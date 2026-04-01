const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const nutrition = {
  pizza: 285,
  burger: 295,
  dosa: 168,
  idli: 39
};

exports.analyzeFood = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Image file is required" });
  }

  const formData = new FormData();
  formData.append("file", fs.createReadStream(req.file.path));

  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/predict",
      formData,
      { headers: formData.getHeaders() }
    );

    const food = response.data.food;

    res.json({
      food,
      calories: nutrition[food] || 100
    });
  } catch (error) {
    console.error("Food analysis failed:", error.message || error);
    res.status(500).json({ error: "Error processing image" });
  } finally {
    fs.unlink(req.file.path, () => {});
  }
};
