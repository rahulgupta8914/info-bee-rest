const {
  Comment,
  validateComment,
  validateUpdateComment,
} = require("../models/Comment");
const asyncMiddleware = require("../middleware/async");
const { Post } = require("../models/Post");
const { mongooseTOJson } = require("../utils/utils");

const addComment = asyncMiddleware(async (req, res, next) => {
  const { error } = validateComment(req.body);
  if (error) return res.status(400).send({ messsage: error.message });
  const post = await Post.findById(req.body.postId);
  if (post) {
    const newComment = new Comment({
      post: req.body.postId,
      comment: req.body.comment,
      author: req.user._id
    });
    const comment = await newComment.save();
    const jsonData = mongooseTOJson(comment);
    delete jsonData.updated_at;
    delete jsonData.post;
    return res
      .status(201)
      .send({ message: "Successfully Commented!", comment: jsonData });
  } else {
    return res.status(404).send({ message: "Post not found!" });
  }
});

const deleteComment = asyncMiddleware(async (req, res, next) => {
  const commentId = req.params.id;
  if (commentId) {
    const findComment = await Comment.findById(commentId).populate("post");
    if (findComment) {
      if (
        findComment.author.equals(req.user._id) ||
        findComment.post.author.equals(req.user._id)
      ) {
        await findComment.remove();
        return res.status(200).send({ message: "Comment deleted!" });
      } else {
        return res
          .status(400)
          .send({ message: "You don't have permission to do that!" });
      }
    } else {
      return res.status(403).send({ message: "Comment dosen't exist!" });
    }
  } else {
    return res.status(400).send({ message: "Please provide commentId!" });
  }
});

const updateComment = asyncMiddleware(async (req, res, next) => {
  const commentId = req.params.id;
  const { error } = validateUpdateComment({ ...req.body, commentId });
  if (error) return res.status(400).send({ message: error.message });
  const findComment = await Comment.findById(commentId).populate("author");
  if (findComment) {
    findComment.comment = req.body.comment;
    findComment.updated_at = new Date();
    const comment = await findComment.save();
    const jsonData = mongooseTOJson(comment);
    delete jsonData.author.created_at;
    delete jsonData.author.updated_at;
    return res
      .status(200)
      .send({ message: "comment updated!", comment: jsonData });
  } else {
    return res.status(403).send({ message: "Comment dosen't exist!" });
  }
});

module.exports = { addComment, deleteComment, updateComment };
