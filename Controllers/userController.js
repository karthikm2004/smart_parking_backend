const user = require('../Models/userModel')
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")

exports.signup = async (req, res) => {
    try {
        console.log(req.body);
        console.log("Headers:", req.headers);
        console.log("Body:", req.body);


        const { username, email, password, role, phone } = req.body;

        const existingUser = await user.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new user({
            username,
            email,
            password: hashedPassword,
            role,
            phone
        });

        await newUser.save();

        return res.status(201).json({
            success: true,
            message: "Signup Successful"
        });

    } catch (err) {
        console.log("Signup Error:", err);
        return res.status(500).json({
            message: err.message
        });
    }
};


exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(req.body);


        const existingUser = await user.findOne({ email });
        console.log(existingUser);


        if (!existingUser) {
            return res.status(400).json({
                message: "Invalid email or password",
            });

        }

        const isMatch = await bcrypt.compare(
            password,
            existingUser.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        const token = jwt.sign(
            {
                userId: existingUser._id,
                role: existingUser.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            role: existingUser.role,
            username: existingUser.username,
        });

    } catch (err) {
        return res.status(500).json({
            message: "Server Error",
        });
    }
};


exports.updateProfile = async (req, res) => {
    try {
        const { username, email, phone } = req.body;

        const userId = req.user.userId;

        const updatedProfile = await user.findByIdAndUpdate(
            userId,
            {
                username,
                email,
                phone
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedProfile) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedProfile
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Get logged-in user profile details
exports.getProfile = async (req, res) => {
    try {
        const profile = await user.findById(req.user.userId).select("-password");

        if (!profile) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user: profile });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};



exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Current password and new password are required",
            });
        }

        const existingUser = await user.findById(userId);

        if (!existingUser) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            currentPassword,
            existingUser.password
        );

        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Current password is incorrect",
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        existingUser.password = hashedPassword;
        await existingUser.save();

        return res.status(200).json({
            message: "Password updated successfully",
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Server error",
        });
    }
};

