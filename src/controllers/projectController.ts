import { Model } from "mongoose";
import Project, { IProject } from "../models/projectModel";
import * as factory from "./handlerFactory";

export const getAllProjects = factory.getAll(Project as Model<IProject>);
export const createProject = factory.createOne(Project as Model<IProject>);
export const getProject = factory.getOne(Project as Model<IProject>);
export const updateProject = factory.updateOne(Project as Model<IProject>);
export const deleteProject = factory.deleteOne(Project as Model<IProject>);
