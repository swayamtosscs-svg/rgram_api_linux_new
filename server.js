const http = require('http');
const next = require('next');

const port = 3000; // Public HTTP port
const hostname = '0.0.0.0'; // Bind to all interfaces for public access

const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  http.createServer((req, res) => {
    handle(req, res);
  }).listen(port, hostname, () => {
    console.log(`✅ Server ready at http://13.61.190.133`);
  });
});