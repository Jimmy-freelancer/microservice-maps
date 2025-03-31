const http = require('http');
const app = require('./app');
const dotenv = require('dotenv');

dotenv.config();

const port = process.env.MAPs_PORT || 3004;
const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Maps Server is running on port ${port}`);
});