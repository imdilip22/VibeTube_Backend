import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthenticatedRequest } from "../../types/auth.types";
import { getProfile, updateProfile } from "../../service/profile/profile.service";

// ─── GET /profile ─────────────────────────────────────────────────────────────
export const getProfileController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const email = req.user!.email;
    const result = await getProfile(email);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("profile.controller.getProfileController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error." });
  }
};

// ─── PUT /profile ─────────────────────────────────────────────────────────────
// Accepts multipart/form-data with optional fields: name, avatar (file), coverPhoto (file),
// clearAvatar ("true"), clearCover ("true")
export const updateProfileController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const email = req.user!.email;
    const files = req.files as { avatar?: Express.Multer.File[]; coverPhoto?: Express.Multer.File[] } | undefined;
    const singleFile = req.file;

    const avatarFilename =
      files?.avatar?.[0]?.filename ??
      (singleFile?.fieldname === "avatar" ? singleFile.filename : undefined);

    const coverFilename =
      files?.coverPhoto?.[0]?.filename ??
      (singleFile?.fieldname === "coverPhoto" ? singleFile.filename : undefined);

    const clearAvatar = req.body.clearAvatar === "true";
    const clearCover = req.body.clearCover === "true";

    const result = await updateProfile(email, {
      name: req.body.name,
      avatarFilename,
      coverFilename,
      clearAvatar,
      clearCover,
    });

    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("profile.controller.updateProfileController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error." });
  }
};
