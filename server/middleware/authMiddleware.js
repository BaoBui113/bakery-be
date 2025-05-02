const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../core/error.response");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("No token provided", 401);
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_USER);
    req.user = decoded;
    next();
  } catch (err) {
    throw new UnauthorizedError("Invalid token", 401);
  }
}
module.exports = authMiddleware;
