import mongoose from "mongoose";
import dotenv from "dotenv";
import { auth, requiredScopes } from "express-oauth2-jwt-bearer";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../config.env") });

import app from "./app";

const DB: string | undefined = process.env.DATABASE?.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD!
);

// Check for required environment variables
if (!process.env.DATABASE_PASSWORD || !DB) {
  console.error("Missing required environment variables");
  process.exit(1);
}

mongoose
  .connect(DB, {
    useUnifiedTopology: true,
  } as mongoose.ConnectOptions)
  .then(() => console.log("DB connection successful!"))
  .catch((err) => {
    console.error("DB connection error:", err);
    process.exit(1);
  });

const PORT: number = +process.env.PORT! || 3000;

// Authorization middleware setup
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE!,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL!,
});

const checkScopes = requiredScopes("read:messages");

app.get("/api/private-scoped", checkJwt, checkScopes, (req, res) => {
  res.json({
    message:
      "Hello from a private endpoint! You need to be authenticated and have a scope of read:messages to see this.",
  });
});

const server = app.listen(PORT, (error?: any) => {
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

process.on("unhandledRejection", (err: any) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
