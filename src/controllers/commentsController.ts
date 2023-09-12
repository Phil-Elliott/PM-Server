import { Model } from "mongoose";
import Comment, { IComment } from "../models/commentsModel";
import * as factory from "./handlerFactory";
import AppError from "../utils/appError";
import Task from "../models/tasksModel";
import { catchAsync } from "../utils/catchAsync";

export const createComment = catchAsync(async (req, res, next) => {
  // Create new comment
  const newComment = await Comment.create(req.body);

  // Update task with new comment ID
  const updatedTask = await Task.findByIdAndUpdate(
    req.body.task,
    { $push: { comments: newComment._id } },
    { new: true, runValidators: true }
  );

  if (!updatedTask) {
    return next(new AppError("No task found with that ID", 404));
  }

  res.status(201).json({
    status: "success",
    data: {
      comment: newComment,
      task: updatedTask,
    },
  });
});

export const getAllComments = factory.getAll(Comment as Model<IComment>);
export const getComment = factory.getOne(Comment as Model<IComment>);
export const updateComment = factory.updateOne(Comment as Model<IComment>);
export const deleteComment = factory.deleteOne(Comment as Model<IComment>);
