const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, "please add username"]
    },
    email: {
        type: String,
        required: [true, "please add email"]
    },
    password: {
        type: String,
        required: [true, "please add password"]
    }
},
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Users", userSchema)