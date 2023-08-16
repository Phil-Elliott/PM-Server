import mongoose from "mongoose";
import dotenv from "dotenv";
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
