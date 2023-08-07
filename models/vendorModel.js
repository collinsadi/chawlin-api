const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const vendorSchema = new Schema({

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
    student: {
        type: Boolean,
        required: true,
    },
    mobileNumber: {
        type: Number,
        required: true,
        trim: true
    },
    businessName: {
        type: String,
        required: true,
        trim: true
    },
    businessImage: {
        type: String,
    },
    verified: {
        type: Boolean,
        required: true,
        default: false
    },

    /**Payment Details */

    ballance: {
        type: Number,
        required: true,
        default: 0
    },
    accountNo: {
        type: Number
    },
    accountProvider: {
        type: String /**Unique Value */
    },
    accountHolder: {
        type: String
    },
    withdrawalPin: {
        type: Number
    },
    logged: {
        type: Boolean,
        default: false
    },
    blocked: {
        type: Boolean,
        default: false
    },
    loginAttempts: {
        type: Number,
        default: 0,      
    },
    token: {
        type: String,
            
    },
    validated: {
        type: Boolean,
        default:false
            
    },
    validationToken: {
        type: String,
            
    },
    validationTokenExpires: {
        type: String,
            
    },


}, {timestamps: true})

const Vendor = mongoose.model("vendor", vendorSchema)

module.exports = Vendor