import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config();

if (!process.env.MONGO_URI) {
  console.error("❌ MongoDB URI not found in environment variables.");
  process.exit(1);
}
const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
};

export {connectDb}