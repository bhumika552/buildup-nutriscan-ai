const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

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

  try {
    const response = await axios.post(
      AI_SERVICE_URL,
      formData,
      { headers: formData.getHeaders() }
    );

    const food = response.data.food;
    const calories = nutrition[food] || 150;
    const description = foodDescriptions[food] || "a tasty choice";
    const advice = goalAdvice[goal];
    let recommendations = (cuisine === 'indian') ? (goalRecommendationsIndian[goal] || goalRecommendationsIndian.maintenance) : (goalRecommendations[goal] || goalRecommendations.maintenance);
    recommendations = filterByDiet(recommendations, diet);

    res.json({
      food,
      description,
      calories,
      goalAdvice: advice,
      recommendations
    });
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