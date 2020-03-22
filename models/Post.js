const mongoose = require("mongoose");
const { CommentSchema } = require("./Comment");

const Post = new mongoose.Schema(
  {
    title: { type: String, max: 32, required: true },
    description: { type: String, max: 5000, required: true },
    views: { type: Number, default: 0 },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    comments: [CommentSchema]
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

Post.statics.getPosts = function(skip, limit) {
  return this.find()
    .skip(skip)
    .limit(limit)
    .sort({ _id: -1 });
};

Post.set("toJSON", {
  transform: function(doc, ret, opt) {
    delete ret["__v"];
    return ret;
  }
});

module.exports = mongoose.model("Post", Post);
