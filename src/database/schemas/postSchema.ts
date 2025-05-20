import mongoose, { Schema } from "mongoose";

const postSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId, //should be objectId only
    ref: "user", //name of the collection
  },
  //   following: { type: Boolean },
  createdOn: {
    type: Schema.Types.Date,
  },
});

const Post = mongoose.model("post", postSchema);

export default Post;
