import {User} from "../models/userModels.js";
import {asynchandler} from "../utils/asyncHandler.js";


const registerUser=asynchandler(async(req,res)=>{
    res.status(200).json({message:"all is well"})
})

export {registerUser};