const Food = require("../models/foodModel")
const Order = require("../models/orderModel")
const Cart = require("../models/cartModel")
const Vendor = require("../models/vendorModel")
const User = require("../models/userModel")
const sendEmail = require("../middlewares/sendEmail")
const Transaction = require("../models/transactionModel")



const newOrder = async (request, response) => {
    const userId = request.user._id

    const location = request.body.location
    const date = new Date()

    try {
    
    const user = await User.findById(userId)

        if(!user){

            return response.status(401).json({status:false, message:"a Critical Error Occured"})
        }
    
        const cartItems = await Cart.find({user:userId}).populate("foodid")

        if(cartItems.length === 0){

            return response.status(400).json({status:false, message:"Nothing to Order"})
        }

        let amount = 0

        cartItems.forEach(item => {
            
            console.log(parseInt(item.foodid.foodPrice) * parseInt(item.foodQuantity))

            amount += parseInt(item.foodid.foodPrice) * parseInt(item.foodQuantity)
        })

        if(amount > user.ballance){

            return response.status(401).json({status:false, message:"Insufficient Ballance Try Funding Your Account and Try Again"})
        }

        const vendor = await Vendor.findById(cartItems[0].vendor)

        
        let statement = `Ordered `

        cartItems.forEach(item => {
            
            console.log(item.foodQuantity, item.foodid.foodName + " Which is " + parseInt(item.foodid.foodPrice) * parseInt(item.foodQuantity))
            
            statement += parseInt(item.foodQuantity) + " " + item.foodid.foodName + ", Which is " + parseInt(item.foodid.foodPrice) * parseInt(item.foodQuantity) + " Naira,"
        })


        const orderDetails = statement + "Making it "+amount+" Naira Total from "+vendor.businessName

        // console.log(statement + "Making it "+amount+" Naira Total")

        const foods = cartItems.map(item => item.foodid)

        user.ballance -= amount
        vendor.ballance += amount
        await user.save()
        await vendor.save()

        
        const order = await Order.create({ user: userId, location, vendor: vendor._id, amount, orderDetails, foods: foods, status: "confirmed" })
        


        sendEmail(user.email, "Order Summary", `<p>${user.firstName},You ${orderDetails} to be Delivered at ${location}<br> <b>Your Current Ballance is ${user.ballance} Naira</b><br> You can Track Your Order from Your Dashboard, You Would Receive Emails About Your Order, Except You have Delivery Emails Turned Off <br> Call Vendor on ${vendor.mobileNumber}</p>`)

        const transaction = await Transaction.create({transactionType:"debit",amount,description:`Ordered for food from ${vendor.businessName} `,owner:userId,status:"successfull"})

        sendEmail(vendor.email,"New Order", `<p>There's a New Order From ${user.firstName} ${user.lastName}, ${orderDetails} to be delivered at ${location}, Your Chowlin Account Have Been Credited Sucessfully</p>`)

        await Cart.deleteMany({user:userId})


        response.status(200).json({status:true, message:"Order Placed Sucessfully"})


    }catch(error){

        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }

}

const packingOrder = async (request, response) => {
    const vendor = request.vendor._id

    const orderid = request.query.order

    try{

        if (!orderid) {
            
            return response.status(422).json({status:false, message:"Order Id not Found"})
        }

        const order = await Order.findById(orderid).populate("user vendor")

        if(!order){

            return response.status(404).json({status:false, message:"Order Not Found"})
        }

        if(order.vendor != vendor){

            return response.status(401).json({status:false, message:"Unauthorized Request"})
        }

        order.status = "packing"

        await order.save()

        if (order.user.deliveryMails) {

            sendEmail(order.user.email,"Order Being Packed",`<p>${order.user.firstName}, Your Order from ${order.vendor.businessName} is being Packed</p><br><br><i>You can Disable These Emails from Your Account Section on The Chowlin Website</i>`)

        }

        

        response.status(200).json({status:true, message:"Order Status Updated"})


    }catch(error){

        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }
}

