import Chat from "../Models/chat.model";
import Users from "../Models/users.model";
import Message from "../Models/message.model";
import ChatHistory from "../Models/chatHistory.model";
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

    return users;
};

export const startChat = async (data: { senderId: any, receiverId: any }, res: Response) => {
    try {
        const { senderId, receiverId } = data;

        if (!senderId || !receiverId) {
            return res.status(400).json({ message: "Both senderId and receiverId are required." });
        }

        const sender = await Users.findById(senderId);
        const receiver = await Users.findById(receiverId);
        if (!sender || !receiver) {
            return res.status(404).json({ message: "Sender or receiver not found." });
        }

        let chat = await Chat.findOne({ participants: { $all: [senderId, receiverId] } });

        if (!chat) {
            chat = await Chat.create({
                participants: [senderId, receiverId],
                messages: []
            });

            let senderChatHistory = await ChatHistory.findOne({ userId: senderId });
            if (!senderChatHistory) {
                senderChatHistory = await ChatHistory.create({ userId: senderId, chats: [] });
                await Users.findByIdAndUpdate(senderId, { chatHistory: senderChatHistory._id });
            }
            senderChatHistory.chats.push(chat._id);
            await senderChatHistory.save();

            let receiverChatHistory = await ChatHistory.findOne({ userId: receiverId });
            if (!receiverChatHistory) {
                receiverChatHistory = await ChatHistory.create({ userId: receiverId, chats: [] });
                await Users.findByIdAndUpdate(receiverId, { chatHistory: receiverChatHistory._id });
            }
            receiverChatHistory.chats.push(chat._id);
            await receiverChatHistory.save();
        }

        return chat;

    } catch (error) {
        console.error("Error starting chat:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


export const createMessage = async (data: { chatId: any, senderId: string, message: string }, res: Response) => {
    const { chatId, senderId, message } = data;

    let chat = await Chat.findOne({ chatId });

    if (!chat) {
        return res.status(404).json({ success: false, message: "No chat found with this id." });
    }

    const createdMessage = await Message.create({
        chatId,
        senderId,
        message
    });

    chat.messages.push(createdMessage._id);
    await chat.save();
    return createdMessage;
};
