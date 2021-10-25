const express=require('express')
const mongoose=require('mongoose')

const router=express.Router();

const Schema=mongoose.Schema

const testcoll=new Schema({},{strict:false})
const testCollection=mongoose.model('test',testcoll)

router.post('/postman-echo.com/post',async (req,res)=>{

    const body={...req.body}
    body.date=new Date();

    await  testCollection.findOne({name: req.body.name},
        (err,response)=>{
                if(response!=null)
                {
                console.log(' found')
                body.deviceID=response.deviceID;

                const testdata=new testCollection(body) 
                testdata.save();
                res.status(200).send({ "message": "Data Updated" });
                }
                else {
                if (body.deviceID ==null){
                    body.deviceID = generateRandomId();
                }
                const testdata=new testCollection(body) 
                testdata.save();
                res.status(200).send({ "message": "New Device Connected" ,"deviceID":body.deviceID});
                }    
        }).clone().catch(function(err){ console.log(err)})
})


router.get('/sensor',async(req,res)=>{

   await testCollection.find({},((err,result)=>
   {
        if(err) throw err;
        res.status(200).send({'data':result})
   }) ).clone().catch(function(err){ console.log(err)})
})

router.get('/sensor/:sensorid',async(req,res)=>{
    if(isNaN(req.params.sensorid)){
        await testCollection.find({name:req.params.sensorid}, (err,result)=>{
            if(err) throw err;   
          res.status(200).send(result);
        }).clone().catch(function(err){ console.log(err)})
    }
    else{
        await testCollection.find({deviceID:Number(req.params.sensorid)}, (err,result)=>{
            if(err) throw err;   
          res.status(200).send(result);
        }).clone().catch(function(err){ console.log(err)})
    }
  
})

router.get('/sensors/:sensorid',async(req,res)=>{
    var startDate= new Date(req.body.startDate);
    var endDate=new Date((req.body.endDate)+ 'T23:59:59');

    if(isNaN(req.params.sensorid)){
        await testCollection.find({name:req.params.sensorid,date: { $lte: endDate , $gte:startDate }}, (err,result)=>{
            if(err) throw err;   
            res.status(200).send(result);
        }).clone().catch(function(err){ console.log(err)})
    }
    else{
        await testCollection.find({deviceID:Number(req.params.sensorid) ,date: { $lte: endDate , $gte:startDate }}, (err,result)=>{
            if(err) throw err;   
            res.status(200).send(result);
        }).clone().catch(function(err){ console.log(err)})
    }
  
})

router.get('/sensor/:sensorid/:type',async(req,res)=>{
   
   var startDate= new Date(req.body.startDate);
    var endDate=new Date((req.body.endDate)+ 'T23:59:59'); 
  
    if(isNaN(req.params.sensorid)){
        await testCollection.find({name:req.params.sensorid,type:req.params.type ,date: { $lte: endDate , $gte:startDate }}, (err,result)=>{
            if(err) throw err;   
            res.status(200).send(result);
        }).clone().catch(function(err){ console.log(err)})
    }
    else
    {
        await testCollection.find({deviceID:Number(req.params.sensorid),type:req.params.type ,date: { $lte: endDate , $gte:startDate }}, (err,result)=>{
            if(err) throw err;   
            res.status(200).send(result);
        }).clone().catch(function(err){ console.log(err)})
    }
})

function generateRandomId(){
 return Math.floor(1000 + Math.random() * 9000);
}

module.exports = router;