import fs from "fs";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";
import { Stream } from "../../models/Stream";
import { User } from "../../models/User";
import { Video } from "../../models/Video";
import config from "../../config/app.config";

// ─── Create a new stream record ───────────────────────────────────────────────
export const createStreamService = async (
  title: string,
  creatorEmail: string,
  thumbnailFile?: Express.Multer.File
) => {
  const existing = await Stream.findOne({ where: { creatorEmail, isLive: true } });
  if (existing) {
    return {
      statusCode: StatusCodes.CONFLICT,
      success: false,
      message: "You already have an active live stream.",
      data: null,
    };
  }

  const streamKey = uuidv4().replace(/-/g, "").slice(0, 20);
  const videoId = uuidv4();

  // Pre-create HLS directories so thumbnail + segments land in the right place
  const liveHlsDir = path.join(process.cwd(), "live-hls", "live", streamKey);
  const videoOutputDir = path.join(config.hlsOutputDir, videoId);
  fs.mkdirSync(liveHlsDir, { recursive: true });
  fs.mkdirSync(videoOutputDir, { recursive: true });

  // Save thumbnail into both directories
  let thumbnailPath: string | null = null;
  if (thumbnailFile) {
    const ext = path.extname(thumbnailFile.originalname).toLowerCase();
    const filename = `thumbnail${ext}`;
    try {
      fs.copyFileSync(thumbnailFile.path, path.join(liveHlsDir, filename));
      fs.renameSync(thumbnailFile.path, path.join(videoOutputDir, filename));
      thumbnailPath = filename;
    } catch (err) {
      console.log("createStreamService: thumbnail save failed", err);
    }
  }

  // Pre-create the Video record (status: "processing") so social features work
  // during the live stream. It becomes "done" once archiving completes.
  await Video.create({
    id: videoId,
    title,
    originalName: `${streamKey}.live`,
    status: "processing",
    createdBy: creatorEmail,
    thumbnailPath,
    isLiveArchive: true,
    streamKey,
    error: null,
  });

  const stream = await Stream.create({
    streamKey,
    title,
    creatorEmail,
    thumbnailPath,
    archivedVideoId: videoId,
  });

  return {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Stream created.",
    data: { stream },
  };
};

// ─── Get a single stream by key ───────────────────────────────────────────────
export const getStreamService = async (streamKey: string) => {
  const stream = await Stream.findOne({
    where: { streamKey },
    include: [{ model: User, as: "creator", attributes: ["email", "name"] }],
  });

  if (!stream) {
    return { statusCode: StatusCodes.NOT_FOUND, success: false, message: "Stream not found.", data: null };
  }

  return { statusCode: StatusCodes.OK, success: true, message: "OK", data: { stream } };
};

// ─── List all currently live streams ─────────────────────────────────────────
export const getActiveStreamsService = async () => {
  const streams = await Stream.findAll({
    where: { isLive: true },
    include: [{ model: User, as: "creator", attributes: ["email", "name"] }],
    order: [["createdAt", "DESC"]],
  });

  return { statusCode: StatusCodes.OK, success: true, message: "OK", data: { streams } };
};

// ─── Get streams created by a specific user ───────────────────────────────────
export const getUserStreamsService = async (creatorEmail: string) => {
  const streams = await Stream.findAll({
    where: { creatorEmail },
    order: [["createdAt", "DESC"]],
  });

  return { statusCode: StatusCodes.OK, success: true, message: "OK", data: { streams } };
};

// ─── Mark a stream as ended (REST fallback) ───────────────────────────────────
export const endStreamService = async (streamKey: string, userEmail: string) => {
  const stream = await Stream.findOne({ where: { streamKey } });

  if (!stream) {
    return { statusCode: StatusCodes.NOT_FOUND, success: false, message: "Stream not found.", data: null };
  }
  if (stream.creatorEmail !== userEmail) {
    return { statusCode: StatusCodes.FORBIDDEN, success: false, message: "Not your stream.", data: null };
  }

  await stream.update({ isLive: false });

  return { statusCode: StatusCodes.OK, success: true, message: "Stream ended.", data: null };
};

// ─── Archive an ended stream into its pre-created Video record ────────────────
export const archiveStreamAsVideo = async (stream: Stream, liveHlsDir: string) => {
  try {
    if (!stream.archivedVideoId) {
      console.log(`[Archive] No archivedVideoId on stream ${stream.streamKey}, skipping.`);
      return;
    }

    const files = fs.readdirSync(liveHlsDir);
    const hasSegments = files.some((f) => f.endsWith(".ts"));
    if (!hasSegments) {
      console.log(`[Archive] No segments found for ${stream.streamKey}, skipping.`);
      return;
    }

    const videoDir = path.join(config.hlsOutputDir, stream.archivedVideoId);
    fs.mkdirSync(videoDir, { recursive: true });

    // Copy all HLS files into hls-output/{videoId}/ (thumbnail was already there)
    for (const file of files) {
      const dest = path.join(videoDir, file);
      if (!fs.existsSync(dest)) {
        fs.copyFileSync(path.join(liveHlsDir, file), dest);
      }
    }

    // Write a single-variant master.m3u8 so WatchPage can load it
    const masterContent = [
      "#EXTM3U",
      "#EXT-X-VERSION:3",
      "#EXT-X-STREAM-INF:BANDWIDTH=1500000",
      "index.m3u8",
    ].join("\n");
    fs.writeFileSync(path.join(videoDir, "master.m3u8"), masterContent, "utf8");

    // Mark the pre-created Video record as done
    await Video.update(
      { status: "done" },
      { where: { id: stream.archivedVideoId } }
    );

    console.log(`[Archive] Stream ${stream.streamKey} → video ${stream.archivedVideoId} done`);
  } catch (err) {
    console.error(`[Archive] Failed for ${stream.streamKey}:`, err);
    if (stream.archivedVideoId) {
      await Video.update(
        { status: "error", error: String(err) },
        { where: { id: stream.archivedVideoId } }
      ).catch(() => {});
    }
  }
};
