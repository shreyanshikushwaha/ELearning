import  express  from "express";
import { activateUser, getUserInfo, loginUser, logoutUser, registartionUser,socialAuth,updateAccessToken, updatePassword, updateProfilePicture, updateUserInfo }  from "../controllers/user.controllers";
import { isAuthenticated ,authorizeRoles,} from "../midlleware/auth";
//import { activateUser } from "../controllers/user.controllers";
const userRouter = express.Router();

userRouter.post('/registration',registartionUser); 
userRouter.post('/activate-user',activateUser); 
userRouter.post('/login',loginUser); 
userRouter.get('/logout',isAuthenticated,logoutUser); // this is authenticated middleware is to empty the session data in upsatsh redis after logout
userRouter.get('/refreshtoken',updateAccessToken);
userRouter.get("/me",isAuthenticated,getUserInfo);
userRouter.post('/socialAuth',socialAuth);
userRouter.put('/updateUserInfo',isAuthenticated,updateUserInfo);
userRouter.put('/updatePassword',isAuthenticated,updatePassword);
userRouter.put('/updateProfilePicture',isAuthenticated,updateProfilePicture);


export default userRouter ;