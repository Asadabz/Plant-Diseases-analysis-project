"""
Plant Disease Detector - Inference API
=========================================
Loads the trained MobileNetV2 model and serves predictions over REST.

Run locally:
    uvicorn main:app --reload --port 8000

Endpoints:
    GET  /health           -> {"status": "ok"}
    POST /predict           -> upload an image file, get back disease + confidence
"""

import io
import json
import os

import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

MODEL_DIR = os.environ.get("MODEL_DIR", "model")
WEIGHTS_PATH = os.path.join(MODEL_DIR, "plant_disease_model.keras")
CLASS_NAMES_PATH = os.path.join(MODEL_DIR, "class_names.json")
IMG_SIZE = (224, 224)

app = FastAPI(title="Plant Disease Detector API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = None
class_names = []


def build_model(num_classes):
    """Must EXACTLY match the architecture used during training."""
    import tensorflow as tf

    base_model = tf.keras.applications.MobileNetV2(
        input_shape=IMG_SIZE + (3,), include_top=False, weights=None
    )
    inputs = tf.keras.Input(shape=IMG_SIZE + (3,))
    x = tf.keras.applications.mobilenet_v2.preprocess_input(inputs)
    x = base_model(x, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dense(128, activation="relu")(x)
    outputs = tf.keras.layers.Dense(num_classes, activation="softmax")(x)
    return tf.keras.Model(inputs, outputs)


@app.on_event("startup")
def load_model():
    """Load the trained model and class names once, at startup."""
    global model, class_names

    if not os.path.exists(CLASS_NAMES_PATH):
        print(f"[WARN] No class_names.json found at {CLASS_NAMES_PATH}.")
        return

    with open(CLASS_NAMES_PATH) as f:
        class_map = json.load(f)
    class_names = [class_map[str(i)] for i in range(len(class_map))]

    if not os.path.exists(WEIGHTS_PATH):
        print(f"[WARN] No weights found at {WEIGHTS_PATH}.")
        print("[WARN] /predict will return a 503 until weights are placed there.")
        return

    import tensorflow as tf

    loaded = tf.keras.models.load_model(WEIGHTS_PATH)
    model = loaded
    print(f"Loaded model from {WEIGHTS_PATH} with {len(class_names)} classes.")


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded yet. Train a model and place it in the model/ folder.",
        )

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file.")

    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB").resize(IMG_SIZE)
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read the uploaded image.")

    # NOTE: preprocessing (mobilenet_v2 style, [-1,1] range) happens INSIDE the
    # model graph itself, so we just feed raw 0-255 pixel values here.
    img_array = np.expand_dims(np.array(image).astype("float32"), axis=0)
    prediction = model.predict(img_array)[0]
    top_idx = int(np.argmax(prediction))

    top3_idx = prediction.argsort()[-3:][::-1]
    top3 = [
        {"disease": class_names[i], "confidence": round(float(prediction[i]), 4)}
        for i in top3_idx
    ]

    return {
        "disease": class_names[top_idx],
        "confidence": round(float(prediction[top_idx]), 4),
        "top3": top3,
    }