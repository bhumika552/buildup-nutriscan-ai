from fastapi import FastAPI, File, UploadFile
import tensorflow as tf
import numpy as np
from PIL import Image
import io

app = FastAPI()

# Load model
model = tf.keras.models.load_model("model.h5")

# classes (same order as training)
classes = ["burger", "donut", "pizza", "french fries"]

def preprocess(image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).resize((224, 224))
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)
    return image

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image_bytes = await file.read()

    img = preprocess(image_bytes)

    prediction = model.predict(img)
    class_index = np.argmax(prediction)

    food = classes[class_index]

    return {"food": food}