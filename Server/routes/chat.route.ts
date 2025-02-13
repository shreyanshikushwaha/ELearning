import  express  from "express";
import { ListRecommendedMentors,Chats,AddMentors } from "../controllers/chat.controller";
const chatRouter = express.Router();

chatRouter.get("/see-all-Mentors",ListRecommendedMentors);
chatRouter.get("/chats",Chats);
chatRouter.post("/createMentor",AddMentors);

export default chatRouter;