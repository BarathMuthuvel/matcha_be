const { SESClient } = require("@aws-sdk/client-ses");
const REGION = "ap-southeast-2";

// Check if AWS credentials are available
const hasCredentials =
  process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

const sesClient = new SESClient({
  region: REGION,
  ...(hasCredentials && {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  }),
});

module.exports = { sesClient, hasCredentials };
