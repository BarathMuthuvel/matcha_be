const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const userRouter = express.Router();

const userFields = "firstName lastName profilePicture bio skills age gender";

// Get all the pending connection requests sent by the logged-in user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedinUserId = req.user._id;
    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedinUserId,
      status: "interested",
    }).populate("fromUserId", userFields);

    res.status(200).json({
      requests: connectionRequests,
      message: "Received connection requests fetched successfully",
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all the connections of the logged-in user
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedinUserId = req.user._id;
    const connections = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedinUserId, status: "accepted" },
        { toUserId: loggedinUserId, status: "accepted" },
      ],
    })
      .populate("fromUserId", userFields)
      .populate("toUserId", userFields);

    const data = connections.map((connection) => {
      if (connection.fromUserId._id.toString() === loggedinUserId.toString()) {
        return connection.toUserId;
      }
      return connection.fromUserId;
    });

    res.status(200).json({
      connections: data,
      message: "Connections fetched successfully",
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to fetch users for the feed
userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedinUserId = req.user._id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch connection requests to hide users from feed
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        {
          fromUserId: loggedinUserId,
        },
        {
          toUserId: loggedinUserId,
        },
      ],
    }).select("fromUserId toUserId");

    // Create a set of user IDs to hide from the feed
    const hideUserFromFeed = new Set();
    connectionRequests.forEach((request) => {
      hideUserFromFeed.add(request.fromUserId.toString());
      hideUserFromFeed.add(request.toUserId.toString());
    });

    // Fetch users excluding the logged-in user and those in connection requests
    const users = await User.find({
      $and: [
        { _id: { $ne: loggedinUserId } }, // Exclude the logged-in user
        { _id: { $nin: Array.from(hideUserFromFeed) } }, // Exclude users in connection requests
      ],
    })
      .select(userFields)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      users: users,
      message: "Users fetched successfully",
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

module.exports = userRouter;
