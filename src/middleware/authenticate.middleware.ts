import { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import passport from "../config/passport";
import { AuthenticatedRequest } from "../types/auth.types";

/**
 * authMiddleware — guards every protected route.
 * Uses passport-jwt strategy (reads accessToken cookie, verifies signature + expiry).
 * Returns plain 401 JSON on failure — no redirects.
 */
export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    "jwt",
    { session: false },
    (err: Error | null, user: { email: string } | false) => {
      if (err || !user) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized.",
        });
        return;
      }
      req.user = user;
      next();
    }
  )(req, res, next);
};
