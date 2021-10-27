const express=require('express');
const { database } = require('faker');
const mongoose=require('mongoose')

const router=express.Router();

const Schema=mongoose.Schema
const sensorSchema=new Schema({},{strict:false,versionKey: false})
const sensorcollection=mongoose.model('sensor',sensorSchema)
const sensordatacollection=mongoose.model('sensorData',sensorSchema)

router.post('/postman-echo.com/post',async (req,res)=>{

    await  sensorcollection.findOne({name: req.body.name},
            (err,response)=>{
                if(response!=null){
                    console.log('responce',response);
                    if(response.type.indexOf(req.body.type) == -1)
                    {
                    sensorcollection.updateOne(
                            { name: response.name },
                            { 
                                $push: { type: req.body.type }
                            },
                            async (err, response) => {
                            if(err) res.status(404).send({ "error": err });
                            }
                        )
                    }
                    
                    storedata(response.deviceID,req.body);
                    res.status(200).send({ "message": "Data Updated" });
                
                }
                else{
                    sensor={
                        deviceID:req.body.deviceID==null || req.body.deviceID=='' ?generateRandomId():Number(req.body.deviceID),
                        name:req.body.name,
                        type:[req.body.type]
                    }
                    new sensorcollection(sensor).save();
                    storedata(sensor.deviceID,req.body);
                    res.status(200).send({ "message": "New Sensor Data Added" , deviceID: sensor.deviceID});

                }
        }).clone().catch(function(err){ console.log(err)})
})


router.get('/sensor',async(req,res)=>{
   await sensordatacollection.find({},{ _id: 0 ,Date:0},((err,result)=>
   {
        if(err) throw err;
        res.status(200).send(result)
   }) ).clone().catch(function(err){ console.log(err)})
})

router.get('/sensor/:sensorid',async(req,res)=>{
   await sensordatacollection.find({deviceID:Number(req.params.sensorid)},{ _id: 0 ,Date:0,deviceID:0}, (err,result)=>{
            if(err) throw err;
            if(result.length>0)   
          res.status(200).send(result);
        }).clone().catch(function(err){ console.log(err)})
})

router.get('/sensors/:sensorid',async(req,res)=>{
    var startDate= new Date(req.body.startDate);
    var endDate=new Date((req.body.endDate)+ 'T23:59:59');
    await sensordatacollection.find({deviceID:Number(req.params.sensorid) ,Date: { $lte: endDate , $gte:startDate }},{ _id: 0 ,Date:0,deviceID:0}, (err,result)=>{
        if(err) throw err;
        res.status(200).send(result);
    }).clone().catch(function(err){ console.log(err)})
  
}) 
router.get('/sensor/:sensorid/:type',async(req,res)=>{
   
   var startDate= new Date(req.body.startDate);
    var endDate=new Date((req.body.endDate)+ 'T23:59:59'); 
        await sensordatacollection.find({deviceID:Number(req.params.sensorid),type:req.params.type ,Date:{$lte: endDate , $gte:startDate }},{ _id: 0 ,Date:0,deviceID:0,type:0}, (err,result)=>{
            if(err) throw err; 
            const data=[];
              result.forEach(element => {
                  var d=JSON.stringify(element)
                  var x=JSON.parse(d)
                  data.push(x.data)
              });
            res.status(200).send(data);
        }).clone().catch(function(err){ console.log(err)})
})

function generateRandomId(){
 return Math.floor(1000 + Math.random() * 9000);
}

async function storedata(ID,req){
    const {name, ...filteredObject} = req;
    filteredObject.Date=new Date();
    filteredObject.deviceID=ID;
   await new sensordatacollection(filteredObject).save()
}
module.exports = router;