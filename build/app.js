"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const xss_clean_1 = __importDefault(require("xss-clean"));
const hpp_1 = __importDefault(require("hpp"));
const appError_1 = __importDefault(require("./utils/appError"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const sectionsRoutes_1 = __importDefault(require("./routes/sectionsRoutes"));
const tasksRoutes_1 = __importDefault(require("./routes/tasksRoutes"));
const commentsRoutes_1 = __importDefault(require("./routes/commentsRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
dotenv_1.default.config({ path: "./config.env" });
const app = (0, express_1.default)();
// Trust first proxy
app.set("trust proxy", 1);
// Global middleware
// Development logging
if (process.env.NODE_ENV === "development") {
    app.use((0, morgan_1.default)("dev"));
}
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    max: 1000,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);
// Body parser
app.use(express_1.default.json({ limit: "10kb" }));
// Data sanitization against NoSQL query injection
app.use((0, express_mongo_sanitize_1.default)());
// Data sanitization against XSS
app.use((0, xss_clean_1.default)());
// Prevent parameter pollution (whitelist specific parameters)
app.use((0, hpp_1.default)({
    whitelist: [],
}));
// Set security HTTP headers
app.use((0, helmet_1.default)());
app.use((0, cookie_parser_1.default)());
// Enable CORS
const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
// ROUTES
app.use("/api/v1/projects", projectRoutes_1.default);
app.use("/api/v1/sections", sectionsRoutes_1.default);
app.use("/api/v1/tasks", tasksRoutes_1.default);
app.use("/api/v1/comments", commentsRoutes_1.default);
app.use("/api/v1/auth", authRoutes_1.default);
app.use("/api/v1/users", userRoutes_1.default);
// 404 route
app.all("*", (req, res, next) => {
    next(new appError_1.default(`Can't find ${req.originalUrl} on this server!`, 404));
});
// Error handling middleware
app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        status: err.status,
        error: err.message || "Internal Server Error",
    });
});
exports.default = app;
/*

- Finish connecting everything
- Clean stuff up
- Have cascade delete for everything



user - 0 auth
projects
Sections
Tasks
Comments
userData(pic etc)


- try using auth in postman
- get it working with app
- start working on and connecting everything else
- add auth to all of the routes (do this as you add it to the frontend)
- figure out how to add profile stuff to the user
- start connecting everything

- add auth0 to other app or maybe just keep using it here








import { auth, requiredScopes } from "express-oauth2-jwt-bearer";


// Authorization middleware setup
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
});

const checkScopes = requiredScopes("read:messages");

app.get("/api/private-scoped", checkJwt, checkScopes, (req, res) => {
  res.json({
    message:
      "Hello from a private endpoint! You need to be authenticated and have a scope of read:messages to see this.",
  });
});


*/
