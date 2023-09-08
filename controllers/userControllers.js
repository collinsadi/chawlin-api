const User = require("../models/userModel")
const sendEmail = require("../middlewares/sendEmail")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const jwtsecret = process.env.JWT_USER
const uuid = require("uuid")


const newUser = async (request, response) => {
    
    const {firstName,lastName,email,password} = request.body


    try{

        if(!firstName){

            return response.status(422).json({status:false, message:"First Name is Required"})
        }
        if (!lastName) {
            
            return response.status(422).json({status:false, message:"Last Name is Required"})
        }
        if (!email) {
            
            return response.status(422).json({status:false, message:"Email is Required"})
        }
        if (email.indexOf("@") === -1) {
            
            return response.status(422).json({status:false, message:"Please Enter a Valid email address"})
        }

        if(!password){

            return response.status(422).json({status:false, message:"Password is Required"})
        }

        const userExists = await User.findOne({ email })
        
        if (userExists) {
            
            return response.status(422).json({status:false, message:"Email Already In Use"})
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        
        
        
        const emailToken =("" + Math.random()).substring(2, 6)

        const user = await User.create({ firstName, lastName, email, password: hashedPassword,validationToken:emailToken,validationTokenExpires: new Date() })
        
        

        const html = `<h3>Welcome to Chowlin </h3><br><p>Use this Code to Verify Your Email Address </p><br><br><h1 style="letter-spacing:15px;">${emailToken}</h1><br><br> <p>token is only valid for 10 Minutes </p>`

        const mail = sendEmail(email, "Email Verification", html)
        

        response.status(201).json({status:true, message:"Sign Up Successful, Please Verify Yor Email",email})

    }catch(error){

        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }

}

const verifyEmail = async (request, response) => {
    
    const { email, code } = request.body
    

    try{

        if (!email) {
        
            return response.status(404).json({status:false, message:"an error occured try logging in again"})
        }
        
        if (!code) {
            
            return response.status(422).json({status:false, messsage:"Email Validation Code Not Found"})
        }

        const user = await User.findOne({ email })
        
        if(!user){

            return response.status(404).json({status:false, message:"User Not Found"})
        }

        if (code !== user.validationToken) {
            
            return response.status(401).json({status:false, message:"Invalid Validation Token"})
        }

        const token = jwt.sign({user},jwtsecret)

        user.validationToken = undefined
        user.validationTokenExpires = undefined
        user.token = token
        user.validated = true
        

        await user.save()

        response.status(200).json({status:true, message:"Email Verified Successfully", user})

    } catch (error) {

        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }

}

const loginUser = async (request, response) => {

    const { email, password } = request.body
    
    try {
        
        if (!email) {
            
            return response.status(422).json({status:false, message:"Email Missing"})
        }

        if (!password) {
            
            return response.status(422).json({status:false, messsage:"Password Missing"})
        }

        const user = await User.findOne({ email })
        
        if (!user) {
            
            return response.status(401).json({status:false, message:"Invalid Credentials"})
        }

        const passwordIsValid = await bcrypt.compare(password, user.password)

        if (!passwordIsValid) {
            user.loginAttempts += 1

            if (user.loginAttempts >= 5 && !user.blocked ) {
                
                user.blocked = true
                await user.save()

                const html = `<p><b>Dear ${user.firstName}</b>,<br> Your Account Has Been Disabled Following the Numerous Invalid Login Credentials Provided and Exhausting the Login Attemp Lifeline, Contact Support With a Comprehensive Letter Proving Your Ownership of the Account and What Led to the Occurence of the Blocking. We are Working Everyday to make Chawlin Safe for Transaction. <br><br>Collins Adi</b> from Chawlin</p>  `
                    
                sendEmail(email, "Account Disabled", html)

               return response.status(401).json({status:false, message:"Accoount Disabled"})
            }

            await user.save()
           return response.status(401).json({status:false, message:"Invalid Credentials"})
        }


        if (user.blocked) {
            
            return response.status(401).json({status:false, message:"Accoount Disabled"})
        }


        if (!user.validated) {
            
         const emailToken =("" + Math.random()).substring(2, 6)

        const html = `<h3>Welcome to Chawlin </h3><br><p>Use this Code to Verify Your Email Address </p><br><br><h1 style="letter-spacing:15px;">${emailToken}</h1><br><br> <p>token is only valid for 10 Minutes </p>`

            const mail = sendEmail(email, "Email Verification", html)
            user.validationToken = emailToken
            user.validationTokenExpires = new Date
            await user.save()

            return response.status(401).json({status:false, message:"Please Verify Email", email})
        }

        user.loginAttempts = 0

        await user.save()

        response.status(200).json({status:true, message:"Login Successful",user})

        
    }catch(error){

        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }

}

const forgotPassword = async (request, response) => {
    
    const email = request.body.email

    try { 

        if (!email) {
            return response.status(422).json({status:false, message:"Email is Missing"})
        }
    
        const user = await User.findOne({ email })
        
        if (!user) {
            
            return response.status(404).json({status:false, message:"User Was Not Found"})
        }

        const passwordResetToken = await uuid.v4()

        user.validationToken = passwordResetToken
        user.validationTokenExpires = new Date()

        await user.save()

        const html = `<p><b>${user.firstName}</b>, You Requested for Password Reset, Please Ignore if You Did Not Initiate this Request and your Password Will not be Changed</p><br><h3><a href="http://localhost:3000/password/reset/${passwordResetToken}>Reset Password</a></h3>  `
                    
        const mail = sendEmail(email, "Password Reset", html)
        
        response.status(200).json({status:true,message:"Password Reset Token Successfully Sent"})

    } catch (error) {
        
        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }

}

const resetPassword = async (request, response) => {
    
    const {validationToken, newPassword} = request.body

    try {
        
        const user = await User.findOne({ validationToken })

        if (!newPassword) {
            
            return response.status(422).json({status:false, message:"New Password is Missing"})
        }
        
        if (!user) {
            
            return response.status(404).json({status:false, message:"Invalid Token"})
        }

        const hashedpassword = await bcrypt.hash(newPassword,10)

        user.password = hashedpassword
        user.validationToken = undefined
        user.validationTokenExpires = undefined

        await user.save()


        response.status(200).json({status:true, message:"Password Reset Successful"})


    } catch (error) {
        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }
}

const getUser = async (request, response) => {
    
    const id = request.user._id

    const user = await User.findById(id)

    response.status(200).json({user})
}







module.exports = {newUser,verifyEmail,loginUser,forgotPassword,resetPassword,getUser,createPaymentPin}