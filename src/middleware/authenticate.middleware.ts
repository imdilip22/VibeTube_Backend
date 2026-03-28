import { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { verifyAccessToken } from "../utils/jwt.utils";
import { AuthenticatedRequest } from "../types/auth.types";

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Read access token from cookie first, fallback to Authorization header
    const token =
      req.cookies?.accessToken ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Access token missing.",
      });
      return;
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("authenticate middleware token verification failed", error);
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: "Invalid or expired access token.",
    });
  }
};
