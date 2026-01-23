import { Router } from "express";
// import multer from "multer";
// import pool from "../db";
import {supabase} from '../db';

const router = Router();

router.get("/", async (req, res) => {
  console.log("fetch posts route called");
  const {user_id} = req.query;

  let query = supabase.from("posts").select("*").order("created_at", { ascending: false });
  if (user_id) {
    query = query.eq("user_id", user_id);
  }

  const { data, error } = await query;
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

router.delete("/:id", async (req, res) => {
  const postId = req.params.id;
  const numericId = Number(postId);
  if (isNaN(numericId)) {
    return res.status(400).json({ error: "Invalid post ID" });
  }
  // Use .select() to get deleted rows
  const { data, error } = await supabase
    .from("posts")
    .delete()
    .eq("id", numericId)
    .select();

  console.log("Supabase delete result:", { data, error });

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  if (!data || data.length === 0) {
    return res.status(404).json({ error: "Post not found or already deleted" });
  }
  res.json({ success: true });
});
export default router;
