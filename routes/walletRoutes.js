const express = require("express")
const router = express.Router()
const checkLogin = require("../middlewares/authenticationMiddleware")
const {fundWallet,fundStatus,userTransactions,getUserWalletBallance,verifyBankAccount} = require("../controllers/walletControllers")
const checkVendor = require("../middlewares/vendorAuthMiddleware")

router.post("/users/account/fund",checkLogin,fundWallet)
router.post("/users/account/fund/verify",checkLogin,fundStatus)
router.get("/transactions/get/user",checkLogin,userTransactions)
router.post("/wallet/balance/user",checkLogin,getUserWalletBallance)
router.get("/wallet/bank/resolve",checkVendor,verifyBankAccount)


module.exports = router