import { Request, Response, NextFunction } from "express";
import { Model } from "mongoose";
import { catchAsync } from "../utils/catchAsync";
import * as factory from "./handlerFactory";
import Project, { IProject } from "../models/projectModel";
import AppError from "../utils/appError";

export const createProject = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    // Check if user is authenticated
    if (!req.user) {
      return next(
        new AppError("You need to be logged in to create a project", 401)
      );
    }

    const userId = req.user._id;

    // Validate request body
    if (!req.body.title || !req.body.background) {
      return next(new AppError("A project must have a title", 400));
    }

    const newProjectData = {
      ...req.body,
      users: [userId, ...(req.body.users || [])],
    };

    const newProject = await Project.create(newProjectData as IProject);

    res.status(201).json({
      status: "success",
      data: {
        project: newProject,
      },
    });
  }
);

export const getAllProjects = factory.getAll(Project as Model<IProject>);
export const getProject = factory.getOne(Project as Model<IProject>);
export const updateProject = factory.updateOne(Project as Model<IProject>);
export const deleteProject = factory.deleteOne(Project as Model<IProject>);
