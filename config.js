const mongoose=require('mongoose')
//const connect=mongoose.connect("mongodb://localhost:27017/UserReg")

const connect = mongoose.connect("mongodb+srv://chiragk:Chirag%40123@cluster0.mgrdtrh.mongodb.net/");




connect.then(()=>{
    console.log("Database connect Successfully")
})
.catch(()=>{
    console.log("Database can't connect")
})

//mongodb+srv://chiragk:Chirag@123@cluster0.mgrdtrh.mongodb.net/