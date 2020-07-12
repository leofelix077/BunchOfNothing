import http, { Server } from "http";
import { getApp } from "./app";
import { createLogger } from "./lib/log";

const logger = createLogger("server");

export function createServer(): Server {
  const { app, apollo } = getApp();

  const server = http.createServer(app);

  // handle subscriptions via apollo
  apollo.installSubscriptionHandlers(server);

  server.on("listening", () => {
    logger.info(
      {
        NODE_ENV: process.env.NODE_ENV,
        NODE_VERSION: process.version,
      },
      "Server started"
    );
  });

  return server;
}

if (require.main === module) {
  try {
    const port = process.env.NODE_PORT || process.env.PORT || 3100;
    createServer().listen(port);
  } catch (error) {
    logger.error({ error }, "error starting server");
  }
}
