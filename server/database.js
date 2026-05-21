import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel_booking';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;