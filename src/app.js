const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");

app.use(express.json()); // Middleware to parse JSON bodies
app.use(cookieParser()); // Middleware to parse cookies

// Import routers
const authRouter = require("./routers/auth");
const profileRouter = require("./routers/profile");
const requestsRouter = require("./routers/request");
const userRouter = require("./routers/user");

// Use routers
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestsRouter);
app.use("/", userRouter);

connectDB()
  .then(() => {
    console.log("MongoDB connected");
    // Start the Express server
    app.listen(9999, () => {
      console.log("Server is running on port 9999");
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
