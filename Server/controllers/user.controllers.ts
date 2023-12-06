require("dotenv").config();
import { Express, Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../Models/user.model";
import ErrorHandler from "../utils/Errorhandler";
import sendMail from "../utils/sendMail";
import { CatchAsyncError } from "../midlleware/catchAsyncError";
import { constants } from "buffer";
import jwt, { JwtPayload, Secret } from "jsonwebtoken"
import ejs from "ejs"
import path from "path"
import { accessTokenOptions, refreshTokenOptions, sendToken } from "../utils/jwt";
import { redis } from "../utils/redis";
import { getUserById } from "../Services/user.service"
import cloudinary from "cloudinary";
//import activationmail from "./mails/activation_mail.ejs"

//craete or register user
interface IRegistrationBody {
   name: string;
   email: string;
   password: string;
   avatar?: string;

}

export const registartionUser = CatchAsyncError(
   async (req: Request, res: Response, next: NextFunction) => {
      try {
         const { name, email, password } = req.body;

         const isEmailExist = await userModel.findOne({ email });
         if (isEmailExist) {
            return next(new ErrorHandler("Email already exsist", 400))
         }

         const user: IRegistrationBody = {
            name,
            email,
            password
         };

         const activationToken = createActivationToken(user);
         const activationCode = activationToken.activationCode;

         const data = { user: { name: user.name }, activationCode };
         const html = await ejs.renderFile(path.join(__dirname, "../mails/activation_mail.ejs"), data);
         try {
            await sendMail({
               email: user.email,
               subject: "Activate your account ",
               template: "activation_mail.ejs",
               data,
            });
            res.status(200).json({
               success: true,
               message: "please check your email to activate your accoiunf",
               activationToken: activationToken.token
            })
         } catch (error: any) {
            return next(new ErrorHandler(error.message, 401))
         }

      } catch (error: any) {
         return next(new ErrorHandler(error.message, 400))
      }
   })

interface IActivationToken {
   token: string,
   activationCode: string
}

export const createActivationToken = (user: any): IActivationToken => {
   const activationCode = Math.floor(1000 + Math.random() * 9000).toString();  //genrate a 4 digit nukmber
   const token = jwt.sign({
      user, activationCode
   }, process.env.ACTIVATION_SECRET as Secret, {
      expiresIn: '5m',
   });

   return { token, activationCode }
}


//activate user 
interface IActivationRequest {
   activation_token: string;
   activation_code: string;
}

export const activateUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { activation_token, activation_code } = req.body as IActivationRequest;
      const newUser: { user: IUser; activationCode: string } = jwt.verify(
         activation_token,
         process.env.ACTIVATION_SECRET as string
      ) as { user: IUser, activationCode: string }

      if (newUser.activationCode != activation_code) {
         return next(new ErrorHandler("Inavlid activation code", 400));
      }

      //otherwise 

      const { name, email, password } = newUser.user;

      const existUser = await userModel.findOne({ email })
      if (existUser) {
         return next(new ErrorHandler("User alreday exists", 400));
      }

      const user = await userModel.create({
         name,
         email,
         password,
      });

      res.status(400).json({
         success: true
      })
   } catch (error: any) {
      return next(new ErrorHandler(error.message, 400))
   }
})

//login USer

interface ILoginRequest {
   email: string,
   password: string
}

export const loginUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { email, password } = req.body as ILoginRequest;
      const user = await userModel.findOne({ email }).select("+password");

      if (!email || !password) {
         return next(new ErrorHandler("please enter all field", 401))
      }
      if (!user) {
         return next(new ErrorHandler("Invalid email or password", 401));
      }

      const isPasswordMatched = await user.comparePassword(password);
      if (!isPasswordMatched) {
         return next(new ErrorHandler("Inavlid email or password", 401));
      }

      sendToken(user, 201, res);


   }
   catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
   }
})

// logout user

export const logoutUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
   try {
      //empty token or cookies
      //  res.cookie("access_token","",{maxAge: 1});
      //  res.cookie("refresh_token","",{maxAge: 1});

      // Log the cookies before clearing them
      // console.log("Cookies before logout:", req.cookies);

      // Clear the cookies
      res.cookie("access_token", "", { maxAge: 1 });
      res.cookie("refresh_token", "", { maxAge: 1 });

      // Log the cookies after clearing them
      //console.log("Cookies after logout:", req.cookies);
      //const hi = req.cookies.access_token;
      //console.log(hi);
      const UserID = req.user?._id || ' ';
      redis.del(UserID);
      res.status(200).json({
         success: true,
         message: "logged out successfully"
      })
   }
   catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
   }
})

//update access token -  it is expirirng evry 5 mins we need to update it evry time
export const updateAccessToken = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
   try {
      const refresh_token = req.cookies.refresh_token as string;
      // console.log(refresh_token);
      const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN as string) as JwtPayload;
      const msg = "could not refresh token";
      if (!decoded) {

         return next(new ErrorHandler(msg, 400));
      }

      const session = await redis.get(decoded.id as string);

      if (!session) {

         return next(new ErrorHandler(msg, 400));
      }

      const user = JSON.parse(session);
      const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN as string, {
         expiresIn: "5m",
      })

      const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN as string, {
         expiresIn: "3d",
      })

      req.user = user;

      res.cookie("access_token", accessToken, accessTokenOptions);
      res.cookie("refresh_token", refreshToken, refreshTokenOptions);

      res.status(200).json({
         status: "success",
         accessToken
      })
   } catch (error: any) {

      return next(new ErrorHandler(error.message, 400));
   }
})

