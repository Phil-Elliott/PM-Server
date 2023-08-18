import express from "express";
import { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import AppError from "./utils/appError";
import { auth, requiredScopes } from "express-oauth2-jwt-bearer";

import projectRoutes from "./routes/projectRoutes";
import sectionsRoutes from "./routes/sectionsRoutes";
import tasksRoutes from "./routes/tasksRoutes";

dotenv.config({ path: "./config.env" });

const app = express();

// Global middleware

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rate limiting
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// Body parser
app.use(express.json({ limit: "10kb" }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution (whitelist specific parameters)
app.use(
  hpp({
    whitelist: [],
  })
);

// Set security HTTP headers
app.use(helmet());

app.use(cookieParser());

// Enable CORS
const corsOptions = {
  origin: "http://localhost:3001",
  credentials: true,
};

app.use(cors(corsOptions));

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

// ROUTES

app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/sections", sectionsRoutes);
app.use("/api/v1/tasks", tasksRoutes);

// 404 route
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.statusCode || 500).json({
    status: err.status,
    error: err.message || "Internal Server Error",
  });
});

export default app;

/*
user - 0 auth
projects
Sections
Tasks
Comments
userData(pic etc)

*/
