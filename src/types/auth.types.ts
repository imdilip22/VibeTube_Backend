import { Request } from "express";

// ─── JWT Payload ──────────────────────────────────────────────────────────────
export type JwtAccessPayload = {
  email: string;
};

// ─── Extended Request ─────────────────────────────────────────────────────────
export type AuthenticatedRequest = Request & {
  user?: JwtAccessPayload;
};
