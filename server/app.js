import express from "express";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { config } from "dotenv";
import connectDB from "./config/db.config.js";

import authRoute from "./routes/auth.route.js";
import chatRoute from "./routes/chat.route.js";
import geminiRoute from "./routes/gemini.route.js";

config();

const app = express();

connectDB();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);

// Routes
app.use("/api/auth", authRoute);
app.use("/api/chats", chatRoute);
app.use("/api/gemini", geminiRoute);

export default app;