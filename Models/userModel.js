const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "owner","admin"],
        default: "user"
    },
    phone: {
        type: String,
        default: ""
    },
    profileImage: {
        type: String,
        default: "",
    }
}, { timestamps: true })

const users = mongoose.model("users", userSchema)
module.exports = users