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
exports.deleteComment = exports.updateComment = exports.getComment = exports.getAllComments = exports.createComment = void 0;
const commentsModel_1 = __importDefault(require("../models/commentsModel"));
const factory = __importStar(require("./handlerFactory"));
const appError_1 = __importDefault(require("../utils/appError"));
const tasksModel_1 = __importDefault(require("../models/tasksModel"));
const catchAsync_1 = require("../utils/catchAsync");
exports.createComment = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Create new comment
    const newComment = yield commentsModel_1.default.create(req.body);
    // Update task with new comment ID
    const updatedTask = yield tasksModel_1.default.findByIdAndUpdate(req.body.task, { $push: { comments: newComment._id } }, { new: true, runValidators: true });
    if (!updatedTask) {
        return next(new appError_1.default("No task found with that ID", 404));
    }
    res.status(201).json({
        status: "success",
        data: {
            comment: newComment,
            task: updatedTask,
        },
    });
}));
exports.getAllComments = factory.getAll(commentsModel_1.default);
exports.getComment = factory.getOne(commentsModel_1.default);
exports.updateComment = factory.updateOne(commentsModel_1.default);
exports.deleteComment = factory.deleteOne(commentsModel_1.default);
