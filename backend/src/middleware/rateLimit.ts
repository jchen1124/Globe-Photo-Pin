import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redisClient } from "../redis";

const createRedisStore = (prefix: string) => 
  new RedisStore({
    prefix,
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  });

  export const geocodeRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Too many geocoding requests. Please try again soon.",
  },
  store: createRedisStore("rate-limit:geocode:"),
});


