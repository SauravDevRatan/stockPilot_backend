import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// ====================== CORS CONFIG ======================
app.use(cors({
  origin: "https://stockpilot-dashboard.onrender.com",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));



// ====================== MIDDLEWARE ======================
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ====================== ROUTERS ======================
import userRouter from "./routes/userRoutes.js";
import tradeRouter from "./routes/tradeRoutes.js";
import dataRouter from "./routes/dataRoutes.js";

// Mount routers (keep frontend URLs same)
app.use("/api/v1/users", userRouter);
app.use("/api/v1/users", tradeRouter);   // /api/v1/users/trade
app.use("/api/v1/users", dataRouter);    // /api/v1/users/holdingData

// ====================== ERROR HANDLING ======================
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ status, message });
});

export { app };


// import express from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";

// const app=express();

// app.use(cors({
//   origin: "https://stockpilot-dashboard.onrender.com",
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// }));
// app.use(express.json({limit:"16kb"}));
// app.use(express.urlencoded({extended:true,limit:"16kb"}));
// app.use(express.static("public"));
// app.use(cookieParser());

// import userRouter from "./routes/userRoutes.js";
// app.use("/api/v1/users",userRouter);

// import tradeRouter from "./routes/tradeRoutes.js";
// app.use("/api/v1/users",tradeRouter);

// import data from "./routes/dataRoutes.js";
// app.use("/api/v1/users",data);
 
// export {app};