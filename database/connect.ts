import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/smartcare";

  // Log partial URI for debugging (hide password)
  const safeUri = uri.replace(/:([^@]+)@/, ":***@");
  console.log(`Connecting to MongoDB: ${safeUri}`);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,  // 10s timeout
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  console.log("MongoDB disconnected");
}
