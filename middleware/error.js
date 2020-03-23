module.exports = (error, req, res, next) => {
  if (error.code === 11000) {
    res
      .status(400)
      .json({
        message: `${
          Object.getOwnPropertyNames(error.keyValue)[0]
        } must be unique, already taken by someone!`
      });
  } else {
    res.status(500).json({ message: "Something failed!" });
  }
};
