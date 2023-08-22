const express = require("express")
const checkLogin = require("../middlewares/authenticationMiddleware")
const router = express.Router()
const {addNewCart,getUserCart,getUserCartLength,removeItemFromCart,changeCartQuantity} = require("../controllers/cartControllers")


router.post("/cart/new", checkLogin, addNewCart)
router.get("/cart/get/user",checkLogin,getUserCart)
router.get("/cart/get/user/length",checkLogin,getUserCartLength)
router.post("/cart/delete",checkLogin,removeItemFromCart)
router.post("/cart/update/quantity",checkLogin,changeCartQuantity)


module.exports = router