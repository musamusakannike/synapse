"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Initialize environment variables first
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const db_config_1 = require("./config/db.config");
const firebase_config_1 = require("./config/firebase.config");
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const course_route_1 = __importDefault(require("./routes/course.route"));
const topic_route_1 = __importDefault(require("./routes/topic.route"));
const flashcard_route_1 = __importDefault(require("./routes/flashcard.route"));
const mcq_route_1 = __importDefault(require("./routes/mcq.route"));
const progress_route_1 = __importDefault(require("./routes/progress.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const notification_route_1 = __importDefault(require("./routes/notification.route"));
const admin_route_1 = __importDefault(require("./routes/admin.route"));
const search_route_1 = __importDefault(require("./routes/search.route"));
const media_route_1 = __importDefault(require("./routes/media.route"));
const payment_route_1 = __importDefault(require("./routes/payment.route"));
const blog_route_1 = __importDefault(require("./routes/blog.route"));
const ai_route_1 = __importDefault(require("./routes/ai.route"));
const error_middleware_1 = require("./middlewares/error.middleware");
const scheduler_1 = require("./jobs/scheduler");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Initialize Database connection
(0, db_config_1.connectDB)();
// Initialize Firebase Admin
(0, firebase_config_1.initFirebase)();
// Global Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
}));
// Mounted before express.json() so the webhook route's express.raw() middleware
// sees the untouched request body — required for Paystack signature verification.
app.use('/api/v1/payments', payment_route_1.default);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging
app.use((0, morgan_1.default)('dev'));
// Base/Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
// API Routes
app.use('/api/v1/auth', auth_route_1.default);
app.use('/api/v1/courses', course_route_1.default);
app.use('/api/v1/topics', topic_route_1.default);
app.use('/api/v1/flashcards', flashcard_route_1.default);
app.use('/api/v1/mcqs', mcq_route_1.default);
app.use('/api/v1/progress', progress_route_1.default);
app.use('/api/v1/users', user_route_1.default);
app.use('/api/v1/notifications', notification_route_1.default);
app.use('/api/v1/admin', admin_route_1.default);
app.use('/api/v1/search', search_route_1.default);
app.use('/api/v1/media', media_route_1.default);
app.use('/api/v1/blog', blog_route_1.default);
app.use('/api/v1/ai', ai_route_1.default);
// Handle 404 routes
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'API endpoint not found.' });
});
// Global Error Handling Middleware
app.use(error_middleware_1.errorHandler);
// Start listening for requests
app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    // Started after listen so a scheduler fault can never block the port binding.
    (0, scheduler_1.startScheduler)();
});
