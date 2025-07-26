const { SendEmailCommand } = require("@aws-sdk/client-ses");
const { sesClient, hasCredentials } = require("./sesClient");

const createSendEmailCommand = (toAddress, fromAddress, subject, body) => {
  return new SendEmailCommand({
    Destination: {
      CcAddresses: [],
      ToAddresses: [toAddress],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `<h1 style="color: #400; font-size: 16px; font-weight: bold; text-align: center; margin-top: 20px; margin-bottom: 20px; margin-left: 20px; margin-right: 20px;">${body}</h1>`,
        },
        Text: {
          Charset: "UTF-8",
          Data: `<p style="color: #400; font-size: 16px; font-weight: bold; text-align: center; margin-top: 20px; margin-bottom: 20px; margin-left: 20px; margin-right: 20px;">${body}</p>`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: fromAddress,
    ReplyToAddresses: [],
  });
};

const run = async (subject, body) => {
  const sendEmailCommand = createSendEmailCommand(
    "barath88355@gmail.com",
    "barath@matchaa.shop",
    subject,
    body
  );

  try {
    return await sesClient.send(sendEmailCommand);
  } catch (caught) {
    if (caught instanceof Error && caught.name === "MessageRejected") {
      const messageRejectedError = caught;
      return messageRejectedError;
    }
    throw caught;
  }
};

module.exports = { run };
