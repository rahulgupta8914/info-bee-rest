const express = require("express");
const userControll = require("../controller/user.controller");
const router = express.Router();

router.post("/", userControll.signUp);
router.post("/authenticate", userControll.signIn);
router.post("/signout", userControll.signOut);

module.exports = router;
