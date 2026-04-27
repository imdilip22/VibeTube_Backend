import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import { User, RefreshToken } from "../../models";
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
  verifyRefreshToken,
} from "../../utils/jwt.utils";

// ─── Register ─────────────────────────────────────────────────────────────────
export const register = async (email: string, name: string, password: string) => {
  try {
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return {
        success: false,
        data: null,
        message: "A user with this email already exists.",
        statusCode: StatusCodes.BAD_REQUEST,
      };
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ email, name, password: hashedPassword });

    return {
      success: true,
      data: { user: { email: user.email, name: user.name } },
      message: "Account created successfully. Please log in.",
      statusCode: StatusCodes.CREATED,
    };
  } catch (error) {
    console.log("auth.service.register error", error);
    return {
      success: false,
      data: null,
      message: "An error occurred during registration.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = async (email: string, password: string) => {
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return {
        success: false,
        data: null,
        message: "Invalid email or password.",
        statusCode: StatusCodes.UNAUTHORIZED,
      };
    }

    if (!user.password) {
      return {
        success: false,
        data: null,
        message: "This account uses Google sign-in. Please continue with Google.",
        statusCode: StatusCodes.UNAUTHORIZED,
      };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return {
        success: false,
        data: null,
        message: "Invalid email or password.",
        statusCode: StatusCodes.UNAUTHORIZED,
      };
    }

    const payload = { email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await RefreshToken.create({
      userEmail: user.email,
      token: refreshToken,
      expiresAt: getRefreshTokenExpiry(),
      revoked: false,
    });

    return {
      success: true,
      data: {
        user: { email: user.email, name: user.name },
        accessToken,
        refreshToken, // controller sets both as httpOnly cookies
      },
      message: "Logged in successfully.",
      statusCode: StatusCodes.OK,
    };
  } catch (error) {
    console.log("auth.service.login error", error);
    return {
      success: false,
      data: null,
      message: "An error occurred during login.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};

// ─── Refresh ──────────────────────────────────────────────────────────────────
// Accepts the refresh token string from the httpOnly cookie.
// Validates it against the DB, rotates (revoke old → issue new pair), and returns
// new access + refresh tokens. The old refresh token is permanently invalidated.
export const refreshTokens = async (incomingRefreshToken: string) => {
  try {
    // 1. Verify the token's JWT signature and expiry
    let decoded: { email: string };
    try {
      decoded = verifyRefreshToken(incomingRefreshToken) as { email: string };
    } catch {
      return {
        success: false,
        data: null,
        message: "Session expired. Please log in again.",
        statusCode: StatusCodes.UNAUTHORIZED,
      };
    }

    // 2. Check it actually exists in DB and hasn't been revoked
    const storedToken = await RefreshToken.findOne({
      where: { token: incomingRefreshToken, revoked: false },
    });

    if (!storedToken) {
      // Token was already used or revoked — potential reuse attack.
      // Revoke ALL tokens for this user to force re-login everywhere.
      await RefreshToken.update({ revoked: true }, { where: { userEmail: decoded.email, revoked: false } });
      return {
        success: false,
        data: null,
        message: "Session invalid. Please log in again.",
        statusCode: StatusCodes.UNAUTHORIZED,
      };
    }

    if (new Date() > storedToken.expiresAt) {
      await storedToken.update({ revoked: true });
      return {
        success: false,
        data: null,
        message: "Session expired. Please log in again.",
        statusCode: StatusCodes.UNAUTHORIZED,
      };
    }

    // 3. Rotate — revoke old token, issue a new pair
    await storedToken.update({ revoked: true });

    const user = await User.findByPk(decoded.email);
    if (!user) {
      return {
        success: false,
        data: null,
        message: "User not found.",
        statusCode: StatusCodes.UNAUTHORIZED,
      };
    }

    const payload = { email: user.email };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    await RefreshToken.create({
      userEmail: user.email,
      token: newRefreshToken,
      expiresAt: getRefreshTokenExpiry(),
      revoked: false,
    });

    return {
      success: true,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
      message: "Token refreshed.",
      statusCode: StatusCodes.OK,
    };
  } catch (error) {
    console.log("auth.service.refreshTokens error", error);
    return {
      success: false,
      data: null,
      message: "An error occurred while refreshing tokens.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logout = async (userEmail: string) => {
  try {
    await RefreshToken.update(
      { revoked: true },
      { where: { userEmail, revoked: false } }
    );
    return {
      success: true,
      data: null,
      message: "Logged out successfully.",
      statusCode: StatusCodes.OK,
    };
  } catch (error) {
    console.log("auth.service.logout error", error);
    return {
      success: false,
      data: null,
      message: "An error occurred during logout.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};