const Vendor = require("../models/vendorModel")
const Image = require("../models/imageModel")
const sendEmail = require("../middlewares/sendEmail")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const jwtsecret = process.env.JWT_VENDOR
const uuid = require("uuid")
const shortid = require("shortid")
const Food = require("../models/foodModel");
const VendorTransaction = require("../models/vendorTransaction")


// const url = "http://localhost:3000"
const url = "https://chowlin.onrender.com"


const newVendor = async (request, response) => {
    
    const { firstName, lastName, email, password, student, mobileNumber,businessName, businessImage } = request.body
    
    try {
        
    

    if (!firstName) {
        
        return response.status(422).json({status:false, message:"First Name is Missing"})
    }

    if (!lastName) {
        
        return response.status(422).json({status:false, message:"Last Name is Required"})
    }
    if (!email) {
        
        return response.status(422).json({status:false, message:"Email is Required"})
    }
    if (!password) {
        
        return response.status(422).json({status:false, message:"Email is Required"})
    }
    if (!student) {
        
        return response.status(422).json({status:false, message:"Are You a Student?, Please Check"})
    }
    if (!mobileNumber) {
        
        return response.status(422).json({status:false, message:"Mobile Number is Required"})
    }
    if (!businessImage) {
        
        return response.status(422).json({status:false, message:"Business Image is Required"})
    }
    if (!businessName) {
        
        return response.status(422).json({status:false, message:"Business Name is Required"})
    }


        const vendorByPhone = await Vendor.findOne({mobileNumber})

        if(vendorByPhone){

            return response.status(401).json({status:false, message:"The Mobile Number Provided is Associated with Another Vendor"})
        }

        const vendorByEmail = await Vendor.findOne({email})

        if (vendorByEmail) {
            
            return response.status(401).json({status:false, message:"he Email Provided is Associated with Another Vendor"})
        }


        const joinedName = businessName.split(" ").length > 0 ? businessName.toLowerCase().split(" ").join("-") : businessName.toLowerCase()
        const joinedWithId = joinedName + "-" + await shortid.generate()
        const uniqueUrl = joinedWithId.toLowerCase();

        const hashedPassword = await bcrypt.hash(password, 10)
        const emailVerificationtoken = (""+Math.random()).substring(2,8)
    
        const vendor = await Vendor.create({ firstName, lastName, email, password: hashedPassword, student, mobileNumber, businessName,uniqueUrl,validationToken:emailVerificationtoken, validationTokenExpires: new Date() })

        const image = await Image.create({ url: businessImage, vendor: vendor._id })
        vendor.businessImage = image._id
        await vendor.save()
        

        const html = `<h3>Welcome to Chawlin </h3><br><p>Use this Code to Verify Your Email Address </p><br><br><h1 style="letter-spacing:15px;">${emailVerificationtoken}</h1><br> <p>token is only valid for 10 Minutes </p>`

        const mail = sendEmail(email, "Email Verification", html)
        

        response.status(201).json({status:true, message:"Vendor Account Created, Please Verify Yor Email",email})

    } catch (error) {
        
        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }

}

const verifyEmail = async (request, response) => {
    
    const { email, code } = request.body

    console.log(email, code)
    

    try{

        if (!email) {
        
            return response.status(404).json({status:false, message:"an error occured try logging in again"})
        }
        
        if (!code) {
            
            return response.status(422).json({status:false, messsage:"Email Validation Code Not Found"})
        }

        const vendor = await Vendor.findOne({ email })
        
        if(!vendor){

            return response.status(404).json({status:false, message:"Vendor Not Found"})
        }

        if (code !== vendor.validationToken) {
            
            return response.status(401).json({status:false, message:"Invalid Validation Token"})
        }

        const token = jwt.sign({vendor},jwtsecret)

        vendor.validationToken = undefined
        vendor.validationTokenExpires = undefined
        vendor.token = token
        vendor.validated = true
        

        await vendor.save()

        const updatedVendor = await Vendor.findOne({email})

        response.status(200).json({status:true, message:"Email Verified Successfully", vendor:updatedVendor})

    } catch (error) {

        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }

}

