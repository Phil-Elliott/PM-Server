import { Request, Response, NextFunction } from "express";
import Comment from "../models/commentsModel";

export const getAllComments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const comments = await Comment.find();
    res.status(200).json({
      status: "success",
      results: comments.length,
      data: {
        comments,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: (error as Error).message,
    });
  }
};

export const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const newComment = await Comment.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        comment: newComment,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: (error as Error).message,
    });
  }
};

export const getComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({
        status: "fail",
        message: "No comment found with that ID",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        comment,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: (error as Error).message,
    });
  }
};

export const updateComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedComment) {
      return res.status(404).json({
        status: "fail",
        message: "No comment found with that ID",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        comment: updatedComment,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: (error as Error).message,
    });
  }
};

export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) {
      return res.status(404).json({
        status: "fail",
        message: "No comment found with that ID",
      });
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: (error as Error).message,
    });
  }
};
