const authModel = require("../../auth.model");

const checkAuth = async (field, value) => {
  try {
    const query = {};
    query[field] = value; // Dynamically create the query object
    console.log("Query object:", query); // Log the query object for debugging

    const user = await authModel
      .findOne(query) // Use the query with the field and value
      .lean();

    if (user) {
      return user;
    } else {
      return false; // User doesn't exist
    }
  } catch (error) {
    console.error("Error in checkAuth:", error);
    return false; // Return false in case of an error
  }
};

module.exports = {
  checkAuth,
};
