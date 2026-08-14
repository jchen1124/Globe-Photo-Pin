import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redisClient } from "../redis";

const createRedisStore = (prefix: string) => 
  new RedisStore({
    prefix,
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  });

// 50 Requests per minute for geocoding requests
export const geocodeRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 50,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
    error: "Too many geocoding requests. Please try again soon.",
    },
    store: createRedisStore("rate-limit:geocode:"),
});

// 10 Requests per hour for upload requests
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Too many uploads. Please try again later.",
  },
  store: createRedisStore("rate-limit:uploads:"),
});

