const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
	{
		imageUrl: { type: String, required: true },
		altText: { type: String }
	},
	{ _id: false }
);

const activitiesSchema = new mongoose.Schema(
	{
		activityName: {
			type: String,
			enum: ["GyanManthan", "Spardha", "Prayas"],
			required: true
		},

		year: {
			type: Number,
			required: true
		},

		images: [imageSchema],

		tags: [{ type: String }],

		isActive: {
			type: Boolean,
			default: true,
			index: true
		},

		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}
	},
	{ timestamps: true }
);

// Indexes
activitiesSchema.index({ activityName: 1, year: 1 }, { unique: true });
activitiesSchema.index({ year: -1 });

module.exports = mongoose.model("Activity", activitiesSchema);
