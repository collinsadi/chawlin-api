
const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const vendorTransactionSchema = new Schema({

    transactionType: {
        type: String,
        required:true
    },
    amount: {
        type: Number,
        required:true
    },
    description: {
        type: String,
        required:true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"vendor"
    },
    status: {
        type: String,
        required:true
    },

},{timestamps: true})

const VendorTransaction = mongoose.model("VendorTransaction",vendorTransactionSchema)

module.exports = VendorTransaction
