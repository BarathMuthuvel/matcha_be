const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileInput } = require("../utils/validation");
const bcrypt = require("bcrypt");
const profileRouter = express.Router();

// Endpoint to view the profile of the logged-in user
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.status(200).send({ message: "Profile data", user });
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
});

// Endpoint to edit the profile of the logged-in user
profileRouter.put("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileInput(req)) {
      return res.status(400).send({ message: "Validation failed" });
    }

    const user = req.user;

    // Log the incoming request data
    console.log("Incoming request body:", req.body);

    // Convert skills to array if it's a string
    if (typeof req.body.skills === "string") {
      req.body.skills = req.body.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (Array.isArray(req.body.skills)) {
      // Ensure skills array contains only non-empty strings
      req.body.skills = req.body.skills.filter(
        (skill) => skill && skill.trim()
      );
    } else if (req.body.skills === "" || req.body.skills === null) {
      // Set empty array if skills is empty
      req.body.skills = [];
    }

    // Validate age before assignment
    if (
      req.body.age !== undefined &&
      req.body.age !== null &&
      req.body.age !== ""
    ) {
      const age = parseInt(req.body.age);
      if (isNaN(age) || age < 18) {
        return res.status(400).send({
          message: "Age must be a valid number and at least 18 years old",
        });
      }
      req.body.age = age;
    } else if (req.body.age === "" || req.body.age === null) {
      // Remove age field if it's empty
      delete req.body.age;
    }

    // Validate gender before assignment
    if (req.body.gender !== undefined) {
      const validGenders = ["male", "female", "other"];
      if (!validGenders.includes(req.body.gender)) {
        return res.status(400).send({
          message: "Gender must be one of: male, female, other",
        });
      }
    }

    Object.assign(user, req.body);
    await user.save();

    res.status(200).send({ message: "Edit profile", user });
  } catch (error) {
    console.error("Profile edit error:", error);
    res.status(500).send({
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Endpoint to change the password of the logged-in user
profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate the current password and update to the new password
    const user = req.user;
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).send({ message: "Current password is incorrect" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).send({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
});

module.exports = profileRouter;
