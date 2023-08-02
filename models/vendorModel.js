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
    shopNo: {
        type:String,
    },
    businessName: {
        type: String,
        required: true,
        trim: true
    },
    businessLocation: {
        type: String,
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


}, {timestamps: true})

const Vendor = mongoose.model("vendor", vendorSchema)

module.exports = Vendor