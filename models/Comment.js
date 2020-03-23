const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const CommentSchema = new mongoose.Schema(
  {
    comment: { type: String, max: 3000, require: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
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
    comment: Joi.string()
      .max(3000)
      .min(1)
      .required()
  });
  return JoiSechma.validate(body);
};
module.exports = { CommentSchema, Comment, validateComment };
