import Redis from "ioredis";

const redisClientSingleton = () => {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    // console.log("Initializing Redis client with URL:", redisUrl);

    const client = new Redis(redisUrl, {
        maxRetriesPerRequest: 3, 
        connectTimeout: 5000,    
    });

    client.on("error", (err) => {
        // console.error('\x1b[31m%s\x1b[0m', `--- [REDIS STATUS] ERROR: ${err.message} ---`);
    });

    client.on("connect", () => {
        // console.log('\x1b[32m%s\x1b[0m', '--- [REDIS STATUS] Redis connected successfully ---');
    });

    return client;
};

declare global {
    var redis: undefined | ReturnType<typeof redisClientSingleton>;
}

const redis = globalThis.redis ?? redisClientSingleton();

export default redis;

if (process.env.NODE_ENV !== "production") globalThis.redis = redis;