const loginVendor = async (request, response) => {

    const { email, password } = request.body
    
    try {
        
        if (!email) {
            
            return response.status(422).json({status:false, message:"Email Missing"})
        }

        if (!password) {
            
            return response.status(422).json({status:false, message:"Password Missing"})
        }

        const vendor = await Vendor.findOne({ email })
        
        if (!vendor) {
            
            return response.status(401).json({status:false, message:"Invalid Credentials"})
        }

        const passwordIsValid = await bcrypt.compare(password, vendor.password)

        if (!passwordIsValid) {
            vendor.loginAttempts += 1

            if (vendor.loginAttempts >= 5 && !vendor.blocked ) {
                
                vendor.blocked = true
                await vendor.save()

                const html = `<p><b>Dear ${vendor.firstName}</b>,<br> Your Account Has Been Disabled Following the Numerous Invalid Login Credentials Provided and Exhausting the Login Attemp Lifeline, Contact Support With a Comprehensive Letter Proving Your Ownership of the Account and What Led to the Occurence of the Blocking. We are Working Everyday to make Chawlin Safe for Transaction. <br><br>Collins Adi</b> from Chawlin</p>  `
                    
                sendEmail(email, "Account Disabled", html)

               return response.status(401).json({status:false, message:"Accoount Disabled"})
            }

            await vendor.save()
           return response.status(401).json({status:false, message:"Invalid Credentials"})
        }


        if (vendor.blocked) {
            
            return response.status(401).json({status:false, message:"Accoount Disabled"})
        }


        if (!vendor.validated) {
            
         const emailToken =("" + Math.random()).substring(2, 8)

        const html = `<h3>Welcome to Chawlin </h3><br><p>Use this Code to Verify Your Email Address </p><br><br><h1 style="letter-spacing:15px;">${emailToken}</h1><br><br> <p>token is only valid for 10 Minutes </p>`

            const mail = sendEmail(email, "Email Verification", html)
            vendor.validationToken = emailToken
            vendor.validationTokenExpires = new Date
            await vendor.save()

            return response.status(401).json({status:false, message:"Please Verify Email", email})
        }

        vendor.loginAttempts = 0

        await vendor.save()

        response.status(200).json({status:true, message:"Login Successful",vendor})

        
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
    
        const vendor = await Vendor.findOne({ email })
        
        if (!vendor) {
            
            return response.status(404).json({status:false, message:"Vendor Was Not Found"})
        }

        const passwordResetToken = await uuid.v4()

        vendor.validationToken = passwordResetToken
        vendor.validationTokenExpires = new Date()

        await vendor.save()

        const html = `<p><b>${vendor.firstName}</b>, You Requested for Password Reset, Please Ignore if You Did Not Initiate this Request and your Password Will not be Changed</p><br><h3><a href="${url}/auth/vendor/password/reset/${passwordResetToken}">Reset Password</a></h3>  `
                    
        sendEmail(email, "Password Reset", html)
        
        response.status(200).json({status:true,message:"Password Reset Token Successfully Sent"})

    } catch (error) {
        
        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }

}

const resetPassword = async (request, response) => {
    
    const {validationToken, newPassword} = request.body

    try {
        
        const vendor = await Vendor.findOne({ validationToken })

        if (!newPassword) {
            
            return response.status(422).json({status:false, message:"New Password is Missing"})
        }
        
        if (!vendor) {
            
            return response.status(404).json({status:false, message:"Invalid Token"})
        }

        const hashedpassword = await bcrypt.hash(newPassword,10)

        vendor.password = hashedpassword
        vendor.validationToken = undefined
        vendor.validationTokenExpires = undefined

        await vendor.save()


        response.status(200).json({status:true, message:"Password Reset Successful"})


    } catch (error) {
        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }
}


