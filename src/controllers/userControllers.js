import {User} from "../models/userModels.js";
import {asynchandler} from "../utils/asyncHandler.js";
import {ApiErrorHandler} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";


const generateAccessAndRefreshToken=async(userId)=>{
    try {
        const user=await User.findById(userId);
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken};
        
    } catch (error) {
        throw new ApiErrorHandler(500,"something went wrong while genrating access and refresh token");
    }
}

const registerUser=asynchandler(async(req,res)=>{
    //ENTER DATA
    let {fullName,email,username,password,dob}=req.body;
    if([fullName,email,username,password,dob].some((e)=>e?.trim()===""))
    {
        throw new ApiErrorHandler(400,"plase update the entire data field");
    }
    //VALIDTAE DATA USERNAME AND EMAIL  
    if(await User.findOne({$or:[{username},{email}]})){
        throw new ApiErrorHandler(200,"username or email is already in database");
    }
    //check fro images
    const avatarLocalFile=req.file?.path;
    if(!avatarLocalFile){
        throw new ApiErrorHandler(404,"images not uploaded")
    }
    //UPLOAD PHOTO TO CLOUDINARY
    const uploadedFile=await uploadOnCloudinary(avatarLocalFile);
    //to check if pic is uploaded on clousinary
    if(!uploadedFile.url){
        throw new ApiErrorHandler(201,"uploading on cloudinary failed")
    }
    //save data to mongodb
    const user=await User.create({
        username:username.toLowerCase(),
        fullName:fullName.toLowerCase(),
        email,password,dob,avatar:uploadedFile.url
    })
    //REMOVE PASSWORD AND REGRESHtOKEN FIELD
    const createdUser=await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiErrorHandler(500,"server error")
    }
    //return respnse
    return res.status(200)
    .json(new ApiResponse(200,createdUser,"user updated successfully"));

})

const loginUser=asynchandler(async(req,res)=>{
    //get dat username and apssword
    let {username,email,password}=req.body;
    //verify sername and serach in datad base
    if(!username && !email){
        throw new ApiErrorHandler(400,"enter username")
    }
    let user=await User.findOne({$or:[{username},{email}]});
    if(!user ){
        throw new ApiErrorHandler(404,"userdetails not found in data base")
    }
    //verify password
    const isValidPassword=await user.isPasswordCorrect(password);
    if(!isValidPassword ){
        throw new ApiErrorHandler(401,"password is incorrect")
    }
    //generate access and refresh token
    const {refreshToken,accessToken}=await generateAccessAndRefreshToken(user._id);
    //send cookie
    const loggedinUser=await User.findById(user._id).select("-password -refreshToken");

    const options={
        httpOnly:true,
        secure:true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24,
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,{user:loggedinUser,accessToken,refreshToken},"User logged in successfully"))
})


const logoutUser=asynchandler(async(req,res)=>{
    let user=await User.findByIdAndUpdate(req.auth._id,{$set:{refreshToken:undefined}},{new:true}) ;
     const options={
        httpOnly:true,
        secure:true,
        sameSite: "none"
    };

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"userlogged Out"))

})

const userDetails=asynchandler(async(req,res)=>{
    let user=req.auth;
    return res.status(200).json(new ApiResponse(200,user,"fetch user data successfully"));
})

const changeCurrentpasword=asynchandler(async(req,res)=>{
    const {oldPassword,newPassword1,newPassword2}=req.body;
    if(newPassword1!==newPassword2)
    {
        throw new ApiErrorHandler(402,"New passwords do not match");
    }
    const user=await User.findById(req.auth?._id);
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiErrorHandler(400,"Invalid old passoword");
    }
    user.password=newPassword1;
    await user.save({validateBeforeSave:false});

    return res.status(200)
    .json(new ApiResponse(200,{},"password updated successfully"));
})

const updateAccountDetails=asynchandler(async(req,res)=>{
    const {fullName,email}=req.body;
    if(!fullName && !email){
        throw new ApiErrorHandler(402,"All fields are required")
    };
    const user=await User.findByIdAndUpdate(req.auth?._id,{$set:{fullName,email}},{new:true}).select("-password -refreshToken");
    return res.status(200)
    .json(new ApiResponse(200, { user }, "User details updated successfully!"));
})

const updateProfilepic=asynchandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path;
    if (!avatarLocalPath) {
       throw new ApiErrorHandler(400,"Avatar file is missing");
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath);
    if (!avatar.url) {
        throw new ApiErrorHandler(400,"Error while uploading on cloudinary");
    }

    const user=await User.findByIdAndUpdate(req.auth?._id,{$set:{avatar:avatar.url}},{new :true}).select("-password -refreshToken");
    return res.status(200)
    .json(new ApiResponse(200, { user }, "User profile updated successfully!"));

})

const verifyUser=asynchandler(async(req,res)=>{
    //get fullName,email,dob,newPassword,confirmPassword from req.body
    let {fullName,email,dob,newPassword,confirmPassword}=req.body;
    //if empty return filed is required
    if([fullName,email,dob,newPassword,confirmPassword].some((e)=>e?.trim()===""))
    {
        throw new ApiErrorHandler(400,"please end the entire field to check");
    }
    //get data from user
    let user=await User.findOne({email});
     if (!user) {
      throw new ApiErrorHandler(404, "User not found");
    }
    //if any fullName email dob do not match profile dont matched with db
    if(user.fullName!==fullName || user.email!==email ){
        throw new ApiErrorHandler(400,"user details do not match with our database details");
    }

    const stored = new Date(user.dob);
    const input = new Date(dob);

    const sameDate =
    stored.getFullYear() === input.getFullYear() &&stored.getMonth() === input.getMonth() &&stored.getDate() === input.getDate();

    if (!sameDate) {
    throw new ApiErrorHandler(400, "Date of birth does not match");
    }

    //check passwords are matching,if password are not matching return not matching
    if(newPassword!==confirmPassword){
        throw new ApiErrorHandler(400,"Updating Passwords do not match")
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully"));
    
})

export {registerUser,loginUser,logoutUser,userDetails,changeCurrentpasword,updateAccountDetails,updateProfilepic,verifyUser};