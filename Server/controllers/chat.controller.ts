require("dotenv").config();
import { Express, Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/Errorhandler";
import { CatchAsyncError } from "../midlleware/catchAsyncError";
import { constants } from "buffer";
import fs from 'fs';
import path from 'path';
import { json } from "body-parser";


export const ListReccomendedMentors = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: currentUserId } = req.body;

        if (!currentUserId) {
            res.status(400).send('User Id is required.');
        }
        const filePath = path.join(__dirname, 'users.json');

        fs.readFile(filePath, 'utf8', (err, data) => {
            const users = JSON.parse(data);
            const filteredUsers = users.filter((users: { id: any; }) => users.id !== currentUserId as string);
            res.status(200).json({
                success: "true",
                User: filteredUsers
            });
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
})

export const Chats = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { senderId, receiverId } = req.body;
        if (!senderId || !receiverId) {
            res.status(400).send('Ids are required.');
        }

        const filePath = path.join(__dirname, 'chats.json');

        fs.readFile(filePath, 'utf8', (err, data) => {
            let chats = JSON.parse(data);
            const chatId = [senderId, receiverId].join('-');
            let chat = chats.find((c: { chatId: any }) => c.chatId === chatId);
            if (!chat) {
                chat = {
                    chatId,
                    participants: [senderId, receiverId],
                    messages: []
                }
                chats.push(chat);
                fs.writeFile(filePath, JSON.stringify(chats, null, 2), (err) => {
                    if (err) {
                        return res.status(500).json({ message: 'Failed to create new chat.' });
                    }
                });
            }
            res.status(200).json({success:'true',chat});
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
})

// export const Course = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
//     try{

//     }catch(error:any){
//         return next(new ErrorHandler(error.message, 500));
//     }
// })
