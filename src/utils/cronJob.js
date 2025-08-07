const cron = require("node-cron");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const ConnectionRequest = require("../models/connectionRequest");
const { run } = require("./sendEmail");

const cronJob = () => {
  cron.schedule("0 8 * * *", async () => {
    try {
      const yesterday = subDays(new Date(), 1);

      const yesterdayStart = startOfDay(yesterday);
      const yesterdayEnd = endOfDay(yesterday);

      const pendingRequests = await ConnectionRequest.find({
        status: "interested",
        createdAt: {
          $gte: yesterdayStart,
          $lt: yesterdayEnd,
        },
      }).populate("fromUserId toUserId");

      const listOfEmails = [
        ...new Set(
          pendingRequests.map((request) => request.toUserId.emailId)
        ),
      ];

      for (const email of listOfEmails) {

        try {
          await run(
            "Connection Request",
            "You have a new connection request"
          );
        } catch (error) {
          console.log(error);
        }
      }

      console.log(listOfEmails);
    } catch (error) {
      console.log(error);
    }
  });
};

module.exports = cronJob;
