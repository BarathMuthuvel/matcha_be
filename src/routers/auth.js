const express = require("express");
const { validateUserInput } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const authRouter = express.Router();

// Endpoint to register a new user
authRouter.post("/signup", async (req, res) => {
  try {
    const { errors, isValid } = validateUserInput(req);
    if (!isValid) {
      return res.status(400).send({ message: "Validation failed", errors });
    }

    const { firstName, lastName, emailId, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    const token = await savedUser.getJWT(); // Generate JWT token
    res.cookie("token", token, {
      expires: new Date(Date.now() + 3600000),
      httpOnly: true,
    });

    res
      .status(201)
      .send({ message: "User registered successfully", User: savedUser });
  } catch (error) {
    res.status(500).send({ message: error.message || "Internal server error" });
  }
});

// Endpoint to login a user
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const isMatch = await user.validatePassword(password);
    if (isMatch) {
      const token = await user.getJWT(); // Generate JWT token
      res.cookie("token", token, {
        expires: new Date(Date.now() + 3600000),
        httpOnly: true,
      }); // Set cookie with token
      res.status(200).send({ message: "Login successful", User: user });
    } else {
      return res.status(401).send({ message: "Invalid password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send({ message: error.message || "Internal server error" });
  }
});

// Endpoint to logout a user
authRouter.post("/logout", (req, res) => {
  try {
    res.clearCookie("token"); // Clear the cookie
    res.status(200).send({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).send({ message: error.message || "Internal server error" });
  }
});

module.exports = authRouter;
