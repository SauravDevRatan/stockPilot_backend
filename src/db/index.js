import mongoose from "mongoose";

const DbConnect = async () => {
  try {
    const connectionInstance=await mongoose.connect(process.env.MONGO_URI);
    console.log("mongoDB is connected to",connectionInstance.connection.host);
}
    catch (error) {
    console.log("Database connection FAILED with error:", error);
    process.exit(1);
  } 
}

export default DbConnect;