const express = require("express");
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");

const profileRouter = express.Router();

profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.status(200).send({ message: "Profile data", user });
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
});

profileRouter.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
});

profileRouter.delete("/users", async (req, res) => {
  try {
    const userId = req.body.id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).send({ message: "User not found" });
    }

    res.status(200).send({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
});

profileRouter.patch("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const data = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).send({ message: "User not found" });
    }

    res.status(200).send(updatedUser);
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
});

module.exports = profileRouter;
