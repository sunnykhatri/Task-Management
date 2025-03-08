const e = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const ConnectionURL = process.env.CONNECTION_URL;
mongoose.connect(ConnectionURL).then(() => {
    console.log('Connected to the database..');
})
.catch(
    (error) => {
        console.log("Error : " + error);
    }
);