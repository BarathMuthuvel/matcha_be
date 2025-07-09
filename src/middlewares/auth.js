const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    // Get token from cookies (should be req.cookies.token)
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).send({ message: "Unauthorized access: No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, "your_jwt_secret");
    } catch (err) {
      return res.status(401).send({ message: "Unauthorized access: Invalid token" });
    }

    const { userId } = decoded;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    req.user = user; // Attach user to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(500).send({ message: error.message || "Internal server error" });
  }
}

module.exports = { userAuth };