const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const path = require("path");
const dotenv=require('dotenv');

dotenv.config({path:path.join(__dirname,"config/config.env")});
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const accountRoutes = require("./routes/account");
const transactionRoutes = require("./routes/transaction");

app.use("/api/v1/account", accountRoutes);
app.use("/api/v1/transaction", transactionRoutes);

module.exports = app;
