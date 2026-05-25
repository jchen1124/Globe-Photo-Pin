import dotenv from "dotenv";
import {
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { supabase } from "../db";
import { s3, bucketName } from "../s3";

dotenv.config();

const storageBucket = "post-images";

const getUniqueImageKeys = async () => {
  const { data, error } = await supabase
    .from("posts")
    .select("image_url")
    .not("image_url", "is", null);

  if (error) {
    throw new Error(`Failed to fetch image keys: ${error.message}`);
  }

  return [...new Set((data ?? []).map((post) => post.image_url).filter(Boolean))];
};

const objectExistsInS3 = async (key: string) => {
  try {
    await s3.send(
      new HeadObjectCommand({
        Bucket: bucketName,
        Key: key,
      }),
    );
    return true;
  } catch {
    return false;
  }
};

const copyImageToS3 = async (key: string) => {
  const publicUrl = supabase.storage.from(storageBucket).getPublicUrl(key).data
    .publicUrl;

  const response = await fetch(publicUrl);
  if (!response.ok) {
    throw new Error(`Failed to download ${key} from Supabase: ${response.status}`);
  }

  const body = Buffer.from(await response.arrayBuffer());
  const contentType =
    response.headers.get("content-type") ?? "application/octet-stream";

  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
};

const migrate = async () => {
  const imageKeys = await getUniqueImageKeys();

  console.log(`Found ${imageKeys.length} image keys in posts table.`);

  let copied = 0;
  let skipped = 0;

  for (const key of imageKeys) {
    const existsInS3 = await objectExistsInS3(key);

    if (existsInS3) {
      skipped += 1;
      console.log(`Skipping ${key}: already exists in S3.`);
      continue;
    }

    await copyImageToS3(key);
    copied += 1;
    console.log(`Copied ${key} to S3.`);
  }

  console.log(`Migration complete. Copied: ${copied}, skipped: ${skipped}.`);
};

migrate().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