const addVendorAccoountDetails = async (request, response) => {
    
    const vendorId = request.vendor._id

    const { accountNo, accountProvider, accountHolder,password} = request.body
    
    try{

        const vendor = await Vendor.findById(vendorId)

        if (!vendor) {
            
            return response.status(404).json({status:false, message:"Vendor Not Found"})
        }

        if (!accountNo || !accountProvider || !accountHolder || !password) {
            
            return response.status(422).json({status:false, message:"One Field or More is Missing"})
        }

        const passwordIsValid = await bcrypt.compare(password, vendor.password)

        if (!passwordIsValid) {
            
            return response.status(501).json({status:false, message:"incorrect Password"})
        }

        vendor.accountHolder = accountHolder
        vendor.accountNo = accountNo
        vendor.accountProvider = accountProvider

        await vendor.save()

        response.status(201).json({status:true, message:"Withdrawal Details Added Successfully"})


    } catch (error) {
        
        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }
    
}

const editVendorAccount = async (request, response) => {

    const id = request.vendor._id
    
    const { firstName, lastName, mobileNumber, businessName, businessImage } = request.body
    
     try{


    if(!firstName){

        return response.status(422).json({status:false,message:"First Name is Missing"})
    }

    if (!lastName) {
        
        return response.status(422).json({status:false,message:"Last Name is Missing"})
    }
    
    if(!mobileNumber){

        return response.status(422).json({statu:false, message:"Mobile Number is Required"})
    }

    if (!businessName) {
        
        return response.status(422).json({status:false, message:"Business Name is Required"})
    }

    if (!businessImage) {
        
        return response.status(422).json({status:false, message:"Business Image is Required"})
    }

    const image = await Image.findOne({vendor:id})
    image.url = businessImage
    await image.save()

    const vendor = await Vendor.findByIdAndUpdate(id,{ firstName, lastName, mobileNumber, businessName, businessImage:image._id})

    await vendor.save()

   response.status(201).json({status:true, message:"Account Updated Successfully"})


    }catch(error){

         response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }
}

const getVendor = async (request, response) => {

    const uniqueUrl = request.query.vendor

    try {
    
        if (!uniqueUrl) {

            return response.status(422).json({ status: false, message: "Vendor Id is Missing" })
        }

        const vendor = await Vendor.findOne({uniqueUrl}).populate("businessImage")

        if (!vendor) {

            return response.status(404).json({ status: false, message: "Vendor Was Not Found" })
        }

        const foods = await Food.find({store:vendor._id})



        response.status(201).json({ status: true, vendor,foods })

    } catch (error) {
        
        response.status(500).json({ status: false, message: "Internal Server Error" })
        console.log(error)
    }

}


const getVendors = async (request, response)=>{

    try{

const vendors = await Vendor.find({validated:true}).sort({createdAt:-1}).populate("businessImage")

response.status(200).json({status:true, vendors})

    }catch(error){
        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }
}

const getLoggedVendor = async (request, response)=>{

    const id = request.vendor._id

    try{

    const vendor = await Vendor.findById(id).populate("businessImage")

    if(!vendor){

        return response.status(404).json({status:false, message:"Vendor Not Found"})
    }

response.status(200).json({status:true, vendor})
        
    }catch(error){
        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }

}

const getVendorBallance = async (request, response)=>{

    const id = request.vendor._id
    const pin = request.body.withdrawalPin

    try{

        if(!pin){

            return response.status(422).json({status:false, message:"Pin is Required"})
        }

        const vendor = await Vendor.findById(id)

        if(pin != vendor.withdrawalPin){

            return response.status(401).json({status:false, message:"Invalid PIn"})
        }

        if(vendor.panicMode){

            return response.status(200).json({status:true, ballance:vendor.panicballance})

        }

        response.status(200).json({status:true, ballance:vendor.ballance})

    }catch(error){

        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }

}

