const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { User } = require("../models/Users");
router.post("/", async (req, res, next) => {
  const token = req.cookies["x-access-token"];
  if (token) {
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    if (decode) {
      req.user = { _id: decode.id, email: decode.email, name: decode.name };
      const findUser = await User.findOne({
        _id: decode.id,
        email: decode.email,
        name: decode.name
      });
      if (findUser) {
        req.user = {
          email: findUser.email,
          _id: findUser._id,
          username: findUser.username,
          name: findUser.name
        };
        res.status(200).json({ message: "You can log in", token, user: req.user });
      } else {
        res.status(404).json({ message: "This user doesn't exist!" });
      }
    } else {
      res.status(401).json({ message: "Somthing failed!" });
    }
  } catch (error) {
    // console.log(error)
    res.status(401).json({ message: error.message });
  }
  } else {
    res.status(401).json({ message: "You must login first!" });
  }
});

module.exports = router;
