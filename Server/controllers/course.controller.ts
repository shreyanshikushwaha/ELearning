import { NextFunction, Response, Request } from "express";
import { CatchAsyncError } from "../midlleware/catchAsyncError";
import ErrorHandler from "../utils/Errorhandler";
import { createCourse } from "../Services/course.service";
import cloudinary from 'cloudinary';
import CourseModel from "../Models/course.model";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import ejs from "ejs"
import path from "path"
import sendMail from "../utils/sendMail";

//basic stucture -
// export const Course = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
//     try{

//     }catch(error:any){
//         return next(new ErrorHandler(error.message, 500));
//     }
// })

// upload course 
export const uploadCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const data = req.body;
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "courses"
            });
            // setting up the public url to show that thumbnail is present 
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        }

        createCourse(data, res, next);

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
})

//edit course
export const editCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        // console.log("Request URL:", req.originalUrl);
        const data = req.body;
        const thumbnail = data.thumbnail;
        //if thumbnail is to be modified
        if (thumbnail) {
            await cloudinary.v2.uploader.destroy(thumbnail.public_id);
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "courses"
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        }

        const courseId = req.params.id;
        //  const course = await CourseModel.findByIdAndUpdate(courseId,{
        //     $set:data},{
        //        new : true
        //     })

        const course = await CourseModel.findByIdAndUpdate(courseId, data, {
            new: true,
        });

        if (!course) {
            return next(new ErrorHandler('Course not found', 404));
        }
        res.status(200).json({
            success: true,
            course
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
})

// view single course without purchasing
export const getSingleCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courseId = req.params.id
        const isCacheExsits = await redis.get(courseId);
        if (isCacheExsits) {
            const course = JSON.parse(isCacheExsits);
            return res.status(200).json({
                success: true,
                course
            })
        } else {

            const course = await CourseModel.findById(courseId).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
            await redis.set(courseId, JSON.stringify(course));
            res.status(200).json({
                success: true,
                course
            })
        }
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
})

// view all course without purchasing
export const getAllCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const isCacheExsits = await redis.get("allCourses");
        if (isCacheExsits) {
            const course = JSON.parse(isCacheExsits);
            return res.status(200).json({
                success: true,
                course
            })
        } else {

            const allCourses = await CourseModel.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
            await redis.set("allCourses", JSON.stringify(allCourses));
            res.status(200).json({
                success: true,
                allCourses
            })
        }


    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
})

// get course content - only for a valid user
export const getCourseByUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courseID = req.params.id;

        //checking if user have purchased that course
        const userCourseList = req.user?.courses;
        const courseExsits = userCourseList?.find((course: any) => course._id.toString() === courseID);
        if (!courseExsits) {
            return next(new ErrorHandler(" you are not eligible to access this course", 400));
        }

        //if user have not purchased this course show this

        const course = await CourseModel.findById(courseID);
        const content = course?.courseData;
        res.status(200).json({
            success: true,
            content
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
})


// add question in course

interface IAddQuestionData {
    question: string,
    courseId: string,
    contentId: string
}

export const addQuestion = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { question, courseId, contentId }: IAddQuestionData = req.body;
        const course = await CourseModel.findById(courseId);
        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler("Invalid Content ID", 400));
        }
        const courseContent = course?.courseData?.find((item: any) => item._id.equals(contentId));
        if (!courseContent) {
            return next(new ErrorHandler("Invalid content id", 400))
        }

        //create a new question object 
        const newQuestion: any = {
            user: req.user,
            question,
            questionReplies: [],
        }

        // add this question to our course content
        courseContent.questions.push(newQuestion);
        //save the upadted cousre
        await course?.save();

        res.status(200).json({
            success: true,
            course,
        })


    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
})

//add answer to course question
interface IAddAnswerData {
    answer: string,
    courseId: string,
    contentId: string,
    questionId: string

}

export const addAnswer = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { answer, courseId, contentId, questionId }: IAddAnswerData = req.body;

        //find course 
        const course = await CourseModel.findById(courseId);

        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler("Invalid Content ID", 400));
        }
        const courseContent = course?.courseData?.find((item: any) => item._id.equals(contentId));
        if (!courseContent) {
            return next(new ErrorHandler("Invalid content id", 400))
        }

        //search question which basically comes from course client
        const question = courseContent?.questions?.find((item: any) =>
            item._id.equals(questionId))

        if (!question) {
            return next(new ErrorHandler("Invalid question id", 400))
        }


        // create new answer object 
        const newAnswer: any = {
            user: req.user,
            answer,
        }

        //add this answer to repliesarray

        question.questionReplies.push(newAnswer);
        await course?.save();
        if (req.user?._id === question.user._id) {
            //create a notification


        } else {
            const data = {
                name: question.user.name,
                title: courseContent.title
            }

            const html = await ejs.renderFile(path.join(__dirname, "../mails/question-reply.ejs"), data);

            try {
                await sendMail({
                    email: question.user.email,
                    subject: "Question-reply",
                    template: "question-reply.ejs",
                    data,
                })
            } catch (error: any) {
                return next(new ErrorHandler(error.message, 500))
            }
        }

        res.status(200).json({
            success: true,
            course,
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
})

//add review in course 

interface IAddReviewData {
    review: string,
    courseId: string,
    rating: number,
    userId: string
}

export const addReview = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        //find courses user have
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;

        //check if user is eligble to write a review in course based on if he has purchased it 
        const courseExsits = userCourseList?.some((course: any) => course._id.toString() === courseId.toString)
        if (!courseExsits) {
            return next(new ErrorHandler("you are not eligible to write a review for this course", 404))
        }
        //find that course
        const course = await CourseModel.findById(courseId);

        // he is valid user with that course
        const { review, rating } = req.body as IAddReviewData;
        const reviewData: any = {
            user: req.user,
            comment: review,
            rating
        }

        course?.reviews.push(reviewData);
        let avg = 0;
        course?.reviews.forEach((rev: any) => {
            avg += rev.rating;
        })
        //save corse
        await course?.save();

        //send notification
        const notification = {
            title: "New Review Recived",
            message: `${req.user?.name} has given a review in ${course?.name}`
        }


        if (course) {
            course.ratings = avg / course.reviews.length;   //ex-  2 review whose sum is 9 / divide by no.of reviews given 2 = 4.5 that is the rating
        }


        res.status(200).json({
            success: true,
            course,
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
})
