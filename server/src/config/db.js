import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/printflow';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`[Database] MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[Database Notice] Could not connect to MongoDB at ${uri}: ${error.message}`);
    console.warn(`[Database Notice] Please ensure MongoDB is running locally or set MONGO_URI in server/.env with your Atlas connection string.`);
    return null;
  }
}
