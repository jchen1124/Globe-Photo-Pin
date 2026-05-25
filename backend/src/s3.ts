import dotenv from "dotenv";
import { S3Client } from "@aws-sdk/client-s3";

dotenv.config();

const accessKeyId =
  process.env.AWS_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION;
const bucketName = process.env.AWS_S3_BUCKET;

if (!accessKeyId || !secretAccessKey || !region || !bucketName) {
  throw new Error(
    "Missing S3 configuration. Required: AWS_ACCESS_KEY_ID (or AWS_ACCESS_KEY), AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET.",
  );
}

export const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export { bucketName };
