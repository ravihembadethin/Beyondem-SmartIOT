const express=require('express')
const mongoose=require('mongoose')

const router=express.Router();

const Schema=mongoose.Schema

const testcoll=new Schema({},{strict:false})
const testCollection=mongoose.model('test',testcoll)

router.post('/postman-echo.com/post',async (req,res)=>{
    
    const body={
        name:req.body.name,
        type:req.body.type,
        data:JSON.stringify(req.body.data),
        date:new Date()
    }
      await  testCollection.findOne({deviceID: req.body.deviceID},{names:1},
            (err,response)=>{
                   if(response!=null)
                   {
                    const testdata=new testCollection(body) 
                    x= testCollection.updateOne(
                        { deviceID: req.body.deviceID },
                        { 
                            $push: { types: testdata } ,
                        },
                        async (err, response) => {
                            if (err) {
                                res.status(200).send({ "error": err });
                            }
                            else {
                                if (response.modifiedCount > 0) {
                                    res.status(200).send({ "message": "Data Updated" });
                                }
                            }
                        }
                     )
                   }
                   else {
                    const body={
                    deviceID:req.body.deviceID,
                    types:[{
                        name: req.body.name,
                        type : req.body.type,
                        data : JSON.stringify(req.body.data),
                        date : new Date()
                    }],
                 }    
                 const testdata=new testCollection(body) 
                    testdata.save();
                    res.status(200).send({ "message": "New Device Connected" ,"deviceID":req.body.deviceID});
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
  await testCollection.find({deviceID:Number(req.params.sensorid)}, (err,result)=>{
       if(err) throw err;   
     res.status(200).send(result);
   }).clone().catch(function(err){ console.log(err)})
})

router.get('/sensors/:sensorid',async(req,res)=>{
  
    var startDate= new Date(req.body.startDate);
    var endDate=new Date((req.body.endDate)+ 'T23:59:59');
   
    await testCollection.aggregate([
        {$match: {deviceID:Number(req.params.sensorid)}} ,
        { $project:{
        types:{$filter:{
            input: '$types',
            as: 'type',
            cond: {
                $and:[
                    {$gte: ['$$type.date',startDate]},
                    {$lte: ['$$type.date',endDate]}
                ],
            }
                    }}
                }},
            ],((err,result)=>{
        if(err) throw err;
    res.status(200).send({'data':result})

    }) )

})

router.get('/sensor/:sensorid/:type',async(req,res)=>{
   
   var startDate= new Date(req.body.startDate);
    var endDate=new Date((req.body.endDate)+ 'T23:59:59'); 
  
    await testCollection.aggregate([
        {$match: {deviceID:Number(req.params.sensorid)}} ,
       { $project:{
        types:{$filter:{
            input: '$types',
            as: 'type',
            cond: {
                $and:[
                    {$eq: ['$$type.type', req.params.type]},
                    {$gte: ['$$type.date',startDate]},
                    {$lte: ['$$type.date',endDate]}
                ],
                }
                 }}
                }},
            ],((err,result)=>{
        if(err) throw err;
     
        res.status(200).send({'data':result})

    }) )
})

module.exports = router;