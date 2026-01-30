const app=require('./app');
const connectDatabase=require('./config/database');

connectDatabase();

const server=app.listen(process.env.PORT,()=>{
    console.log(`My Server listening to the port: ${process.env.PORT}`);
    
})

process.on('unhandledRejection',(err)=>{
    console.log(`Error : ${err.message}`);
    console.log('Shutting down the server due to unhandledRejection Error');
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

