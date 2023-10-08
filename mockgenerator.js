import fs from 'fs';
import instruments from "./instruments.js"
import { parentPort, workerData } from "worker_threads";

const { interval, totalRecords } = workerData;

console.log(`Got request in worker to generate new data having ${totalRecords} records with ${interval} interval.`)

function getRandomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

// Function to generate mock stock market data for a single instrument
function generateStockData(symbol, workerData) {

    const startDate = new Date("2018-10-19").getTime();
    const data = [];

    const incrementFactor = interval === 'daily' ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000;

    for (let i = 0; i < totalRecords; i++) {
        const currentDate = new Date(startDate + i * incrementFactor);
        const open = getRandomInRange(100, 200).toFixed(2);
        const high = (parseFloat(open) + getRandomInRange(0, 10)).toFixed(2);
        const low = (parseFloat(open) - getRandomInRange(0, 10)).toFixed(2);
        const close = getRandomInRange(parseFloat(low), parseFloat(high)).toFixed(2);
        const volume = Math.floor(getRandomInRange(100000, 1000000));

        data.push({
            time: interval === 'daily' ? currentDate.toISOString().split('T')[0] : currentDate.toISOString(),
            open: parseFloat(open),
            high: parseFloat(high),
            low: parseFloat(low),
            close: parseFloat(close),
            volume: volume,
        });
    }

    return data;
}



// Function to generate mock stock market data for multiple instruments
function generateMarketData(workerData) {
    let marketData = {};

    console.log(`Generating ${workerData.interval} mock data consisting of ${workerData.totalRecords} records`);
    instruments.forEach((symbol) => {
        marketData = generateStockData(symbol, workerData);
        fs.writeFileSync(`./stockData/${symbol}${workerData.interval}.json`, JSON.stringify(marketData))
    });

    return marketData;
}

// generate data
try {
    generateMarketData(workerData);
    console.log(`This worker has successfully generated ${totalRecords} datapoints of mock data having ${interval} interval`)
    parentPort.postMessage("Data generation done")
}
catch (e) {
    console.log(e)
    parentPort.postMessage(`Error in data generation ${e.message}`)
}


