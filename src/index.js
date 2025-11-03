import dotenv from "dotenv";
dotenv.config({path: "./.env"});
import {app} from "./app.js";
import DbConnect from "./db/index.js ";

DbConnect()
.then(
    ()=>{
        app.listen(process.env.PORT || 8080,()=>{
            console.log(`app is listenng at ${process.env.PORT}`)
        })
    }
)
.catch((err)=>{
    console.log("mongoDB connection failed !!",err)
});