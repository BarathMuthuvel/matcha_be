const express = require('express');
const { userAuth } = require("../middlewares/auth");


const requestsRouter = express.Router();

requestsRouter.get('/requests', userAuth, async (req, res) => {
  try {
    // Fetch all requests from the database
    res.status(200).send("List of all requests");
  } catch (error) {
    res.status(500).send({ message: 'Internal server error' });
  }
});

module.exports = requestsRouter;