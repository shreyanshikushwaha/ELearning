import  express  from "express";
import { ListReccomendedMentors,Chats } from "../controllers/chat.controller";
const chatRouter = express.Router();

chatRouter.get("/see-all-Mentors",ListReccomendedMentors);
chatRouter.get("/chats",Chats);

export default chatRouter;