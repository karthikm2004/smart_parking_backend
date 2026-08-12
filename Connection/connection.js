const mongoose=require('mongoose')

mongoose.connect(process.env.CONNECTION_STRING).then((res)=>{
    console.log("Server Connected to MongoDb");
    
}).catch((error)=>{
    console.log(error);
    
})