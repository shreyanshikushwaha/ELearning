import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/Errorhandler";
import { CatchAsyncError } from "../midlleware/catchAsyncError";
import { getRecommendedMentors, startChat, addMentor,createMessage } from "../Services/chat.service";

export const AddMentors = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username,email,password } = req.body;

        if (!username || !email ||!password) {
            return res.status(400).json({ message: "required fields" });
        }

        const addedMentor = await addMentor(req.body,res);

        res.status(200).json({
            success: true,
            users: addedMentor
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

export const ListRecommendedMentors = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: currentUserId } = req.body;

        if (!currentUserId) {
            return res.status(400).json({ message: "User Id is required." });
        }

        const recommendedMentors = await getRecommendedMentors(currentUserId,res);

        res.status(200).json({
            success: true,
            users: recommendedMentors
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

export const Chats = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { senderId, receiverId } = req.body;
        if (!senderId || !receiverId) {
            return res.status(400).json({ message: "Both senderId and receiverId are required." });
        }
        const data = {senderId,receiverId};
        const chat = await startChat(data, res);
        res.status(201).json({
            success : "true",
            chat
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});


export const onSendMessage = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { chatId,senderId,message  } = req.body;
        if (!senderId || !chatId || !message) {
            return res.status(400).json({ message: "Required all fields." });
        }
        const data = {chatId,senderId,message};
        const chat = await createMessage(data, res);
        res.status(201).json({
            success : "true",
            chat
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});


