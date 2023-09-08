const User = require("../models/userModel")
const sendEmail = require("../middlewares/sendEmail")
const bcrypt = require("bcrypt")



const editPersonalDetails = async (request, response) => {

    const id = request.user._id
    
    const {firstName,lastName,phoneNumber} = request.body

    try {
        
        if(!firstName){


            return response.status(422).json({status:false, message:"First Name is Missing"})
        }

        if(!lastName){


            return response.status(422).json({status:false, message:"Last Name is Missing"})
        }

        
        if(!phoneNumber){


            return response.status(422).json({status:false, message:"Phone Number is Missing"})
        }


        const user = await User.findById(id)
        
        user.firstName = firstName
        user.lastName = lastName
        user.phoneNumber = phoneNumber

        await user.save()
      

        response.status(201).json({status:true, message:"Account Updated Sucessfully"})

        


    }catch(error){

        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }

}


const editSecurityDetails = async (request, response) => {
    
    const id = request.user._id

    let {oldPassword, newPassword} = request.body

    try {

        if (!oldPassword) {
        
            return response.status(422).json({status:false, message:'Old Password Is Required'})

        }
    
        if (!newPassword) {
        
            return response.status(422).json({status:false, message:'New Password Is Required'})

        }


        const user = await User.findById(id)

        const passwordIsValid = await bcrypt.compare(oldPassword,user.password)

        if(!passwordIsValid){

            return response.status(401).json({status:false, message:"Incorrect Password"})
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        
        user.password = hashedPassword

        await user.save()


        response.status(201).json({status:true, message:"Security Settings Updated"})


    }catch(error){

        response.status(500).json({ status: false, message: "Internal Server Error" })
        
        console.log(error)
    }

}

const twoFactorStatus = async (request, response) => {

    const id = request.user._id
    
    const {twoFactor} = request.body
    
    try{

        const user = await User.findById(id)

        
        if (twoFactor === true) {
            
            user.twoFactor = true

             await user.save()

            if(user.twoFactor !== true){

                sendEmail(user.email,"Two Factor Enabled",`<p><b>Dear ${user.firstName}</b>, Two Factor Authentication Was Enabled on Your Account, this Means That You will Need to login with Unique 4 digit codes Even though you Have your passwords, Starting from the next time that You login</p>`)

            }

            return  response.status(200).json({status:true, message:"Two Factor Authenticator Enabled"})

            
        }
        
        if (twoFactor === false) {
            
            user.twoFactor = false

             await user.save()

            return response.status(200).json({status:true, message:"Two Fctor Authenticator Disabled"})
        }


       


        
    }catch(error){

        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }



}


const changePanicBalance = async (request, response) =>{

    const id = request.user._id

    const { panicBallance, panicStatus } = request.body
    
   

    try {

        
        if(panicBallance  > 5000){


            return response.status(422).json({status:false, message:'Panic Ballance is 5000 Maximum'})
        }
    
        const user = await User.findById(id)



        if (panicBallance) {
            
            user.panicBallance = panicBallance
        }

        if (panicStatus === true) {
            
            user.panicStatus = true
        }

        if (panicStatus === false) {
            
            user.panicStatus = false
        }
       

        await user.save()
    


     
        

    }catch(error){

        response.status(500).json({status:false, message:"internal Server Error"})
        console.log(error)
    }

}

const createPaymentPin = async (request, response) => {
    const id = request.user._
    const {password, newpin} = request.body

    try{

        if (!password) {
            return response.status(422).json({status:false, message:"Password is Required"})
        }
        if (!newpin) {
            return response.status(422).json({status:false, message:"Please Enter New Pin"})
        }

        if (newpin.length !== 4) {
            
            return response.status(422).json({status:false, message:"Pin should be 4 Numbers"})

        }

        const user2 = await User.findById(id)

        const passwordIsValid = await bcrypt.compare(password, user2.password)

        if (!passwordIsValid) {
            
            return response.status(401).json({status:false, message:"Incorrect Password"})
        }

        user2.paymentPin = newpin

        await user2.save()

        response.status(200).json({status:true, message:"Transaction Pin Updated"})

    }catch(error){
        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }
}

const notificationPrefrences = async (request, response) => {

    const id = request.user._id
    
    const { fundingMails, deliveryMails, dealsMails } = request.body
    
    try {
    
        const user = await User.findById(id)

        user.fundingMails = fundingMails
        user.deliveryMails = deliveryMails
        user.dealsMails = dealsMails

        response.status(200).json({status:true, message:"Notification Prefrences Updated"})

        
    }catch(error){

        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }

}



module.exports = {editPersonalDetails,editSecurityDetails,twoFactorStatus,changePanicBalance,createPaymentPin,notificationPrefrences}