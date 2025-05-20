import { Router } from "express";
import {
  registerUser,
  loginUser,
  addPost,
  getAllPosts,
  getPostCount,
  getPostsBetweenDates,
  addComment,
  followUser,
  getFollowings,
} from "../controllers/userController";
import passport from "../strategies/localStrategy";

const router = Router();
// first route.. Testing purpose
router.get("/", () => {
  console.log(`Hello world`);
});

// registering a user
router.post("/register", (req, res, next) => {
  registerUser(req, res, next);
});

// logging in a user
router.post("/login", passport.authenticate("local"), (req, res, next) => {
  loginUser(req, res, next);
});

// add a post
router.post("/post", (req, res, next) => {
  addPost(req, res, next);
});

// get all posts
router.get("/post", (req, res, next) => {
  getAllPosts(req, res, next);
});

// get post count
router.get("/post-count", (req, res, next) => {
  getPostCount(req, res, next);
});

// get posts between two dates
router.post("/filtered-posts", (req, res, next) => {
  getPostsBetweenDates(req, res, next);
});

// add a comment
router.post("/comment", (req, res, next) => {
  addComment(req, res, next);
});

// route to follow a user
router.post("/follow", (req, res, next) => {
  followUser(req, res, next);
});

// route to see the followings of each user
router.get("/followings", (req, res, next) => {
  getFollowings(req, res, next);
});
export default router;
