const Joi = require("@hapi/joi");
const User = require("../models/Users");
const bcrypt = require("bcryptjs");

// sign up
exports.signUp = async (req, res, next) => {
  // Joi validation
  const JoiSchema = Joi.object({
    username: Joi.string()
      .max(32)
      .min(5)
      .required(),
    email: Joi.string()
      .email()
      .max(32)
      .min(1)
      .required(),
    password: Joi.string()
      .max(64)
      .min(6)
      .required(),
    confirmPassword: Joi.ref("password"),
    firstName: Joi.string()
      .max(32)
      .min(5)
      .required(),
    lastName: Joi.string()
      .max(32)
      .min(5)
      .required()
  }).with("password", "confirmPassword");

  try {
    await JoiSchema.validateAsync(req.body);
    const { username, email, password, firstName, lastName } = req.body;
    const user = new User({
      name: `${firstName} ${lastName}`,
      username,
      email,
      password
    });
    const userSaved = await user.save();
    res
      .cookie("x-access-token", user.generateToken(), { httpOnly: true })
      .json({
        message: "Successfully registered",
        user: userSaved,
        token: user.generateToken()
      });
  } catch (error) {
    if (
      error &&
      error.code === 11000 &&
      error.keyPattern.username === 1 &&
      error.keyPattern.email === 1
    ) {
      res.status(400).json({ message: "email and username must be unique" });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};

// login
exports.signIn = async (req, res, next) => {
  const JoiSchema = Joi.object({
    username: Joi.string()
      .max(32)
      .min(5)
      .alphanum(),
    email: Joi.string()
      .email()
      .max(32)
      .min(1),
    password: Joi.string()
      .max(64)
      .min(6)
      .required()
  }).xor("username", "email");
  try {
    await JoiSchema.validateAsync(req.body);
    const { username, email, password } = req.body;
    const queryObject = () => {
      if (username) {
        return { username, password };
      } else {
        return { email, password };
      }
    };
    const findUser = await User.findOne(queryObject);
    if (findUser) {
      const hashPassword = findUser.password;
      const result = await bcrypt.compare(password, hashPassword);
      if (result) {
        return res
          .cookie("x-access-token", findUser.generateToken(), { httpOnly: true })
          .status(200)
          .json({
            message: "Successfully signed in!",
            token: findUser.generateToken()
          });
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
