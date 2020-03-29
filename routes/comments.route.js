const express = require("express");
const router = express.Router();
const commentController = require("../controller/comment.controller");
const { isAuthenticated } = require("../middleware/auth");

router.post("/", isAuthenticated, commentController.addComment);
router.patch("/:id", isAuthenticated, commentController.updateComment);
router.delete("/:id", isAuthenticated, commentController.deleteComment);

router.post("/:id/reply", isAuthenticated, commentController.replyComment);

module.exports = router;
