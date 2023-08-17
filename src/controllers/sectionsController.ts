import { Request, Response } from "express";
import Section from "../models/sectionsModel";

export const getAllSections = async (req: Request, res: Response) => {
  try {
    const sections = await Section.find();
    res.status(200).json({
      status: "success",
      results: sections.length,
      data: {
        sections,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: (error as Error).message,
    });
  }
};

export const getSection = async (req: Request, res: Response) => {
  try {
    const section = await Section.findById(req.params.id);
    res.status(200).json({
      status: "success",
      data: {
        section,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: (error as Error).message,
    });
  }
};

export const createSection = async (req: Request, res: Response) => {
  try {
    const newSection = await Section.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        section: newSection,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: (error as Error).message,
    });
  }
};

export const updateSection = async (req: Request, res: Response) => {
  try {
    const section = await Section.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: {
        section,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: (error as Error).message,
    });
  }
};

export const deleteSection = async (req: Request, res: Response) => {
  try {
    await Section.findByIdAndDelete(req.params.id);
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
