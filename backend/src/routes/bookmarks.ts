// Add, Remove, and Get Bookmarks

import { Router } from "express";
import { supabase } from "../db";

const router = Router();

router.post("/", async (req, res) => {
  const { user_id, post_id } = req.body;

  if (!user_id || !post_id) {
    return res.status(400).json({ error: "Missing user_id or post_id" });
  }

  const { data, error } = await supabase
    .from("bookmarks")
    .insert({
      user_id,
      post_id,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Post already bookmarked" });
    }

    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
});

router.delete("/:postId", async (req, res) => {
  const { postId } = req.params;
  const { user_id } = req.query;
  
  if (!user_id) {
    return res.status(400).json({ error: "Missing user_id" });
  }

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", user_id)
    .eq("post_id", Number(postId));

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true });
});

router.get("/", async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: "Missing user_id" });
  }

  const { data, error } = await supabase
    .from("bookmarks")
    .select(
      `
      post_id,
      posts (*)
      `
    )
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const posts = (data ?? []).map((bookmark) => bookmark.posts);

  res.json(posts);
});

export default router;