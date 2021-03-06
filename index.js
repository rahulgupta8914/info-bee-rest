require("dotenv").config();
// Import packages
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

// error handler route
const error = require("./middleware/error");
// import routes
const validateRoutes = require("./routes/validate.routes");
const userRoutes = require("./routes/users.route");
const postRoutes = require("./routes/posts.route");
const commentRoutes = require("./routes/comments.route");
const replyCommentRoutes = require("./routes/replyComments.route");

const { DB_URI } = process.env;
const PORT = process.env.PORT || 5000;

// Start express app
const app = express();
app.use(helmet());
app.use(cookieParser());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PATCH, PUT, POST, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, x-authorization, Content-Type, Accept"
  );
  next();
});

app.use(morgan("dev")); // logger
app.use(express.json()); //Used to parse JSON bodies

app.get("/", (req, res) => {
  res.send({ message: "We are InfoBe" });
});

// extends uris with routes
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);
app.use("/comments/",replyCommentRoutes);
app.use("/validateToken", validateRoutes);

app.use((req, res, next) => {
  res.status(404).send({
    message: "We don't find you"
  });
});

app.use(error);

app.listen(PORT, () => {
  mongoose.set("useFindAndModify", false);
  mongoose.connect(
    DB_URI || "mongodb://localhost/info-be-db",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    },
    err => {
      if (err) {
        console.log(err);
      } else {
        console.log(`app is running on ${PORT}`);
        console.log("mongodb is connected!");
      }
    }
  );
});
