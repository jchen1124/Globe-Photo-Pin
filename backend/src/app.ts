import express from "express";
import cors from "cors";
import postsRoutes from "./routes/posts";
import geocodeRoutes from "./routes/geocode";

const app = express();
const allowedOrigins = [
  "https://mygeogallery.com",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const isLocalViteOrigin = /^http:\/\/localhost:\d+$/.test(origin);
      const isAllowedOrigin = allowedOrigins.includes(origin);

      if (isLocalViteOrigin || isAllowedOrigin) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
); //allows different servers to communicate with each other
app.use(express.json());
// NO LONGER NEEDED AS WE ARE USING SUPABASE STORAGE
// Serve uploaded images with proper headers
// app.use("/uploads", express.static("uploads", {
//   setHeaders: (res, path) => {
//     res.set("Content-Type", "image/jpeg");
//     res.set("Content-Disposition", "inline");
//   }
// }));
app.use("/api/posts", postsRoutes);
app.use("/geocode", geocodeRoutes);

export default app;
