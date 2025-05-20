import express from "express";
import userRoutes from "./routes/userRoutes";
import { databaseConnection } from "./controllers/databaseConnection";
import mongoose, { Types } from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "./strategies/localStrategy";

const app = express();

declare global {
  namespace Express {
    interface User {
      _id: Types.ObjectId;
      username: string;
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    }
  }
}

databaseConnection();

// setting up some middlewares

app.use(express.json());

app.use(
  session({
    secret: "ts_session_secret",
    saveUninitialized: false,
    resave: false,
    store: MongoStore.create({
      client: mongoose.connection.getClient(),
    }),
  })
);
app.use(passport.initialize());
app.use(passport.session());

// using user Routes
app.use(userRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Running at port ${PORT}`);
});
