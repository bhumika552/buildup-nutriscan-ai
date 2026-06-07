const express = require("express");
const router = express.Router();
const multer = require("multer");

const { analyzeFood, getScans, deleteScans } = require("../controllers/foodController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

// file upload setup
const upload = multer({ dest: "uploads/" });

// routes
router.post("/analyze", optionalAuth, upload.single("image"), analyzeFood);
router.get("/scans", protect, getScans);
router.delete("/scans", protect, deleteScans);

module.exports = router;