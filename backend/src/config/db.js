import mongoose from "mongoose";

export async function connectDB() {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error(
      "MONGO_URI is not defined in environment variables. Please check your .env configuration."
    );
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(
      `✅ MongoDB Connected: Host=${conn.connection.host}, Database=${conn.connection.name}`
    );
    return conn;
  } catch (err) {
    console.error(`❌ MongoDB Connection Error: ${err.message}`);
    throw err;
  }
}

export default connectDB;
