const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  emailId: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    required: true,
    min: 18, // Assuming age cannot be negative
  },
  gender: {
    type: String,
    required: true,
    trim: true,
    validate: function (value) {
      const validGenders = ["male", "female", "other"];
      if (!validGenders.includes(value)) {
        throw new Error("Invalid gender");
      }
    },
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
