import { Router } from "express";
import multer from "multer";
// import pool from "../db";
import { supabase } from "../db";

const router = Router();
const upload = multer(); // For parsing multipart/form-data

router.get("/", async (req, res) => {
  const { user_id } = req.query;

  let query = supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });
  if (user_id) {
    query = query.eq("user_id", user_id);
  }

  const { data, error } = await query;
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { description, latitude, longitude, user_id, photo_date } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({ error: "Image file is required" });
    }

    if (!user_id || !latitude || !longitude) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const fileExtension = imageFile.originalname.split(".").pop();
    const fileName = `${user_id}-${Date.now()}.${fileExtension}`;

    // Upload image FIRST
    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(fileName, imageFile.buffer, {
        contentType: imageFile.mimetype,
      });

    if (uploadError) {
      console.error("Image upload error:", uploadError);
      return res.status(500).json({ error: "Failed to upload image" });
    }

    // ONLY if image succeeds, insert into database
    const createdAt = new Date().toISOString();
    const { error: insertError } = await supabase.from("posts").insert({
      user_id,
      image_url: fileName,
      description: description || "",
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      created_at: createdAt,
      photo_date: photo_date || createdAt,
    });

    if (insertError) {
      console.error("Database insert error:", insertError);
      // Delete image if database fails
      await supabase.storage
        .from("post-images")
        .remove([fileName])
        .catch((err) => console.error("Cleanup error:", err));
      return res.status(500).json({ error: "Failed to create post" });
    }

    return res.status(201).json({ message: "Post created successfully" });
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const postId = req.params.id;
  const numericId = Number(postId);
  if (isNaN(numericId)) {
    return res.status(400).json({ error: "Invalid post ID" });
  }

  // 1. Fetch the post to get the image_url
  const { data: postData, error: fetchError } = await supabase
    .from("posts")
    .select("image_url")
    .eq("id", numericId)
    .single();

  if (fetchError) {
    return res.status(500).json({ error: fetchError.message });
  }
  if (!postData) {
    return res.status(404).json({ error: "Post not found" });
  }

  // 2. Remove the image from Supabase Storage
  if (postData.image_url) {
    const { error: removeError } = await supabase.storage
      .from("post-images")
      .remove([postData.image_url]);
    if (removeError) {
      // Log but don't block post deletion
      console.error("Error removing image from storage:", removeError.message);
    }
  }

  // 3. Delete the post
  const { data, error } = await supabase
    .from("posts")
    .delete()
    .eq("id", numericId)
    .select();

  // console.log("Supabase delete result:", { data, error });

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  if (!data || data.length === 0) {
    return res.status(404).json({ error: "Post not found or already deleted" });
  }
  res.json({ success: true });
});
export default router;
