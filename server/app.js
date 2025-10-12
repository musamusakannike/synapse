require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

const connectDB = require("./config/db.config");
// Import routes
const authRoutes = require("./routes/auth.route");
const chatRoutes = require("./routes/chat.route");
const dashboardRoutes = require("./routes/dashboard.route");
const documentRoutes = require("./routes/document.route");
const flashcardRoutes = require("./routes/flashcard.route");
const quizRoutes = require("./routes/quiz.route");
const topicRoutes = require("./routes/topic.route");
const websiteRoutes = require("./routes/website.route");
const wikipediaRoutes = require("./routes/wikipedia.route");
const ttsRoutes = require("./routes/tts.route");

const app = express();
// Behind a proxy (Render/NGINX), trust X-Forwarded-* headers for correct IP detection
app.set("trust proxy", 1);
connectDB();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(limiter);

app.get("/", (req, res) => {
  return res.redirect(process.env.FRONTEND_URL);
});

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/websites", websiteRoutes);
app.use("/api/wikipedia", wikipediaRoutes);
app.use("/api/tts", ttsRoutes);


module.exports = app;
