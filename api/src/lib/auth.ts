import admin from "./firebase";
import bearerToken from "express-bearer-token";
import { createLogger } from "./log";
import { Request, Response, NextFunction } from "express";

const logger = createLogger("auth");

function authenticated(options: any): any {
  return async (
    req: Request & { userId: string },
    res: Response,
    next: NextFunction
  ) => {
    const { token } = req;
    if (!token) {
      if (options && options.soft) {
        next();
        return;
      }
      logger.warn("Missing token in request");
      throw new Error("Missing token in request");
    }

    // Always disable before deployment
    // logger.debug('Auth token: %s', token);
    try {
      const { uid } = await admin.auth().verifyIdToken(token);
      if (!uid) {
        next(new Error("No uid returned by firebase"));
        return;
      }
      req.userId = uid;
      next();
    } catch (error) {
      logger.error(error, "Firebase Token verification failed");
      next(new Error("Auth Verification Failed"));
    }
  };
}

function authenticatedUser(): any {
  return async (req: Request, res: Response, next: NextFunction) => {
    const {
      token,
      params: { userId },
    } = req;
    if (!token) {
      logger.warn("Missing token in request");
      next(new Error("Missing Token in Request"));
      return;
    }

    if (!userId) {
      next(new Error("Missing userId in request"));
    }

    let uid;
    try {
      const result = await admin.auth().verifyIdToken(token);
      uid = result.uid;
    } catch (error) {
      logger.error(error, "Firebase Token verification failed");
      next(new Error("Auth Verification Failed"));
      return;
    }

    if (userId !== uid) {
      logger.warn({ userId, uid }, "userId and uid did not match");
      next(new Error("Mismatching userId"));
      return;
    }

    next();
  };
}

export function authMiddleware(options?: any): any {
  return [bearerToken(), authenticated(options)];
}

export function authMiddlewareUser(): any {
  return [bearerToken(), authenticatedUser()];
}
