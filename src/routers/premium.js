const express = require("express");
const { userAuth } = require("../middlewares/auth");
const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../models/payment");
const membershipAmount = require("../utils/constant");
const {validateWebhookSignature} = require('razorpay/dist/utils/razorpay-utils');
const User = require("../models/user");


// create payment order for premium membership and save payment details in database
paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { memberShipType } = req.body;
    const { firstName, lastName, emailId } = req.user;

    // create order for payment 
    const order = await razorpayInstance.orders.create({
      amount: membershipAmount[memberShipType] * 100,
      currency: "INR",
      receipt: "receipt#1",
      partial_payment: false,
      notes: {
        firstName,
        lastName,
        emailId,
        memberShipType,
      },
    });

    // save payment details in database
    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savePayment = await payment.save();

    return res.status(200).json({
      message: "Payment created successfully",
      ...savePayment.toJSON(),
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Payment creation error:", error);

    // Provide more specific error messages
    if (error.error && error.error.description) {
      return res.status(400).json({
        message: "Payment creation failed",
        error: error.error.description,
      });
    }

    res.status(500).json({
      message: "Internal server error",
      error: error.message || "Unknown error occurred",
    });
  }
});

// webhook to verify payment and update user's membership details
paymentRouter.post("/payment/webhook", async (req, res) => {
  try {
    // verify webhook signature
    const webhookSignature = req.headers("x-razorpay-signature");

    // verify webhook signature and get payment status
   const isWebhookValid = validateWebhookSignature(
      JSON.stringify(res.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );
    if (!isWebhookValid) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    // get payment status from webhook
    const paymentStatus = req.body.payload.payment.entity;

    // update payment status in database
    const payment = await Payment.findOne({ orderId: paymentStatus.order_id });
    payment.status = paymentStatus.status;
    await payment.save();

    // update user's membership details
    const user = await User.findOne({ _id: payment.userId });
    user.isPremium = true;
    user.membershipType = paymentStatus.notes.memberShipType;
    await user.save();

    return res.status(200).json({ message: "Payment verified successfully" });

  } catch (error) {
    console.error("Payment verification error:", error);
  }
});

// verify premium membership
paymentRouter.get("/premium/verify", userAuth, async (req, res) => {
  try {
    const user = req.user.toJSON();
    if (user.isPremium) {
      return res.status(200).json({ isPremium: true, membershipType: user.membershipType, membershipExpiry: user.membershipExpiry });
    }
    return res.status(400).json({ isPremium: false });
  } catch (error) {
    console.error("Payment verification error:", error);
  }
});

module.exports = paymentRouter;
