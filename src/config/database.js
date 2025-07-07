const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://matcha:Matcha2025@matcha.bjnyfq5.mongodb.net/?retryWrites=true&w=majority&appName=Matcha"
  );
};

connectDB()
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

module.exports = connectDB;
