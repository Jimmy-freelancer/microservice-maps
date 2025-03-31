const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const cookieParser = require('cookie-parser');  
const mapsRoutes = require('./routes/maps.route');
const cors = require('cors');

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/test', (req, res) => {
    res.send('Hello from maps service');
});

app.use('/', mapsRoutes);

module.exports = app;