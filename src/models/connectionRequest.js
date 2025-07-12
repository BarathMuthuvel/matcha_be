const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true, // Ensure fromUserId is unique
      ref: "User", // Reference to User model
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true, // Ensure toUserId is unique
      ref: "User", // Reference to User model
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message:
          "Status must be one of 'ignored', 'interested', 'accepted', or 'rejected'",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster search by fromUserId and toUserId
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

connectionRequestSchema.pre("save", function (next) {
  // Custom logic before saving a connection request
  const connectionRequest = this;
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("Cannot send a connection request to yourself");
  }
  next();
});

const ConnectionRequest = new mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);

module.exports = ConnectionRequest;
