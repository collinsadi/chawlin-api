const jwt = require("jsonwebtoken")
require("dotenv").config()
const jwtsecret = process.env.JWT_USER
const User = require("../models/userModel")

const checkLogin = async (request,response,next) => {

    if (request.headers.authorization && request.headers.authorization.startsWith("Bearer")) {
    
        try {
        
            const token = request.headers.authorization.split(" ")[1]

            const decoded = jwt.verify(token,jwtsecret)

            // const user = await User.findOne({email:decoded.user.email})

            request.user = decoded.user

            console.log(decoded.user._id)
            console.log(decoded.signature)

            next()

        } catch (error) {
            
            response.status(401).json({status:false, message:"Unauthorized"})
            console.log(error)
        }

}


}

module.exports = checkLogin