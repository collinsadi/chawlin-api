const jwt = require("jsonwebtoken")
require("dotenv").config()
const jwtsecret = process.env.JWT_VENDOR
const Vendor = require("../models/vendorModel")


const checkVendor = async (request,response,next) => {

    if (request.headers.authorization && request.headers.authorization.startsWith("Bearer")) {
    
        try {
        
            const token = request.headers.authorization.split(" ")[1]

            const decoded = jwt.verify(token,jwtsecret)

            const vendor = await Vendor.findOne({email:decoded.vendor.email})

            if (!vendor) {
                
                return response.status(401).json({status:false, message:"Unauthorized"})
            }

            request.vendor = vendor

            next()

        } catch (error) {
            
            response.status(401).json({status:false, message:"Unauthorized"})
            console.log(error)
        }

    } else {
        response.status(401).json({status:false, message:"Unauthorized"})

}


}



module.exports = checkVendor