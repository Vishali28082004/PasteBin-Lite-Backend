import mongoose from "mongoose";
import config from "../config/index.js";

let connectionCounter = 0;

export default function connectDatabase (callback){
    mongoose.connect(`${config.MONGO_URL}`)
    .then(()=>{
        console.log('Database Connected successfully');
        return callback(true)
    })

    .catch((err)=>{
        console.log('err: ', err);
        
    })
}