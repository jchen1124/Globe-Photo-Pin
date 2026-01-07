import express from "express";
import cors from "cors";
import postsRoutes from "./routes/posts";
import geocodeRoutes from "./routes/geocode";

const app = express();

app.use(cors());
app.use(express.json());
console.log("app.ts called")
// Serve uploaded images
app.use("/uploads", express.static("uploads"));
app.use("/posts", postsRoutes);
app.use("/geocode", geocodeRoutes);

export default app;