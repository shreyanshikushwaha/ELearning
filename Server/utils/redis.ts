import { Redis } from "ioredis";
require('dotenv').config();

const redisClient = () =>{
    if(process.env.REDIS_URL){
        console.log('REDIS CONNECTED')
        return process.env.REDIS_URL;
    }
    throw new Error ('REDIS not CONNECTED')
}

// export const redis = new Redis()
export const redisClient()