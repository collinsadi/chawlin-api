const express = require("express")
const router = express.Router()
const checkLogin = require("../middlewares/authenticationMiddleware")
const {fundWallet,fundStatus} = require("../controllers/walletControllers")

router.post("/users/account/fund",checkLogin,fundWallet)
router.post("/users/account/fund/verify",checkLogin,fundStatus)


module.exports = router