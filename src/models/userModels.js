import mongoose from "mongoose";

const userSchema=mongoose.Schema({
    fullName:{type:String,required:true,},
    email:{type:String,required:true,unique:true},
    username:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    dob:{type:Date,required:true},
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

export const User=mongoose.model("User",userSchema);