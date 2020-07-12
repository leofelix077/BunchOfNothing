import { NextFunction, Request, Response } from "express";

const ALLOWED_ORIGINS = [
  "*.bunchofnothing.com",
  "https://www.bunchofnothing.com",
  "http://localhost:3000",
];

export function createCORSMiddleware(): (
  req: Request,
  res: Response,
  next: NextFunction
) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.get("origin");
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
    }

    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    next();
  };
}
