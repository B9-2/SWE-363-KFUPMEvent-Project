import mongoose from "mongoose";

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI environment variable is not set");
  }

  try {
    cachedConnection = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB connected: ${cachedConnection.connection.host}`);
    return cachedConnection;
  } catch (error) {
    cachedConnection = null;
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
};

export default connectDB;
