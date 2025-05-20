import { NextFunction, Request, Response } from "express";
import User from "../database/schemas/userSchema";
import {
  AggregateAllPosts,
  AggregateFollowing,
  FollowingI,
  ModifiedPostsI,
  PostBetweenDatesI,
  PostCountI,
  RegisterBody,
  UserI,
} from "../interfaces";
import Post from "../database/schemas/postSchema";
import Comment from "../database/schemas/commentSchema";
import mongoose from "mongoose";
import Follower from "../database/schemas/followSchema";

export const registerUser = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;
  try {
    const newUser = await new User(body).save();
    const { password, ...rest } = newUser.toObject();
    return res.status(200).send({ msg: `User added successfully`, user: rest });
  } catch (err) {
    return res
      .status(400)
      .send({ msg: `Error in route /register`, error: (err as Error).message });
  }
};

export const loginUser = (
  req: Request<{}, {}, { username: string; password: string }>,
  res: Response,
  next: NextFunction
) => {
  // const user: UserI | null = req.user;
  // const { user } = req;
  if (!req.user)
    return res.status(401).send({ msg: "Please Authenticate first" });
  const user = (req.user as UserI).toObject();
  const { password, ...rest } = user;
  return res.status(200).send({ msg: "Login Successful", user: rest });
};

export const addPost = async (
  req: Request<
    {},
    {},
    {
      title: string;
      description: string;
      createdBy?: mongoose.Types.ObjectId;
      createdOn?: Date;
    }
  >,
  res: Response,
  next: NextFunction
) => {
  const { user } = req;
  let body = req.body;
  if (!user) return res.status(401).send({ msg: "Please Authenticate first" });
  body = { ...body, createdBy: (user as UserI)._id, createdOn: new Date() };
  try {
    const newPost = await new Post(body).save();
    return res
      .status(200)
      .send({ msg: "Post added successfully", post: newPost });
  } catch (err) {
    return res
      .status(400)
      .send({ msg: "Error in route /addPost", error: (err as Error).message });
  }
};

export const getAllPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user } = req;
  try {
    const posts = await Post.aggregate<AggregateAllPosts>([
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          "user.password": 0,
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "postId",
          as: "comments",
        },
      },
      {
        $addFields: {
          noOfComments: { $size: "$comments" },
        },
      },
    ]);
    const matchResult = await Follower.aggregate([
      { $match: { userId: user?._id } },
    ]);
    let followingObject;
    // if there are no documents returned by match pipeline, then return an empty array for followings
    if (matchResult.length === 0) {
      followingObject = [{ _id: null, followings: [] }];
    } else {
      followingObject = (await Follower.aggregate([
        {
          $match: { userId: user?._id },
        },
        {
          $group: {
            _id: "$userId",
            followings: { $push: "$following" },
          },
        },
      ])) as AggregateFollowing[];
    }

    let modifiedPosts;
    // if the user is following someone, then we need to add a field called following in each post
    if (followingObject[0].followings.length > 0) {
      const followingArr = followingObject[0].followings.map(
        (x: mongoose.Types.ObjectId) => {
          return x.toString();
        }
      ) as [string];
      modifiedPosts = posts.map((post) => {
        const isFollowing = followingArr.includes(post.createdBy.toString());
        return { ...post, following: isFollowing };
      }) as ModifiedPostsI[];
      return res.status(200).send({
        msg: "All Posts",
        modifiedPosts,
      });
      // if the user is not following anyone, then we need to add a field called following with a value of false in each post
    } else {
      modifiedPosts = posts.map((post) => {
        return { ...post, following: false };
      }) as ModifiedPostsI[];

      return res.status(200).send({ msg: "All Posts", modifiedPosts });
    }
  } catch (err) {
    return res.status(400).send({
      msg: "Error in route /getAllPosts",
      error: (err as Error).message,
    });
  }
};

export const getPostCount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // return res.status(200).send({ msg: "Post Count", count: 10 });
  try {
    const result = (await Post.aggregate([
      {
        $group: {
          _id: "$createdBy",
          postCount: { $sum: 1 },
        },
      },
      {
        $project: {
          userId: "$_id",
          _id: 0,
          postCount: 1,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $project: {
          "user.password": 0,
        },
      },
    ])) as PostCountI[];
    return res.status(200).send({ msg: "Post Count", count: result });
  } catch (err) {
    return res.status(400).send({
      msg: "Error in route /getPostCount",
      error: (err as Error).message,
    });
  }
};

export const getPostsBetweenDates = async (
  req: Request<{}, {}, { startDate: string; endDate: string }>,
  res: Response,
  next: NextFunction
) => {
  // return res.status(200).send({ msg: "Post Count", count: 10 });
  const { startDate, endDate } = req.body;
  let result = (await Post.aggregate([
    {
      $match: {
        createdOn: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
    },
  ])) as PostBetweenDatesI[];
  return res.status(200).send({
    msg: "Post Between Dates",
    result: result,
    totalLength: result.length,
  });
};

export const addComment = async (
  req: Request<{}, {}, { postId: mongoose.Types.ObjectId; msg: string }>,
  res: Response,
  next: NextFunction
) => {
  const {
    body: { postId, msg },
    user,
  } = req;
  try {
    const newComment = await new Comment({
      postId,
      commentMessage: msg,
      commentBy: new mongoose.Types.ObjectId(user?._id),
    }).save();

    return res
      .status(200)
      .send({ msg: "Comment added successfully", newComment });
  } catch (err) {
    return res.status(401).send({
      msg: "Error occured in /comment route",
      error: (err as Error).message,
    });
  }
};

export const followUser = async (
  req: Request<{}, {}, { id: mongoose.Types.ObjectId }>,
  res: Response,
  next: NextFunction
) => {
  const {
    body: { id: otherUserId },
    user,
  } = req;
  try {
    await new Follower({
      userId: new mongoose.Types.ObjectId(user?._id),
      following: new mongoose.Types.ObjectId(otherUserId),
    }).save();
    return res.status(200).send({ msg: "follower successfully added" });
  } catch (err) {
    return res
      .status(401)
      .send({ msg: "error in /follow route", error: (err as Error).message });
  }
};

export const getFollowings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = (await Follower.aggregate([
      {
        $group: {
          _id: "$userId",
          following: { $push: "$following" },
        },
      },
      {
        $unwind: "$following",
      },
      {
        $lookup: {
          from: "users",
          localField: "following",
          foreignField: "_id",
          as: "following_user_details",
        },
      },
      {
        $unwind: "$following_user_details",
      },
      {
        $project: {
          "following_user_details.password": 0,
        },
      },
      {
        $group: {
          _id: "$_id",
          followingIds: { $push: "$following" },
          followingUserDetails: { $push: "$following_user_details" },
        },
      },
    ])) as FollowingI[];

    return res.status(200).send(result);
  } catch (err) {
    return res.status(401).send({
      msg: "error in /followings route",
      error: (err as Error).message,
    });
  }
};
