"use strict";
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
exports.updatePassword = exports.resetPassword = exports.forgotPassword = exports.restrictTo = exports.protect = exports.login = exports.register = exports.logout = void 0;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../models/userModel"));
const catchAsync_1 = require("../utils/catchAsync");
const appError_1 = __importDefault(require("../utils/appError"));
const email_1 = __importDefault(require("../utils/email"));
const signToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() +
            parseInt(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true,
        sameSite: "none",
    };
    if (process.env.NODE_ENV === "production")
        cookieOptions.secure = true;
    res.cookie("jwt", token, cookieOptions);
    user.password = undefined;
    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user,
        },
    });
};
const logout = (req, res) => {
    res.cookie("jwt", "loggedout", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ status: "success" });
};
exports.logout = logout;
exports.register = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user) {
        (0, exports.logout)(req, res);
    }
    const userExists = yield userModel_1.default.findOne({ email: req.body.email });
    if (userExists) {
        return res.json("User already exists");
    }
    const newUser = yield userModel_1.default.create(req.body);
    createSendToken(newUser, 201, res);
}));
exports.login = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user) {
        (0, exports.logout)(req, res);
    }
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new appError_1.default("Please provide email and password!", 400));
    }
    const user = yield userModel_1.default.findOne({ email }).select("+password");
    if (!user || !(yield user.correctPassword(password, user.password))) {
        return next(new appError_1.default("Incorrect email or password", 401));
    }
    createSendToken(user, 200, res);
}));
exports.protect = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token) {
        return next(new appError_1.default("You are not logged in! Please log in to get access.", 401));
    }
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    if (!decoded.id || !decoded.iat) {
        return next(new appError_1.default("Invalid token", 401));
    }
    const freshUser = yield userModel_1.default.findById(decoded.id);
    if (!freshUser || freshUser.changedPasswordAfter(decoded.iat)) {
        return next(new appError_1.default("Token is invalid or has expired", 401));
    }
    req.user = freshUser;
    next();
}));
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new appError_1.default("You do not have permission to perform this action", 403));
        }
        next();
    };
};
exports.restrictTo = restrictTo;
exports.forgotPassword = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield userModel_1.default.findOne({ email: req.body.email });
    if (!user) {
        return next(new appError_1.default("There is no user with that email address", 404));
    }
    const resetToken = user.createPasswordResetToken();
    yield user.save({ validateBeforeSave: false });
    const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
    try {
        yield (0, email_1.default)({
            email: user.email,
            subject: "Your password reset token (valid for 10 minutes)",
            message,
        });
        res.status(200).json({
            status: "success",
            message: "Token sent to email!",
        });
    }
    catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        yield user.save({ validateBeforeSave: false });
        return next(new appError_1.default("There was an error sending the email. Try again later!", 500));
    }
}));
exports.resetPassword = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Get user based on the token
    const hashedToken = crypto_1.default
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
    const user = yield userModel_1.default.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    // Check if token has not expired and if there is a user
    if (!user) {
        return next(new appError_1.default("Token is invalid or has expired", 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    yield user.save();
    // Log the user in, Set the JWT token as a cookie in the response
    const token = signToken(user._id.toString());
    res.cookie("token", token).status(200).json({
        status: "success",
        token,
    });
}));
exports.updatePassword = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !req.user.id) {
        return next(new appError_1.default("No user found", 401));
    }
    // Get user from collection
    const user = yield userModel_1.default.findById(req.user.id).select("+password");
    if (!user) {
        return next(new appError_1.default("User not found", 404));
    }
    if (!req.body.passwordCurrent ||
        !(yield user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new appError_1.default("Your current password is wrong", 401));
    }
    if (!req.body.password || !req.body.passwordConfirm) {
        return next(new appError_1.default("Password and confirm password are required", 400));
    }
    // Update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    yield user.save();
    // Log user in, send JWT
    const token = signToken(user._id.toString());
    res.cookie("token", token).status(200).json({
        status: "success",
        token,
    });
}));
