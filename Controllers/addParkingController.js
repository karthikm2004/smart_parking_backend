const addparkingModel = require("../Models/addParkingModel")

// owner adds a new parking (default approvalStatus = "pending")
exports.addParking = async (req, res) => {
    try {
        const {
            propertyName,
            location,
            slots,
            price,
            type,
            openingHours,
            about,
            amenities,
            contactNum,
        } = req.body;

        const uploadImg = req.file.filename;

        const newParking = new addparkingModel({
            propertyName,
            location,
            slots,
            price,
            type,
            openingHours,
            uploadImg,
            about,
            amenities,
            contactNum,
            ownerId: req.user.userId,
            isApproved: false,
            approvalStatus: "pending"
        });

        await newParking.save();

        res.status(201).json({
            message: "Parking Added Successfully",
            newParking,
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Server Error",
        });
    }
};

// owner gets their own parkings (with approvalStatus shown)
exports.getOwnerParkings = async (req, res) => {
    try {
        const parkings = await addparkingModel.find({ ownerId: req.user.userId }).sort({ createdAt: -1 });

        res.status(200).json({
            message: "Owner parkings fetched",
            parkings,
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Server Error",
        });
    }
};

// admin gets all parkings (for approval management)
exports.getAllParkings = async (req, res) => {
    try {
        const parkings = await addparkingModel.find().populate("ownerId", "username email").sort({ createdAt: -1 });

        res.status(200).json({
            message: "All parkings fetched",
            parkings,
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Server Error",
        });
    }
};

// admin approves or rejects a parking
exports.updateApprovalStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { approvalStatus } = req.body;

        console.log("updateApprovalStatus - req.user:", req.user);

        // only admin can do this
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied. Admin only.",
            });
        }

        // validate approvalStatus value
        if (!["approved", "rejected"].includes(approvalStatus)) {
            return res.status(400).json({
                message: "Invalid status. Use 'approved' or 'rejected'.",
            });
        }

        const updatedParking = await addparkingModel.findByIdAndUpdate(
            id,
            {
                approvalStatus,
                isApproved: approvalStatus === "approved"
            },
            { new: true }
        );

        if (!updatedParking) {
            return res.status(404).json({
                message: "Parking not found",
            });
        }

        res.status(200).json({
            message: `Parking ${approvalStatus} successfully`,
            updatedParking,
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Server Error",
        });
    }
};

// admin deletes a parking
exports.deleteParking = async (req, res) => {
    try {
        const { id } = req.params;

        console.log("deleteParking - req.user:", req.user);

        // only admin can do this
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied. Admin only.",
            });
        }

        const deletedParking = await addparkingModel.findByIdAndDelete(id);

        if (!deletedParking) {
            return res.status(404).json({
                message: "Parking not found",
            });
        }

        res.status(200).json({
            message: "Parking deleted successfully",
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Server Error",
        });
    }
};

// user gets all approved parkings
exports.getApprovedParkings = async (req, res) => {
    try {
        const parkings = await addparkingModel.find({ approvalStatus: "approved" }).sort({ createdAt: -1 });

        res.status(200).json({
            message: "Approved parkings fetched successfully",
            parkings,
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Server Error",
        });
    }
};

// user gets single parking details
exports.getSingleParking = async (req, res) => {
    try {
        const { id } = req.params;
        const parking = await addparkingModel.findById(id);

        if (!parking) {
            return res.status(404).json({
                message: "Parking not found",
            });
        }

        res.status(200).json({
            message: "Parking details fetched successfully",
            parking,
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Server Error",
        });
    }
};