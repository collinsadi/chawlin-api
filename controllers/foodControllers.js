const Food = require("../models/foodModel");
const shortid = require("shortid")
const Vendor = require("../models/vendorModel")


const createFood = async (request, response) => {
    
    const store = request.vendor._id

    const {foodName, foodDescription,foodPrice,foodImage} = request.body

    try{


        if (!foodName) {
            
            return response.status(422).json({status:false, message:"Food Name is Required"})
        }
        if (!foodDescription) {
            
            return response.status(422).json({status:false, message:"Food Descritpion is Required"})
        }
        if (!foodPrice) {
            
            return response.status(422).json({status:false, message:"Food Price is Required"})
        }
        if (!foodImage) {
            
            return response.status(422).json({status:false, message:"Food Image is Required"})
        }

        const joinName = `${foodName.split(" ").length > 0 ? foodName.split(" ").join("-").toLowerCase() : foodName.toLowerCase()}-`

        const uniqueName = joinName+await shortid.generate().toLowerCase()

        const food = await Food.create({ foodName,uniqueName, foodDescription, foodPrice, foodImage, store })
        
        response.status(201).json({status:true, message:"Food Sucessfully Created"})

    }catch(error){

        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }


}

const markFoodUnavailable = async (request, response) => {
    
    const id = request.query.food
    const store = request.vendor._id
    console.log(store)

    try{

        const food = await Food.findById(id)

        if (!food) {
            
            return response.status(404).json({status:false, message:"Food Not Found"})
        }

        console.log(food.store)

        if(!food.store == store){

            return response.status(401).json({status:false, message:"You can only Control Food You Created"})
        }

        food.notAvailable = true
        await food.save()

        response.status(200).json({status:true, message:"Food Marked as Unavailable"})

    }catch(error){

        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }

}
const markFoodAvailable = async (request, response) => {
    
    const id = request.query.food
    const store = request.vendor._id

    try{

        const food = await Food.findById(id)

        if (!food) {
            
            return response.status(404).json({status:false, message:"Food Not Found"})
        }

        if(!food.store == store){

            return response.status(401).json({status:false, message:"You can only Control Food You Created"})
        }

        food.notAvailable = false
        await food.save()

        response.status(200).json({status:true, message:"Food Marked as Available"})

    }catch(error){

        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }

}

const getFoodByUniqueName = async (request, response)=>{

    const uniqueName = request.query.food

    try {
    
    if(!uniqueName){

        return response.status(422).json({status:false, message:"query 'food' missing"})
        }
        
        const food = await Food.findOne({ uniqueName }).populate("store","-token")
        
        if (!food) {
            
            return response.status(404).json({ status: false, message:"Food Was Not Found"})
        }

        response.status(200).json({status:true, food})


    } catch (error) {
        
        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }

}

const getAllFoodByVendor = async (request, response) => {
    
    const store = request.query.vendor

    try{

        if(!store){

            return response.status(422).json({status:false, message:"query 'vendor' missing " })
        }

        const vendor = await Vendor.findById(store)

        if(!vendor){

            return response.status(422).json({status:false, message:"Invalid Vendor Id"})
        }

        const foods = await Food.find({ store }).populate("store","-token").sort({createdAt:-1})
        
        response.status(200).json({status:true, foods})

    }catch(error){

        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }

}

const getLoggedInVendorFoods = async (request, response)=>{

    const store = request.vendor._id

    try {

    const menu = await Food.find({store}).sort({createdAt:-1})

    response.status(200).json({status:true, menu})

    } catch(error){
        response.status(500).json({status:false, message:"Internal Server Error"})
        console.log(error)
    }
}


module.exports = {createFood,markFoodAvailable,markFoodUnavailable,getFoodByUniqueName,getAllFoodByVendor,getLoggedInVendorFoods}