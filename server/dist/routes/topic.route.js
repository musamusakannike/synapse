"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const topic_controller_1 = require("../controllers/topic.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const access_middleware_1 = require("../middlewares/access.middleware");
const topic_validation_1 = require("../validations/topic.validation");
const router = (0, express_1.Router)();
// Topic titles stay visible even for locked courses (acts as a preview/marketing list);
// the full topic (its lesson `contents`) is the actual paid material, so that's gated.
router.get('/course/:courseId', topic_controller_1.getTopicsByCourse);
router.get('/:id', auth_middleware_1.protect, (0, access_middleware_1.requireCourseAccess)((0, access_middleware_1.resolveCourseIdFromTopicParam)('id')), topic_controller_1.getTopicById);
router.post('/', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), topic_validation_1.validateCreateTopic, topic_controller_1.createTopic);
router.put('/reorder', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), topic_controller_1.reorderTopics);
router.put('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), topic_validation_1.validateUpdateTopic, topic_controller_1.updateTopic);
router.delete('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), topic_controller_1.deleteTopic);
exports.default = router;
