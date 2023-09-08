const express = require("express")
const router = express.Router()

const {editPersonalDetails,editSecurityDetails,twoFactorStatus,changePanicBalance,createPaymentPin,notificationPrefrences} = require("../controllers/settingsControllers")

const checkLogin = require("../middlewares/authenticationMiddleware")

router.post("/user/settings/personal",checkLogin,editPersonalDetails)
router.post("/user/settings/security",checkLogin,editSecurityDetails)
router.post("/user/settings/security/twofactor",checkLogin,twoFactorStatus)
router.post("/user/settings/security/panic",checkLogin,changePanicBalance)
router.post("/user/settings/security/paymentpin",checkLogin,createPaymentPin)
router.post("/user/settings/notifications",checkLogin,notificationPrefrences)












module.exports = router