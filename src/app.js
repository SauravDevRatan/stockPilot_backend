import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app=express();

app.use(cors(
    {
        origin:process.env.ORIGIN_CORS,
        credentials:true
    }
));
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./routes/userRoutes.js";
app.use("/api/v1/users",userRouter);

import tradeRouter from "./routes/tradeRoutes.js";
app.use("/api/v1/users",tradeRouter);

import data from "./routes/dataRoutes.js";
app.use("/api/v1/users",data);
 
export {app};