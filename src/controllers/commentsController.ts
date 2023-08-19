import { Model } from "mongoose";
import Comment, { IComment } from "../models/commentsModel";
import * as factory from "./handlerFactory";

export const getAllComments = factory.getAll(Comment as Model<IComment>);
export const getComment = factory.getOne(Comment as Model<IComment>);
export const updateComment = factory.updateOne(Comment as Model<IComment>);
export const deleteComment = factory.deleteOne(Comment as Model<IComment>);
export const createComment = factory.createOne(Comment as Model<IComment>);
