import { Request, Response, NextFunction } from "express";
import { Model } from "mongoose";
import Task, { ITask } from "../models/tasksModel";
import * as factory from "./handlerFactory";
import { catchAsync } from "../utils/catchAsync";
import AppError from "../utils/appError";
import Section from "../models/sectionsModel";

export const createTask = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    // 1. Validation
    const { title, priority, due, project, section } = req.body;
    if (!title || !project || !section) {
      return next(
        new AppError("Title, project, and section are required fields.", 400)
      );
    }

    // 2. Creation
    const newTask = await Task.create({
      title,
      priority,
      due,
      project,
      section,
    });

    // Update the section's ordered_tasks array
    await Section.findByIdAndUpdate(section, {
      $push: {
        tasks: newTask._id,
        ordered_tasks: newTask._id,
      },
    });

    // 3. Response
    res.status(201).json({
      status: "success",
      data: {
        task: newTask,
      },
    });
  }
);

export const getTasksForSection = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    // 1. Validation
    const sectionId = req.params.sectionId;
    if (!sectionId) {
      return next(new AppError("Section ID is required to fetch tasks.", 400));
    }

    // 2. Fetch the section and populate the ordered_tasks field
    const section = await Section.findById(sectionId).populate("ordered_tasks");

    if (!section) {
      return next(new AppError("No section found with the given ID.", 404));
    }

    // 3. Response
    if (!section.ordered_tasks || section.ordered_tasks.length === 0) {
      // Returning a 200 status code indicating no tasks were found
      return res.status(200).json({
        status: "success",
        message: "No tasks found for the given section ID.",
        data: {
          tasks: [],
        },
      });
    }

    res.status(200).json({
      status: "success",
      results: section.ordered_tasks.length,
      data: {
        tasks: section.ordered_tasks,
      },
    });
  }
);

export const getTask = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const taskId = req.params.id;

    if (!taskId) {
      return next(new AppError("Task ID is required to fetch the task.", 400));
    }

    const task = await Task.findById(taskId)
      .populate("comments")
      .populate("watching_users")
      .populate("assigned_users");

    if (!task) {
      return next(new AppError("No task found with the given ID.", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        attributes: task,
      },
    });
  }
);

export const getAllTasks = factory.getAll(Task as Model<ITask>);
export const updateTask = factory.updateOne(Task as Model<ITask>);
export const deleteTask = factory.deleteOne(Task as Model<ITask>);
