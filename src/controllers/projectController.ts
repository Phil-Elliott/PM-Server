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

export const getAllProjects = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new AppError("You need to be logged in to get projects", 401)
      );
    }

    // Filter projects where user is part of it
    const filter = { users: req.user._id };

    // Retrieve only the titles and backgrounds
    const projects = await Project.find(filter).select("title background");

    res.status(200).json({
      status: "success",
      results: projects.length,
      data: {
        data: projects,
      },
    });
  }
);

export const getProject = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const project = await Project.findById(req.params.id)
      .populate("ordered_sections")
      .populate("users");

    if (!project) {
      return next(new AppError("No project found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        project,
      },
    });
  }
);

export const updateSectionOrder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const projectId = req.params.id;
    const { ordered_sections } = req.body;

    if (!ordered_sections || !Array.isArray(ordered_sections)) {
      return next(
        new AppError("Ordered sections are required and must be an array.", 400)
      );
    }

    try {
      const project = await Project.findByIdAndUpdate(
        projectId,
        {
          ordered_sections,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!project) {
        return next(new AppError("No project found with that ID", 404));
      }

      res.status(200).json({
        status: "success",
        data: {
          project,
        },
      });
    } catch (error) {
      console.error("Error in update operation:", error);
      return next(new AppError("Error updating project.", 500));
    }
  }
);

export const updateProject = factory.updateOne(Project as Model<IProject>);
export const deleteProject = factory.deleteOne(Project as Model<IProject>);
