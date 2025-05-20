import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema({
  postId: {
    type: Schema.Types.ObjectId,
    ref: "post",
  },
  commentMessage: String,
  commentBy: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
});

const Comment = mongoose.model("comment", commentSchema);
export default Comment;
