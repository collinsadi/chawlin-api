const express = require("express")
const mongoose = require("mongoose")
const app = express()
require("dotenv").config()
const morgan = require("morgan")
const port = process.env.PORT
const url = process.env.MONGO

// routes
const userRoutes = require("./routes/userRoutes")
const walletRoutes = require("./routes/walletRoutes")
const vendorRoutes = require("./routes/vendorRoutes")

// Middlewares
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan("dev"))



// start server

app.listen(port, () => {
    
    console.log("Server Started")
})

// Connect Database
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MONGO DB"))
    .catch((error) => console.log("could not connect to MONGO DB"))



    // use Routes

app.use(userRoutes)
app.use(walletRoutes)
app.use(vendorRoutes)