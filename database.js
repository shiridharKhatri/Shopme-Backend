const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path:"./config.env"});
const dbURL = process.env.DATABASE;
const connectToServer = ()=>{
    mongoose.connect(dbURL).then(()=>{
        console.log("Connected to database");
    }).catch((error)=>{
        console.log(`Failed to connect with a database ${error.message}`)
    })
}
module.exports = connectToServer;