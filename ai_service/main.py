from fastapi import FastAPI, File, UploadFile, HTTPException
import tensorflow as tf
import numpy as np
from PIL import Image
import io
from pathlib import Path
import random

app = FastAPI()

model_path = Path("model.h5")
model = None

# classes (same order as training)
classes = ["burger", "donut", "pizza", "french fries"]

if model_path.exists():
    try:
        model = tf.keras.models.load_model(str(model_path))
        print("Loaded model.h5 successfully")
    except Exception as e:
        print("Failed to load model.h5:", e)
        model = None
else:
    print("model.h5 not found; /predict will return dummy labels")


def preprocess(image_bytes):
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize((224, 224))
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid image file")

    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)
    return image


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image_bytes = await file.read()
    img = preprocess(image_bytes)

    if model is None:
        food = random.choice(classes)
    else:
        prediction = model.predict(img)
        class_index = np.argmax(prediction)
        food = classes[class_index]

    return {"food": food}
