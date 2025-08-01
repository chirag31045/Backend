const express=require('express')
const cors=require('cors')
const multer=require('multer')
const path=require('path')
const bcrypt=require('bcrypt')
require('./config')



const app=express();
app.use(cors());
app.use(express.json())
app.use('/uploads',express.static('uploads'))

const Users=require('./models/Users');
const Restaurant=require('./models/Restaurant');
const Category=require('./models/Category')
const Dish=require('./models/Dish')
const Order=require('./models/Orders')

// multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// user registration password ram@234
app.post('/api/users/register',async(req,res)=>{
    try{
        const {name,email,password}=req.body;
        
        const exitingUser=await Users.findOne({email});
        if(exitingUser){
           return res.status(400).json({message:"Email already register"})
        }
        const hashedPaasword=await bcrypt.hash(password,10)

        const newUSer=new Users({
            name,
            email,
          password:hashedPaasword
        })
        await newUSer.save();

        return res.status(201).json({message: 'User registered Successfully',user:newUSer})
    
    }catch(err){
        return res.status(500).json({message: 'Server error',error:err.message})

    }
    
})





// get users
app.get('/api/users/register',async(req,res)=>{
    const users=await Users.find();
    res.json(users)
})

// user login
app.post('/api/users/login',async(req,res)=>{
    const {email,password}=req.body;

    try{
        const user=await Users.findOne({email});
        if(!user){
            return res.status(400).json({message :'User not found'})
        }
        const isMatch=await bcrypt.compare(password,user.password)

        if(!isMatch){
            return res.status(400).json({message: "Invalid password"});
        }

        res.status(200).json({message: 'Login Successfull',user});

    }catch(err){
        res.status(500).json({message:'server error',error:err.message})
    }
})
// Restaurant CRUD Operation
app.post('/api/restaurant',async(req,res)=>{
    const restaurant=new Restaurant(req.body);
    await restaurant.save();
    res.status(201).json(restaurant)
})

app.get('/api/restaurant',async(req,res)=>{
    const restaurant=await Restaurant.find();
    res.json(restaurant)
})

app.put('/api/restaurant/:id',async(req,res)=>{
    const updated=await Restaurant.findByIdAndUpdate(req.params.id,req.body,{new:true})
    res.json(updated)
})

app.delete('/api/restaaurant/:id',async(req,res)=>{
    const deleted=await Restaurant.findByIdAndDelete(req.params.id)
    res.json(deleted)
})

// Category CRUD Opearation
app.post('/api/category',async(req,res)=>{
    const category=new Category(req.body)
    await category.save();
    res.status(201).json(category)   
})

app.get('/api/category',async(req,res)=>{
    const categories=await Category.find();
    res.json(categories)
})

app.put('/api/category/:id',async(req,res)=>{
    const updated=await Category.findByIdAndUpdate(req.params.id,req.body,{new:true})
    res.json(updated);
})

app.delete('/api/category/:id',async(req,res)=>{
    const deleted=await Category.findByIdAndDelete(req.params.id);
    res.json(deleted)
})

// Dishes CRUD Operation
app.post('/api/dish', upload.single('image'),async(req,res)=>{
    const dish=new Dish({
        name:req.body.name,
        //description:req.body.description,
        price:req.body.price,
        category:req.body.category,
        restaurant:req.body.restaurant,
        image:req.file ? req.file.path : ''
    })
    await dish.save();
    res.status(201).json(dish)
})

app.get('/api/dish',async(req,res)=>{
    const dishes=await Dish.find();
    res.json(dishes)
})

app.put('/api/dish/:id',upload.single('image'),async(req,res)=>{
    const updated=await Dish.findByIdAndUpdate(req.params.id,{
        name:req.body.name,
       // description:req.body.description,
        price:req.body.price,
        category:req.body.category,
        restaurant:req.body.category,
        image: req.file ? req.file.path: req.body.image
    },{new:true})
    res.json(updated)
})

app.delete('/api/dish/:id',async(req,res)=>{
    const deleted=await Dish.findByIdAndDelete(req.params.id);
    res.json(deleted)
})

// Orders

app.post('/api/order',async(req,res)=>{
    try{
        const order=new Order(req.body)
        await order.save();
        res.status(201).json(order)
    }
    catch(err){
        res.status(400).json({error:err.message})
    }
   
})

app.get('/api/order',async(req,res)=>{
    try{ 
         const orderes=await Order.find()
         .populate('user')
         .populate('dishes')
         res.json(orderes)
    }catch(err){
        res.status(400).json({error:err.message})
    }
   
})

app.put('/api/order/:id',async(req,res)=>{
    try{
    const update=await Order.findByIdAndUpdate(req.params.id,req.body,{new:true});
    res.json(update)
    }
    catch(err){
        res.status(400).json({error:err.message})
    }
})

