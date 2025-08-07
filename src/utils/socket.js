const socket = require("socket.io");
const { Chat } = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ userId, id, firstName }) => {
      const roomId = [userId, id].sort().join("-");
      socket.join(roomId);
    });

    socket.on("sendMessage", async ({ userId, id, text }) => {
      try {
        const roomId = [userId, id].sort().join("-");

        // check if userId and id are friends
        const connectionRequest = await ConnectionRequest.findOne({
          $or: [
            { fromUserId: userId, toUserId: id, status: "accepted" },
            { fromUserId: id, toUserId: userId, status: "accepted" },
          ],
        });
        if (!connectionRequest) {
          throw new Error("You are not friends");
        }

        let chat = await Chat.findOne({
          participants: { $all: [userId, id] },
        });

        if (!chat) {
          chat = new Chat({ participants: [userId, id], messages: [] });
        }

        chat.messages.push({ senderId: userId, text });
        await chat.save();

        io.to(roomId).emit("receiveMessage", { text, timestamp: Date.now() });
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });

  return io;
};

module.exports = initializeSocket;
