import mongoose from 'mongoose';

const dbURL: string = process.env.MONGODB_URI || '';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(dbURL);
    console.log(`MongoDB Connected ${conn.connection.host}`);
  } catch (err: any) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
