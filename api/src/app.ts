import { createCORSMiddleware } from "./lib/cors";
import express, { Application } from "express";
import i18nextMiddleware from "i18next-express-middleware";
import i18next from "./lib/i18next";
import { ApolloServer } from "apollo-server-express";
import { authMiddleware } from "./lib/auth";
import schema from "./graphql/schema";
import { createLogger } from "./lib/log";

export interface API {
  app: Application;
  apollo: ApolloServer;
}

export function getApp(): API {
  const app = express();
  const logger = createLogger("app");
  const graphqlLogger = createLogger("graphql");

  const apollo = new ApolloServer({
    schema,
    formatError: (error) => {
      graphqlLogger.error(error);
      return error;
    },
    context: async ({ req, res, connection }) => {
      if (!req || !req.headers) {
        return connection ? connection.context : {};
      }
      return res.locals.user;
    },
  });

  app.use("/graphql", authMiddleware({ soft: true }));

  app.use(i18nextMiddleware.handle(i18next));

  app.use(createCORSMiddleware());
  app.options("/*", (_, res) => res.send(true));

  app.use("/graphql", authMiddleware({ soft: true }));
  apollo.applyMiddleware({ app, path: "/graphql", cors: true });

  logger.info({ operations: apollo.graphqlPath }, "graphql server started");

  app.get("/", (req, res) => {
    res.send(true);
  });
  app.get("/health", (_, res) => {
    res.end();
  });

  return { app, apollo };
}
