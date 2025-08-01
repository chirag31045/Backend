const Category = require("./Category")
const Restaurant = require("./Restaurant")

const mongoose=require('mongoose')
const dishSchema=new mongoose.Schema({
    name:String,
    //description:String,
    price:Number,
    category:{type:mongoose.Schema.Types.ObjectId,ref:'Category'},
    restaurant:{type:mongoose.Schema.Types.ObjectId,ref:'Restaurant'},
    image:String
})
module.exports=mongoose.model('dish',dishSchema)