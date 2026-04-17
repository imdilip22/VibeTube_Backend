import fs from "fs";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { ServiceResult } from "../../types/common.types";
import { VideoRecord } from "../../types/video.types";
import config from "../../config/app.config";
import { createVideo, getAllVideos, getVideoById } from "./videoStore.service";
import { transcode } from "./transcode.service";

// ─── Save thumbnail ───────────────────────────────────────────────────────────
// Moves the temp-uploaded thumbnail into the video's hls-output directory.
// Returns the stored filename (e.g. "thumbnail.jpg") or null if not provided.
const saveThumbnail = (videoId: string, thumbnailFile: Express.Multer.File | undefined): string | null => {
  if (!thumbnailFile) return null;
  try {
    const ext = path.extname(thumbnailFile.originalname).toLowerCase();
    const filename = `thumbnail${ext}`;
    const dest = path.join(config.hlsOutputDir, videoId, filename);
    fs.renameSync(thumbnailFile.path, dest);
    return filename;
  } catch (err) {
    console.log("video.service.saveThumbnail error", err);
    return null;
  }
};

// ─── Upload ───────────────────────────────────────────────────────────────────
export const uploadVideoService = async (
  videoId: string,
  title: string,
  originalName: string,
  inputFileName: string,
  createdBy: string,
  thumbnailFile?: Express.Multer.File
): Promise<ServiceResult<VideoRecord>> => {
  try {
    const outputDir = path.join(config.hlsOutputDir, videoId);
    fs.mkdirSync(outputDir, { recursive: true });

    // Move thumbnail into hls-output dir before creating the DB record
    const thumbnailPath = saveThumbnail(videoId, thumbnailFile);

    const result = await createVideo(videoId, title, originalName, createdBy, thumbnailPath);
    if (!result.success || !result.data) return result;

    // Fire-and-forget — controller doesn't await this
    transcode(videoId, inputFileName);

    return {
      success: true,
      data: result.data,
      message: "Video uploaded. Transcoding started.",
      statusCode: StatusCodes.OK,
    };
  } catch (error) {
    console.log("video.service.uploadVideoService error", error);
    return {
      success: false,
      data: null,
      message: "Failed to process video upload.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};

// ─── Get all (optionally filtered by channel) ─────────────────────────────────
export const getAllVideosService = async (createdBy?: string, sort?: string): Promise<ServiceResult<VideoRecord[]>> => {
  return getAllVideos(createdBy, (sort as any) ?? "latest");
};

// ─── Get status ───────────────────────────────────────────────────────────────
export const getVideoStatusService = async (videoId: string): Promise<ServiceResult<VideoRecord>> => {
  return getVideoById(videoId);
};
