import Piscina from 'piscina';
import fs from 'fs';

import instruments from "../instruments.js"


// creating a thread pool for the mock data generator
const piscina = new Piscina({
    filename: './mockgenerator.js',
    minThreads: 2,
    idleTimeout: 100,
})

/**
 * generates mock data by delegating the task to the Piscina thread pool
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const generateData = (req, res) => {

    const start = new Date().getTime();

    let { interval, totalRecords } = req.query;

    res.type('text/html')

    if (interval !== "hourly" && interval !== "daily") {
        return void res.status(400).send("Invalid interval given. Mock data generation interval can be hourly or daily")
    }

    if (!totalRecords || isNaN(Number(totalRecords)))
        totalRecords = 5000;


    piscina.run({ interval, totalRecords }).then(({ err, success }) => {
        if (err) global.socket.emit("mock-data", { err, success })
        else {
            console.log(`Got task from worker success:${success}. Time taken is ${new Date().getTime() - start} ms for ${totalRecords} records`)
            if (global.socket) {
                console.log("emitting task status to connected socket")
                global.socket.emit("mock-data", { err, success })
            }
        }
    })

    console.log("New worker initialised")

    return void res.status(200).send("Data Generation Started")
}

/**
 * gets all the instruments available
 * @param {*} req 
 * @param {*} res 
 */
const getInstruments = (req, res) => {
    res.type('json');
    res.status(200).send(instruments)
}

/**
 * fetches stock details
 * @param {} req 
 * @param {*} res 
 * @returns 
 */
const getInstrumentDetails = (req, res) => {
    const { symbol, interval } = req.query;
    res.type('json');
    if (interval !== "hourly" && interval !== "daily") {
        return void res.status(400).send({ status: "failure", data: "Invalid interval given. Mock data generation interval can be hourly or daily" })
    }
    if (!instruments.includes(symbol)) {
        return void res.status(400).send({ status: "failure", data: "Invalid symbol given." })
    }

    // creating a stream from the file and piping the file to the response object
    const fileReadStream = fs.createReadStream(`./stockData/${symbol + interval}.json`);
    fileReadStream.on('error', err => {
        return void res.status(404).send({ status: "failure", data: err.message })

    })
    fileReadStream.pipe(res);
}

export default {
    generateData, getInstruments, getInstrumentDetails
}