// Upload, delete, and image retrieval logic.
import { Router } from "express";
import multer from "multer";
import { supabase } from "../db";
import { redisClient } from "../redis";

const router = Router();
const upload = multer(); // For parsing multipart/form-data

import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, bucketName } from "../s3";

const SIGNED_URL_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7; // 7 days
// Keep Redis shorter than the S3 URL lifetime so cached URLs expire first.
const SIGNED_URL_CACHE_TTL_SECONDS = 60 * 60 * 24 * 6; // 6 days

const getImageUrl = async (imagePath: string | null) => {
  if (!imagePath) {
    return null;
  }

  const cacheKey = `s3:signed-url:v1:${imagePath}`;

  // Reuse signed URLs while they are still safely inside their expiration window.
  const cachedUrl = await redisClient.get(cacheKey);

  if (cachedUrl) {
    console.log("S3 signed URL cache hit:", cacheKey);
    return cachedUrl;
  }

  console.log("S3 signed URL cache miss:", cacheKey);

  // Verify the object exists before generating a URL that the frontend will use.
  await s3.send(
    new HeadObjectCommand({
      Bucket: bucketName,
      Key: imagePath,
    }),
  );

  const signedUrl = await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: bucketName,
      Key: imagePath,
    }),
    { expiresIn: SIGNED_URL_EXPIRES_IN_SECONDS },
  );

  // Store the generated access URL so future post fetches can skip signing work.
  await redisClient.set(cacheKey, signedUrl, {
    EX: SIGNED_URL_CACHE_TTL_SECONDS,
  });

  return signedUrl;
};

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

  const postsWithImageUrls = await Promise.all(
    (data ?? []).map(async (post) => ({
      ...post,
      imageUrl: await getImageUrl(post.image_url),
    })),
  );

  res.json(postsWithImageUrls);
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

    // Upload the image before inserting the post so the database never points
    // at an object that failed to upload.
    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: fileName,
          Body: imageFile.buffer,
          ContentType: imageFile.mimetype,
        }),
      );
    } catch (error) {
      console.error("Image upload error:", error);
      return res.status(500).json({ error: "Failed to upload image" });
    }

    // Only after the S3 upload succeeds do we persist the post metadata.
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
      // Roll back the uploaded object if the database insert fails.
      await s3
        .send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: fileName,
          }),
        )
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

  // Fetch the S3 object key before deleting the row so storage can be cleaned up.
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

  // Remove the image and invalidate its cached signed URL.
  if (postData.image_url) {
    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: postData.image_url,
        }),
      );
      await redisClient.del(`s3:signed-url:v1:${postData.image_url}`);
    } catch (error) {
      console.error("Error removing image from storage:", error);
    }
  }

  // Delete the database row after storage cleanup has been attempted.
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
