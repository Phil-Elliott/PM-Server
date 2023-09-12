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
exports.deleteTask = exports.updateTask = exports.getAllTasks = exports.getTask = exports.getTasksForSection = exports.createTask = void 0;
const tasksModel_1 = __importDefault(require("../models/tasksModel"));
const factory = __importStar(require("./handlerFactory"));
const catchAsync_1 = require("../utils/catchAsync");
const appError_1 = __importDefault(require("../utils/appError"));
const sectionsModel_1 = __importDefault(require("../models/sectionsModel"));
exports.createTask = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Validation
    const { title, priority, due, project, section } = req.body;
    if (!title || !project || !section) {
        return next(new appError_1.default("Title, project, and section are required fields.", 400));
    }
    // 2. Creation
    const newTask = yield tasksModel_1.default.create({
        title,
        priority,
        due,
        project,
        section,
    });
    // Update the section's ordered_tasks array
    yield sectionsModel_1.default.findByIdAndUpdate(section, {
        $push: {
            tasks: newTask._id,
            ordered_tasks: newTask._id,
        },
    });
    // 3. Response
    res.status(201).json({
        status: "success",
        data: {
            task: newTask,
        },
    });
}));
exports.getTasksForSection = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Validation
    const sectionId = req.params.sectionId;
    if (!sectionId) {
        return next(new appError_1.default("Section ID is required to fetch tasks.", 400));
    }
    // 2. Fetch the section and populate the ordered_tasks field
    const section = yield sectionsModel_1.default.findById(sectionId).populate("ordered_tasks");
    if (!section) {
        return next(new appError_1.default("No section found with the given ID.", 404));
    }
    // 3. Response
    if (!section.ordered_tasks || section.ordered_tasks.length === 0) {
        // Returning a 200 status code indicating no tasks were found
        return res.status(200).json({
            status: "success",
            message: "No tasks found for the given section ID.",
            data: {
                tasks: [],
            },
        });
    }
    res.status(200).json({
        status: "success",
        results: section.ordered_tasks.length,
        data: {
            tasks: section.ordered_tasks,
        },
    });
}));
exports.getTask = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const taskId = req.params.id;
    if (!taskId) {
        return next(new appError_1.default("Task ID is required to fetch the task.", 400));
    }
    const task = yield tasksModel_1.default.findById(taskId)
        .populate({
        path: "comments",
        model: "Comment",
        populate: {
            path: "users_permissions_user",
            model: "User",
        },
    })
        .populate("watching_users")
        .populate("assigned_users");
    if (!task) {
        return next(new appError_1.default("No task found with the given ID.", 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            attributes: task,
        },
    });
}));
exports.getAllTasks = factory.getAll(tasksModel_1.default);
exports.updateTask = factory.updateOne(tasksModel_1.default);
exports.deleteTask = factory.deleteOne(tasksModel_1.default);
