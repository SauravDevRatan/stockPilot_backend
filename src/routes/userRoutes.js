import {Router} from "express";
import {registerUser} from "../controllers/userControllers.js";

const userRouter=Router();

userRouter.route("/register").get(registerUser);

export default userRouter;