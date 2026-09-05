import { env } from "./config";
import { migrate } from "./database/migrate";

// Keep startup and shutdown explicit across development and production.
import { pool } from "./database/pool";
import { createApp } from "./app";
import { startIntegrationWorker } from "./services/integration.service";
import { provisionWhatsAppPlatformConnection } from "./services/whatsapp-platform.service";

async function start() {
  await migrate();
  await provisionWhatsAppPlatformConnection();
  startIntegrationWorker();
  const server = createApp().listen(env.port, () => {
    console.log(`LemonBooks API listening at http://localhost:${env.port}`);
    console.log("Database: PostgreSQL");
  });

  const shutdown = async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    server.closeAllConnections();
    await pool.end();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((error) => {
  console.error("LemonBooks API failed to start", error);
  process.exit(1);
});
