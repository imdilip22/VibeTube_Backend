import { StatusCodes } from "http-status-codes";
import { User } from "../../models";
import fs from "fs";
import path from "path";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

const deleteFile = (filename: string | null | undefined, subdir: string) => {
  if (!filename) return;
  try {
    fs.unlinkSync(path.join(UPLOAD_ROOT, subdir, filename));
  } catch {
    // ignore — file may not exist
  }
};

// ─── Get profile ──────────────────────────────────────────────────────────────
export const getProfile = async (email: string) => {
  try {
    const user = await User.findByPk(email, {
      attributes: ["email", "name", "avatar", "coverPhoto", "createdAt"],
    });
    if (!user) {
      return { success: false, data: null, message: "User not found.", statusCode: StatusCodes.NOT_FOUND };
    }
    return { success: true, data: user.toJSON(), message: "Profile fetched.", statusCode: StatusCodes.OK };
  } catch (error) {
    console.log("profile.service.getProfile error", error);
    return { success: false, data: null, message: "Internal error.", statusCode: StatusCodes.INTERNAL_SERVER_ERROR };
  }
};

// ─── Update profile ───────────────────────────────────────────────────────────
export const updateProfile = async (
  email: string,
  updates: {
    name?: string;
    avatarFilename?: string;
    coverFilename?: string;
    clearAvatar?: boolean;
    clearCover?: boolean;
  }
) => {
  try {
    const user = await User.findByPk(email);
    if (!user) {
      return { success: false, data: null, message: "User not found.", statusCode: StatusCodes.NOT_FOUND };
    }

    const fields: Record<string, string | null> = {};

    if (updates.name?.trim()) fields.name = updates.name.trim();

    if (updates.clearAvatar) {
      deleteFile(user.avatar, "profiles");
      fields.avatar = null;
    } else if (updates.avatarFilename) {
      deleteFile(user.avatar, "profiles"); // remove old file
      fields.avatar = updates.avatarFilename;
    }

    if (updates.clearCover) {
      deleteFile(user.coverPhoto, "covers");
      fields.coverPhoto = null;
    } else if (updates.coverFilename) {
      deleteFile(user.coverPhoto, "covers"); // remove old file
      fields.coverPhoto = updates.coverFilename;
    }

    if (Object.keys(fields).length === 0) {
      return { success: false, data: null, message: "Nothing to update.", statusCode: StatusCodes.BAD_REQUEST };
    }

    await user.update(fields);
    await user.reload(); // ensure returned values reflect what was just saved

    return {
      success: true,
      data: { email: user.email, name: user.name, avatar: user.avatar, coverPhoto: user.coverPhoto },
      message: "Profile updated.",
      statusCode: StatusCodes.OK,
    };
  } catch (error) {
    console.log("profile.service.updateProfile error", error);
    return { success: false, data: null, message: "Internal error.", statusCode: StatusCodes.INTERNAL_SERVER_ERROR };
  }
};
