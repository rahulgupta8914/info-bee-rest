const express = require("express");
const router = express.Router();
const chatController = require("../controller/chat.controller");
const { isAuthenticated } = require("../middleware/auth");

router.get("/conversations",isAuthenticated,chatController.getConversationList);
router.post("/conversations",isAuthenticated,chatController.createConversation);
router.post("/messages", isAuthenticated, chatController.sendMessage);
router.get("/messages", isAuthenticated, chatController.fetchMessages);

module.exports = router;
