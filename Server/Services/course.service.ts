// this file will create a course
import { Response } from "express";
import CourseModel from "../Models/course.model";
import { CatchAsyncError } from "../midlleware/catchAsyncError";

//create course
export const createCourse = CatchAsyncError(async(data:any,res:Response)=>{
    // this data will be given by course controller uploadCourse route
     const course = await CourseModel.create(data);
     res.status(200).json({
        success:true,
        course,
     })
})