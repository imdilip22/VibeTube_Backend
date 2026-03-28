import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { AuthenticatedRequest } from "../../types/auth.types";
import { getCommentsService, addCommentService, deleteCommentService } from "../../service/comment/comment.service";

export const getCommentsController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await getCommentsService(req.params.videoId as string);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("comment.controller.getCommentsController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error." });
  }
};

export const addCommentController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const content = (req.body.content as string)?.trim();
    if (!content) {
      res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Comment content is required." });
      return;
    }
    const result = await addCommentService(req.params.videoId as string, req.user!.email, content, req.body.parentId as string);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("comment.controller.addCommentController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error." });
  }
};

export const deleteCommentController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await deleteCommentService(req.params.commentId as string, req.user!.email);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("comment.controller.deleteCommentController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error." });
  }
};