const orderOutForDelivery = async (request, response) => {
    
     const vendor = request.vendor._id

    const orderid = request.query.order

    try{

        if (!orderid) {
            
            return response.status(422).json({status:false, message:"Order Id not Found"})
        }

        const order = await Order.findById(orderid).populate("user vendor")

        if(!order){

            return response.status(404).json({status:false, message:"Order Not Found"})
        }

        if(order.vendor != vendor){

            return response.status(401).json({status:false, message:"Unauthorized Request"})
        }

        order.status = "out"

        await order.save()

        if (order.user.deliveryMails) {

            sendEmail(order.user.email,"Order Out",`<p>${order.user.firstName}, Your Order from ${order.vendor.businessName} is Out for Delivery to ${order.location}, Please Dont Keep the Rider Waiting, Don't also Hesitate to report any Abnormal Behaviour or Food Handling to Chowlin Customer Support Center</p><br><br><i>You can Disable These Emails from Your Account Section on The Chowlin Website</i>`)

        }


        response.status(200).json({status:true, message:"Order Status Updated"})


    }catch(error){

        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }
}

const orderDelivered = async (request, response) => {
     const vendor = request.vendor._id

    const orderid = request.query.order

    try{

        if (!orderid) {
            
            return response.status(422).json({status:false, message:"Order Id not Found"})
        }

        const order = await Order.findById(orderid).populate("user vendor")

        if(!order){

            return response.status(404).json({status:false, message:"Order Not Found"})
        }

        if(order.vendor != vendor){

            return response.status(401).json({status:false, message:"Unauthorized Request"})
        }

        order.status = "delivered"
        order.closed = true

        await order.save()

        if (order.user.deliveryMails) {

            sendEmail(order.user.email,"Order Delivered",`<p>${order.user.firstName}, Your Order from ${order.vendor.businessName} Was Marked as Delivered to ${order.location}, Please Contact Support if you Did not Receive this Order, Don't also Hesitate to report any Abnormal Behaviour or Food Handling to Chowlin Customer Support Center<br> You can also Take a few Minutes of your Time and Rate Your Experience on the Chowlin App</p><br><br><i>You can Disable These Emails from Your Account Section on The Chowlin Website</i>`)

        }





        response.status(200).json({status:true, message:"Order Status Updated"})


    }catch(error){

        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }
}

const getUserOrders = async (request, response)=>{

    const user = request.user._id

    try{

    // const orders = await Order.find({user}).populate("ven\dor").sort({createdAt:-1})

        const openOrders = await Order.find({user,$and:[{closed:{$eq:false},cancelled:{$ne:true}}]}).populate("vendor").sort({createdAt:-1})

        const closedOrders = await Order.find({user,$and:[{closed:{$eq:true},cancelled:{$ne:true}}]})

    response.status(200).json({status:true,openOrders,closedOrders})

    }catch(error){

        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }

}


const getVendorOrders = async (request, response) => {
    const vendor = request.vendor._id

    try{

    const orders = await Order.find({vendor}).populate("vendor").sort({createdAt:-1})


    response.status(200).json({status:true,orders})

    }catch(error){

        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }

}

const getSingleOrderForVendor = async (request, response)=>{

    const vendor = request.vendor._id

    const orderid = request.query.order

    try{

        const order = await Order.findById(orderid).populate("user foods")
        
        if (order.vendor != vendor) {
            
            return response.status(401).json({status:false, message:"Unauthorized Request"})
        }


    response.status(200).json({status:true,order})

    }catch(error){

        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }

}
const getSingleOrderForUser = async (request, response)=>{

    const user = request.user._id

    const orderid = request.query.order

    try{

        const order = await Order.findById(orderid)
        
        if (order.user != user) {
            
            return response.status(401).json({status:false, message:"Unauthorized Request"})
        }


    response.status(200).json({status:true,order})

    }catch(error){

        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }

}

