import { start } from "node:repl";
import app from "./app";
import { connectRedis } from "./redis";

const PORT = Number(process.env.PORT) || 3001;

const startServer = async () => {
  // Connect to Redis
  await connectRedis();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1)
})
