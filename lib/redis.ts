import Redis from "ioredis";

const redisClientSingleton = () => {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    console.log("Initializing Redis client with URL:", redisUrl);

    const client = new Redis(redisUrl, {
        maxRetriesPerRequest: 3, // Limited retries to avoid hanging
        connectTimeout: 5000,    // 5 seconds timeout
    });

    client.on("error", (err) => {
        console.error("Redis Client Error:", err);
    });

    client.on("connect", () => {
        console.log("Redis Client Connected");
    });

    return client;
};

declare global {
    var redis: undefined | ReturnType<typeof redisClientSingleton>;
}

const redis = globalThis.redis ?? redisClientSingleton();

export default redis;

if (process.env.NODE_ENV !== "production") globalThis.redis = redis;
