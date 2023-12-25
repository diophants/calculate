const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const application = express();
const server = http.createServer(application);
const ws = new WebSocket.Server({ server });

application.use('./frontend/static', express.static(path.join(__dirname, 'public')));

const calculatorRouter = require('./modules/calculator');
// const currencyConverterRouter = require('./modules/currency-converter');
// const stockMarketRouter = require('./modules/stock-market');

application.use('/calculator', calculatorRouter);
// application.use('/currency-converter', currencyConverterRouter);
// application.use('/stock-market', stockMarketRouter);

ws.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {});
})

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server os listening on port ${PORT}`);
})