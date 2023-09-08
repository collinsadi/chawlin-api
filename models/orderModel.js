const mongoose = require("mongoose")
const Schema = mongoose.Schema;


const orderSchema = new Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    location: {
        type: String,
        required:true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"vendor"
    },
    amount: {
        type: Number,
        required:true
    },
    orderDetails: {
        type: String,
        required:true
    },
    foods: [
        {type:mongoose.Schema.Types.ObjectId,ref:"food"}
    ],
    status: {
        type: String,
        required:true
    },
    cancelled: {
        type: Boolean,
        default:false
    },
    closed: {
        type: Boolean,
        default:false
    }

}, { timestamps: true })


const Order = mongoose.model("order", orderSchema)

module.exports = Order