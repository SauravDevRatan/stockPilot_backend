import { ApiErrorHandler } from "../utils/ApiError.js";
import { asynchandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import {User} from "../models/userModels.js";


export const verifyJwt=asynchandler(async(req,res,next)=>{
   
     let token = req.cookies?.accessToken;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new ApiErrorHandler(401, "Unauthorized — No token provided");
    }
     if (!token) {
         throw new ApiErrorHandler(400,"Not authorised — No token provided");
     }
     try {
     const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
 
     let user=await User.findById(decodedToken._id).select("-password -refreshToken");
 
     if(!user){
         throw new ApiErrorHandler(403, "Invalid token — user not found")
     }
 
     req.auth=user;
 
     next();
   } catch (error) {
    throw new ApiError(401, "Not authorised — Invalid or expired token");
   }
})