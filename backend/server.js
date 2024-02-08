'use strict';

const fs = require('node:fs');
const http = require('node:http');
const WebSocket = require('ws');

const PORT = 3001;

const index = fs.readFileSync('../frontend/index.html', 'utf-8');

const css = fs.readFileSync('../frontend/calculate.css', 'utf-8');

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.write(`<style>${css}</style>`);
  res.end(index);
});

server.listen(PORT, () => {
  console.log(`Server is run: http://localhost:${PORT}`);
});

const ws = new WebSocket.Server({ server });

ws.on('connection', (connection, req) => {
  const id = req.socket.remoteAddress;
  console.log(`Connected: ${id}`);
  connection.on('message', (message) => {
    console.log(`Send message: ${message}`);
    for (const client of ws.clients) {
      if (client.readyState !== WebSocket.OPEN) continue;
      if (connection === client) continue;
      client.send(message, { binary: false });
    }
  });
  connection.on('close', () => {
    console.log(`Disconnect: ${id}`);
  });
});
