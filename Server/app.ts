require('dotenv').config(); 
import express from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import { request } from "http";
import { ErrorMiddleware } from "./midlleware/error";
import userRouter from "./routes/user.routes";
import courseRouter from "./routes/course.route";

//body parser 
app.use(express.json({limit: "50mb"}));

//cookie parser 
app.use(cookieParser());

//cors
app.use(cors({
    origin : process.env.ORIGIN
}));

//roytes  
app.use("/api/v1",userRouter)
app.use("/api/v1",courseRouter)

//testing api :
app.get("/test", (Request,Response,NextFunction)=>{
    Response.status(200).json({
        success:true,
        message:"API is working"
    })
})

//unknown routes
app.all("*", (Request,Response,NextFunction)=>{
    const err = new Error(`Route $(req.originalUrl) not found`) as any;
    err.statusCode = 404;
    NextFunction(err);
})

app.use(ErrorMiddleware);