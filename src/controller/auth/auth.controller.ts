import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import passport from "../../config/passport";
import { register, login, refreshTokens, logout } from "../../service/auth/auth.service";
import { AuthenticatedRequest } from "../../types/auth.types";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt.utils";
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";
const IS_PROD = process.env.NODE_ENV === "production";

// ─── Cookie helpers ───────────────────────────────────────────────────────────

const setAccessCookie = (res: Response, token: string) => {
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 1000, // 1 hour
  });
};

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "lax",
    path: "/", // not scoped — path scoping caused cross-origin send issues in dev
    maxAge: 12 * 60 * 60 * 1000, // 12 hours
  });
};

const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
};

// ─── POST /auth/register ──────────────────────────────────────────────────────
export const registerController = async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "All fields are required." });
      return;
    }
    const result = await register(email, name, password);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("auth.controller.registerController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error." });
  }
};

// ─── POST /auth/login ─────────────────────────────────────────────────────────
export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "All fields are required." });
      return;
    }
    const result = await login(email, password);

    if (result.success && result.data?.accessToken && result.data?.refreshToken) {
      setAccessCookie(res, result.data.accessToken);
      setRefreshCookie(res, result.data.refreshToken);
      // Never expose raw tokens in the response body
      res.status(result.statusCode).json({
        ...result,
        data: { user: result.data.user },
      });
    } else {
      res.status(result.statusCode).json(result);
    }
  } catch (error) {
    console.log("auth.controller.loginController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error." });
  }
};

// ─── POST /auth/refresh ───────────────────────────────────────────────────────
// Reads the refreshToken from its scoped httpOnly cookie.
// Validates it, rotates the pair, and sets fresh cookies.
export const refreshController = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken as string;
    if (!refreshToken) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: "Refresh token not found." })
    }
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: "Invalid refresh token." })
    }
    const newAccessToken = generateAccessToken({ email: decoded.email });
    const newRefreshToken = generateRefreshToken({ email: decoded.email })
    setAccessCookie(res, newAccessToken);
    setRefreshCookie(res, newRefreshToken)
    return res.status(StatusCodes.OK).json({ success: true, message: "Access token refreshed successfully." });

  } catch (error) {
    console.log("auth.controller.refreshController error", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error." });
  }
};

// ─── POST /auth/logout ────────────────────────────────────────────────────────
export const logoutController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.email) {
      await logout(req.user.email);
    }
    clearAuthCookies(res);
    res.status(StatusCodes.OK).json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    console.log("auth.controller.logoutController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET /auth/google ─────────────────────────────────────────────────────────
export const googleAuthController = passport.authenticate("google", {
  session: false,
  scope: ["email", "profile"],
});

// ─── GET /auth/google/callback ────────────────────────────────────────────────
export const googleCallbackController = (req: Request, res: Response) => {
  passport.authenticate(
    "google",
    { session: false },
    (err: Error | null, user: { email: string; name: string; accessToken: string; refreshToken: string } | false) => {
      if (err || !user) {
        console.log("auth.controller.googleCallbackController error", err);
        return res.redirect(`${FRONTEND_URL}/login?error=google_failed`);
      }

      setAccessCookie(res, user.accessToken);
      setRefreshCookie(res, user.refreshToken);

      const userPayload = Buffer.from(JSON.stringify({ email: user.email, name: user.name })).toString("base64");
      res.redirect(`${FRONTEND_URL}/auth/callback?user=${userPayload}`);
    }
  )(req, res, () => { });
};
