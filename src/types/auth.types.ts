import { Request } from "express";

// ─── Auth Payload ─────────────────────────────────────────────────────────────
export type JwtAccessPayload = {
  email: string;
};

// ─── Service Result (shared) ──────────────────────────────────────────────────
export type { ServiceResult } from "./common.types";


// ─── Auth Data ────────────────────────────────────────────────────────────────
export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type AuthData = {
  user: {
    email: string;
    name: string;
  };
  tokens: TokenPair;
};

// ─── Request Bodies ───────────────────────────────────────────────────────────
export type RegisterBody = {
  email: string;
  name: string;
  password: string;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type RefreshBody = {
  refreshToken: string;
};

export type LogoutBody = {
  refreshToken: string;
};

// ─── Extended Request ─────────────────────────────────────────────────────────
export type AuthenticatedRequest = Request & {
  user?: JwtAccessPayload;
};
