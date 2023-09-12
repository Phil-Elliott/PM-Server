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
exports.deleteProject = exports.updateProject = exports.addUserToProject = exports.updateSectionOrder = exports.getProject = exports.getAllProjects = exports.createProject = void 0;
const catchAsync_1 = require("../utils/catchAsync");
const factory = __importStar(require("./handlerFactory"));
const projectModel_1 = __importDefault(require("../models/projectModel"));
const appError_1 = __importDefault(require("../utils/appError"));
exports.createProject = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if user is authenticated
    if (!req.user) {
        return next(new appError_1.default("You need to be logged in to create a project", 401));
    }
    const userId = req.user._id;
    // Validate request body
    if (!req.body.title || !req.body.background) {
        return next(new appError_1.default("A project must have a title", 400));
    }
    const newProjectData = Object.assign(Object.assign({}, req.body), { users: [userId, ...(req.body.users || [])] });
    const newProject = yield projectModel_1.default.create(newProjectData);
    res.status(201).json({
        status: "success",
        data: {
            project: newProject,
        },
    });
}));
exports.getAllProjects = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return next(new appError_1.default("You need to be logged in to get projects", 401));
    }
    // Filter projects where user is part of it
    const filter = { users: req.user._id };
    // Retrieve only the titles and backgrounds
    const projects = yield projectModel_1.default.find(filter).select("title background");
    res.status(200).json({
        status: "success",
        results: projects.length,
        data: {
            data: projects,
        },
    });
}));
exports.getProject = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const project = yield projectModel_1.default.findById(req.params.id)
        .populate("ordered_sections")
        .populate("users");
    if (!project) {
        return next(new appError_1.default("No project found with that ID", 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            project,
        },
    });
}));
exports.updateSectionOrder = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const projectId = req.params.id;
    const { ordered_sections } = req.body;
    if (!ordered_sections || !Array.isArray(ordered_sections)) {
        return next(new appError_1.default("Ordered sections are required and must be an array.", 400));
    }
    try {
        const project = yield projectModel_1.default.findByIdAndUpdate(projectId, {
            ordered_sections,
        }, {
            new: true,
            runValidators: true,
        });
        if (!project) {
            return next(new appError_1.default("No project found with that ID", 404));
        }
        res.status(200).json({
            status: "success",
            data: {
                project,
            },
        });
    }
    catch (error) {
        console.error("Error in update operation:", error);
        return next(new appError_1.default("Error updating project.", 500));
    }
}));
exports.addUserToProject = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Fetch the project by its ID
    const project = yield projectModel_1.default.findById(req.params.id);
    // Validate that project exists
    if (!project) {
        return next(new appError_1.default("No project found with that ID", 404));
    }
    // Fetch the user ID
    const userId = req.body.userId;
    // Validate that userId is provided
    if (!userId) {
        return next(new appError_1.default("User ID must be provided", 400));
    }
    // Add the user ID to the project's users array
    project.users.push(userId);
    // Save the updated project
    yield project.save();
    res.status(200).json({
        status: "success",
        data: {
            project,
        },
    });
}));
exports.updateProject = factory.updateOne(projectModel_1.default);
exports.deleteProject = factory.deleteOne(projectModel_1.default);
