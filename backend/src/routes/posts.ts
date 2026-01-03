import { Router } from "express";
import multer from "multer";
import pool from "../db";

const router = Router();

// Temp storage
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { description, latitude, longitude } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({ error: "Image file is required" });
    }

    await pool.query(
      `INSERT INTO posts (image_url, description, latitude, longitude) VALUES ($1, $2, $3, $4)`,
      [imageFile.filename, description, latitude, longitude]
    );
    res.status(201).json({ message: "Post created successfully" });
  } catch (error) {
    console.error("Error handling post request:", error);
  }
});

export default router;
