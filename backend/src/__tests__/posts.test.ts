import express from "express";
import type { NextFunction, Request, Response } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import postsRoutes from "../routes/posts";
import { supabase } from "../db";
import { redisClient } from "../redis";
import { s3 } from "../s3";

vi.mock("../redis", () => ({
  redisClient: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}));

vi.mock("../db", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock("../s3", () => ({
  bucketName: "test-bucket",
  s3: {
    send: vi.fn(),
  },
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(),
}));

vi.mock("../middleware/rateLimit", () => ({
  uploadRateLimiter: (_req: Request, _res: Response, next: NextFunction) =>
    next(),
}));

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/posts", postsRoutes);
  return app;
};

const mockPostsQuery = (posts: unknown[]) => {
  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({
        data: posts,
        error: null,
      }),
    }),
  } as never);
};

describe("GET /api/posts signed URL cache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates and caches a signed S3 URL on a cache miss", async () => {
    mockPostsQuery([
      {
        id: 1,
        user_id: "user-1",
        image_url: "user-1-1720000000000.jpg",
        description: "Test post",
        latitude: 40.7128,
        longitude: -74.006,
        created_at: "2026-08-17T00:00:00.000Z",
        photo_date: "2026-08-17T00:00:00.000Z",
      },
    ]);

    vi.mocked(redisClient.get).mockResolvedValue(null);
    vi.mocked(s3.send).mockResolvedValue();
    vi.mocked(getSignedUrl).mockResolvedValue("https://signed-s3-url.test");

    const response = await request(createTestApp()).get("/api/posts");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      expect.objectContaining({
        id: 1,
        image_url: "user-1-1720000000000.jpg",
        imageUrl: "https://signed-s3-url.test",
      }),
    ]);

    expect(redisClient.get).toHaveBeenCalledWith(
      "s3:signed-url:v1:user-1-1720000000000.jpg",
    );
    expect(s3.send).toHaveBeenCalledTimes(1);
    expect(getSignedUrl).toHaveBeenCalledTimes(1);
    expect(redisClient.set).toHaveBeenCalledWith(
      "s3:signed-url:v1:user-1-1720000000000.jpg",
      "https://signed-s3-url.test",
      { EX: 60 * 60 * 24 * 6 },
    );
  });

  it("returns the cached signed S3 URL without checking S3 or signing again", async () => {
    mockPostsQuery([
      {
        id: 1,
        user_id: "user-1",
        image_url: "user-1-1720000000000.jpg",
        description: "Test post",
        latitude: 40.7128,
        longitude: -74.006,
        created_at: "2026-08-17T00:00:00.000Z",
        photo_date: "2026-08-17T00:00:00.000Z",
      },
    ]);

    vi.mocked(redisClient.get).mockResolvedValue(
      "https://cached-signed-s3-url.test",
    );

    const response = await request(createTestApp()).get("/api/posts");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      expect.objectContaining({
        id: 1,
        image_url: "user-1-1720000000000.jpg",
        imageUrl: "https://cached-signed-s3-url.test",
      }),
    ]);

    expect(redisClient.get).toHaveBeenCalledWith(
      "s3:signed-url:v1:user-1-1720000000000.jpg",
    );
    expect(s3.send).not.toHaveBeenCalled();
    expect(getSignedUrl).not.toHaveBeenCalled();
    expect(redisClient.set).not.toHaveBeenCalled();
  });
});
