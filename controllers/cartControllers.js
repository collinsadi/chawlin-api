const Cart = require("../models/cartModel")
const Food = require("../models/foodModel")


const addNewCart = async (request, response) => {
    
    const user = request.user._id

    const {foodid} = request.body


    try {

        if(!foodid){

            return response.status(422).json({status:false, message:"Food Id is Required"})
        }

        const food = await Food.findById(foodid)

        if(!food){

            return response.status(404).json({status:false, message:"Food Not Found"})

        }


        if(food.notAvailable){

            return response.status(401).json({status:false, message:"Food Unavailable at the Moment"})
        }
    
        const foodExists = await Cart.findOne({ foodid })
        
        if (foodExists) {
            
            foodExists.foodQuantity += 1

            await foodExists.save()

            return response.status(200).json({status:true, message:"Food Quantity Increased"})
        }
        console.log(food.store)


        const anotherVendor = await Cart.findOne({ user ,$and:[{vendor:{$ne:food.store}}]} )
        
        if (anotherVendor){// && !anotherVendor.vendor == food.store) {
            
            return response.status(400).json({status:false,message:"Sorry, You can only Purchase Meals from One Vendor at a Time, remove Meals from another Vendor and add Another if You wish to buy from another Vendor"})
        }


    

        const cart = await Cart.create({user,foodid,vendor:food.store})

        response.status(201).json({status:true, message:`${food.foodName} added To Cart`})


    } catch (error) {
        
        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }

}

const getUserCart = async (request, response)=>{
    
    const user = request.user._id


    try{

        const cartItems = await Cart.find({ user }).populate("foodid").sort({createdAt:-1})
        
        // const totalQuantity = cartItems.map(item => item.foodQuantity).join("+").toString()

        // const quantity = eval(totalQuantity)

        // console.log(quantity)

        // const totalAmount = cartItems.map(item => item.foodid.foodPrice).join("+").toString()

        // const amount = quantity * eval(totalAmount)

        // console.log(eval(totalAmount))

        let amount = 0

        cartItems.forEach(item => {
            
            console.log(parseInt(item.foodid.foodPrice) * parseInt(item.foodQuantity))

            amount += parseInt(item.foodid.foodPrice) * parseInt(item.foodQuantity)
        })
       

       


        response.status(200).json({status:true, cartItems,bill:amount})

    } catch (error) {
        
        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }


}

const getUserCartLength = async (request, response) => {
    
    const user = request.user._id

    try {
    
        const cartLength = await Cart.find({ user }).count()
        
        response.status(200).json({status:true,cartLength})


    }catch(error){

        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }

}

const changeCartQuantity = async (request, response) => {
    
    const user = request.user._id

    const food = request.query.food /**cart Unique Identifier */

    const action = request.body.action



    try {

        if (!food) {
            
            return response.status(422).json({status:false, message:"Cart Id is Missing"})
        }

         const cartToChange = await Cart.findById(food).populate("foodid")

        if(user != cartToChange.user){

            return response.status(401).json({status:false, message:"Unauthorized Request"})
        }

        if (!cartToChange) {
                    
            return response.status(404).json({status:false, message:"Cart Not Found"})

        }
        

        if(action === "reduce"){ 

            if (cartToChange.foodQuantity === 1) {
                
                return response.status(404).json({status:false, message:"Cart at Minimun"})
            }

            cartToChange.foodQuantity -= 1
            await cartToChange.save()

            return response.status(200).json({status:true, message:"Cart Item Reduced"})
        }


        if(action === "increase"){ 

            cartToChange.foodQuantity += 1
            await cartToChange.save()

            return response.status(200).json({status:true, message:"Cart Item Increased"})
        }

        response.status(422).json({status:false, message:"Action Not Recognized"})

        
    } catch (error) {
        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }

}

const removeItemFromCart = async (request, response) => {
    
    const user = request.user._id

    const food = request.query.food /**cart Unique Identifier */

    try {

        if (!food) {
            
            return response.status(422).json({status:false, message:"Cart Id is Missing"})
        }

        const cartTodelete = await Cart.findById(food).populate("foodid")

        if (!cartTodelete) {
            
            return response.status(404).json({status:false, message:"Cart Not Found"})

        }

        if(user != cartTodelete.user){

            return response.status(401).json({status:false, message:"Unauthorized Request"})
        }

        const deletedName = cartTodelete.foodid.foodName

        await Cart.findByIdAndDelete(food)
        

        response.status(200).json({status:true, message:`${deletedName} Removed from Cart`})


    }catch(error){

        response.status(500).json({status:false, message:"Intrnal Server Error"})
        console.log(error)
    }

}

module.exports = {addNewCart,getUserCart,getUserCartLength,removeItemFromCart,changeCartQuantity}