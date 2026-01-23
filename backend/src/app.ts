import express from "express";
import cors from "cors";
import postsRoutes from "./routes/posts";
import geocodeRoutes from "./routes/geocode";

const app = express();

app.use(cors());
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