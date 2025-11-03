
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const userSchema=mongoose.Schema({
    fullName:{type:String,required:true,trim:true},
    email:{type:String,required:true,unique:true,trim:true,lowercase:true},
    username:{type:String,required:true,unique:true,lowercase:true,trim:true},
    password:{type:String,required:true},
    dob:{type:Date,required:true},
    avatar:{type:String},
    holding:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Holding"
    },
    order:
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order"
    }
},{ timestamps: true });

userSchema.pre("save",async function(next){
    if(!this.isModified("password")){return next()}

    this.password=await bcrypt.hash(this.password,10);
    next();
})

userSchema.methods.isPasswordCorrect=async function (password) {
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken= function(){
    return jwt.sign(
        {
            _id:this._id,
            username:this.username,
            email:this.email
        },
        process.env.ACCESS_TOKEN_SECRET
        ,{
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken= function(){
    return jwt.sign(
        {
            _id:this._id,
            username:this.username,
            email:this.email
        },
        process.env.REFRESH_TOKEN_SECRET
        ,{
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User=mongoose.model("User",userSchema);