app.delete('/api/order/:id',async(req,res)=>{
    try{
       const deleted=await Order.findByIdAndDelete(req.params.id)
       res.json(deleted)
    }
    catch(err){
        res.status(400).json({error:err.message})
    }

})

// Add to cart
app.post('/api/cart/add',async(req,res)=>{
    const {user,dishes}=req.body;

    try{
        if(!user || !Array.isArray(dishes)){
            return res.status(400).json({message:"User Id and dishes array are required"})
        }
        const cart=await Order.findOne({user,isCart:true})
        if(!cart){
            return res.status(404).json({message:"Cart not found"})
        }

       // add dishes
       dishes.forEach(id=>{
        if(!cart.dishes.includes(id)){
            cart.dishes.push(id);
        }
       })
       await cart.save();

       res.status(200).json({
        message:"Dishes added to cart",
        cart: cart
       })
    }
    catch(err){
        res.status(500).json({message: 'Error removing from cart',error:err.message})
    }
})

// view cart  id use user
app.get('/api/cart/:id',async(req,res)=>{
    try{
        const cart=await Order.findOne({user: req.params.id,isCart: true}).populate('dishes')
        res.json(cart || {});
    }catch(err){
        res.status(500).json({message: 'Error fetching cart',error: err})
    }
})

// remove dishes (single and multiple)
app.post('/api/cart/remove',async(req,res)=>{
    const {user,dishes}=req.body
    try{
        if(!user || !Array.isArray(dishes)){
            return res.status(400).json({message:'User ID and dishes array are required'})
        }

        const cart=await Order.findOne({user,isCart:true})

        if(!cart){
            return res.status(404).json({message:"Cart not found"})
        }

        cart.dishes=cart.dishes.filter(
            id=>!dishes.includes(id.toString())
        )
        await cart.save();

        res.status(200).json({
            message:'Dishes removed from cart',
            cart: cart
        })
    }catch(err){
        res.status(500).json({
            message: 'Error removing fomr cart'
        })

    }
})



// confirm order place  // id use user
app.post('/api/cart/checkout/:id',async(req,res)=>{
    try{
       const order=await Order.findOne({user:req.params.id,isCart:true});

       if(!order){
        return res.status(404).json({message: 'No cart found'})
       }

       order.isCart=false; // confirm the order
       await order.save();
       
       res.json({message:'Order placed',order})
    }catch(err){
        res.status(500).json({message: 'Checkout failed',error:err})
    }
})

// Onlinepayment
app.post('/api/payment',async(req,res)=>{
    const {orderId, amount}=req.body;
    try{
        const PaymentResponse={
            success:true,
            transactionId:'TXN123456', // DUMMY transaction
            paymentStatus:'PAID'
        }

        // update order with payment status
        await Order.findByIdAndUpdate(orderId,{
            isCart:false,
            totalPrice:amount,
            payment:{ 
                transactionId: PaymentResponse.transactionId,
                status:PaymentResponse.paymentStatus
            }
        })
        res.status(200).json({message :'Payment successfull',...PaymentResponse})
    }catch(err){
        res.status(200).json({message: 'Payment unsuccessfull',error:err})
    }
})



// monthly total order

app.get("/api/order/total-orders",async(req,res)=>{
    try{
        const total=await Order.countDocuments({isCart:true});
        res.json({totalOrders:total})
    }
    catch(err){
        res.status(500).json({error:err.message})

    }
})

// monthly total revenue
app.get("/api/order/monthly-revenue",async(req,res)=>{
    try{
        const currentMonthStart=new Date(new Date().getFullYear(),new Date().getMonth(),1)
        const revenue=await Order.aggregate([
            {
            $match:{
            
                createdAt:{$gte:currentMonthStart},
                payment:"success"
            }
            },
            {
                $group:{
                    _id:null,
                    totalRevenue:{$sum: "$totalPrice"}
                }
            }
        ])
        console.log("revenu : ",revenue)
        res.json({monthlyRevenue: revenue[0]?.totalRevenue || 0})
    }catch(err){
        res.status(500).json({error:err.message})
    }
})

// total items solds
app.get('/api/order/items-solds',async(req,res)=>{
    try{
        const result=await Order.aggregate([
            {
                $match:{
                    isCart:true
                }
            },
            {
                $project:{
                    dishCount:{$size :"$dishes"}
                }
            },
            {
                $group:{
                    _id:null,
                    totalItemsSolds:{$sum:"$dishCount"}
                }
            }
            

        ])
        res.json({totalItemsSolds:result[0]?.totalItemsSolds || 0})

    }catch(err){
        res.status(500).json({error:err.message})
    }
})









const port=7878;
app.listen(port,"0.0.0.0",()=>{
    console.log(`Server running http:localhost://${port}`)
})





/*
{
  "name": "chirag",
  "email": "ciragkumawat@54.com",
  "password": "password123"
}


*/