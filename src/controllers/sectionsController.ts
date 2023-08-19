import { Model } from "mongoose";
import Section, { ISection } from "../models/sectionsModel";
import * as factory from "./handlerFactory";

export const getAllSections = factory.getAll(Section as Model<ISection>);
export const getSection = factory.getOne(Section as Model<ISection>);
export const createSection = factory.createOne(Section as Model<ISection>);
export const updateSection = factory.updateOne(Section as Model<ISection>);
export const deleteSection = factory.deleteOne(Section as Model<ISection>);
