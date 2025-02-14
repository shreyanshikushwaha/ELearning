import  express  from "express";
import { ListRecommendedMentors,Chats,AddMentors, onSendMessage, onGetChatsRecords } from "../controllers/chat.controller";
const chatRouter = express.Router();

chatRouter.get("/see-all-Mentors",ListRecommendedMentors);
chatRouter.get("/getChatRecords",onGetChatsRecords);
chatRouter.post("/createMentor",AddMentors);
chatRouter.post("/chats",Chats);
chatRouter.post("/sendMessage",onSendMessage);

export default chatRouter;