import jwt from "jsonwebtoken";
import { JwtAccessPayload } from "../types/auth.types";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "access_secret_fallback";
const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ?? "refresh_secret_fallback";
const ACCESS_EXPIRY = (process.env.JWT_ACCESS_EXPIRY ?? "15m") as jwt.SignOptions["expiresIn"];
const REFRESH_EXPIRY = (process.env.JWT_REFRESH_EXPIRY ?? "7d") as jwt.SignOptions["expiresIn"];

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

export const getRefreshTokenExpiry = () => {
  const expiry = process.env.JWT_REFRESH_EXPIRY ?? "7d";
  const unit = expiry.slice(-1);
  const value = parseInt(expiry.slice(0, -1), 10);

  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  const ms = (multipliers[unit] ?? multipliers["d"]) * value;
  return new Date(Date.now() + ms);
};
