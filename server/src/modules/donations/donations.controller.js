const donationsService = require("./donations.service");
const {
  getRazorpayClient,
  getRazorpayConfig,
  verifyPaymentSignature,
} = require("./razorpay.service");

const getPublicDonationConfig = (globalDonationConfig = {}) => {
  const { keyId, currency } = getRazorpayConfig();

  return {
    enabled: Boolean(keyId),
    provider: globalDonationConfig.provider || "razorpay",
    key: globalDonationConfig.publicKey || keyId || null,
    currency: globalDonationConfig.currency || currency,
    name: globalDonationConfig.name || "Prayas",
    description:
      globalDonationConfig.description || "Support Prayas through your donation.",
    image: globalDonationConfig.image || null,
  };
};

const getDonations = async (req, res) => {
  try {
    const donations = await donationsService.getDonations();
    return res.status(200).json(donations);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch donations", error: error.message });
  }
};

const getDonationById = async (req, res) => {
  try {
    const donation = await donationsService.getDonationById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    return res.status(200).json(donation);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch donation", error: error.message });
  }
};

const createDonation = async (req, res) => {
  try {
    const donation = await donationsService.createDonation(req.body);
    return res.status(201).json(donation);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to create donation", error: error.message });
  }
};

const getDonationCheckoutConfig = async (req, res) => {
  try {
    const globalConfig = req.app.locals.globalService
      ? await req.app.locals.globalService.getGlobalData()
      : null;

    return res.status(200).json({
      success: true,
      data: getPublicDonationConfig(globalConfig?.donation),
      donationMessage: globalConfig?.donationMessage || "",
    });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};

const createDonationOrder = async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    const donorName = req.body.donorName?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const contact = req.body.contact?.trim();
    const message = req.body.message?.trim();

    if (!Number.isFinite(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "A valid donation amount is required." });
    }

    const razorpay = getRazorpayClient();
    const { currency } = getRazorpayConfig();
    const globalConfig = req.app.locals.globalService
      ? await req.app.locals.globalService.getGlobalData()
      : null;
    const amountInSubunits = Math.round(amount * 100);
    const receipt = `donation_${Date.now()}`;

    const order = await razorpay.orders.create({
      amount: amountInSubunits,
      currency,
      receipt,
      notes: {
        donorName: donorName || "Anonymous",
        email: email || "",
        contact: contact || "",
      },
    });

    const donation = await donationsService.createDonation({
      donorName: donorName || "Anonymous",
      email,
      contact,
      amount,
      currency,
      orderId: order.id,
      transactionId: order.id,
      gateway: "razorpay",
      paymentStatus: "Pending",
      message,
      metadata: {
        receipt,
        order,
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        donationId: donation._id,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        ...getPublicDonationConfig(globalConfig?.donation),
        prefill: {
          name: donorName || "",
          email: email || "",
          contact: contact || "",
        },
      },
    });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};

const verifyDonationPayment = async (req, res) => {
  try {
    const orderId = req.body.razorpay_order_id;
    const paymentId = req.body.razorpay_payment_id;
    const signature = req.body.razorpay_signature;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification payload is incomplete.",
      });
    }

    const isValid = verifyPaymentSignature({ orderId, paymentId, signature });
    if (!isValid) {
      const existingDonation = await donationsService.getDonationByOrderId(orderId);
      await donationsService.updateDonationByOrderId(orderId, {
        paymentStatus: "Failed",
        verified: false,
        failureReason: "Invalid Razorpay signature",
        metadata: {
          ...(existingDonation?.metadata || {}),
          verificationFailureAt: new Date().toISOString(),
        },
      });

      return res
        .status(400)
        .json({ success: false, message: "Payment signature verification failed." });
    }

    const existingDonation = await donationsService.getDonationByOrderId(orderId);
    const donation = await donationsService.updateDonationByOrderId(orderId, {
      paymentId,
      signature,
      transactionId: paymentId,
      paymentStatus: "Success",
      verified: true,
      failureReason: null,
      metadata: {
        ...(existingDonation?.metadata || {}),
        verifiedAt: new Date().toISOString(),
      },
    });

    if (!donation) {
      return res
        .status(404)
        .json({ success: false, message: "Donation order not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Donation verified successfully.",
      data: donation,
    });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};

const markDonationFailure = async (req, res) => {
  try {
    const orderId = req.body.orderId || req.body.razorpay_order_id;
    const failureReason = req.body.failureReason?.trim() || "Payment not completed";

    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "orderId is required." });
    }

    const existingDonation = await donationsService.getDonationByOrderId(orderId);
    const donation = await donationsService.updateDonationByOrderId(orderId, {
      paymentStatus: "Failed",
      verified: false,
      failureReason,
      metadata: {
        ...(existingDonation?.metadata || {}),
        failureSource: "checkout",
      },
    });

    if (!donation) {
      return res
        .status(404)
        .json({ success: false, message: "Donation order not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Donation failure recorded.",
      data: donation,
    });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};

const updateDonation = async (req, res) => {
  try {
    const donation = await donationsService.updateDonation(
      req.params.id,
      req.body,
    );
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    return res.status(200).json(donation);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update donation", error: error.message });
  }
};

const deleteDonation = async (req, res) => {
  try {
    const donation = await donationsService.deleteDonation(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    return res.status(200).json({ message: "Donation deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete donation", error: error.message });
  }
};

module.exports = {
  getDonations,
  getDonationById,
  getDonationCheckoutConfig,
  createDonationOrder,
  verifyDonationPayment,
  markDonationFailure,
  createDonation,
  updateDonation,
  deleteDonation,
};
