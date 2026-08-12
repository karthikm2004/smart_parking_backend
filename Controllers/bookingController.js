const bookingModel = require('../Models/bookingModel')
const addparkingModel = require("../Models/addParkingModel");
const razorpay = require("../Razorpay config/razorpay");
const crypto = require("crypto");


// USER
//  --------------------//

// User creates a new booking
exports.createBooking = async (req, res) => {
    try {
        const {
            parkingId,
            slotId,
            date,
            startTime,
            endTime,
            vehicleNumber,
            vehicleType,
            totalPrice,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
        } = req.body;

        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            return res.status(400).json({
                message: "Payment verification details are required"
            });
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest("hex");

        if (expectedSignature !== razorpaySignature) {
            return res.status(400).json({
                message: "Payment verification failed"
            });
        }

        const razorpayOrder = await razorpay.orders.fetch(razorpayOrderId);
        const razorpayPayment = await razorpay.payments.fetch(razorpayPaymentId);

        if (
            razorpayOrder.amount !== Math.round(Number(totalPrice) * 100) ||
            !["authorized", "captured"].includes(razorpayPayment.status)
        ) {
            return res.status(400).json({
                message: "Payment could not be verified or the amount does not match"
            });
        }

        // check if slot is already booked for this parking lot on this date
        const existingBooking = await bookingModel.findOne({
            parkingId,
            slotId,
            date,
            status: "booked"
        });

        if (existingBooking) {
            return res.status(400).json({
                message: "Slot is already booked for this date"
            });
        }

        // check if slot is blocked by owner
        const parking = await addparkingModel.findById(parkingId);
        if (parking && parking.blockedSlots.includes(slotId)) {
            return res.status(400).json({
                message: "Slot is blocked by owner"
            });
        }

        const newBooking = new bookingModel({
            parkingId,
            userId: req.user.userId,
            slotId,
            date,
            startTime,
            endTime,
            vehicleNumber,
            vehicleType,
            totalPrice,
            status: "booked"
        });

        await newBooking.save();

        res.status(201).json({
            message: "Booking Confirmed Successfully",
            booking: newBooking
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Get bookings for a parking lot (can filter by date)
exports.getParkingBookings = async (req, res) => {
    try {
        const { parkingId } = req.params;
        const { date } = req.query;

        let query = { parkingId, status: "booked" };
        if (date) {
            query.date = date;
        }

        const bookings = await bookingModel.find(query).populate("userId", "username email phone");

        res.status(200).json({
            message: "Bookings fetched successfully",
            bookings
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Get all bookings of logged-in user
exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await bookingModel.find({ userId: req.user.userId })
            .populate("parkingId", "propertyName location price")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "User bookings fetched successfully",
            bookings
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

// User cancels their own booking before the booking start time
exports.cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await bookingModel.findOne({ _id: bookingId, userId: req.user.userId });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.status === "cancelled") {
            return res.status(400).json({ message: "This booking is already cancelled" });
        }

        const bookingStartTime = new Date(`${booking.date}T${booking.startTime}:00`);
        if (bookingStartTime <= new Date()) {
            return res.status(400).json({
                message: "Bookings can only be cancelled before the start time"
            });
        }

        booking.status = "cancelled";
        await booking.save();

        res.status(200).json({ message: "Booking cancelled successfully", booking });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};


// OWNER
// ------------//

// Owner toggles block/unblock for a slot
exports.toggleBlockSlot = async (req, res) => {
    try {
        const { parkingId } = req.params;
        const { slotId } = req.body;

        const parking = await addparkingModel.findById(parkingId);
        if (!parking) {
            return res.status(404).json({
                message: "Parking lot not found"
            });
        }

        // check if owner is the actual owner
        if (parking.ownerId.toString() !== req.user.userId && req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied. Unauthorized."
            });
        }

        let blockedSlots = [...parking.blockedSlots];
        const isBlocked = blockedSlots.includes(slotId);

        if (isBlocked) {
            // Unblock: remove slotId
            blockedSlots = blockedSlots.filter(s => s !== slotId);
        } else {
            // Block: add slotId (make sure it isn't already booked first)
            const slotBookings = await bookingModel.find({
                parkingId,
                slotId,
                status: "booked"
            });

            const activeBooking = slotBookings.some((booking) => {
                const bookingEndTime = new Date(`${booking.date}T${booking.endTime}:00`);
                return bookingEndTime > new Date();
            });

            if (activeBooking) {
                return res.status(400).json({
                    message: "Cannot block a slot with an active or upcoming booking"
                });
            }
            blockedSlots.push(slotId);
        }

        parking.blockedSlots = blockedSlots;
        await parking.save();

        res.status(200).json({
            message: isBlocked ? "Slot unblocked successfully" : "Slot blocked successfully",
            blockedSlots: parking.blockedSlots
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server Error"
        });
    }
};
