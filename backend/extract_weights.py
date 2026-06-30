import tensorflow as tf
from tensorflow.keras import layers, models
import json
import os

IMG_SIZE = (224, 224)
MODEL_DIR = "model"

with open(os.path.join(MODEL_DIR, "class_names.json")) as f:
    class_map = json.load(f)
NUM_CLASSES = len(class_map)
print(f"Num classes: {NUM_CLASSES}")

def build_model(num_classes):
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=IMG_SIZE + (3,), include_top=False, weights=None
    )
    inputs = tf.keras.Input(shape=IMG_SIZE + (3,))
    x = tf.keras.applications.mobilenet_v2.preprocess_input(inputs)
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(128, activation="relu")(x)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)
    return models.Model(inputs, outputs)

model = build_model(NUM_CLASSES)
model.load_weights(os.path.join(MODEL_DIR, "plant_disease_model.h5"))
model.save_weights(os.path.join(MODEL_DIR, "plant_disease_model_weights.h5"))
print("✅ Weights extracted successfully!")