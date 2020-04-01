const express = require("express");
const router = express.Router();
const replyCommentController = require("../controller/replyComment.controller");
const { isAuthenticated } = require("../middleware/auth");

router.post("/:id/replies", isAuthenticated, replyCommentController.replyComment);
router.patch("/:id/replies/:replyId", isAuthenticated, replyCommentController.updateReplyComment);
router.delete("/:id/replies/:replyId", isAuthenticated, replyCommentController.deleteReplyComment);

module.exports = router;