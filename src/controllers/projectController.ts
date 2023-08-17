import Project from "../models/projectModel";
import { Request, Response, NextFunction } from "express";

// Fetch all projects
export const getAllProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const projects = await Project.find();
    res.status(200).json({
      status: "success",
      data: {
        projects,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: (error as Error).message,
    });
  }
};

// Create a new project
export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        project,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: (error as Error).message,
    });
  }
};

// Fetch a single project by ID
export const getProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        status: "fail",
        message: "No project found with that ID",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        project,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: (error as Error).message,
    });
  }
};

// Update a project by ID
export const updateProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!project) {
      return res.status(404).json({
        status: "fail",
        message: "No project found with that ID",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        project,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: (error as Error).message,
    });
  }
};

// Delete a project by ID
export const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({
        status: "fail",
        message: "No project found with that ID",
      });
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: (error as Error).message,
    });
  }
};
