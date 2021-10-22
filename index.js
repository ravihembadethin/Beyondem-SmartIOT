const express=require('express');
const mongoose=require('mongoose');
// const bodyparser = require('body-parser');
const app=express();

const routes=require('./route/routes')

const PORT=3000
const  MONGO="mongodb://localhost:27017/test";

// app.use(bodyparser.json());
app.use(express.json());
app.use(express.urlencoded());

app.use('/',routes)

app.use('*',(req,res)=>{
    res.status(404).send({'error':'page not found !'})
})


mongoose.connect(MONGO,(error)=>{
    if(error){
        console.log('connection error in DB')
    }
    else{
        console.log('Successfully Connected to Database')
    }
})



app.listen(PORT,(err)=>{
    if (err) throw err;
    console.log(`server is running on port: ${PORT}`)
})
