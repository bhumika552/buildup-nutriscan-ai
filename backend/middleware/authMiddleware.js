const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to strictly protect routes (e.g. fetching user history)
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "JWT_SECRET");

      // Get user from token and attach to request
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ error: "Not authorized, user not found" });
      }
      return next();
    } catch (error) {
      console.error("Auth protect middleware error:", error.message);
      return res.status(401).json({ error: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ error: "Not authorized, no token" });
  }
};

// Middleware to optionally check for user (e.g. for /analyze route)
const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "JWT_SECRET");

      // Attach user to request
      req.user = await User.findById(decoded.id).select("-password");
    } catch (error) {
      // Don't fail the request, just log and proceed as guest
      console.log("Optional auth token verification failed:", error.message);
    }
  }

  next();
};

module.exports = { protect, optionalAuth };
