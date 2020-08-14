const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("@hapi/joi");
const Schema = mongoose.Schema;
const saltRounds = bcrypt.genSaltSync(10);

const User = new Schema(
  {
    name: { type: String, default: "No Name", max: 32 },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// hash user password before saving into database
User.pre("save", function() {
  this.password = bcrypt.hashSync(this.password, saltRounds);
});

User.set("toJSON", {
  transform: function(doc, ret, opt) {
    delete ret["password"];
    delete ret["__v"];
    return ret;
  }
});

User.methods.generateToken = function() {
  return jwt.sign(
    {
      id: this._id,
      name: this.name,
      email: this.email
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// validate for sign up
const validateSignUp = body => {
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
      .min(1)
      .required(),
    lastName: Joi.string()
      .max(32)
      .min(1)
      .required()
  }).with("password", "confirmPassword");
  return JoiSchema.validate(body);
};
// validate for sign in
const validateSignIn = body => {
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
  return JoiSchema.validate(body);
};

module.exports = {
  User: mongoose.model("User", User),
  validateSignUp,
  validateSignIn
};
