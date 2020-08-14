const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const ConversationSchema = new Schema(
  {
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);
const MessageSchema = new Schema(
  {
    body: {
      type: String,
      maxlength: 2200,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    conversation:{ type: Schema.Types.ObjectId, ref: "Conversation" }
  },
  { timestamps: true }
);

module.exports = {
  Conversation: model("Conversation", ConversationSchema),
  Message: model("Message", MessageSchema),
};
