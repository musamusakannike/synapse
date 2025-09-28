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
const documentRoutes = require("./routes/document.route");

const app = express();
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
app.use("/api/documents", documentRoutes);

module.exports = app;
