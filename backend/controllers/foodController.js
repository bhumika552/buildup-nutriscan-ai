const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const Scan = require("../models/Scan");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000/predict";
const nutrition = {
  pizza: 285,
  burger: 295,
  donut: 195,
  "french fries": 312
};

const foodDescriptions = {
  pizza: "cheesy and satisfying",
  burger: "savory and filling",
  donut: "sweet and indulgent",
  "french fries": "crispy and salty"
};

const goalAdvice = {
  maintenance: "Maintain a balanced diet with vegetables, lean protein, and whole grains.",
  weight_loss: "Reduce portion size, choose veggie-rich sides, and keep treats occasional.",
  weight_gain: "Add nutrient-rich calories like nuts, whole grains, and healthy fats.",
  muscle_build: "Prioritize protein-rich meals and recovery nutrition after workouts."
};

const goalRecommendations = {
  maintenance: [
    "Mixed greens salad with grilled chicken",
    "Vegetable stir-fry with brown rice",
    "Oven-baked salmon with quinoa"
  ],
  weight_loss: [
    "Zucchini noodles with lean turkey",
    "Grilled fish with steamed vegetables",
    "Greek yogurt bowl with berries"
  ],
  weight_gain: [
    "Chicken and avocado wrap",
    "Smoothie with oats, nut butter, and banana",
    "Rice bowl with beans and roasted veggies"
  ],
  muscle_build: [
    "Grilled chicken with quinoa and broccoli",
    "Greek yogurt with nuts and fruit",
    "Turkey burger with sweet potato fries"
  ]
};

const goalRecommendationsIndian = {
  maintenance: [
    "Vegetable sabzi with chapati",
    "Tandoori chicken with salad",
    "Dal, brown rice and mixed vegetable curry"
  ],
  weight_loss: [
    "Moong dal chilla with mint chutney",
    "Grilled fish tikka with steamed veggies",
    "Mixed vegetable sambar with small portion of rice"
  ],
  weight_gain: [
    "Paneer bhurji with paratha",
    "Chicken biryani (smaller portion) with raita",
    "Peanut and banana smoothie"
  ],
  muscle_build: [
    "Tandoori chicken with quinoa or brown rice",
    "Chole (chickpea) curry with brown rice",
    "Egg bhurji with whole wheat toast"
  ]
};

function filterByDiet(list, diet) {
  if (!diet || diet === 'any') return list;
  const meatKeywords = ['chicken', 'fish', 'salmon', 'turkey', 'beef', 'prawn', 'mutton', 'egg', 'egg curry', 'egg bhurji', 'fish tikka', 'tandoori chicken', 'biryani'];
  if (diet === 'veg') {
    return list.filter(item => {
      const low = item.toLowerCase();
      return !meatKeywords.some(k => low.includes(k));
    });
  }
  if (diet === 'nonveg') {
    // Prefer non-veg items: if list contains non-veg, return them; otherwise return original list
    const nonveg = list.filter(item => meatKeywords.some(k => item.toLowerCase().includes(k)));
    return nonveg.length ? nonveg : list;
  }
  return list;
}

function normalizeGoal(goal) {
  const key = String(goal || "maintenance").toLowerCase();
  return goalAdvice[key] ? key : "maintenance";
}

exports.analyzeFood = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Image file is required" });
  }

  const goal = normalizeGoal(req.body.goal);
  const diet = String(req.body.diet || 'any').toLowerCase();
  const cuisine = String(req.body.cuisine || 'global').toLowerCase();
  const formData = new FormData();
  formData.append("file", fs.createReadStream(req.file.path));

  // Prepare base64 preview of image for MongoDB history
  let previewBase64 = null;
  try {
    const fileBuffer = fs.readFileSync(req.file.path);
    previewBase64 = `data:image/jpeg;base64,${fileBuffer.toString("base64")}`;
  } catch (err) {
    console.error("Error generating base64 preview:", err.message);
  }

  try {
    const response = await axios.post(
      AI_SERVICE_URL,
      formData,
      { headers: formData.getHeaders() }
    );

    // Extract values returned from AI service (FastAPI which integrates Gemini)
    const food_name = response.data.food_name || response.data.food || "Unknown Dish";
    const confidence = response.data.confidence || 0.92;
    const nutritionInfo = response.data.nutrition || {
      calories: response.data.calories || nutrition[food_name.toLowerCase()] || 250,
      protein: response.data.protein || 12,
      carbs: response.data.carbs || 30,
      fat: response.data.fat || 10,
      fiber: response.data.fiber || 3
    };

    const description = foodDescriptions[food_name.toLowerCase()] || response.data.description || `A nutritious serving of ${food_name}`;
    const advice = goalAdvice[goal];
    let recommendations = (cuisine === 'indian') ? (goalRecommendationsIndian[goal] || goalRecommendationsIndian.maintenance) : (goalRecommendations[goal] || goalRecommendations.maintenance);
    recommendations = filterByDiet(recommendations, diet);

    const result = {
      food_name,
      confidence,
      nutrition: nutritionInfo,
      description,
      goalAdvice: advice,
      recommendations
    };

    // Save to MongoDB if user is authenticated
    if (req.user) {
      try {
        await Scan.create({
          userId: req.user._id,
          food_name,
          confidence,
          nutrition: nutritionInfo,
          preview: previewBase64
        });
      } catch (dbErr) {
        console.error("Error saving scan history to MongoDB:", dbErr.message);
      }
    }

    res.json(result);
  } catch (error) {
    console.error("Food analysis failed:", error.message || error);
    if (error.response) {
      console.error("AI service response:", error.response.status, error.response.data);
      const aiError = error.response.data?.detail || error.response.data?.error || "AI service error";
      return res.status(502).json({ error: aiError });
    }
    res.status(500).json({ error: "Error processing image" });
  } finally {
    fs.unlink(req.file.path, () => {});
  }
};

// @desc    Get user's scan history from MongoDB
// @route   GET /api/scans
// @access  Private
exports.getScans = async (req, res) => {
  try {
    const scans = await Scan.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(scans);
  } catch (err) {
    console.error("GetScans error:", err.message);
    res.status(500).json({ error: "Server error fetching history" });
  }
};

// @desc    Clear user's scan history in MongoDB
// @route   DELETE /api/scans
// @access  Private
exports.deleteScans = async (req, res) => {
  try {
    await Scan.deleteMany({ userId: req.user._id });
    res.json({ message: "History cleared successfully" });
  } catch (err) {
    console.error("DeleteScans error:", err.message);
    res.status(500).json({ error: "Server error clearing history" });
  }
};