const changeVendorPassword = async (request, response)=>{

    const id = request.vendor._id

    const {oldPassword, newPassword} = request.body

    try{

        if(!oldPassword){

            return response.status(422).json({status:false, message:"Password is Required"})
        }

        if(!newPassword){

            return response.status(422).json({status:false, message:"New Password Required"})
        }

        const vendor = await Vendor.findById(id)

        const passwordIsValid = await bcrypt.compare(oldPassword, vendor.password)

        if(!passwordIsValid){

            return response.status(401).json({status:false, message:"Incorrect Password"})
        }

        const password = await bcrypt.hash(newPassword,10)

        vendor.password = password

        await vendor.save()

        response.status(201).json({status:true, message:"Password Changed"})

    



    }catch(error){

        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }

}


const setVendorPaymentPin = async (request, response)=>{

    const id = request.vendor._id
    const {pin,password} = request.body


    try{

        if(!pin){

            return response.status(422).json({status:false, message:"Please Enter Transaction Pin"})
        }

        if(pin.length > 4){

            return response.status(422).json({status:false, message:"Pin Must be 4 Characters"})
        }

        if(!password){

            return response.status(422).json({status:false, message:"Please Enter Password for Validation"})
        }

        const vendor = await Vendor.findById(id)


        const passwordIsValid = await bcrypt.compare(password, vendor.password)

        console.log(vendor)
        // console.log(passwordIsValid)

        if(!passwordIsValid){

            return response.status(401).json({status:false, message:"Incorrect Password"})
        }

        vendor.withdrawalPin = pin

        await vendor.save()

        response.status(201).json({status:true, message:"Payment Pin Updated"})




    }catch(error){

        console.log(error)
        response.status(500).json({status:false, message:"Internal Server Error"})
    }


}


const setVendorPanicMode = async (request, response)=>{

    const id = request.vendor._id
    const {amount,status} = request.body


    try{

    if(!amount){

        return response.status(422).json({status:false, message:"Please Enter Panic Amount"})
    }
    if(amount > 5000){

        return response.status(401).json({status:false, message:"Panic Ballance can only be 5000 and Lesser"})

    }

    const vendor = await Vendor.findById(id)
    vendor.panicballance = amount
    vendor.panicMode = status
    await vendor.save()

    response.status(201).json({status:true, message:"Panic Mode Updated"})




    }catch(error){

        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }
}

const requestWithdrawal = async (request, response) => {
    
    const amount = request.body.amount
    const id = request.vendor._id

    try{

    if(!amount){

        return response.status(422).json({status:false, message:"Please Enter Amount to Withdraw"})
    }
    
        const vendor = await Vendor.findById(id)

   
        
        if (amount == vendor.ballance) {
            
            return response.status(400).json({status:false, message:"You can Not Withdraw all Funds"})
        }

        if (parseInt(amount)+500 > vendor.ballance) {
            
            return response.status(400).json({status:false, message:"Insufficient Funds, at Least 500 must be Left in your wallet"})
        }

        if (!vendor.accountNo) {
            
            return response.status(400).json({status:false, message:"You Dont Have any Saved Withdrawal Details"})
        }

        vendor.ballance -= parseInt(amount)
        await vendor.save()

        const vendorTransaction = await VendorTransaction.create({ transactionType: "debit", amount:amount, description:`Business Sales Withdrawal` , owner: vendor._id, status: "successfull" })

        sendEmail(vendor.email,"Withdrawal Summary",`Dear ${vendor.firstName}, Your Requested for the Withdrawal of ${amount} NGN from Your Business Named ${vendor.businessName} on Chowlin, You'll Receive a Mail Immediately Withdrawal has been Approved`)

 
        response.status(200).json({status:true, message:"Withdrawal Request Submitted"})


    }catch(error){

        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }

}

 module.exports = {newVendor,verifyEmail,loginVendor,forgotPassword,resetPassword,addVendorAccoountDetails,getVendors,getVendor,getLoggedVendor,getVendorBallance,editVendorAccount,changeVendorPassword,setVendorPaymentPin,setVendorPanicMode,requestWithdrawal}