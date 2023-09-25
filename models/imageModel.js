const mongoose = require("mongoose")
const Schema = mongoose.Schema;


const imageSchema = new Schema({

    url: {
        type: String,
        required:true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"vendor"
    }

}, { timestamps: true })


const Image = mongoose.model("image", imageSchema)

module.exports = Image