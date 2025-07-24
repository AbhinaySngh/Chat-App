import mongoose from "mongoose";

//  Fucntion to connect to MongoDB database
export const connectDB = async () => {
  try {
    // Connect to MongoDB using the URI from environment variables
    mongoose.connection.on('connected', () => console.log("MongoDB connected successfully"));

    await mongoose.connect(`${process.env.MONGODB_URI}/char-app`);
    } catch (error) {
    console.log(error);
  }


}