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

import projectRoutes from "./routes/projectRoutes";
import sectionsRoutes from "./routes/sectionsRoutes";
import tasksRoutes from "./routes/tasksRoutes";
import commentsRoutes from "./routes/commentsRoutes";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";

dotenv.config({ path: "./config.env" });

const app = express();

// Trust first proxy
app.set("trust proxy", 1);

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
  // origin: "https://timely-lollipop-f90b7b.netlify.app",
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));

// ROUTES

app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/sections", sectionsRoutes);
app.use("/api/v1/tasks", tasksRoutes);
app.use("/api/v1/comments", commentsRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

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