// export const updateAccessToken = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
//    try {
//        const refresh_token = req.cookies.refresh_token as string;
//       //  console.log("Refresh Token:", refresh_token);

//        const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN as string) as JwtPayload;
//       //  console.log("Decoded Token:", decoded);

//        const msg = "Could not refresh token";

//        if (!decoded) {
//            console.error("Invalid Decoded Token");
//            return next(new ErrorHandler(msg, 400));
//        }

//        const session = await redis.get(decoded.id as string);
//        console.log("Redis Session:", session);

//        if (!session) {
//            console.error("Session not found in Redis");
//            return next(new ErrorHandler(msg, 400));
//        }

//        const user = JSON.parse(session);
//        const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN as string, { expiresIn: "5m" });
//        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN as string, { expiresIn: "3d" });

//       //  console.log("Generated Access Token:", accessToken);
//       //  console.log("Generated Refresh Token:", refreshToken);

//        res.cookie("access_token", accessToken, accessTokenOptions);
//        res.cookie("refresh_token", refreshToken, refreshTokenOptions);

//        res.status(200).json({
//            status: "success",
//            accessToken
//        });
//    } catch (error: any) {
//        //console.error("Error:", error.message);
//        return next(new ErrorHandler(error.message, 400));
//    }
// });

//get user info

export const getUserInfo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
   try {
      const userID = req.user?._id;
      getUserById(userID, res);
   }
   catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
   }
})

//social authentication - this will be implemented in our frontend , from their next auth will fetch value and verify it after that
// this route will get the fileds such as emails, and will create a user from it
interface ISocialAuthBody {
   email: string,
   name: string,
   avatar: string
}
export const socialAuth = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { email, name, avatar } = req.body as ISocialAuthBody;
      const user = await userModel.findOne({ email });
      //if he is new signup him
      if (!user) {
         const newUser = await userModel.create({ email, name, avatar });
         sendToken(newUser, 200, res);
      }
      // if he is already user log him up
      else {
         sendToken(user, 200, res);
      }
   } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
   }
})

// update user profile - 
interface IUpdateUserInfo {
   email: string,
   name: string
}
export const updateUserInfo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { email, name } = req.body as IUpdateUserInfo;
      const userId = req.user?._id;
      const user = await userModel.findById(userId);

      if (email && user) {
         const isEmailExist = await userModel.findOne({ email })
         if (isEmailExist) {
            return next(new ErrorHandler("Email already exsist", 401));
         }
         user.email = email;
      }

      if (user && name) {
         user.name = name;
      }

      await user?.save();

      await redis.set(userId, JSON.stringify(user));

      res.status(201).json({
         success: true,
         user,
      })

   } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
   }
})

interface IUpdatePassword {
   oldPassword: string,
   newPassword: string
}

export const updatePassword = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { oldPassword, newPassword } = req.body as IUpdatePassword;
      if (!oldPassword || !newPassword) {
         return next(new ErrorHandler("please enter both feilds", 401));
      }
      // select the feild because in user model sleect is set to false;

      const user = await userModel.findById(req.user?._id).select("+password");

      if (user?.password === undefined) {
         return next(new ErrorHandler("invalid user", 401));
      }

      //check if old passowrd is maching to hased password - 
      const isPasswordMatch = await user?.comparePassword(oldPassword);

      if (!isPasswordMatch) {
         return next(new ErrorHandler("invalid old password", 401));
      }

      user.password = newPassword;
      await user.save();
      await redis.set(req.user?._id, JSON.stringify(user));

      res.status(200).json({
         success: true,
         user,
      })

   } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
   }
})

// upadte user profile  : 
interface IUpdateProfilePicture {
   avatar: string,
}

export const updateProfilePicture = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { avatar } = req.body;
      // if avatar have public id it means he already have a profile pic but if not then its his first picture
      //find user
      const userId = req.user?._id;
      const user = await userModel.findById(userId);
      if (avatar && user) {
         if (user?.avatar?.public_id) {
            // upadting prfile pic first - destroy
            await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);
            //second upload 
            const myCloud = await cloudinary.v2.uploader.upload(avatar, {
               folder: "avatars",
               width: 150,
            });
            user.avatar = {
               public_id: myCloud.public_id,
               url: myCloud.secure_url,
            }
         } else {

            //no public id then direct;ly upload
            const myCloud = await cloudinary.v2.uploader.upload(avatar, {
               folder: "avatars",
               width: 150,
            });
            user.avatar = {
               public_id: myCloud.public_id,
               url: myCloud.secure_url,
            }
         }

         await user?.save();
         await redis.set(userId,JSON.stringify(user));
         res.status(200).json({
            success : true,
            user,
         })
      }

   } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
   }
})