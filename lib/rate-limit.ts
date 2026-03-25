import redis from "./redis";

/**
 * Rate limiting logic using Redis
 * @param identifier A unique string to identify the client (e.g., email, IP)
 * @param limit Maximum number of attempts
 * @param duration Duration in seconds for the window
 * @returns Object containing whether the request is allowed and the remaining attempts
 */
export async function rateLimit(
    identifier: string,
    limit: number = 5,
    duration: number = 60
) {
    const key = `rate_limit:login:${identifier}`;

    try {
        const current = await redis.get(key);
        const count = current ? parseInt(current) : 0;

        if (count >= limit) {
            const ttl = await redis.ttl(key);
            return {
                allowed: false,
                remaining: 0,
                retryAfter: ttl > 0 ? ttl : duration,
            };
        }

        const multi = redis.multi();
        multi.incr(key);
        if (!current) {
            multi.expire(key, duration);
        }

        await multi.exec();

        return {
            allowed: true,
            remaining: limit - (count + 1),
            retryAfter: 0,
        };
    } catch (error) {
        console.error("Redis rate limit error:", error);
        // On Redis error, allow the request to prevent locking out users if Redis is down
        return {
            allowed: true,
            remaining: 1,
            retryAfter: 0,
        };
    }
}

/**
 * Reset rate limit for a specific identifier
 * Useful after a successful login
 */
export async function resetRateLimit(identifier: string) {
    const key = `rate_limit:login:${identifier}`;
    await redis.del(key);
}
