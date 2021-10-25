const axios = require('axios');
const faker = require('faker');

const ingestEndpoint = "http://localhost:3000/postman-echo.com/post";

//Test motor names are randomly picked, each one then sends random data types from all the current available ones.

const sensorNames = ["Motor-1", "Motor-2", "Motor-3", "Motor-4"];
const sensorId=[1122,3344,4455,6677,8899];

function getTempData() {
    var tempData = {
        name: faker.random.arrayElement(sensorNames),
        deviceID: null,
        type: "TEMP",
        data: {
            battery: faker.datatype.float({
                'min': 0,
                'max': 10
            }),
            temp1: faker.datatype.float({
                'min': 1,
                'max': 200
            }),
            temp2: faker.datatype.float({
                'min': 1,
                'max': 200
            }),
            temp3: faker.datatype.float({
                'min': 1,
                'max': 200
            })
        }
    };
    //Temp sensors wont always have 3 temperatures, but generally the same device will always have the same total count. (A sensor with 3 temp readings shouldnt start sending just 1)
    return tempData;
}


function getAccelData() {
    const accelData = {
        name: faker.random.arrayElement(sensorNames),
        deviceID: null,
        type: "ACCEL",
        data: {
            rms1: faker.datatype.float({
                'min': 0,
                'max': 10
            }),
            rms2: faker.datatype.float({
                'min': 0,
                'max': 10
            }),
            rms3: faker.datatype.float({
                'min': 0,
                'max': 10
            }),
            version: 32.75,
            battery: faker.datatype.float({
                'min': 0,
                'max': 10
            }),
        }
    };
    return accelData;
}

function toxy(rate, channel) {
    return channel.map((y, i) => ({
        x: i / rate,
        y: y
    }))
}



function getVibData() {
   
    var vibrationData = {
        name: faker.random.arrayElement(sensorNames),
        deviceID: null,
        type: "VIB",
        sample_rate: 25600,
        data: {
            channel1: {
                x: [],
                y: []
            },
            channel2: {
                x: [],
                y: []
            },
            version: 15,
            battery: faker.datatype.float({
                'min': 0,
                'max': 10
            }),
        }
    };

    vibrationData.data.channel1 = generateVibChannel(vibrationData.sample_rate);
    vibrationData.data.channel2 = generateVibChannel(vibrationData.sample_rate);
    return vibrationData;
}


function generateVibChannel(sampleRate) {
    var channel = {
        x: [],
        y: []
    };
    var channelData = toxy(sampleRate, getRandomVibData(1024));
    channel.x = channelData.map(function(loc) {
        return loc.x;
    });
    channel.y = channelData.map(function(loc) {
        return loc.y;
    });
    return channel;
}

function getRandomVibData(numPoints) {
    return Array.from({
        length: numPoints
    }, () => Math.ceil(Math.random() * 10000) * (Math.round(Math.random()) ? 1 : -1))
}

async function sendPost(data) {
    const resp = await axios.post(ingestEndpoint, data)
    .then(function (response) {
        console.log(response.data);
        })
        .catch(function (error) {
        console.log(error);
        });
}

async function sendRandom() {
    console.log("Sending Random Data...");
    const dataFuncts = [getTempData, getAccelData, getVibData];
    var data = faker.random.arrayElement(dataFuncts)();
    await sendPost(data);
}

async function run() {
    console.log("Datasim Running...");
    await sendRandom();
    await setInterval(sendRandom, 5000);
}


run();