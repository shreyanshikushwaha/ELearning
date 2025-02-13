import Chat from "../Models/chatHistory.model";
import Users from "../Models/users.model";
import Message from "../Models/message.model";
import { Response } from "express";
import { CatchAsyncError } from "../midlleware/catchAsyncError";

export const addMentor = async (body: any, res: any) => {
    const { username, email, password } = body;
    const user = await Users.findOne({ email })

    if (user) {
        return res.status(400).json({ message: "User present." });
    }
    const createdUser = await Users.create({ username, email, password });
    return createdUser;
};


export const getRecommendedMentors = async (currentUserId: string, res: Response) => {
    if (!currentUserId) {
        return res.status(400).json({ message: "User Id is required." });
    }

    const users = await Users.find({ _id: { $ne: currentUserId } });

    res.status(200).json({
        success: true,
        users
    });
};

export const getOrCreateChat = async (data: { senderId: any, receiverId: any }, res: Response) => {
    const { senderId, receiverId } = data;
    if (!senderId || !receiverId) {
        return res.status(400).json({ message: "Both senderId and receiverId are required." });
    }

    const chatId = [senderId, receiverId].sort().join('-');

    let chat = await Chat.findOne({ chatId }).populate("messages");

    if (!chat) {
        chat = await Chat.create({
            chatId,
            participants: [senderId, receiverId],
            messages: []
        });
    }
};
