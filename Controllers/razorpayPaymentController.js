  const razorpay = require("../Razorpay config/razorpay");

exports.createOrder = async (req, res) => {
    try {

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return res.status(500).json({
                message: "Razorpay keys are missing in the backend .env file"
            });
        }

        const { amount } = req.body;
        const paymentAmount = Number(amount);

        if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
            return res.status(400).json({
                message: "A valid payment amount is required"
            });
        }

        const options = {
            amount: Math.round(paymentAmount * 100),
            currency: "INR",
            receipt: `parking_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            message: "Order created successfully",
            order
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Failed to create payment order"
        });
    }
};