const userCancellOrder = async (request, response) => {
    
    const user = request.user._id

    const orderid = request.query.order

    try{

        if (!orderid) {
            
            return response.status(422).json({status:false,message:"Oder Id Not Found"})
        }

        const order = await Order.findById(orderid)

        if(!order){

            return response.status(404).json({statua:false, message:"Order Not Found"})
        }
   
        if (order.user != user) {
            
            return response.status(401).json({statua:false, message:"Unauthorized Request"})
        }

        if(order.status === "packing"){

            return response.status(400).json({status:false, message:"Your Food is already Being Packed You can Not Cancel Order"})
        }

        if(order.status === "out"){

            return response.status(400).json({status:false, message:"Your Food is already Out For Delivery You can Not Cancel Order"})
        }

        if(order.status === "delivered"){

            return response.status(400).json({status:false, message:"Your Food has Already Been Delivered, You can Not Cancel Order"})
        }


        const vendor = await Vendor.findById(order.vendor)
        const userToCredit = await User.findById(user)

        vendor.ballance -= order.amount
        userToCredit.ballance += order.amount
        order.cancelled = true

        await userToCredit.save()
        await vendor.save()
        await order.save()

        const transaction = await Transaction.create({transactionType:"credit",amount:order.amount,description:`Funds Reversal for Cancelled Order`,status:"sucessfull",owner:user})


        sendEmail(vendor.email,"Order Cancelled",`Order ${order._id} Has Been Canceled By User, This May Be Due to Delay in Delivery, Please Try to Meet up Fast deliveries so as to Avoid Cancelation of Future Orders by Users, <b>Your Chowlin Account Has Been Debited the Sum of ${order.amount} Naira and Credited to User's Account as a Canceled Order Reversal Fund</b>.<br><br> Contact Support to Report any Action You think is Required Prior to the Cancelation of this Order`)

        response.status(200).json({status:true, message:"Order Sucessfully Cancelled"})

    }catch(error){

        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }

}
const vendorCancellOrder = async (request, response) => {
    
    const vendor = request.vendor._id

    const orderid = request.query.order

    try{

        if (!orderid) {
            
            return response.status(422).json({status:false,message:"Oder Id Not Found"})
        }

        const order = await Order.findById(orderid)

        if(!order){

            return response.status(404).json({statua:false, message:"Order Not Found"})
        }
   
        if (order.vendor != vendor) {
            
            return response.status(401).json({statua:false, message:"Unauthorized Request"})
        }

        if(order.status === "packing"){

            return response.status(400).json({status:false, message:"Food is already Being Packed You can Not Cancel Order"})
        }

        if(order.status === "out"){

            return response.status(400).json({status:false, message:"Food is already Out For Delivery You can Not Cancel Order"})
        }

        if(order.status === "delivered"){

            return response.status(400).json({status:false, message:"Food has Already Been Delivered, You can Not Cancel Order"})
        }


        const vendor = await Vendor.findById(order.vendor)
        const userToCredit = await User.findById(order.user)

        vendor.ballance -= order.amount
        userToCredit.ballance += order.amount
        order.cancelled = true

        await userToCredit.save()
        await vendor.save()
        await order.save()

        const transaction = await Transaction.create({transactionType:"credit",amount:order.amount,description:`Funds Reversal for Cancelled Order`,status:"sucessfull",owner:user})


        sendEmail(userToCredit.email,"Order Cancelled",`${userToCredit.firstName}, Your Order #${order._id} Has Been Canceled By Vendor, This May Be Due to Vendor's Inability to Deliver Food or Unavailability of Food<b>Your Chowlin Account Has Been Credited with the Sum of ${order.amount} Naira as a Canceled Order Reversal Fund</b>.<br><br> Contact Support to Report any Action You think is Required Prior to the Cancelation of this Order`)

        response.status(200).json({status:true, message:"Order Sucessfully Cancelled"})

    }catch(error){

        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }

}


const getInvoive = async (request, response)=>{

const user = request.user._id

    const orderid = request.query.order

    try{

        const order = await Order.findById(orderid).populate('user vendor foods')
        
        if (order.user._id != user) {
            
            return response.status(401).json({status:false, message:"Unauthorized Request"})
        }


    response.status(200).json({status:true,order})

    }catch(error){

        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }

}

module.exports = {newOrder,packingOrder,orderOutForDelivery,orderDelivered,getUserOrders,getVendorOrders,getSingleOrderForVendor,getSingleOrderForUser,userCancellOrder,vendorCancellOrder,getInvoive}