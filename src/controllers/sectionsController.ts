import { Request, Response, NextFunction } from "express";
import mongoose, { Model } from "mongoose";
import Section, { ISection } from "../models/sectionsModel";
import * as factory from "./handlerFactory";
import { catchAsync } from "../utils/catchAsync";
import AppError from "../utils/appError";
import Project from "../models/projectModel";

export const createSection = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    // 1. Validation
    const { title, order, project } = req.body;
    if (!title || order === undefined || !project) {
      return next(
        new AppError("Title, order, and project are required fields.", 400)
      );
    }

    // 2. Creation
    const newSection = await Section.create({
      title,
      order,
      project,
    });

    // Update the project's sections and ordered_sections arrays
    await Project.findByIdAndUpdate(project, {
      $push: {
        sections: newSection._id,
        ordered_sections: newSection._id,
      },
    });

    // 3. Response
    res.status(201).json({
      status: "success",
      data: {
        section: newSection,
      },
    });
  }
);

export const updateOrderedTasks = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { ordered_tasks } = req.body;

    // Ensure ordered_tasks is provided and is an array
    if (!ordered_tasks || !Array.isArray(ordered_tasks)) {
      return next(new AppError("Invalid input for ordered tasks.", 400));
    }

    // Update the section's ordered_tasks array
    const updatedSection = await Section.findByIdAndUpdate(
      id,
      {
        ordered_tasks: ordered_tasks.map(
          (taskId) => new mongoose.Types.ObjectId(taskId)
        ),
      },
      {
        new: true, // This option ensures the updated document is returned
        runValidators: true, // Ensure the update respects model validation
      }
    );

    if (!updatedSection) {
      return next(new AppError("No section found with that ID.", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        section: updatedSection,
      },
    });
  }
);

export const getAllSections = factory.getAll(Section as Model<ISection>);
export const getSection = factory.getOne(Section as Model<ISection>);
export const updateSection = factory.updateOne(Section as Model<ISection>);
export const deleteSection = factory.deleteOne(Section as Model<ISection>);
