'use strict';

// создать одностраничное приложение с навигацией по влкадкам
// возможность обновлять файлы не перезагружая сервер

const fs = require('node:fs');
const http = require('node:http');
const WebSocket = require('ws');
const path = require('node:path');

const PORT = 3000;

const STATIC_PATH = path.join(process.cwd(), './static');

const MIME_TYPE = {
  html: 'text/html; charset=UTF-8',
  js: 'application/javascript; charset=UTF-8',
  css: 'text/css',
  ico: 'image/x-icon',
  png: 'image/png',
  jpg: 'image/jpeg',
  default: 'text/plain',
};

const serveFile = (name) => {
  const filePath = path.join(STATIC_PATH, name);
  if (!filePath.startsWith(STATIC_PATH)) {
    console.log(`file path ${name} is not valid`);
    return null;
  }
  const stream = fs.createReadStream(filePath);
  return stream;
};

const server = http.createServer((req, res) => {
  const { url } = req;
  let name = url === '/' ? 'index.html' : url;
  const filePath = path.join(STATIC_PATH, name);
  let statusCode = 200;
  if (!fs.existsSync(filePath)) {
    name = '404.html';
    statusCode = 404;
  }
  const ext = path.extname(name).substring(1);
  const mimeType = MIME_TYPE[ext] || MIME_TYPE.default;
  res.writeHead(statusCode, { 'Content-Type': mimeType });
  const stream = serveFile(name);
  if (stream) {
    stream.pipe(res);
  }
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
