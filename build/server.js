"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../config.env") });
const app_1 = __importDefault(require("./app"));
const DB = (_a = process.env.DATABASE) === null || _a === void 0 ? void 0 : _a.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);
// Check for required environment variables
if (!process.env.DATABASE_PASSWORD || !DB) {
    console.error("Missing required environment variables");
    process.exit(1);
}
mongoose_1.default
    .connect(DB, {
    useUnifiedTopology: true,
})
    .then(() => console.log("DB connection successful!"))
    .catch((err) => {
    console.error("DB connection error:", err);
    process.exit(1);
});
const PORT = +process.env.PORT || 3000;
const server = app_1.default.listen(PORT, (error) => {
    if (error) {
        console.error(`[server]: Error starting server: ${error.message}`);
        return;
    }
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
process.on("SIGTERM", () => {
    console.log("SIGTERM RECEIVED. Shutting down gracefully");
    server.close(() => {
        console.log("Process terminated!");
    });
});
process.on("unhandledRejection", (err) => {
    console.log("UNHANDLED REJECTION! 💥 Shutting down...");
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
