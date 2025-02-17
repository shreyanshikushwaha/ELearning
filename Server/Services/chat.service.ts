import Chat from "../Models/chat.model";
import Users from "../Models/users.model";
import Message from "../Models/message.model";
import ChatHistory from "../Models/chatHistory.model";
import { Response } from "express";
import mongoose from "mongoose";

export const addMentor = async (body: any, res: any) => {
    const { username, email, password } = body;
    const user = await Users.findOne({ email })

    if (user) {
        return res.status(400).json({ message: "User present." });
    }
    const createdUser = await Users.create({ username, email, password });
    return createdUser;
};

export const getChatRecords = async (userId: string, res: any) => {
    const chatRecords = await ChatHistory.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (!chatRecords) {
        return res.status(404).json({ message: "No Chat Record." });
    }
    return chatRecords;
};

export const GetAllMessages = async (chatId: string, res: any) => {
    const messageRecords = await Message.find({ chatId: chatId }).sort({ timestamp: 1 });
    
    if (!messageRecords) {
        return res.status(404).json({ message: "No Chat Record." });
    }
    return messageRecords;
};

export const getRecommendedMentors = async (currentUserId: string, res: Response) => {
    if (!currentUserId) {
        return res.status(400).json({ message: "User Id is required." });
    }

    const users = await Users.find({ _id: { $ne: currentUserId } });

    return users;
};


export const startChat = async (data: { senderId: any, receiverId: any }, res: Response) => { 
    const session = await mongoose.startSession();
    session.startTransaction();

    try { 
        const { senderId, receiverId } = data;

        if (!senderId || !receiverId) { 
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Both senderId and receiverId are required." });
        }

        const sender = await Users.findById(senderId).session(session);
        const receiver = await Users.findById(receiverId).session(session);

        if (!sender || !receiver) { 
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Sender or receiver not found." });
        }

        let chat = await Chat.findOne({ participants: { $all: [senderId, receiverId] } }).session(session);
        if (!chat) { 
            chat = (await Chat.create([{ participants: [senderId, receiverId], messages: [] }], { session }))[0];

            const senderChatHistory =await ChatHistory.findOneAndUpdate(
                { userId: senderId },
                { $setOnInsert: { userId: senderId }, $addToSet: { chats: chat._id } },
                { upsert: true, new: true, session }
            );

            const receiverChatHistory = await ChatHistory.findOneAndUpdate(
                { userId: receiverId },
                { $setOnInsert: { userId: receiverId }, $addToSet: { chats: chat?._id } },
                { upsert: true, new: true, session }
            );

            await Users.findByIdAndUpdate(senderId, {$push:{chatHistory:senderChatHistory._id}},{new:true,session});
            await Users.findByIdAndUpdate(receiverId,{$push:{chatHistory : receiverChatHistory._id}},{new:true, session});

            await session.commitTransaction();
            session.endSession();

            return res.status(201).json({ chat, message: "Chat created successfully." });
        } else {
            await session.abortTransaction();
            session.endSession();
            return res.status(200).json({ chat, message: "Chat already exists." });
        }
    } catch (error) { 
        await session.abortTransaction();
        session.endSession();
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
