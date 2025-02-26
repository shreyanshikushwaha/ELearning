import  express  from "express";
import { ListRecommendedMentors,Chats,AddMentors, onSendMessage, onGetChatsRecords,onGetAllMessages } from "../controllers/chat.controller";

const chatRouter = express.Router();

chatRouter.post("/see-all-Mentors",ListRecommendedMentors);
chatRouter.get("/getChatRecords",onGetChatsRecords);
chatRouter.post("/createMentor",AddMentors);
chatRouter.post("/chats",Chats);
chatRouter.post("/sendMessage",onSendMessage);
chatRouter.post('/seeMessages',onGetAllMessages);

export default chatRouter;