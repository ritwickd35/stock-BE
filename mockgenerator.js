import fs from 'fs';
import instruments from "./instruments.js"


function getRandomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

// Function to generate mock stock market data for a single instrument
function generateStockData(interval, totalRecords) {

    const startDate = new Date("2018-10-19").getTime();
    const data = [];

    const incrementFactor = interval === 'daily' ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000;

    for (let i = 0; i < totalRecords; i++) {
        const currentDate = new Date(startDate + i * incrementFactor);
        const open = i == 0 ? Math.random() * Math.random() * 1000 : data[i - 1]["close"];
        const high = (parseFloat(open) + getRandomInRange(0, Math.random() * 11)).toFixed(2);
        const low = (parseFloat(open) - getRandomInRange(0, Math.random() * 11)).toFixed(2);
        const close = getRandomInRange(parseFloat(low), parseFloat(high)).toFixed(2);
        const volume = Math.floor(getRandomInRange(100000, 1000000));

        data.push({
            time: interval === 'daily' ? currentDate.toISOString().split('T')[0] : Math.floor(currentDate.getTime() / 1000),
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
function generateMarketData(interval, totalRecords) {
    let marketData = {};

    console.log(`Generating ${interval} mock data consisting of ${totalRecords} records`);
    instruments.forEach((symbol) => {
        marketData = generateStockData(interval, totalRecords);
        fs.writeFile(`./stockData/${symbol}${interval}.json`, JSON.stringify(marketData), err => {
            if (err) {
                console.error("Error in worker", err)
                parentPort.postMessage(`Error in data generation ${err.message}`)
            }
        })
    });

    return marketData;
}

// exporting function for piscina to run
export default ({ interval, totalRecords }) => {
    console.log(`Got request in worker to generate new data having ${totalRecords} records with ${interval} interval.`)

    try {
        generateMarketData(interval, totalRecords);
        console.log(`This worker has successfully generated ${totalRecords} datapoints of mock data having ${interval} interval`)
        return { err: null, success: true }
    }
    catch (e) {
        console.log(e)
        return { err: e, success: false }
    }
}

