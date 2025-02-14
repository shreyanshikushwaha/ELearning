import  express  from "express";
import { ListRecommendedMentors,Chats,AddMentors, onSendMessage } from "../controllers/chat.controller";
const chatRouter = express.Router();

chatRouter.post("/createMentor",AddMentors);
chatRouter.get("/see-all-Mentors",ListRecommendedMentors);
chatRouter.post("/chats",Chats);
chatRouter.post("/sendMessage",onSendMessage);

export default chatRouter;