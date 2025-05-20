import { Types } from "mongoose";

export interface UserI {
  _id: Types.ObjectId;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterBody {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
