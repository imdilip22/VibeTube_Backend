import { Request, Response } from "express";
import { register, login, refreshTokens, logout, getMe } from "../../service/auth/auth.service";
import { googleSignIn } from "../../service/auth/google.auth.service";
import { AuthenticatedRequest } from "../../types/auth.types";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

const ACCESS_MAX_AGE = 15 * 60 * 60 * 1000; // 15 minutes
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

// Helper: set token cookies on the response
const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie("accessToken", accessToken, { ...COOKIE_OPTIONS, maxAge: ACCESS_MAX_AGE });
  res.cookie("refreshToken", refreshToken, { ...COOKIE_OPTIONS, maxAge: REFRESH_MAX_AGE });
};

// Helper: clear token cookies
const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken", COOKIE_OPTIONS);
  res.clearCookie("refreshToken", COOKIE_OPTIONS);
};

export const registerController = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
    const result = await register(email, name, password);

    // No cookies set on registration — user must log in
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("auth.controller.registerController error", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export const loginController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
    const result = await login(req.body.email, req.body.password);

    if (result.success && result.data?.tokens) {
      setAuthCookies(res, result.data.tokens.accessToken, result.data.tokens.refreshToken);
    }

    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("auth.controller.loginController error", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export const meController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    // req.user is set by the authenticate middleware
    if (!req.user?.email) {
      return res.status(401).json({ success: false, message: "Not authenticated." });
    }
    const result = await getMe(req.user.email);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("auth.controller.meController error", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export const refreshController = async (
  req: Request,
  res: Response
) => {
  try {
    // Read refresh token from cookie (fallback to body for backward compat)
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: "Refresh token is required." });
    }
    const result = await refreshTokens(refreshToken);

    if (result.success && result.data?.tokens) {
      setAuthCookies(res, result.data.tokens.accessToken, result.data.tokens.refreshToken);
    }

    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("auth.controller.refreshController error", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export const logoutController = async (
  req: Request,
  res: Response
) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    const result = await logout(refreshToken);

    // Always clear cookies on logout
    clearAuthCookies(res);

    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("auth.controller.logoutController error", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export const googleSignInController = async (
  req: Request,
  res: Response
) => {
  try {
    const { idToken: accessToken } = req.body;   // frontend sends field as "idToken"
    if (!accessToken) {
      return res.status(400).json({ success: false, message: "Google access token is required." });
    }
    const result = await googleSignIn(accessToken);

    if (result.success && result.data?.tokens) {
      setAuthCookies(res, result.data.tokens.accessToken, result.data.tokens.refreshToken);
    }

    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("auth.controller.googleSignInController error", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

