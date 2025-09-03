const http = require('http');
const next = require('next');

const port = 4000;
const hostname = '0.0.0.0'; // All interfaces pe bind hoga (server accessible from anywhere)

const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  http.createServer((req, res) => {
    handle(req, res);
  }).listen(port, hostname, () => {
    console.log(`✅ Server ready at http://103.14.120.163:${port}`);
  });
});