const express = require("express")
const router = express.Router()

const {newVendor,verifyEmail,loginVendor,forgotPassword,resetPassword,addVendorAccoountDetails,getVendors,getVendor} = require("../controllers/vendorControllers")
const checkVendor = require("../middlewares/vendorAuthMiddleware")


router.post("/vendor/signup", newVendor)
router.post("/vendor/signup/verify", verifyEmail)
router.post("/vendor/login", loginVendor)
router.post("/vendor/password/forgotten", forgotPassword)
router.post("/vendor/password/reset", resetPassword)
router.post("/vendor/withdrawal/settings",checkVendor,addVendorAccoountDetails )
router.post("/vendor/account/edit")
router.get("/vendors/get/all", getVendors)
router.get("/vendor/get",getVendor)





module.exports = router