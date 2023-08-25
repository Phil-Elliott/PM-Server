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

    // 2. Fetch tasks
    const tasks = await Task.find({ section: sectionId });

    // 3. Response
    if (!tasks) {
      return next(
        new AppError("No tasks found for the given section ID.", 404)
      );
    }

    res.status(200).json({
      status: "success",
      results: tasks.length,
      data: {
        tasks: tasks,
      },
    });
  }
);

export const getAllTasks = factory.getAll(Task as Model<ITask>);
export const getTask = factory.getOne(Task as Model<ITask>);
export const updateTask = factory.updateOne(Task as Model<ITask>);
export const deleteTask = factory.deleteOne(Task as Model<ITask>);
