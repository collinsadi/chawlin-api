const express = require("express")
const router = express.Router()

const {newVendor,verifyEmail,loginVendor,forgotPassword,resetPassword,addVendorAccoountDetails,getVendors,getVendor,getLoggedVendor,getVendorBallance,editVendorAccount,changeVendorPassword,setVendorPaymentPin,setVendorPanicMode,requestWithdrawal} = require("../controllers/vendorControllers")
const checkVendor = require("../middlewares/vendorAuthMiddleware")


router.post("/vendor/signup", newVendor)
router.post("/vendor/signup/verify", verifyEmail)
router.post("/vendor/login", loginVendor)
router.post("/vendor/password/forgotten", forgotPassword)
router.post("/vendor/password/reset", resetPassword)
router.post("/vendor/withdrawal/settings",checkVendor,addVendorAccoountDetails )
router.post("/vendor/account/edit",checkVendor,editVendorAccount)
router.get("/vendors/get/all", getVendors)
router.get("/vendor/get",getVendor)
router.get("/vendor/get/one",checkVendor,getLoggedVendor)

router.post("/wallet/ballance/vendor",checkVendor,getVendorBallance)
router.post("/vendor/settings/security",checkVendor,changeVendorPassword)
router.post("/vendor/settings/security/paymentpin",checkVendor,setVendorPaymentPin)
router.post("/vendor/settings/security/panic",checkVendor,setVendorPanicMode)
router.post("/vendor/withdrawal/request",checkVendor,requestWithdrawal)




module.exports = router