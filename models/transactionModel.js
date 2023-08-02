const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const transactionSchema = new Schema({

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
        ref:"user"
    },
    status: {
        type: String,
        required:true
    },

},{timestamps: true})

const Transaction = mongoose.model("transaction",transactionSchema)

module.exports = Transaction