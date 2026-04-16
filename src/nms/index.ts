// @ts-ignore — node-media-server has no bundled TS declarations
import NodeMediaServer from "node-media-server";
import path from "path";

// NMS handles RTMP ingestion on port 1935.
// HLS generation is done directly by the Socket.io FFmpeg pipeline (liveStream.ts),
// so no trans task is needed here.
const nmsConfig = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: 8888,
    mediaroot: path.join(process.cwd(), "live-hls"),
    allow_origin: "*",
  },
};

export const nms = new NodeMediaServer(nmsConfig);
