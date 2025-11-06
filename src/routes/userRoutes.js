import {Router} from "express";
import {registerUser,loginUser,logoutUser,userDetails,changeCurrentpasword,updateAccountDetails,updateProfilepic,verifyUser} from "../controllers/userControllers.js";
import {upload} from "../middleware/multerMiddleware.js";
import {verifyJwt} from "../middleware/authMiddleware.js";

const userRouter=Router();

userRouter.route("/register").post(upload.single("avatar"), registerUser);
userRouter.route("/login").post( loginUser);
userRouter.route("/logout").post( verifyJwt,logoutUser);
userRouter.route("/me").get(verifyJwt,userDetails);
userRouter.route("/changePassword").post(verifyJwt,changeCurrentpasword);
userRouter.route("/updateDetails").post(verifyJwt,updateAccountDetails);
userRouter.route("/updateProfilepic").put(verifyJwt,upload.single("avatar"),updateProfilepic);
userRouter.route("/verifyUser").post(verifyUser);
export default userRouter;