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

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

MODEL_DIR = os.environ.get("MODEL_DIR", "model")
WEIGHTS_PATH = os.path.join(MODEL_DIR, "plant_disease_model.keras")
CLASS_NAMES_PATH = os.path.join(MODEL_DIR, "class_names.json")
IMG_SIZE = (224, 224)
GREEN_THRESHOLD = 15.0  # % of pixels that must be green-ish for image to be considered a leaf
CONFIDENCE_THRESHOLD = 0.16  # model ki top prediction 60% se kam confident ho to reject karo

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


def is_leaf_image(image_bytes: bytes, green_threshold: float = GREEN_THRESHOLD) -> bool:
    """
    Check karta hai ki image me kaafi green pixels hain ya nahi.
    Returns True agar leaf/plant jaisi lagti hai, False agar random object.
    """
    pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_array = np.array(pil_image)

    img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
    img_hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)

    lower_green = np.array([25, 40, 40])
    upper_green = np.array([90, 255, 255])

    mask = cv2.inRange(img_hsv, lower_green, upper_green)

    green_pixel_count = np.count_nonzero(mask)
    total_pixels = mask.shape[0] * mask.shape[1]
    green_percentage = (green_pixel_count / total_pixels) * 100

    return green_percentage >= green_threshold


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

    # Layer 1 — green pixel check (model call se pehle hi non-leaf reject)
    if not is_leaf_image(contents):
        return {
            "status": "invalid",
            "disease": None,
            "confidence": 0.0,
            "message": "This doesn't appear to be a valid leaf image. Please upload a clear leaf photo.",
        }

    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB").resize(IMG_SIZE)
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read the uploaded image.")

    # NOTE: preprocessing (mobilenet_v2 style, [-1,1] range) happens INSIDE the
    # model graph itself, so we just feed raw 0-255 pixel values here.
    img_array = np.expand_dims(np.array(image).astype("float32"), axis=0)
    prediction = model.predict(img_array)[0]
    top_idx = int(np.argmax(prediction))
    top_confidence = float(prediction[top_idx])

    # Layer 2 — confidence threshold (low-confidence predictions reject)
    if top_confidence < CONFIDENCE_THRESHOLD:
        return {
            "status": "invalid",
            "disease": None,
            "confidence": round(top_confidence, 4),
            "message": "Model is prediction ke baare me confident nahi hai. Please clear leaf ki photo upload karo.",
        }

    top3_idx = prediction.argsort()[-3:][::-1]
    top3 = [
        {"disease": class_names[i], "confidence": round(float(prediction[i]), 4)}
        for i in top3_idx
    ]

    return {
        "status": "success",
        "disease": class_names[top_idx],
        "confidence": round(top_confidence, 4),
        "top3": top3,
    }