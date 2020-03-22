const express = require("express");
const userControll = require("../controller/user.controller");
const router = express.Router();

router.post("/", userControll.signUp);
router.post("/authenticate", userControll.signIn);

module.exports = router;
