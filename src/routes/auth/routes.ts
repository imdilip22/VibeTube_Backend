import { Router } from "express";
import {
  registerController,
  loginController,
  meController,
  refreshController,
  logoutController,
  googleSignInController,
} from "../../controller/auth/auth.controller";
import { authenticate } from "../../middleware/authenticate.middleware";

export const authRouter = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.post("/google", googleSignInController);
authRouter.get("/me", authenticate, meController);
authRouter.post("/refresh", refreshController);
authRouter.post("/logout", logoutController);
