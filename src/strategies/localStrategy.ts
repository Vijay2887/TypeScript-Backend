import passport, { serializeUser } from "passport";
import { Strategy } from "passport-local";
import User from "../database/schemas/userSchema";
import { UserI } from "../interfaces";

export default passport.use(
  new Strategy(async (username, password, done) => {
    try {
      const findUser = await User.findOne({ username });
      if (!findUser) throw new Error("Unable to find the user");
      if (findUser.password !== password) throw new Error("Incorrect Password");
      done(null, findUser);
    } catch (err) {
      done((err as Error).message, false);
    }
  })
);

passport.serializeUser((findUser, done) => {
  done(null, findUser._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const findUser = await User.findById(id);
    if (!findUser) throw new Error("Unable to fetch the user ");
    done(null, findUser);
  } catch (err) {
    done((err as Error).message, false);
  }
});
