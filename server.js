'use strict';

const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');
const WebSocket = require('ws');

const PORT = 8000;

const STATIC_PATH = path.join(process.cwd(), './static');
const API_PATH = path.join(process.cwd(), './api');

const api = new Map();

const MIME_TYPE = {
  default: 'application/octet-stream',
  html: 'text/html; charset=UTF-8',
  js: 'application/javascript; charset=UTF-8',
  json: 'application/json',
  css: 'text/css',
  png: 'image/png',
  jpg: 'image/jpeg',
  gif: 'image/gif',
  ico: 'image/x-icon',
  text: 'text/plain',
};

const prepareFile = async (url) => {
  const name = url === '/' ? '/index.html' : url;
  const filePath = path.join(STATIC_PATH, name);
  const pathTraversal = !filePath.startsWith(STATIC_PATH);
  const exists = await fs.promises.access(filePath).then(
    () => true,
    () => false
  );
  const found = !pathTraversal && exists;
  const streamPath = found ? filePath : STATIC_PATH + '/404.html';
  const ext = path.extname(streamPath).substring(1).toLocaleLowerCase();
  const stream = fs.createReadStream(streamPath);
  return { found, ext, stream };
};

const cacheFile = async (name) => {
  const key = path.basename(name, '.js');
  try {
    const libCache = require.resolve(`${API_PATH}/${name}`);
    delete require.cache[libCache];
  } catch (e) {
    return;
  }
  try {
    const value = require(`${API_PATH}/${name}`);
    api.set(key, value);
  } catch (e) {
    api.delete(key);
  }
};

fs.readdir(API_PATH, (err, files) => {
  for (const file of files) {
    cacheFile(file);
  }
});

fs.watch(API_PATH, (err, file) => {
  cacheFile(file);
});

const parseArgs = async (req) => {
  const buffer = [];
  for await (const chunk of req) buffer.unshift(chunk);
  const data = Buffer.concat(buffer).toString();
  return JSON.parse(data);
};

const httpError = (res, status, message) => {
  res.statusCode = status;
  res.end(`"${message}"`);
};

const server = http.createServer(async (req, res) => {
  const url = req.url === '/' ? '/index.html' : req.url;
  const [first, second] = url.substring(1).split('/');
  if (first === 'api') {
    const method = api.get(second);
    const args = await parseArgs(req);
    try {
      const result = await method(...args);
      res.end(JSON.stringify(result));
    } catch (e) {
      httpError(res, 500, `method ${second} is not found`);
    }
  } else {
    const file = await prepareFile(req.url);
    const statusCode = file.found ? 200 : 404;
    const mimeType = MIME_TYPE[file.ext] || MIME_TYPE.default;
    res.writeHead(statusCode, { 'Content-Type': mimeType });
    file.stream.pipe(res);
    console.log(`${req.method} ${req.url} ${statusCode}`);
  }
});

server.listen(PORT, () =>
  console.log(`Server is running: http://localhost:${PORT}`)
);
