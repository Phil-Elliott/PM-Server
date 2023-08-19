import { Model } from "mongoose";
import Task, { ITask } from "../models/tasksModel";
import * as factory from "./handlerFactory";

export const getAllTasks = factory.getAll(Task as Model<ITask>);
export const getTask = factory.getOne(Task as Model<ITask>);
export const createTask = factory.createOne(Task as Model<ITask>);
export const updateTask = factory.updateOne(Task as Model<ITask>);
export const deleteTask = factory.deleteOne(Task as Model<ITask>);
