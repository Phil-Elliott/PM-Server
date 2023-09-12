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
exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = exports.getUserByEmail = exports.getMe = exports.deleteMe = exports.updateMe = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const catchAsync_1 = require("../utils/catchAsync");
const appError_1 = __importDefault(require("../utils/appError"));
const factory = __importStar(require("./handlerFactory"));
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el))
            newObj[el] = obj[el];
    });
    return newObj;
};
exports.updateMe = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Preventing password updates through this route
    if (req.body.password || req.body.passwordConfirm) {
        return next(new appError_1.default("This route is not for password updates. Please use /updatePassword", 400));
    }
    // Create a new object with only the fields we want to allow updates for
    const fieldsToUpdate = {
        email: req.body.email,
        name: req.body.name,
        avatar: req.body.avatar,
    };
    // Filter out undefined fields to prevent accidental overwrite with undefined
    const filteredBody = Object.fromEntries(Object.entries(fieldsToUpdate).filter(([_, value]) => value !== undefined));
    const updatedUser = yield userModel_1.default.findByIdAndUpdate((_a = req.user) === null || _a === void 0 ? void 0 : _a.id, filteredBody, {
        new: true,
        runValidators: true,
    });
    if (!updatedUser) {
        return next(new appError_1.default("Error updating user details", 400));
    }
    res.status(200).json({
        status: "success",
        data: {
            user: updatedUser,
        },
    });
}));
exports.deleteMe = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    // Find the user by ID
    const user = yield userModel_1.default.findById((_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
    // Check if the user was found
    if (!user) {
        return next(new appError_1.default("No user found with that ID", 404));
    }
    // Delete the user (this will trigger the deleteOne middleware)
    yield user.deleteOne();
    // clear the cookie
    res.clearCookie("jwt");
    res.status(204).json({
        status: "success",
        data: null,
    });
}));
exports.getMe = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req, "req");
    if (!req.user || !req.user.id) {
        return next(new appError_1.default("User not authenticated", 401)); // or some other error handling
    }
    req.params.id = req.user.id;
    next();
}));
const getUserByEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the email from the request parameters
        const email = req.params.email;
        if (!email) {
            return next(new appError_1.default("Email is required to fetch the user.", 400));
        }
        // Find the user by email
        const user = yield userModel_1.default.findOne({ email });
        if (!user) {
            return next(new appError_1.default("No user found with the given email.", 404));
        }
        // Send back the user details
        res.status(200).json({
            status: "success",
            data: {
                id: user._id,
                name: user.name,
                avatar: user.avatar,
            },
        });
    }
    catch (err) {
        return next(new appError_1.default("An error occurred while fetching the user.", 500));
    }
});
exports.getUserByEmail = getUserByEmail;
exports.getAllUsers = factory.getAll(userModel_1.default);
exports.getUserById = factory.getOne(userModel_1.default);
exports.updateUser = factory.updateOne(userModel_1.default);
exports.deleteUser = factory.deleteOne(userModel_1.default);
