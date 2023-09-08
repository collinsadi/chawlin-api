const express = require("express")
const mongoose = require("mongoose")
const app = express()
require("dotenv").config()
const morgan = require("morgan")
const port = process.env.PORT
const url = process.env.MONGO
const cors = require("cors")

// routes
const userRoutes = require("./routes/userRoutes")
const walletRoutes = require("./routes/walletRoutes")
const vendorRoutes = require("./routes/vendorRoutes")
const foodRoutes = require("./routes/foodRoutes")
const cartRoutes = require("./routes/cartRoutes")
const orderRoutes = require("./routes/orderRoutes")
const settingsRoutes = require("./routes/settingsRoutes")

// Middlewares
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan("dev"))
app.use(cors({
    // origin: "https://chowlin.onrender.com",
    origin:"http://localhost:3000"
}))


// start server

app.listen(port, () => {
    
    console.log("Server Started")
})

// Connect Database
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MONGO DB"))
    .catch((error) => console.log("could not connect to MONGO DB"))



    // use Routes

    app.get("/", (request, response) => {
        
    response.json({message:"Welcome To The Chowlin Food App API"})

    })

app.use(userRoutes)
app.use(walletRoutes)
app.use(vendorRoutes)
app.use(foodRoutes)
app.use(cartRoutes)
app.use(orderRoutes)
app.use(settingsRoutes)