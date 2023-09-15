"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSection = exports.updateSection = exports.getSection = exports.getAllSections = exports.updateOrderedTasks = exports.createSection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const sectionsModel_1 = __importDefault(require("../models/sectionsModel"));
const factory = __importStar(require("./handlerFactory"));
const catchAsync_1 = require("../utils/catchAsync");
const appError_1 = __importDefault(require("../utils/appError"));
const projectModel_1 = __importDefault(require("../models/projectModel"));
exports.createSection = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Validation
    const { title, order, project } = req.body;
    if (!title || order === undefined || !project) {
        return next(new appError_1.default("Title, order, and project are required fields.", 400));
    }
    // 2. Creation
    const newSection = yield sectionsModel_1.default.create({
        title,
        order,
        project,
    });
    // Update the project's sections and ordered_sections arrays
    yield projectModel_1.default.findByIdAndUpdate(project, {
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
}));
exports.updateOrderedTasks = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { ordered_tasks } = req.body;
    // Ensure ordered_tasks is provided and is an array
    if (!ordered_tasks || !Array.isArray(ordered_tasks)) {
        return next(new appError_1.default("Invalid input for ordered tasks.", 400));
    }
    // Update the section's ordered_tasks array
    const updatedSection = yield sectionsModel_1.default.findByIdAndUpdate(id, {
        ordered_tasks: ordered_tasks.map((taskId) => new mongoose_1.default.Types.ObjectId(taskId)),
    }, {
        new: true,
        runValidators: true,
    });
    if (!updatedSection) {
        return next(new appError_1.default("No section found with that ID.", 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            section: updatedSection,
        },
    });
}));
exports.getAllSections = factory.getAll(sectionsModel_1.default);
exports.getSection = factory.getOne(sectionsModel_1.default);
exports.updateSection = factory.updateOne(sectionsModel_1.default);
exports.deleteSection = factory.deleteOne(sectionsModel_1.default);
