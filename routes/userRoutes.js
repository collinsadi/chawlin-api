const express = require("express")
const router = express.Router()
const {newUser,verifyEmail,loginUser,forgotPassword,resetPassword,getUser} = require("../controllers/userControllers")
const checkLogin = require("../middlewares/authenticationMiddleware")


router.post("/users/signup",newUser)
router.post("/users/signup/verify",verifyEmail)
router.post("/users/login",loginUser)
router.post("/users/password/forgotten",forgotPassword)
router.post("/users/password/reset",resetPassword)
router.post("/users/get/one",checkLogin,getUser)




module.exports = router