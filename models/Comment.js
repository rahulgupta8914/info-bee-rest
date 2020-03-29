const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const subSchema = new mongoose.Schema(
  {
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    comment: { type: String, max: 1000, require: true }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const CommentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true
    },
    comment: { type: String, max: 1000, require: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    replies: [subSchema]
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

CommentSchema.set("toJSON", {
  transform: function(doc, ret, opt) {
    delete ret["__v"];
    return ret;
  }
});
const Comment = mongoose.model("Comments", CommentSchema);

const validateComment = body => {
  const JoiSechma = Joi.object({
    postId: Joi.string(),
    comment: Joi.string()
      .max(3000)
      .min(1)
      .required()
  });
  return JoiSechma.validate(body);
};
const validateUpdateComment = body => {
  const JoiSechma = Joi.object({
    commentId: Joi.string().regex(
      /^[0-9a-fA-F]{24}$/,
      "Commment id should be valid Monogo id"
    ),
    comment: Joi.string()
      .max(1000)
      .min(1)
      .required()
  });
  return JoiSechma.validate(body);
};

const validateSubSchema = body => {
  const JoiSechma = Joi.object({
    commentId: Joi.string().regex(
      /^[0-9a-fA-F]{24}$/,
      "Commment id should be valid Monogo id"
    ),
    to: Joi.string().regex(
      /^[0-9a-fA-F]{24}$/,
      "mentioned user id should be valid Monogo id"
    ),
    comment: Joi.string()
      .max(1000)
      .min(1)
      .required()
  });
  return JoiSechma.validate(body);
};

module.exports = {
  CommentSchema,
  Comment,
  validateComment,
  validateUpdateComment,
  validateSubSchema
};
