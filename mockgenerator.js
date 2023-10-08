import fs from 'fs'
import { parentPort, workerData } from "worker_threads"

console.log("Got request in worker to generate new data. Interval is ", workerData.interval)

function getRandomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

// Function to generate mock stock market data for a single instrument
function generateStockData(symbol, interval) {
    const startDate = new Date("2018-10-19").getTime();
    const data = [];

    const incrementFactor = interval === 'daily' ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000;

    for (let i = 0; i < 5000; i++) {
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

const instruments = ['AAPL', 'GOOGL', 'AMZN', 'MSFT', 'TSLA', 'FB', 'NVDA', 'NFLX', 'BRK', 'V'];


// Function to generate mock stock market data for multiple instruments
function generateMarketData(interval) {
    let marketData = {};

    instruments.forEach((symbol) => {
        marketData = generateStockData(symbol, interval);
        fs.writeFileSync(`${symbol}${interval}.json`, JSON.stringify(marketData))
    });

    return marketData;
}

// generate data
try {
    generateMarketData(workerData.interval);
    console.log("This worker has successfully generated mock data for interval", workerData.interval)
    parentPort.postMessage("Data generation done")
}
catch (e) {
    parentPort.postMessage(`Error in data generation ${e.message}`)
}


