import mongoose from "mongoose";

const orderSchema=mongoose.Schema({
    orderName:String,
    qty:Number,
    price: Number,
    mode:{type:String, required:true},
    date: {type: Date,default: Date.now,} 
},{ timestamps: true });

export const Order=mongoose.model("Order",orderSchema);