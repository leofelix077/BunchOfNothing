import pino from "pino";

const {
  env: { SERVICE_NAME, LOG_LEVEL },
} = process;

const logger = pino({
  base: {
    service: SERVICE_NAME,
  },
  level: LOG_LEVEL || "info",
});

export function createLogger(file: string): ReturnType<typeof logger.child> {
  return logger.child({ file });
}
