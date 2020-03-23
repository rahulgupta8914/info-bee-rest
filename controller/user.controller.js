const { User, validateSignIn, validateSignUp } = require("../models/Users");
const bcrypt = require("bcryptjs");
const asyncMiddleWare = require("../middleware/async");

// sign up
exports.signUp = asyncMiddleWare(async (req, res, next) => {
  // Joi validation
  const { error } = validateSignUp(req.body);
  if (error) {
    return res.status(400).send({ message: error.message });
  }
  const { username, email, password, firstName, lastName } = req.body;
  const user = new User({
    name: `${firstName} ${lastName}`,
    username,
    email,
    password
  });
  const userSaved = await user.save();
  res.cookie("x-access-token", user.generateToken(), { httpOnly: true }).json({
    message: "Successfully registered",
    user: userSaved,
    token: user.generateToken()
  });
});

exports.signIn = asyncMiddleWare(async (req, res, next) => {
  const { error } = validateSignIn(req.body);
  if (error) {
    return res.status(400).send({ message: error.message });
  }
  const { username, email, password } = req.body;
  const queryObject = username ? { username } : { email };
  const findUser = await User.findOne(queryObject);
  if (
    (findUser && findUser.username === username) ||
    findUser.email === email
  ) {
    const hashPassword = findUser.password;
    const result = bcrypt.compareSync(password, hashPassword);
    if (result) {
      return res
        .cookie("x-access-token", findUser.generateToken(), {
          httpOnly: true
        })
        .status(200)
        .json({
          message: "Successfully signed in!",
          user: findUser,
          token: findUser.generateToken()
        });
    } else {
      return res.status(400).send({ message: "password didn't matched" });
    }
  } else {
    return res.status(400).send({ message: "user doesn't exists!" });
  }
});
