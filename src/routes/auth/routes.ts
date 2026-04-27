import { Router } from "express";
import {
  registerController,
  loginController,
  refreshController,
  logoutController,
  googleAuthController,
  googleCallbackController,
} from "../../controller/auth/auth.controller";
import { authMiddleware } from "../../middleware/authenticate.middleware";

export const authRouter = Router();

// ── Public ────────────────────────────────────────────────────────────────────
authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.post("/refresh", refreshController);

// ── Google OAuth2 (authorization code flow) ───────────────────────────────────
authRouter.get("/google", googleAuthController);
authRouter.get("/google/callback", googleCallbackController);

// ── Protected ─────────────────────────────────────────────────────────────────
authRouter.post("/logout", authMiddleware, logoutController);
