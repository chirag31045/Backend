const mongoose=require('mongoose')
const Dish=require('./Dish')
const orderSchema=new mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId, ref:'users'},
    dishes:[{type:mongoose.Schema.Types.ObjectId,ref:'dish'}],
    totalPrice:Number,
    isCart:{type: Boolean,default: true},
    createdAt:{type:Date,default:Date.now},
   status : {
        type : String,
        enum : ["completed","pending","cancelled"]
    },
    payment : {
        type:String,
        enum : ["pending", "success","cancelled"]
    }
})
// Pre-save hook to calculate tottalPrice
orderSchema.pre('save',async function(next){
    try{
        const dishDetails= await Dish.find({_id: {$in: this.dishes} })

        this.totalPrice=dishDetails.reduce((sum,dish)=>sum+dish.price,0);
        next();
    }catch(err){
        next(err)
    }
})

module.exports=mongoose.model('order',orderSchema)
