const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      console.error(err); // Log the error for debugging
      res.status(500).json({
        status: 500,
        message: "Internal Server Error",
        error: err.message || "Something went wrong",
      });
      next(err); // Call the next middleware with the error
    });
  };
};
module.exports = {
  asyncHandler,
};
