const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { authenticate } = require("../middlewares/auth.middleware");
const {
  uploadDocument,
  listDocuments,
  getDocument,
  deleteDocument,
  reprocessDocument,
} = require("../controllers/document.controller");

const router = express.Router();

// Ensure upload directory exists
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

// Routes
router.post("/", authenticate, upload.single("file"), uploadDocument);
router.get("/", authenticate, listDocuments);
router.get("/:id", authenticate, getDocument);
router.delete("/:id", authenticate, deleteDocument);
router.post("/:id/reprocess", authenticate, reprocessDocument);

module.exports = router;