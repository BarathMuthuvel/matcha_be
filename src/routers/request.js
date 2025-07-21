const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const requestsRouter = express.Router();
const User = require("../models/user");

// Route to send a connection request
requestsRouter.post(
  "/request/send/:status/:userId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.userId;
      const status = req.params.status;

      // Validate status
      const validStatuses = ["ignored", "interested"];
      if (!validStatuses.includes(status)) {
        return res.status(400).send({
          message: `Invalid status. Status must be one of ${validStatuses.join(
            ", "
          )}`,
        });
      }

      // Validate user IDs
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).send({
          message: "User not found",
        });
      }

      // Check if the fromUserId is the same as toUserId
      if (fromUserId.toString() === toUserId) {
        return res.status(400).send({
          message: "Cannot send a connection request to yourself",
        });
      }

      // Check if a connection request already exists
      const existingRequest = await ConnectionRequest.findOne({
        $or: [
          {
            fromUserId,
            toUserId,
          },
          {
            fromUserId: toUserId,
            toUserId: fromUserId,
          },
        ],
      });

      if (existingRequest) {
        return res.status(400).send({
          message: "Connection request already exists",
        });
      }

      // Create a new connection request
      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();
      res.status(200).send({
        message: "Connection request sent successfully",
        data,
      });
    } catch (error) {
      console.error("Error sending connection request:", error);
      res.status(500).send({
        message: "Internal server error",
        error: error.message,
      });
    }
  }
);

// Route to review a connection request
requestsRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUserId = req.user._id;
      const { status, requestId } = req.params;

      // Validate status
      const validStatuses = ["accepted", "rejected"];
      if (!validStatuses.includes(status)) {
        return res.status(400).send({
          message: `Invalid status`,
        });
      }

      // Find the connection request
      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUserId, // Ensure the request belongs to the logged-in user
        status: "interested", // Only allow review of requests with 'interested' status
      });

      if (!connectionRequest) {
        return res.status(404).send({
          message: "Connection request not found or not eligible for review",
        });
      }

      // Update the status of the connection request
      connectionRequest.status = status;
      await connectionRequest.save();

      res.status(200).send({
        message: "Connection request reviewed successfully",
        data: connectionRequest,
      });
    } catch (error) {
      console.error("Error reviewing connection request:", error);
      res.status(500).send({
        message: "Internal server error",
        error: error.message,
      });
    }
  }
);

module.exports = requestsRouter;
