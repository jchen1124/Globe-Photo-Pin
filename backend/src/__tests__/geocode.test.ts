import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import geocodeRoutes from "../routes/geocode";
import { redisClient } from "../redis";

vi.mock("axios");

vi.mock("../redis", () => ({
  redisClient: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

const mockedAxios = vi.mocked(axios);

const createTestApp = () => {
  const app = express();
  app.use("/geocode", geocodeRoutes);
  return app;
};

describe("GET /geocode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.VITE_MAPBOX_TOKEN = "test-mapbox-token";
  });

  it("fetches from Mapbox and caches the result on a cache miss", async () => {
    vi.mocked(redisClient.get).mockResolvedValue(null);

    mockedAxios.get.mockResolvedValue({
      data: {
        features: [
          {
            place_name: "New York, New York, United States",
          },
        ],
      },
    });

    const app = createTestApp();

    const response = await request(app)
      .get("/geocode")
      .query({ latitude: "40.7128", longitude: "-74.0060" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      address: "New York, New York, United States",
    });

    expect(redisClient.get).toHaveBeenCalledWith(
      "geocode:v1:40.71280:-74.00600",
    );

    expect(mockedAxios.get).toHaveBeenCalledTimes(1);

    expect(redisClient.set).toHaveBeenCalledWith(
      "geocode:v1:40.71280:-74.00600",
      JSON.stringify({ address: "New York, New York, United States" }),
      { EX: 60 * 5 },
    );
  });

  it("returns cached data without calling Mapbox on a cache hit", async () => {
    vi.mocked(redisClient.get).mockResolvedValue(
      JSON.stringify({ address: "Cached New York Address" }),
    );

    const app = createTestApp();

    const response = await request(app)
      .get("/geocode")
      .query({ latitude: "40.7128", longitude: "-74.0060" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      address: "Cached New York Address",
    });

    expect(mockedAxios.get).not.toHaveBeenCalled();
    expect(redisClient.set).not.toHaveBeenCalled();
  });
});