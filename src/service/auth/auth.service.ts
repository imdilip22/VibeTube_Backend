import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import { User, RefreshToken } from "../../models";

import {
    generateAccessToken,
    generateRefreshToken,
    getRefreshTokenExpiry,
    verifyRefreshToken,
} from "../../utils/jwt.utils";
import {
    ServiceResult,
    AuthData,
    RegisterBody,
    LoginBody,
    RefreshBody,
    LogoutBody,
} from "../../types/auth.types";

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

        const user = await User.create({
            email,
            name,
            password: hashedPassword,
        });

        // Don't generate tokens on registration — user must log in
        return {
            success: true,
            data: {
                user: {
                    email: user.email,
                    name: user.name,
                },
            },
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
                user: {
                    email: user.email,
                    name: user.name,
                },
                tokens: { accessToken, refreshToken },
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

// ─── Get Current User (via access token) ──────────────────────────────────────
export const getMe = async (email: string) => {
    try {
        const user = await User.findByPk(email);
        if (!user) {
            return {
                success: false,
                data: null,
                message: "User not found.",
                statusCode: StatusCodes.UNAUTHORIZED,
            };
        }
        return {
            success: true,
            data: {
                user: {
                    email: user.email,
                    name: user.name,
                },
            },
            message: "User retrieved.",
            statusCode: StatusCodes.OK,
        };
    } catch (error) {
        console.log("auth.service.getMe error", error);
        return {
            success: false,
            data: null,
            message: "An error occurred.",
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        };
    }
};

// ─── Refresh Tokens ───────────────────────────────────────────────────────────
export const refreshTokens = async (refreshToken: string) => {
    try {

        let decoded: any;

        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch (verifyError) {
            console.log("auth.service.refreshTokens token verification failed", verifyError);
            return {
                success: false,
                data: null,
                message: "Invalid or expired refresh token.",
                statusCode: StatusCodes.UNAUTHORIZED,
            };
        }

        const storedToken = await RefreshToken.findOne({
            where: { token: refreshToken },
        });

        if (!storedToken) {
            return {
                success: false,
                data: null,
                message: "Refresh token not found.",
                statusCode: StatusCodes.UNAUTHORIZED,
            };
        }

        if (storedToken.revoked) {
            return {
                success: false,
                data: null,
                message: "Refresh token has been revoked.",
                statusCode: StatusCodes.UNAUTHORIZED,
            };
        }

        if (new Date() > storedToken.expiresAt) {
            return {
                success: false,
                data: null,
                message: "Refresh token has expired.",
                statusCode: StatusCodes.UNAUTHORIZED,
            };
        }

        // Revoke old token
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
            data: {
                user: {
                    email: user.email,
                    name: user.name,
                },
                tokens: {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                },
            },
            message: "Tokens refreshed successfully.",
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
export const logout = async (refreshToken: string) => {
    try {

        const storedToken = await RefreshToken.findOne({
            where: { token: refreshToken },
        });

        if (!storedToken) {
            return {
                success: false,
                data: null,
                message: "Refresh token not found.",
                statusCode: StatusCodes.BAD_REQUEST,
            };
        }

        await storedToken.update({ revoked: true });

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