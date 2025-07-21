const validator = require("validator");

const validateUserInput = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  const errors = {};

  if (!firstName || validator.isEmpty(firstName)) {
    errors.firstName = "First name is required";
  }

  if (!lastName || validator.isEmpty(lastName)) {
    errors.lastName = "Last name is required";
  }

  if (!emailId || !validator.isEmail(emailId)) {
    errors.emailId = "Invalid email format";
  }

  if (!password || password.length < 6) {
    errors.password = "Password must be at least 6 characters long";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

const validateEditProfileInput = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "bio",
    "skills",
    "profilePicture",
  ];

  const isEditAllowed = Object.keys(req.body).every((key) =>
    allowedEditFields.includes(key)
  );

  return isEditAllowed;
};

module.exports = {
  validateUserInput,
  validateEditProfileInput,
};
