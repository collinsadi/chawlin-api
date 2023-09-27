const express = require("express")
const router = express.Router()

const { newOrder, packingOrder, orderOutForDelivery, orderDelivered, getUserOrders, getVendorOrders, getSingleOrderForVendor, getSingleOrderForUser, userCancellOrder, vendorCancellOrder,getInvoive,vendorInvoice} = require("../controllers/orderControllers")
const checkLogin = require("../middlewares/authenticationMiddleware")
const checkVendor = require("../middlewares/vendorAuthMiddleware")

router.post("/order/new", checkLogin, newOrder)
router.post("/order/status/packing",checkVendor,packingOrder)
router.post("/order/status/out",checkVendor,orderOutForDelivery)
router.post("/order/status/delivered", checkVendor, orderDelivered)

/**
 * Get order for user
 */

router.get("/order/get/user",checkLogin,getUserOrders)


router.get("/order/get/vendor",checkVendor,getVendorOrders)
router.get("/order/get/vendor/single",checkVendor,getSingleOrderForVendor)
router.get("/order/get/user/single",checkLogin,getSingleOrderForUser)
router.post("/order/cancel/user",checkLogin,userCancellOrder)
router.post("/order/cancel/vendor",checkVendor,vendorCancellOrder)
router.get('/order/get/invoice',checkLogin,getInvoive)
router.get("/order/get/invoice/vendor",checkVendor,vendorInvoice)


module.exports = router