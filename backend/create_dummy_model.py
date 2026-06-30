"""
Creates a TINY placeholder model — NOT trained on real leaf data.
Purpose: let you test the full pipeline (upload -> API -> response -> UI)
end-to-end before investing hours in real training on your laptop.

Predictions from this model are meaningless (it has only seen random
noise images), but the API contract (shapes, response format) is
identical to what the real trained model will produce.

Run: python create_dummy_model.py
Output: model/plant_disease_model.h5 + model/class_names.json
"""

import json
import os

import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models

IMG_SIZE = (224, 224)
OUT_DIR = "model"

# Same class-name style as the real PlantVillage dataset, so the frontend's
# disease-name matching logic behaves the same way it will with the real model.
CLASS_NAMES = [
    "Tomato___healthy",
    "Tomato___Late_blight",
    "Tomato___Bacterial_spot",
    "Tomato___Septoria_leaf_spot",
]


def build_tiny_model(num_classes: int) -> tf.keras.Model:
    """A tiny CNN — NOT MobileNetV2, no pretrained weights, no internet needed.
    Just enough structure to accept a 224x224 image and output class probabilities."""
    inputs = layers.Input(shape=IMG_SIZE + (3,))
    x = layers.Conv2D(8, 3, activation="relu", padding="same")(inputs)
    x = layers.MaxPooling2D()(x)
    x = layers.Conv2D(16, 3, activation="relu", padding="same")(x)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(16, activation="relu")(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)
    model = models.Model(inputs, outputs)
    model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])
    return model


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    num_classes = len(CLASS_NAMES)

    model = build_tiny_model(num_classes)

    # Train briefly on random synthetic noise, just so weights aren't pure
    # random init (gives slightly varying confidence scores per image).
    n_samples = 40
    X = np.random.rand(n_samples, *IMG_SIZE, 3).astype("float32")
    y_idx = np.random.randint(0, num_classes, size=n_samples)
    y = tf.keras.utils.to_categorical(y_idx, num_classes=num_classes)

    print("Training on random noise for a few steps (placeholder only)...")
    model.fit(X, y, epochs=3, batch_size=8, verbose=1)

    model_path = os.path.join(OUT_DIR, "plant_disease_model.h5")
    model.save(model_path)

    with open(os.path.join(OUT_DIR, "class_names.json"), "w") as f:
        json.dump(CLASS_NAMES, f, indent=2)

    print(f"\nSaved placeholder model to {model_path}")
    print(f"Saved class names to {OUT_DIR}/class_names.json")
    print("\nReminder: this model has NOT learned anything about real leaves.")
    print("Its predictions exist only to test the pipeline end-to-end.")


if __name__ == "__main__":
    main()
