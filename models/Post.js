const mongoose = require("mongoose");
const { Comment } = require("./Comment");
const Joi = require("@hapi/joi");

const Post = new mongoose.Schema(
  {
    title: { type: String, max: 32, required: true },
    description: { type: String, max: 5000, required: true },
    views: { type: Number, default: 0 },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

Post.statics.getSinglePost = function(id) {
  const findPost = this.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        localField: "author",
        from: "users",
        foreignField: "_id",
        as: "author"
      }
    },
    { $unwind: "$author" },
    {
      $project: {
        __v: 0,
        "author.password": 0,
        "author.created_at": 0,
        "author.updated_at": 0,
        "author.__v": 0,
      }
    }
  ]);
  return findPost;
};
Post.statics.getPosts = function(skip, limit, req) {
  return this.aggregate([
    {
      $lookup: {
        localField: "author",
        from: "users",
        foreignField: "_id",
        as: "author"
      }
    },
    {
      $unset: [
        "author.password",
        "author.created_at",
        "author.updated_at",
        "author.__v"
      ]
    },
    { $unwind: "$author" },
    {
      $lookup: {
        localField: "_id",
        from: "comments",
        foreignField: "post",
        as: "comments"
      }
    },
    {
      $addFields: { _id: { $toString: "$_id" } }
    },
    { $sort: { created_at: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        title: 1,
        description: 1,
        author: 1,
        views: 1,
        created_at: 1,
        commentCount: { $size: "$comments" },
        link: {
          $concat: [req.protocol + "://" + req.get("host") + "/posts/", "$_id"]
        }
      }
    }
  ]);
};

Post.pre("remove", async function(next) {
  await Comment.remove({ post: this._id });
  next();
});

Post.set("toJSON", {
  transform: function(doc, ret, opt) {
    delete ret["__v"];
    return ret;
  }
});

const validatePost = body => {
  const schema = Joi.object({
    title: Joi.string()
      .max(32)
      .min(1)
      .required(),
    description: Joi.string()
      .max(5000)
      .min(1)
      .required()
  });
  return schema.validate(body);
};

module.exports = { Post: mongoose.model("Post", Post), validatePost };
