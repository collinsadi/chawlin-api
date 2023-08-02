const sendEmail = require("../middlewares/sendEmail")
const Transaction = require("../models/transactionmodel")
const User = require("../models/userModel")


const fundWallet = async (request, response) => {

    const user = request.user

    const {amount,pin} = request.body
    
    try {
    
        if (!amount) {
            return response.status(422).json({status:false, message:"Please Enter an Amount To fund"})
        }

        if (!pin) {
            return response.status(422).json({status:false, message: "Please Enter Transaction Pin"})
        }

        // if (pin !== user.paymentPin) {
            
        //     return response.status(401).json({status:false, messsage: "Please Enter a Valid Transaction Pin"})
        // }

        if (amount < 1000) {
            
            return response.status(400).json({status:false, message: "Minimum Account Deposit is 1000 NGN an Above"})
        }

        try{

        const payStackSecretKey = process.env.PAYSTACK_SECRET
        const url = "https://api.paystack.co/transaction/initialize"
        
        const res = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${payStackSecretKey}`,
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                amount: amount*100 ,
                email : user.email,
                callback_url: `http://localhost:5000/users/account/funded`

            })
        })
        
        const data = await res.json()
            console.log(data)
            
        if (data.status) {
        response.status(200).json({status:true, paymentUrl:data.data.authorization_url})
        return;
        }

        response.status(400).json({status:false, message:`${data.message ? data.message : "Unable to Process Payment"}`})
       
    }catch(error){
        response.status(500).json({status:false, message:"an Error Occured"})
        console.log("Paystack error", error)
    }





    }catch(error){

        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }

}

const fundStatus = async (request, response) => {
    
    const refrence = request.query.refrence
    const user = request.user

    try {
        const url = "https://api.paystack.co/transaction/verify/" + refrence
        const payStackSecretKey = process.env.PAYSTACK_SECRET

    const res = await fetch(url,{
        method:"get",
        headers: {
            Authorization: `Bearer ${payStackSecretKey}`,
            "Content-Type":"application/json"
        }
    })

    const data = await res.json()

        // if (user.email !== data.customer.email) {
                
        //         return response.status(401).json({status:false, message:"Looks Like an Unauthorized Request"})
        //     }

        console.log(data)

        if (data.status) {

            const email = user.email
            const amount = parseInt(data.data.amount)/100 
            const date = new Date(data.data.paid_at)
            const html  = `<p><b>Dear ${user.firstName}</b>, <br> Your Payment Request to Fund Your Account with the sum of<b> ${amount} NGN </b> on ${date.toLocaleDateString(undefined,{day:"2-digit", month:"2-digit", year:"numeric"})}, was Sucessful and Your Acount Have Been Funded. <br><br> Feel Free to Contact Support for any Further Information on Paymemt that you might Need</p>`
            
            const user2 = await User.findOne({ email })
            const transaction = await Transaction.create({transactionType:"credit",amount:amount, description:"Account Funding",owner:user2._id, status:"successful"})

            user2.ballance += amount

            await user2.save()
            await transaction.save()

            sendEmail(email, "Transaction Summary", html)
            
            return response.status(200).json({status: true, message:"Accound Funded Successfully"})
        }

        if (!data.status) {
            
            const email = user.email
            const amount = parseInt(data.data.amount)/100 
            const date = new Date(data.data.paid_at)
            const html  = `<p><b>Dear ${user.firstName}</b>, <br> Your Payment Request to Fund Your Account with the sum of<b> ${amount} NGN </b> on ${date.toLocaleDateString(undefined,{day:"2-digit", month:"2-digit", year:"numeric"})}, Failed. <br><br> Feel Free to Contact Support for any Further Information on Paymemt that you might Need</p>`
            
            const transaction = Transaction.create({transactionType:"credit",amount:amount, description:"Account Funding",owner:user._id, status:"failed"})

            
            await transaction.save()

            sendEmail(email, "Transaction Summary", html)
            
            return response.staus(200).json({status: false, message:"Transaction Failed"})
        }


        

    } catch (error) {
        
        response.status(500).json({status: false, message:"Internal Server Error"})
        console.log(error)
    }
}



module.exports = {fundWallet,fundStatus}