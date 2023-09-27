const express = require("express")
const router = express.Router()
const {createFood,markFoodAvailable,markFoodUnavailable,getFoodByUniqueName,getAllFoodByVendor,getLoggedInVendorFoods } = require("../controllers/foodControllers")
const checkVendor = require("../middlewares/vendorAuthMiddleware")


router.post("/food/create", checkVendor, createFood)
router.get("/food/get", getFoodByUniqueName)
router.post("/food/edit/unavailable", checkVendor, markFoodUnavailable)
router.post("/food/edit/available", checkVendor, markFoodAvailable)
router.get("/food/get/all",getAllFoodByVendor)
router.get("/food/get/vendor/logged",checkVendor,getLoggedInVendorFoods)




module.exports = router