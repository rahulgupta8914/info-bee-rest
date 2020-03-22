const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Schema = mongoose.Schema;
const saltRounds = bcrypt.genSaltSync(10);

const User = new Schema(
  {
    name: { type: String, default: "No Name", max: 32 },
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

User.index({ username: 1, email: 1 }, { unique: true });
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

module.exports = mongoose.model("User", User);
