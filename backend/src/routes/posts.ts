import { Router } from "express";
import multer from "multer";
import pool from "../db";

const router = Router();

// Temp storage
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { description, latitude, longitude } = req.body; // other form fields
    const imageFile = req.file; // multer put the image file info here

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

// Get all posts from the database
router.get("/", async (req, res) => {
    try{
        const result = await pool.query("SELECT * FROM posts ORDER BY created_at DESC");
        res.json(result.rows)
    }catch(error){
        console.error("Error fetching posts:", error);
        res.status(500).json({ error: "Internal server error" });
    }
})

export default router;
