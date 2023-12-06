import  express  from "express";
import { addAnswer, addQuestion, addReview, editCourse, getAllCourse, getCourseByUser, getSingleCourse, uploadCourse } from "../controllers/course.controller";
import { authorizeRoles, isAuthenticated } from "../midlleware/auth";
const courseRouter = express.Router();

courseRouter.post("/create-Course",isAuthenticated,authorizeRoles("admin"),uploadCourse);
courseRouter.put("/edit-Course/:id",isAuthenticated,authorizeRoles("admin"),editCourse);
courseRouter.get("/see-single-Course/:id",getSingleCourse);
courseRouter.get("/see-all-Course",getAllCourse);
courseRouter.get("/get-Course-content/:id",isAuthenticated,getCourseByUser);
courseRouter.put("/add-question",isAuthenticated,addQuestion);
courseRouter.put("/add-answer",isAuthenticated,addAnswer);
courseRouter.put("/add-review/:id",isAuthenticated,authorizeRoles("admin"),addReview);

export default courseRouter;