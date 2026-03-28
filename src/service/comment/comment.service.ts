import { StatusCodes } from "http-status-codes";
import { Comment, User } from "../../models";
import type { ServiceResult } from "../../types/common.types";

export type CommentRecord = {
  id: string;
  videoId: string;
  userEmail: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  commenter?: { name: string };
};

export const getCommentsService = async (videoId: string): Promise<ServiceResult<CommentRecord[]>> => {
  try {
    const comments = await Comment.findAll({
      where: { videoId },
      include: [{ model: User, as: "commenter", attributes: ["name"] }],
      order: [["createdAt", "ASC"]],
    });
    return {
      success: true,
      data: comments.map((c) => c.get({ plain: true }) as CommentRecord),
      message: "Comments retrieved.",
      statusCode: StatusCodes.OK,
    };
  } catch (error) {
    console.log("comment.service.getCommentsService error", error);
    return {
      success: false,
      data: null,
      message: "Failed to retrieve comments.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};

export const addCommentService = async (
  videoId: string,
  userEmail: string,
  content: string,
  parentId: string | null = null
): Promise<ServiceResult<CommentRecord>> => {
  try {
    const comment = await Comment.create({ videoId, userEmail, content, parentId });
    const withCommenter = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: "commenter", attributes: ["name"] }],
    });
    return {
      success: true,
      data: withCommenter!.get({ plain: true }) as CommentRecord,
      message: "Comment added.",
      statusCode: StatusCodes.CREATED,
    };
  } catch (error) {
    console.log("comment.service.addCommentService error", error);
    return {
      success: false,
      data: null,
      message: "Failed to add comment.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};

export const deleteCommentService = async (
  commentId: string,
  userEmail: string
): Promise<ServiceResult<null>> => {
  try {
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return {
        success: false,
        data: null,
        message: "Comment not found.",
        statusCode: StatusCodes.NOT_FOUND,
      };
    }
    if (comment.userEmail !== userEmail) {
      return {
        success: false,
        data: null,
        message: "Not authorised to delete this comment.",
        statusCode: StatusCodes.FORBIDDEN,
      };
    }
    await comment.destroy();
    return { success: true, data: null, message: "Comment deleted.", statusCode: StatusCodes.OK };
  } catch (error) {
    console.log("comment.service.deleteCommentService error", error);
    return {
      success: false,
      data: null,
      message: "Failed to delete comment.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};
