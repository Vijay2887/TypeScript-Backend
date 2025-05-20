import mongoose from "mongoose";

export const databaseConnection = async (): Promise<void> => {
  try {
    await mongoose.connect("mongodb://localhost:27017/DB");
    console.log("Database connected");
  } catch (error) {
    console.log("Error connecting to the database:", error);
  }
};
