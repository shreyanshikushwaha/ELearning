require('dotenv').config();
import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const emailRegexPattern: RegExp = /^[^\s@ + @[^\s@] +\.[^\s@] + $/;
//e,mail verfiy

//interface
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar: {
        public_id: string;
        url: string;
    }
    role: string;
    isVerified: boolean;
    courses: Array<{ courseID: string }>;
    comparePassword: (password: string) => Promise<boolean>;
    SignAccessToken : ()=>string;
    SignRefreshToken : () => string;

}
const userSchema: Schema<IUser> = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "please enter your name"],
    },
    email: {
        type: String,
        required: [true, "please enter your email"],
        validated: {
            validator: function (value: string) {
                return emailRegexPattern.test(value);
            },
            message: "enter a valid email"
        },
        unique: true,
    },
    password: {
        type: String,
        //required: [true, "please enter password"], - untrue because using social auth we do not enetr password
        minlength: [6, "password must be atleast 6 character"],
        select: false,
    },
    avatar: {
        public_id: String,
        url: String
    },
    role: {
        type: String,
        default: "user",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    courses: [
        {
            courseId: String,
        }
    ],


}, { timestamps: true });

//hash password : 
userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

//sign our access token -  whem user log in craete a access token ,if reload or acess to itsself so simple compare the token

userSchema.methods.SignAccessToken = function (){
    return jwt.sign({id: this._id},process.env.ACCESS_TOKEN  || ' ',{
        expiresIn:"5m",
    });
}

// sign refresh token
userSchema.methods.SignRefreshToken = function(){
    return jwt.sign({id: this._id},process.env.REFRESH_TOKEN  || ' ',{
        expiresIn:"3d",
    });
}
//compare pswrd
userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);

}

const userModel: Model<IUser> = mongoose.model("User", userSchema);  
export default userModel;