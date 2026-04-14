import { StatusCodes } from "http-status-codes";
import { User, RefreshToken } from "../../models";
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
} from "../../utils/jwt.utils";

// ─── Google Sign-In (access_token flow) ───────────────────────────────────────
// The frontend sends a Google OAuth access_token (implicit flow).
// We verify it by fetching Google's userinfo endpoint — no client secret needed.
export const googleSignIn = async (accessToken: string) => {
  try {
    // 1. Fetch user info from Google using the access token
    const userInfoRes = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!userInfoRes.ok) {
      return {
        success: false,
        data: null,
        message: "Invalid or expired Google access token.",
        statusCode: StatusCodes.UNAUTHORIZED,
      };
    }

    const googleUser = await userInfoRes.json() as {
      sub: string;
      email?: string;
      name?: string;
      email_verified?: boolean;
    };

    if (!googleUser.email) {
      return {
        success: false,
        data: null,
        message: "No email address found in Google account.",
        statusCode: StatusCodes.BAD_REQUEST,
      };
    }

    if (!googleUser.email_verified) {
      return {
        success: false,
        data: null,
        message: "Google account email is not verified.",
        statusCode: StatusCodes.UNAUTHORIZED,
      };
    }

    const { sub: googleId, email, name } = googleUser;

    // 2. Find existing user by email; create if new
    let user = await User.findOne({ where: { email } });

    if (user) {
      // Update googleId if not already linked, and fix name if it's still the default
      const updates: Record<string, any> = {};
      if (!user.googleId) updates.googleId = googleId;
      if (name && user.name === "User") updates.name = name;
      if (Object.keys(updates).length > 0) {
        await user.update(updates);
      }
    } else {
      // Brand-new user — create without a password
      user = await User.create({
        email,
        name: name ?? email.split("@")[0],
        password: null,
        googleId,
      });
    }

    // 3. Issue our own JWT pair (same as regular login)
    const jwtPayload = { email: user.email };
    const newAccessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    await RefreshToken.create({
      userEmail: user.email,
      token: refreshToken,
      expiresAt: getRefreshTokenExpiry(),
      revoked: false,
    });

    return {
      success: true,
      data: {
        user: {
          email: user.email,
          name: user.name,
        },
        tokens: { accessToken: newAccessToken, refreshToken },
      },
      message: "Signed in with Google successfully.",
      statusCode: StatusCodes.OK,
    };
  } catch (error) {
    console.log("google.auth.service.googleSignIn error", error);
    return {
      success: false,
      data: null,
      message: "Google sign-in failed.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};

