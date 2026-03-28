import fs from "fs";
import path from "path";
import { exec } from "child_process";
import config from "../../config/app.config";
import { updateVideoStatus } from "./videoStore.service";
import { FfmpegVariant } from "../../types/config.types";

// ─── Command builder ──────────────────────────────────────────────────────────
const buildFfmpegCommand = (inputPath: string, outputPath: string) => {
  const { variants, hlsTime } = config.ffmpeg;

  const maps = variants.map(() => "-map 0:v:0 -map 0:a:0?").join(" ");

  const videoOpts = variants
    .map((v: FfmpegVariant, i: number) => `-b:v:${i} ${v.videoBitrate} -s:v:${i} ${v.width}x${v.height}`)
    .join(" ");

  const audioOpts = variants
    .map((v: FfmpegVariant, i: number) => `-b:a:${i} ${v.audioBitrate}`)
    .join(" ");

  const streamMap = variants.map((_: FfmpegVariant, i: number) => `v:${i},a:${i}`).join(" ");

  return [
    `ffmpeg -i "${inputPath}"`,
    maps,
    "-c:v h264 -c:a aac",
    videoOpts,
    audioOpts,
    `-var_stream_map "${streamMap}"`,
    "-f hls",
    `-hls_time ${hlsTime}`,
    "-hls_list_size 0",
    `-hls_segment_filename "${outputPath}/v%v/segment_%03d.ts"`,
    "-master_pl_name master.m3u8",
    `"${outputPath}/v%v/index.m3u8"`,
  ].join(" ");
};

// ─── Transcode (fire-and-forget) ──────────────────────────────────────────────
export const transcode = (videoId: string, inputFileName: string) => {
  try {
    const inputPath = path.join(config.uploadsDir, inputFileName);
    const outputDir = path.join(config.hlsOutputDir, videoId);
    // FFmpeg on Windows uses forward slashes in output paths
    const outputPath = outputDir.replace(/\\/g, "/");

    // Pre-create variant subdirectories — FFmpeg won't create them
    config.ffmpeg.variants.forEach((_: FfmpegVariant, i: number) => {
      fs.mkdirSync(path.join(outputDir, `v${i}`), { recursive: true });
    });

    const ffmpegCmd = buildFfmpegCommand(inputPath, outputPath);

    console.log("transcode.service starting for videoId", videoId);
    console.log("transcode.service command", ffmpegCmd);

    exec(ffmpegCmd, { maxBuffer: config.ffmpeg.maxBuffer }, async (error, _stdout, stderr) => {
      if (error) {
        console.log("transcode.service.exec ffmpeg error", error);
        if (stderr) {
          console.log("transcode.service.exec ffmpeg stderr", stderr.slice(-500));
        }
        await updateVideoStatus(videoId, "error", error.message);
        return;
      }

      console.log("transcode.service completed for videoId", videoId);
      await updateVideoStatus(videoId, "done");

      // Store a copy for download before deleting from uploads
      const downloadPath = path.join(outputDir, "download.mp4");
      fs.copyFile(inputPath, downloadPath, (copyErr) => {
        if (copyErr) {
          console.log("transcode.service.cleanup copyFile error", copyErr);
        } else {
          console.log("transcode.service.cleanup created download.mp4 for videoId", videoId);
        }

        // Always remove the raw uploaded file from the temp uploads folder
        fs.unlink(inputPath, (err) => {
          if (err) {
            console.log("transcode.service.cleanup unlink error", err);
          } else {
            console.log("transcode.service.cleanup removed temp upload file", inputFileName);
          }
        });
      });
    });
  } catch (error) {
    console.log("transcode.service.transcode bootstrap error", error);
    updateVideoStatus(videoId, "error", "Transcoding bootstrap failed");
  }
};
