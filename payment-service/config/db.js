import mongoose from "mongoose";

async function connectDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Payment Service connected to MongoDB");
  }
  catch (error) {
    console.error("Payment Service connection error:", error);
    process.exit(1);
  }
}

export default connectDb;
