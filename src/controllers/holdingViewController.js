import { User } from "../models/userModels.js";
import {asynchandler} from "../utils/asyncHandler.js";

const holdingViewer=asynchandler(async(req,res)=>{
    const userId=req.auth._id;
    const user=await User.findById(userId).populate("holding").populate("order");
    res.json({holding:user.holding,balance:user.balance,username:user.username,order:user.order});
})

export {holdingViewer};