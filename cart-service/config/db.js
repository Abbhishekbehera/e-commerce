import mongoose from "mongoose";

async function connectDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Cart Service connected to MongoDB");
  }
  catch (error) {
    console.error("Cart Service connection error:", error);
    process.exit(1);
  }
}

export default connectDb;
