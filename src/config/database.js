const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4, // Force IPv4
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverApi: {
        version: "1",
        strict: true,
        deprecationErrors: true,
      },
    };

    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(mongoURI, options);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);

    // Additional debugging information
    if (error.code === "EREFUSED") {
      console.error("DNS resolution failed. This could be due to:");
      console.error("1. Network connectivity issues");
      console.error("2. Firewall blocking the connection");
      console.error("3. DNS server issues");
      console.error("4. MongoDB Atlas cluster being down");
    }

    // Retry connection after 5 seconds
    console.log("Retrying connection in 5 seconds...");
    setTimeout(() => {
      connectDB();
    }, 5000);
  }
};

// Handle connection events
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected");
});

connectDB()
  .then(() => console.log("Database connection initiated"))
  .catch((err) =>
    console.error("Failed to initiate database connection:", err)
  );

module.exports = connectDB;
