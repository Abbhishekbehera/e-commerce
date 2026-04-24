import mongoose from "mongoose";

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("User Service connected to MongoDB");
  }
  catch (error) {
    console.error("User Service connection error:", error);
    process.exit(1);
  }
}

export default connectDB;