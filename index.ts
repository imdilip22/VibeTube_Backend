import serverless from "serverless-http";
import express from "express";
import "dotenv/config";
import cors from "cors";
import path from "path";
import bodyParser from "body-parser";
import { router } from "./src/routes/common/routes";
import cookieParser from "cookie-parser";
import { Request, Response } from "express";
import { connectDB } from "./src/config/database";
import { errorHandler } from "./src/middleware/errorHandler.middleware";
// Load models so associations are registered at startup
import "./src/models/index";

const app = express();
const cloudFrontURL = process.env.CLOUDFRONT_URL;

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// ─── Serve HLS output as static files for video playback ──────────────────────
app.use("/hls-output", express.static(path.join(process.cwd(), "hls-output")));

app.use("/health", (req: Request, res: Response) => {
  res.status(200).json({ message: "OK" });
});

app.use("/api/v1", router);

// Global error handler — must be registered after all routes
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(process.env.PORT ?? 3000, () => {
      console.log(`Server is running on port http://localhost:${process.env.PORT ?? 3000}`);
    });
  } catch (error) {
    console.log("startServer failed to start", error);
    process.exit(1);
  }
};

startServer();

export const handler = serverless(app);
