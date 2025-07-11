const validator = require("validator");

const validateUserInput = (req) => {
  const { firstName, lastName, emailId, password, age, gender } = req.body;
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

  if (!password || !validator.isStrongPassword(password, { minLength: 6 })) {
    errors.password = "Password must be at least 6 characters and strong";
  }

  if (
    age === undefined ||
    age === null ||
    !validator.isInt(age.toString(), { min: 18 })
  ) {
    errors.age = "Age is required and must be at least 18";
  }

  const validGenders = ["male", "female", "other"];
  if (!gender || !validGenders.includes(gender)) {
    errors.gender =
      "Gender is required and must be one of: male, female, other";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

const validateEditProfileInput = (req) => {
  const allowedEditFields = ["firstName", "lastName", "age", "gender"];

  const isEditAllowed = Object.keys(req.body).every((key) =>
    allowedEditFields.includes(key)
  );

  return {
    isEditAllowed,
  };
};

module.exports = {
  validateUserInput,
  validateEditProfileInput,
};
