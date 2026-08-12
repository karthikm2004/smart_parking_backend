const mongoose = require("mongoose")

const parkingSchema = new mongoose.Schema(
    {
        propertyName: {
            type: String,
            required: true,
            trim: true,
        },

        location: {
            type: String,
            required: true,
            trim: true,
        },

        slots: {
            type: Number,
            required: true,
            min: 1,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        type: {
            type: String,
            enum: ["Covered", "Open"],
            required: true,
        },

        openingHours: {
            type: String,
            required: true,
        },

        uploadImg: {
            type: String,
            required: true,
        },

        about: {
            type: String,
            required: true,
        },

        amenities: {
            type: [String], 
            default: [],
        },

        contactNum: {
            type: String,
            required: true,
        },

        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },

        isApproved: {
            type: Boolean,
            default: false,
        },

        approvalStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },

        status: {
            type: String,
            enum: ["Available", "Full", "Closed"],
            default: "Available",
        },

        blockedSlots: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);


const addParkings = mongoose.model("addParkings", parkingSchema)
module.exports = addParkings