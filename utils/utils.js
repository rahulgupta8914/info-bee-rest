const mongooseTOJson = data => {
  return JSON.parse(JSON.stringify(data));
};
module.exports = { mongooseTOJson };
