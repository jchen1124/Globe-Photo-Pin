import {connectRedis} from "./redis";

const PORT = Number(process.env.PORT) || 3001;

const startServer = async () => {
  await connectRedis();
  console.log("Connected to Redis");

  const { default: app } = await import("./app");

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
