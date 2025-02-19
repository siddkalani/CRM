const mongoose = require("mongoose")

const contactSchema = mongoose.Schema(
    {
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        firstName: {
            type: String,
            required: [true, "please add name"]
        },
        lastName: {
            type: String,
            required: [true, "please add name"]
        },
        email: {
            type: String,
            required: [true, "please add email"]
        },
        phone: {
            type: String,
            required: [true, "please add phone"]
        },
        notes:{
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Contacts", contactSchema)