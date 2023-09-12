"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    let error = Object.assign({}, err);
    error.message = err.message;
    // Log to console for the developer
    console.error(err);
    // Mongoose bad ObjectId
    if (err.name === "CastError") {
        const message = `Resource not found with id of ${err.value}`;
        error = new ErrorResponse(message, 404);
    }
    // Mongoose validation error
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors)
            .map((val) => val.message)
            .join(", ");
        error = new ErrorResponse(message, 400);
    }
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || "Server Error",
    });
};
exports.errorHandler = errorHandler;
class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
