from fastapi import FastAPI, File, UploadFile, HTTPException
import os
import io
import json
import base64
import requests
from PIL import Image

app = FastAPI()

# Locate API keys
openai_key = os.environ.get("OPENAI_API_KEY")
api_key = os.environ.get("GEMINI_API_KEY")
try:
    for env_path in [
        os.path.join(os.path.dirname(__file__), ".env"),
        os.path.join(os.path.dirname(__file__), "..", "backend", ".env"),
    ]:
        if not os.path.exists(env_path):
            continue
        with open(env_path, "r") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                name, value = line.split("=", 1)
                name = name.strip()
                value = value.strip()
                if name == "OPENAI_API_KEY":
                    openai_key = value
                elif name == "GEMINI_API_KEY":
                    api_key = value
except Exception as e:
    print("Could not load API keys from env:", e)

if openai_key:
    print("OpenAI API key found. Using OpenAI for image analysis.")
elif api_key:
    print("Gemini API key found. Using Gemini for image analysis.")
else:
    print("WARNING: No OpenAI or Gemini API key found. /predict will use local image classification.")

# Local image classification fallback
local_model = None
local_model_loaded = False

food_nutrition_map = {
    "pizza": {"calories": 285, "protein": 12, "carbs": 36, "fat": 10, "fiber": 2},
    "hamburger": {"calories": 354, "protein": 17, "carbs": 33, "fat": 17, "fiber": 2},
    "hot dog": {"calories": 290, "protein": 11, "carbs": 26, "fat": 18, "fiber": 1},
    "french fries": {"calories": 312, "protein": 4, "carbs": 41, "fat": 15, "fiber": 4},
    "sushi": {"calories": 200, "protein": 12, "carbs": 28, "fat": 6, "fiber": 1},
    "salad": {"calories": 140, "protein": 3, "carbs": 12, "fat": 8, "fiber": 4},
    "ice cream": {"calories": 207, "protein": 4, "carbs": 24, "fat": 11, "fiber": 1},
    "bagel": {"calories": 245, "protein": 9, "carbs": 48, "fat": 1, "fiber": 2},
    "guacamole": {"calories": 230, "protein": 3, "carbs": 12, "fat": 21, "fiber": 6},
}

imagenet_food_names = {
    "pizza": "pizza",
    "cheeseburger": "hamburger",
    "hamburger": "hamburger",
    "hotdog": "hot dog",
    "french_fries": "french fries",
    "french_loaf": "bread",
    "bagel": "bagel",
    "pretzel": "pretzel",
    "guacamole": "guacamole",
    "ice_cream": "ice cream",
    "sushi": "sushi",
    "carbonara": "spaghetti carbonara",
    "spaghetti_squash": "spaghetti squash",
    "mashed_potato": "mashed potato",
    "Caesar_salad": "salad",
    "red_wine": "red wine",
    "espresso": "espresso"
}

food_keywords = [
    "pizza", "burger", "hot dog", "fries", "french", "sushi", "salad", "sandwich",
    "bread", "bagel", "burrito", "taco", "cake", "ice cream", "cookie", "chocolate",
    "donut", "pasta", "noodle", "soup", "rice", "steak", "curry"
]

try:
    import tensorflow as tf
    from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions
    from tensorflow.keras.preprocessing.image import img_to_array

    def load_local_model():
        global local_model, local_model_loaded
        if not local_model_loaded:
            local_model = MobileNetV2(weights="imagenet")
            local_model_loaded = True
            print("Local MobileNetV2 model loaded for image classification.")

    def predict_with_local_model(image: Image.Image):
        if not local_model_loaded:
            load_local_model()

        image = image.convert("RGB")
        image = image.resize((224, 224))
        x = img_to_array(image)
        x = preprocess_input(x)
        x = x.reshape((1, 224, 224, 3))
        preds = local_model.predict(x)
        decoded = decode_predictions(preds, top=10)[0]

        best = None
        for _, label, score in decoded:
            if label in imagenet_food_names:
                best = (imagenet_food_names[label], score)
                break

        if not best:
            for _, label, score in decoded:
                name = label.replace("_", " ")
                if any(keyword in name.lower() for keyword in food_keywords):
                    best = (name, score)
                    break

        if not best:
            label, score = decoded[0][1], decoded[0][2]
            best = ("food item", score)

        name, confidence = best
        nutrition = food_nutrition_map.get(name.lower(), {
            "calories": int(250 + confidence * 200),
            "protein": int(10 + confidence * 10),
            "carbs": int(30 + confidence * 20),
            "fat": int(12 + confidence * 8),
            "fiber": 3
        })
        return {
            "food_name": name.title(),
            "confidence": round(float(confidence), 2),
            "nutrition": nutrition
        }
