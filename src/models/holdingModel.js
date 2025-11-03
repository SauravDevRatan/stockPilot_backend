import mongoose from "mongoose";

const holdingSchema=mongoose.Schema({
    name:String,
    qty:Number,
    avg: Number,
    price: Number,
    net: String,
    day: String,
},{ timestamps: true });

export const Holding=mongoose.model("Holding",holdingSchema);