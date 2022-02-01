const host = process.env.HOST || 'localhost';
const port = process.env.PORT || '8080';

const cors_proxy = require('cors-anywhere');
cors_proxy.createServer({
    originWhitelist: [],
    requireHeader: ['origin', 'x-requested-with'],
    removeHeaders: ['cookie', 'cookie2']
}).listen(port, host, function () {
    console.log(`Running CORS Anywhere on ${host}:${port}`);
});
