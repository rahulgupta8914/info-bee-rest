const Post = require("../models/Post");
const Joi = require("@hapi/joi");
const mongoose = require("mongoose");
const { Comment } = require("../models/Comment");

exports.getPosts = async (req, res, next) => {
  // const { limit, skip } = req.params;
  const limit = Number(req.params.limit) === 0 ? 1 : Number(req.params.limit);
  const skip = Number(req.params.skip);
  if ((limit && skip) || skip === 0) {
    try {
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
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  } else {
    res.status(400).send({ message: "please pass limit and skip" });
  }
};

exports.getSinglepost = async (req, res, next) => {
  const { id } = req.params;
  try {
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
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
  const { title, description } = req.body;
  const JoiSechma = Joi.object({
    title: Joi.string()
      .max(32)
      .min(1)
      .required(),
    description: Joi.string()
      .max(5000)
      .min(1)
      .required()
  });
  const post = new Post({ description, author: req.user, title });
  try {
    await JoiSechma.validateAsync(req.body);
    const save = await post.save();
    res.status(201).send({
      message: "Successfully post created",
      post:
        req.protocol +
        "://" +
        req.get("host") +
        req.originalUrl +
        save._id +
        "/"
    });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

exports.createPost = async (req, res, next) => {
  const { title, description } = req.body;
  const JoiSechma = Joi.object({
    title: Joi.string()
      .max(32)
      .min(1)
      .required(),
    description: Joi.string()
      .max(5000)
      .min(1)
      .required()
  });
  const post = new Post({ description, author: req.user, title });
  try {
    await JoiSechma.validateAsync(req.body);
    const save = await post.save();
    res.status(201).send({
      message: "Successfully post created",
      post:
        req.protocol +
        "://" +
        req.get("host") +
        req.originalUrl +
        save._id +
        "/"
    });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

exports.createComment = async (req, res, next) => {
  try {
    const _id = mongoose.Types.ObjectId.isValid(req.params.id);
    const JoiSechma = Joi.object({
      comment: Joi.string()
        .max(3000)
        .min(1)
        .required()
    });
    await JoiSechma.validateAsync(req.body);
    if (_id) {
      const post = await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $push: {
            comments: new Comment({
              comment: req.body.comment,
              author: req.user
            })
          }
        },
        { new: true }
      );
      if (post) {
        res.status(201).send({ message: "New Comment added" });
      }
    } else {
      res.status(400).send({ message: "invalid id type id " + _id });
    }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};
