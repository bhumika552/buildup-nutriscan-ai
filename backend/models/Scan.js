const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  food_name: {
    type: String,
    required: true,
  },
  confidence: {
    type: Number,
    required: true,
  },
  nutrition: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
  },
  preview: {
    type: String, // Can store base64 string or image preview link
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Scan", scanSchema);
