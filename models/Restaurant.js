const mongoose=require('mongoose')
const restaurantSchema=new mongoose.Schema({
    name:String,
    location:String,
    description:String
})
module.exports=mongoose.model('restaurant',restaurantSchema)