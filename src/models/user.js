const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    index: true, // Index for faster search
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  emailId: {
    type: String,
    required: true,
    trim: true,
    unique: true, // Ensure email is unique
    lowercase: true, // Store email in lowercase
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  profilePicture: {
    type: String,
    default:
      "https://img.freepik.com/premium-vector/person-with-blue-shirt-that-says-name-person_1029948-7040.jpg", // Default profile picture
  },
  bio: {
    type: String,
  },
  skills: {
    type: [String], // Array of strings for skills
  },
  age: {
    type: Number,
    min: 18, // Assuming age cannot be negative
  },
  gender: {
    type: String,
    trim: true,
    validate: function (value) {
      const validGenders = ["male", "female", "other"];
      if (!validGenders.includes(value)) {
        throw new Error("Invalid gender");
      }
    },
  },
});

userSchema.index({ firstName: 1, lastName: 1 }); // Compound index for faster search by name

//Schema methods
userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ userId: user._id }, "your_jwt_secret", {
    expiresIn: "1h",
  });
  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;

  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHash
  );

  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }
  return isPasswordValid;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
