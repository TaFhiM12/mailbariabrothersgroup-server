import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import app from "./app.js";

const bootstrap = async () => {
  await connectDatabase();

  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });
};

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});