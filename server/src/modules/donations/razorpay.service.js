const crypto = require("crypto");
const Razorpay = require("razorpay");

const getRazorpayConfig = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  return {
    keyId,
    keySecret,
    currency: process.env.RAZORPAY_CURRENCY || "INR",
  };
};

const assertRazorpayConfigured = () => {
  const { keyId, keySecret } = getRazorpayConfig();

  if (!keyId || !keySecret) {
    const error = new Error(
      "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
    );
    error.statusCode = 500;
    throw error;
  }
};

const getRazorpayClient = () => {
  assertRazorpayConfigured();

  const { keyId, keySecret } = getRazorpayConfig();
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

const buildSignature = ({ orderId, paymentId }) => {
  const { keySecret } = getRazorpayConfig();

  return crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
};

const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
  if (!orderId || !paymentId || !signature) {
    return false;
  }

  return buildSignature({ orderId, paymentId }) === signature;
};

module.exports = {
  getRazorpayConfig,
  getRazorpayClient,
  verifyPaymentSignature,
};
