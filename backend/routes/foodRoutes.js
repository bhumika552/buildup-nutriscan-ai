const express = require("express");
const router = express.Router();
const multer = require("multer");

const { analyzeFood } = require("../controllers/foodController");

// file upload setup
const upload = multer({ dest: "uploads/" });

// route
router.post("/analyze", upload.single("image"), analyzeFood);

module.exports = router;