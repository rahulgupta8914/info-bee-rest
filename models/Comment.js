const mongoose = require("mongoose");

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
module.exports = { CommentSchema, Comment };
