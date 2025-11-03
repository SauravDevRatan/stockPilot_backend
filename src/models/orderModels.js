import mongoose from "mongoose";

const orderSchema=mongoose.Schema({
    orderNmae:String,
    qty:Number,
    price: Number,
    mode:{type:String,enum: ["online", "cash", "UPI", "card"],required:true},
    date: {type: Date,default: Date.now,} 
},{ timestamps: true });

export const Holding=mongoose.model("Order",orderSchema);