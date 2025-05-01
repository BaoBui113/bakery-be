const { default: mongoose } = require("mongoose");

const convertToObjectMongoose = (id) => {
  return new mongoose.Types.ObjectId(id);
};
module.exports = convertToObjectMongoose;
