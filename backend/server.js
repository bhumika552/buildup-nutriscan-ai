require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const foodRoutes = require("./routes/foodRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Database connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/buildup")
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const distPath = path.join(__dirname, "..", "frontend", "dist");
const publicPath = path.join(__dirname, "public");
const staticPath = fs.existsSync(distPath) ? distPath : publicPath;

app.use(express.static(staticPath));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", foodRoutes);

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Not Found" });
  }
  res.sendFile(path.join(staticPath, "index.html"));
});

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});

