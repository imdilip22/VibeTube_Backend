import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

// Global error-handling middleware — must have exactly 4 params so Express
// recognises it as an error handler (not a regular middleware).
export const errorHandler = (
  err: Error & { statusCode?: number },
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    console.log("errorHandler.multer error", err);
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
    return;
  }

  const statusCode =
    err.statusCode && err.statusCode < StatusCodes.INTERNAL_SERVER_ERROR
      ? err.statusCode
      : StatusCodes.INTERNAL_SERVER_ERROR;

  const message =
    statusCode >= StatusCodes.INTERNAL_SERVER_ERROR
      ? "Internal server error."
      : err.message;

  console.log("errorHandler.unhandled error", err);
  res.status(statusCode).json({ success: false, message });
};
