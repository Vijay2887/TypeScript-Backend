import { Types } from "mongoose";
import { Document } from "mongoose";

export interface UserI {
  _id: Types.ObjectId;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UserI extends Document {}

export interface RegisterBody {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AggregateAllPosts {
  _id: Types.ObjectId;
  title: string;
  description: string;
  createdBy: Types.ObjectId;
  createdOn: Date;
  user: UserI;
  comments: [
    {
      _id: Types.ObjectId;
      postId: Types.ObjectId;
      commentMessage: string;
      commentBy: Types.ObjectId;
    }
  ];
  noOfComments: number;
}

export interface AggregateFollowing {
  _id: Types.ObjectId;
  followings: [Types.ObjectId];
}

export interface ModifiedPostsI extends AggregateAllPosts {
  following: boolean;
}

export interface PostCountI {
  postCount: number;
  userId: Types.ObjectId;
  user: [
    {
      _id: Types.ObjectId;
      username: string;
      firstName: string;
      lastName: string;
      email: string;
    }
  ];
}

export interface PostBetweenDatesI {
  _id: Types.ObjectId;
  title: string;
  description: string;
  createdBy: Types.ObjectId;
  createdOn: Date;
}

// {
//   "_id": "68297f7b4133cd0a3da9132c",
//   "followingIds": [
//     "68297f4d4133cd0a3da91328",
//     "68297f654133cd0a3da9132a"
//   ],
//   "followingUserDetails": [
//     {
//       "_id": "68297f4d4133cd0a3da91328",
//       "username": "vijay123",
//       "firstName": "Pulipati",
//       "lastName": "vijaya simha",
//       "password": "123",
//       "email": "vijay@a.com",
//       "__v": 0
//     },
//     {
//       "_id": "68297f654133cd0a3da9132a",
//       "username": "phani123",
//       "firstName": "Aeruva",
//       "lastName": "Phaneendra",
//       "password": "123",
//       "email": "phani@a.com",
//       "__v": 0
//     }
//   ]
// }

export interface FollowingI {
  _id: Types.ObjectId;
  followings: [Types.ObjectId];
  followingUserDetails: [UserI];
}
