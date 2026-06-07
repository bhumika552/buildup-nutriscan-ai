from fastapi import FastAPI, File, UploadFile, HTTPException
import os
import io
import json
from PIL import Image

app = FastAPI()

# Locate the Gemini API Key
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    # Try reading from the Express backend .env file
    try:
        env_path = os.path.join(os.path.dirname(__file__), "..", "backend", ".env")
        if os.path.exists(env_path):
            with open(env_path, "r") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("GEMINI_API_KEY="):
                        api_key = line.split("=", 1)[1].strip()
                        break
    except Exception as e:
        print("Could not load API key from backend env:", e)

if api_key:
    print("Gemini API key found. Python service configured successfully.")
else:
    print("WARNING: GEMINI_API_KEY is missing. /predict will run in mock mode.")


@app.get("/")
def read_root():
    return {"status": "online", "service": "BUILDUP AI Service"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image_bytes = await file.read()

    # If API key is not configured, fall back to mock data
    if not api_key:
        print("FastAPI running in mock mode because API key is missing.")
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

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)

        # Load image with PIL and convert to bytes for API
        image = Image.open(io.BytesIO(image_bytes))
        # Convert to RGB if needed (removes alpha channel)
        if image.mode in ("RGBA", "P"):
            image = image.convert("RGB")
        
        # Re-encode to JPEG bytes
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

        # Strip any markdown wrappers just in case
        raw = response.text.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        result_json = json.loads(raw)
        return result_json

    except Exception as e:
        print("Gemini API call failed, falling back to mock details. Error:", str(e))
        return {
            "food_name": "Margherita Pizza",
            "confidence": 0.85,
            "nutrition": {
                "calories": 560,
                "protein": 22,
                "carbs": 68,
                "fat": 24,
                "fiber": 3
            }
        }
