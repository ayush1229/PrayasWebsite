const mongoose = require("mongoose");

const donationsSchema = new mongoose.Schema(
	{
		donorName: String,

		email: {
			type: String,
			lowercase: true,
			index: true
		},

		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},

		amount: {
			type: Number,
			required: true
		},

		currency: {
			type: String,
			default: "INR"
		},

		transactionId: {
			type: String,
			required: true,
			unique: true
		},

		gateway: {
			type: String,
			default: "razorpay"
		},

		paymentStatus: {
			type: String,
			enum: ["Pending", "Success", "Failed", "Refunded"],
			default: "Pending",
			index: true
		},

		failureReason: String,

		verified: {
			type: Boolean,
			default: false
		},

		receiptUrl: String,

		metadata: mongoose.Schema.Types.Mixed,

		date: {
			type: Date,
			default: Date.now,
			index: true
		}
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Donation", donationsSchema);
