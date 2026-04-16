import { Server as HTTPServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import { spawn, ChildProcess } from "child_process";
import fs from "fs";
import path from "path";
import { Stream } from "../models/Stream";
import { archiveStreamAsVideo } from "../service/live/live.service";

const activeFFmpeg = new Map<string, ChildProcess>();
// Track viewer socket IDs per stream room (excludes broadcaster)
const roomViewers = new Map<string, Set<string>>();

function broadcastViewerCount(io: SocketServer, streamKey: string) {
  const count = roomViewers.get(streamKey)?.size ?? 0;
  io.to(`room:${streamKey}`).emit("viewer:count", { count });
}

export function setupLiveSocket(httpServer: HTTPServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    let broadcasterStreamKey: string | null = null;
    // Track which rooms this viewer socket has joined so we can clean up on disconnect
    const viewerRooms = new Set<string>();

    // ── Broadcaster: start streaming ───────────────────────────────────────────
    socket.on("broadcaster:start", async (data: { streamKey: string }) => {
      const { streamKey } = data;
      broadcasterStreamKey = streamKey;

      if (activeFFmpeg.has(streamKey)) {
        activeFFmpeg.get(streamKey)!.stdin?.end();
        activeFFmpeg.delete(streamKey);
      }

      const outputDir = path.join(process.cwd(), "live-hls", "live", streamKey);
      fs.mkdirSync(outputDir, { recursive: true });

      const playlistPath = path.join(outputDir, "index.m3u8");
      const segmentPattern = path.join(outputDir, "seg_%05d.ts");

      const ffmpeg = spawn("ffmpeg", [
        "-i", "pipe:0",
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-tune", "zerolatency",
        "-profile:v", "baseline",
        "-level", "3.0",
        "-g", "30",
        "-c:a", "aac",
        "-ar", "44100",
        "-b:a", "128k",
        "-f", "hls",
        "-hls_time", "2",
        "-hls_list_size", "0",       // keep ALL segments — required for DVR seek + archiving
        "-hls_flags", "append_list", // never delete segments
        "-hls_segment_filename", segmentPattern,
        playlistPath,
      ]);

      ffmpeg.stderr?.on("data", (_chunk: Buffer) => {
        // process.stdout.write(`[FFmpeg:${streamKey}] ${_chunk.toString()}`);
      });

      ffmpeg.on("close", async (code) => {
        console.log(`[FFmpeg:${streamKey}] process exited (code ${code})`);
        activeFFmpeg.delete(streamKey);
        try {
          const stream = await Stream.findOne({ where: { streamKey } });
          if (stream) await archiveStreamAsVideo(stream, outputDir);
        } catch (err) {
          console.error(`[Live] Archive failed for ${streamKey}:`, err);
        }
      });

      ffmpeg.on("error", (err) => {
        console.error(`[FFmpeg:${streamKey}] spawn error:`, err.message);
        socket.emit("stream:error", { message: "FFmpeg failed to start. Is ffmpeg installed and on PATH?" });
      });

      activeFFmpeg.set(streamKey, ffmpeg);
      // Broadcaster joins the room so they receive viewer:count updates
      socket.join(`room:${streamKey}`);
      if (!roomViewers.has(streamKey)) roomViewers.set(streamKey, new Set());

      await Stream.update({ isLive: true }, { where: { streamKey } });
      socket.to(`room:${streamKey}`).emit("stream:started", { streamKey });
      broadcastViewerCount(io, streamKey);

      console.log(`[Live] Stream started: ${streamKey} → ${playlistPath}`);
    });

    // ── Broadcaster: video chunk → FFmpeg stdin ────────────────────────────────
    socket.on("broadcaster:chunk", (chunk: ArrayBuffer | Buffer) => {
      const ffmpeg = broadcasterStreamKey ? activeFFmpeg.get(broadcasterStreamKey) : null;
      if (ffmpeg?.stdin && !ffmpeg.stdin.destroyed) {
        ffmpeg.stdin.write(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
    });

    // ── Broadcaster: stop ──────────────────────────────────────────────────────
    socket.on("broadcaster:stop", async () => {
      await endBroadcast(socket, io, broadcasterStreamKey);
      broadcasterStreamKey = null;
    });

    // ── Viewer: join ───────────────────────────────────────────────────────────
    socket.on("viewer:join", (data: { streamKey: string }) => {
      const { streamKey } = data;
      socket.join(`room:${streamKey}`);
      viewerRooms.add(streamKey);
      if (!roomViewers.has(streamKey)) roomViewers.set(streamKey, new Set());
      roomViewers.get(streamKey)!.add(socket.id);
      broadcastViewerCount(io, streamKey);
    });

    // ── Viewer: leave ──────────────────────────────────────────────────────────
    socket.on("viewer:leave", (data: { streamKey: string }) => {
      const { streamKey } = data;
      socket.leave(`room:${streamKey}`);
      viewerRooms.delete(streamKey);
      roomViewers.get(streamKey)?.delete(socket.id);
      broadcastViewerCount(io, streamKey);
    });

    // ── Disconnect: clean up viewer counts ────────────────────────────────────
    socket.on("disconnect", async () => {
      // Remove from all viewer rooms
      for (const streamKey of viewerRooms) {
        roomViewers.get(streamKey)?.delete(socket.id);
        broadcastViewerCount(io, streamKey);
      }
      viewerRooms.clear();

      if (broadcasterStreamKey) {
        await endBroadcast(socket, io, broadcasterStreamKey);
      }
    });
  });

  return io;
}

async function endBroadcast(socket: Socket, io: SocketServer, streamKey: string | null) {
  if (!streamKey) return;
  const ffmpeg = activeFFmpeg.get(streamKey);
  if (ffmpeg) ffmpeg.stdin?.end();
  await Stream.update({ isLive: false }, { where: { streamKey } }).catch(() => {});
  roomViewers.delete(streamKey);
  io.to(`room:${streamKey}`).emit("stream:ended", { streamKey });
  console.log(`[Live] Stream ended: ${streamKey}`);
}
