const categoryModel = require("../../category.model");

const checkCategory = async (field, value) => {
  console.log(
    "Check auth function called with field:",
    field,
    "and value:",
    value
  );
  const query = {};
  query[field] = value; // Dynamically create the query object
  console.log("Query object:", query); // Log the query object for debugging
  const category = await categoryModel.findOne(query).lean();
  if (category) {
    return category;
  } else {
    return false; // User doesn't exist
  }
};
module.exports = {
  checkCategory,
};
