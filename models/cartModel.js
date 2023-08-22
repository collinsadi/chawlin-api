const mongoose = require("mongoose")
const Schema = mongoose.Schema;



const cartSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    foodid: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"food"
    },
    foodQuantity: {
        type: Number,
        required: true,
        default:1
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"vendor"
    }
},{timestamps:true})

const Cart = mongoose.model("cart", cartSchema)

module.exports = Cart