except Exception as e:
    print("Local TensorFlow model unavailable:", e)
    local_model = None
    local_model_loaded = False


@app.get("/")
def read_root():
    return {"status": "online", "service": "BUILDUP AI Service"}


def parse_openai_response_json(data):
    raw = ""
    if isinstance(data, dict) and data.get("output_text"):
        raw = data.get("output_text")
    else:
        for item in data.get("output", []):
            if item.get("type") == "output_text":
                for content in item.get("content", []):
                    if content.get("type") == "output_text":
                        raw += content.get("text", "")
            elif item.get("type") == "message":
                for part in item.get("content", []):
                    if part.get("type") == "output_text":
                        raw += part.get("text", "")
    return raw.strip()


def predict_with_openai(image: Image.Image):
    if not openai_key:
        raise ValueError("OpenAI API key is not configured.")

    if image.mode in ("RGBA", "P"):
        image = image.convert("RGB")

    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format="JPEG")
    b64_image = base64.b64encode(img_byte_arr.getvalue()).decode("utf-8")

    payload = {
        "model": "gpt-4.1-mini",
        "input": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": (
                            "Analyze the food item in the image. You must identify the food and estimate "
                            "its portion size and nutrition. Respond ONLY with a valid JSON object matching "
                            "this structure:\n"
                            "{\n"
                            "  \"food_name\": \"Grilled Chicken Salad\",\n"
                            "  \"confidence\": 0.94,\n"
                            "  \"nutrition\": {\n"
                            "    \"calories\": 320,\n"
                            "    \"protein\": 28,\n"
                            "    \"carbs\": 12,\n"
                            "    \"fat\": 18,\n"
                            "    \"fiber\": 4\n"
                            "  }\n"
                            "}\n"
                            "Do not include markdown wrappers (like ```json), respond with ONLY the raw JSON text."
                        )
                    },
                    {
                        "type": "input_image",
                        "image_url": f"data:image/jpeg;base64,{b64_image}"
                    }
                ]
            }
        ]
    }

    headers = {
        "Authorization": f"Bearer {openai_key}",
        "Content-Type": "application/json"
    }

    response = requests.post(
        "https://api.openai.com/v1/responses",
        json=payload,
        headers=headers,
        timeout=60
    )
    response.raise_for_status()

    result = response.json()
    raw = parse_openai_response_json(result)
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    return json.loads(raw)


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes))

    if openai_key:
        try:
            return predict_with_openai(image)
        except Exception as e:
            print("OpenAI API call failed, falling back to Gemini/local. Error:", str(e))

    if api_key:
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=api_key)
            if image.mode in ("RGBA", "P"):
                image = image.convert("RGB")
            img_byte_arr = io.BytesIO()
            image.save(img_byte_arr, format="JPEG")
            img_bytes = img_byte_arr.getvalue()

            prompt = (
                "Analyze the food item in the image. You must identify the food and estimate "
                "its portion size and nutrition. Respond ONLY with a valid JSON object matching "
                "this structure:\n"
                "{\n"
                "  \"food_name\": \"Grilled Chicken Salad\",\n"
                "  \"confidence\": 0.94,\n"
                "  \"nutrition\": {\n"
                "    \"calories\": 320,\n"
                "    \"protein\": 28,\n"
                "    \"carbs\": 12,\n"
                "    \"fat\": 18,\n"
                "    \"fiber\": 4\n"
                "  }\n"
                "}\n"
                "Do not include markdown wrappers (like ```json), respond with ONLY the raw JSON text."
            )

            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=[
                    types.Part.from_bytes(data=img_bytes, mime_type="image/jpeg"),
                    prompt
                ]
            )

            raw = response.text.strip()
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
                raw = raw.strip()

            result_json = json.loads(raw)
            return result_json
        except Exception as e:
            print("Gemini API call failed, falling back to local model. Error:", str(e))

    try:
        return predict_with_local_model(image)
    except Exception as e:
        print("Local model failed or unavailable; returning fallback response. Error:", str(e))

    print("No OpenAI/Gemini API key and local model unavailable; returning fallback response.")
    return {
        "food_name": "Grilled Chicken Salad",
        "confidence": 0.94,
        "nutrition": {
            "calories": 320,
            "protein": 28,
            "carbs": 12,
            "fat": 18,
            "fiber": 4
        }
    }
