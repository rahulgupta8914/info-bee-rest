const {
  Comment,
  validateSubSchema,
  SubComment,
  validateSubSchemaDeleteUpdate
} = require("../models/Comment");
const { User } = require("../models/Users");
const asyncMiddleWare = require("../middleware/async");
/* reply */
const replyComment = asyncMiddleWare(async (req, res, next) => {
  const commentId = req.params.id;
  const { error } = validateSubSchema({ ...req.body, commentId });
  if (error) return res.status(400).send({ message: error.message });
  const mainComment = await Comment.findById(commentId);
  if (mainComment) {
    const to = await User.findById(req.body.replyTo);
    if (to) {
      const replyComment = new SubComment({
        to: to,
        comment: req.body.comment,
        author: req.user
      });
      mainComment.replies.push(replyComment);
      await mainComment.save();
      return res.status(200).send({ message: "Comment added!" });
    } else {
      return res.status(400).send({ message: "User not found!" });
    }
  } else {
    return res.status(400).send({ message: "Comment not found!" });
  }
});

const updateReplyComment = asyncMiddleWare(async (req, res, next) => {
  const commentId = req.params.id;
  const replyId = req.params.replyId;
  // to do
});

const deleteReplyComment = asyncMiddleWare(async (req, res, next) => {
  const commentId = req.params.id;
  const replyId = req.params.replyId;
  const { error } = validateSubSchemaDeleteUpdate({ commentId, replyId });
  if (error) res.status(400).send({ message: error.message });
  const findComment = await Comment.findById(commentId).populate("post");
  const replyComment = findComment.replies.id(replyId);
  if (findComment && replyComment) {
    if (
      findComment.post.author.equals(req.user._id) ||
      replyComment.author.equals(req.user._id)
    ) {
      findComment.replies.id(replyId).remove();
      await findComment.save();
      return res.send({ message: "Reply deleted!" });
    } else {
      return res
        .status(400)
        .send({ message: "You don't have permission to do that!" });
    }
  } else {
    return res.status(400).send({ message: "Comment not found!" });
  }
});

module.exports = { replyComment, updateReplyComment, deleteReplyComment };
