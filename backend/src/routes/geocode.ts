import axios from "axios";
import { Router } from "express";
import dotenv from "dotenv";
import { redisClient } from "../redis";
import { geocodeRateLimiter } from "../middleware/rateLimit";

dotenv.config();

const router = Router();

router.get("/", geocodeRateLimiter, async (req, res) => {
    console.log("Geocode requester IP:", req.ip);
    console.log("Geocode rate limit info:", (req as any).rateLimit);
  const start = Date.now();

  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res
      .status(400)
      .json({ error: "Latitude and longitude are required" });
  }
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res
      .status(400)
      .json({ error: "Latitude and longitude must be valid numbers" });
  }

  const cacheKey = `geocode:v1:${lat.toFixed(5)}:${lng.toFixed(5)}`;
  try {
    // const response = await fetch(url);
    // const data = await response.json();
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit took ${Date.now() - start}ms`);
      console.log("Cache hit for geocode data", cachedData);
      return res.json(JSON.parse(cachedData));
    }

    console.log("Cache miss for geocode data, fetching from Mapbox API");
    const MAPBOX_TOKEN = process.env.VITE_MAPBOX_TOKEN;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`;

    const response = await axios.get(url);
    const place = response.data.features[0]?.place_name || "Unknown location";
    console.log("Geocode response:", place);
    await redisClient.set(cacheKey, JSON.stringify({ address: place }), {
      EX: 60 * 5,
    });
    console.log(`Cache miss took ${Date.now() - start}ms`);
    return res.json({ address: place });
  } catch (error) {
    console.error("Error fetching geocode data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
