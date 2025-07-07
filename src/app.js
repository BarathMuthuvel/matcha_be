const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const { validateUserInput } = require("./utils/validation");
const bcrypt = require("bcrypt");

app.use(express.json()); // Middleware to parse JSON bodies

app.post("/signup", async (req, res) => {
  try {
    const { errors, isValid } = validateUserInput(req);
    if (!isValid) {
      return res.status(400).send({ message: "Validation failed", errors });
    }

    const { firstName, lastName, emailId, password, age, gender } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
      age,
      gender,
    });
    await newUser.save();
    res.status(201).send({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).send({ message: error.message || "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ message: "Invalid credentials" });
    }

    res.status(200).send({ message: "Login successful" });
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
});

app.delete("/users", async (req, res) => {
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

app.patch("/users/:id", async (req, res) => {
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
