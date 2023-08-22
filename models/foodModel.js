const mongoose = require("mongoose")
const Schema = mongoose.Schema;


const foodSchema = new Schema({
    
    foodName: {
        type: String,
        required:true
    },
    uniqueName: {
        type: String,
        required:true
    },
    foodDescription: {
        type: String,
        required:true
    },
    foodPrice: {
        type: String,
        required:true
    },
    foodImage: {
        type: String,
        required:true
    },
    notAvailable: {
        
        type: Boolean,
        default:false
    }
    ,
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"vendor"
    }

}, { timestamps: true })

const Food = mongoose.model("food", foodSchema)

module.exports = Food