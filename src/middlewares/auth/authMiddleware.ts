import { Request, Response, NextFunction } from "express";
import * as Jwt from "jsonwebtoken";
import config from "../../config";
import { AuthInfo, AuthRequest } from "./context";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const _req = req as AuthRequest;

  const authHeader = _req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  let decoded;

  try {
    decoded = Jwt.verify(token, config.JWT_SECRET) as AuthInfo;
    _req.auth = decoded;
  } catch (error) {
    console.log("Invalid token");
  }
  next();
};
