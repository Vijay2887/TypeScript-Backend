import mongoose, { Schema } from "mongoose";

const followSchema = new Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "user",
  },
  following: {
    type: mongoose.Types.ObjectId,
    ref: "user",
  },
});

const Follower = mongoose.model("follower", followSchema);
export default Follower;
