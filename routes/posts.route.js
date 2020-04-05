const express = require("express");
const postController = require("../controller/post.controller");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");

router.get("/:page/:limit", postController.getPosts);

router.post("/", isAuthenticated, postController.createPost);

router.get("/:id", postController.getSinglePost);

router.delete("/:id", isAuthenticated, postController.deletePost);

module.exports = router;
