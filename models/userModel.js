const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    ballance: {
        type: Number,
        required: true,
        default: 0
    },
    paymentPin: {
        type: Number
    },
    points: {
        type: Number,
        default:0
    },
    logged: {
        type: Boolean,
        default: false
    },
    blocked: {
        type: Boolean,
        default: false
    },
    logins: {
        type: Number,
        trim: true,      
    },
    token: {
        type: String,
            
    },
    validationToken: {
        type: String,
            
    },
    validationTokenExpires: {
        type: String,
            
    },
    validated: {
        type: Boolean,
        default:false
            
    },
    blocked: {
        type: Boolean,
        default:false
            
    },
    loginAttempts: {
        type: Number,
        default:0
            
    },
}, { timestamps: true })


const User = mongoose.model("user", userSchema)

module.exports = User