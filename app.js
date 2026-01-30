const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const path = require("path");
const dotenv=require('dotenv');

dotenv.config({path:path.join(__dirname,"config/config.env")});
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

module.exports = app;
