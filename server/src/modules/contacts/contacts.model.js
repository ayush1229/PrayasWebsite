const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
	{
		fullName: { type: String, required: true },

		email: {
			type: String,
			required: true,
			lowercase: true
		},

		phoneNumber: String,

		helpType: String,

		message: { type: String, required: true },

		status: {
			type: String,
			enum: ["Unread", "Replied", "Closed"],
			default: "Unread",
			index: true
		},

		assignedTo: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},

		replyMessage: String,

		notes: String,

		isArchived: {
			type: Boolean,
			default: false,
			index: true
		},

		submittedAt: {
			type: Date,
			default: Date.now,
			index: true
		}
	},
	{ timestamps: true }
);

module.exports = mongoose.model("ContactInquiry", contactSchema);
