const { Post, validatePost } = require("../models/Post");
const mongoose = require("mongoose");
const asyncMiddleware = require("../middleware/async");

exports.getPosts = asyncMiddleware(async (req, res, next) => {
  const limit = Number(req.params.limit) === 0 ? 1 : Number(req.params.limit);
  const skip = Number(req.params.skip);
  if ((limit && skip) || skip === 0) {
    const posts = await Post.getPosts(skip, limit);
    const jsonData = JSON.stringify(posts);
    const addHyperMedia = JSON.parse(jsonData).map(item => {
      const obj = {
        ...item,
        visit: req.protocol + "://" + req.get("host") + "/posts/" + item._id
      };
      delete obj["_id"];
      return obj;
    });
    if (posts.length === 0) {
      res.status(404).send({ messages: "no posts" });
    } else {
      res.send({ posts: addHyperMedia });
    }
  } else {
    res.status(400).send({ message: "please pass limit and skip" });
  }
});

exports.getSinglepost = asyncMiddleware(async (req, res, next) => {
  const { id } = req.params;
  const _id = mongoose.Types.ObjectId.isValid(id);
  if (_id) {
    const post = await Post.findOne({ _id: id })
      .populate("author")
      .populate("comments.author");
    if (post) {
      res.status(200).send({ message: "post found!", post: post });
    } else {
      res.status(404).send({ message: "Post doesn't exist!" });
    }
  } else {
    res.status(400).send({ message: "invalid id type id " + _id });
  }
});

exports.createPost = asyncMiddleware(async (req, res, next) => {
  const { title, description } = req.body;
  const { error } = validatePost(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  const post = new Post({ description, author: req.user, title });
  const save = await post.save();
  return res.status(201).send({
    message: "Successfully post created",
    post:
      req.protocol + "://" + req.get("host") + req.originalUrl + save._id + "/"
  });
});

exports.deletePost = asyncMiddleware(async (req, res, next) => {
  const id = req.params.id;
  if (id) {
    const post = await Post.findOne({ _id: id });
    if (post) {
      if (post.author.toString() === req.user._id.toString()) {
        await post.remove();
        return res.status(200).send({ message: "Post deleted!" });
      } else {
        return res.status(400).send({ message: "Bad request!" });
      }
    } else {
      return res.status(400).send({ message: "Post not found!" });
    }
  } else {
    return res.status(400).send({ message: "Provide a valid id!" });
  }
});
