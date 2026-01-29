const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const connectDatabase = () => {
  mongoose
    .connect(process.env.DB_LOCAL_URI)
    .then((con) => {
      console.log(`MongoDB is Connected to the host: ${con.connection.host}`);
    })
    
};

connectDatabase();

const server=app.listen(process.env.PORT,()=>{
    console.log(`My Server listening to the port: ${process.env.PORT}`);
    
})

process.on('unhandledRejection',(err)=>{
    console.log(`Error : ${err.message}`);
    console.log('Shutting down the server due to unhandlerejection Error');
    server.close(()=>{
        process.exit(1)
    })
    
}) 

process.on('uncaughtException',(err)=>{
    console.log(`Error : ${err.message}`);
    console.log('Shutting down the server due to uncaughtException Error');
    server.close(()=>{
        process.exit(1)
    })
})

