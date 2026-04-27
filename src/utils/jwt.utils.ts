import jwt from "jsonwebtoken";
import { JwtAccessPayload } from "../types/auth.types";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "access_secret_fallback";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "refresh_secret_fallback";

// access = 1h, refresh = 12h (as requested)
const ACCESS_EXPIRY = "1h";
const REFRESH_EXPIRY = "12h";

export const generateAccessToken = (payload: JwtAccessPayload) => {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });
};

export const generateRefreshToken = (payload: JwtAccessPayload) => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, ACCESS_SECRET) as JwtAccessPayload;
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_SECRET) as JwtAccessPayload;
};

/**
 * Decode an access token WITHOUT verifying expiry.
 * Used by the refresh endpoint to identify the user from an expired cookie.
 */
export const decodeTokenPayload = (token: string): JwtAccessPayload | null => {
  try {
    return jwt.decode(token) as JwtAccessPayload;
  } catch {
    return null;
  }
};

export const getRefreshTokenExpiry = () => {
  // 12 hours in ms
  return new Date(Date.now() + 12 * 60 * 60 * 1000);
};
