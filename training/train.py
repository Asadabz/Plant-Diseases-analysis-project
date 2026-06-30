"""
Plant Disease Detector - Training Script
==========================================
Trains a leaf-disease classifier using transfer learning (MobileNetV2).

Dataset expected in this folder structure (standard ImageDataGenerator format):

    dataset/
        train/
            Tomato___Healthy/
                img1.jpg
                img2.jpg
            Tomato___Late_Blight/
                img1.jpg
            Potato___Early_Blight/
                ...
        val/
            Tomato___Healthy/
                ...
            Tomato___Late_Blight/
                ...

This matches the folder layout of the public "PlantVillage" dataset on Kaggle:
https://www.kaggle.com/datasets/emmarex/plantdisease

Run on Google Colab with a free GPU for fast training:
    1. Upload/mount the dataset (Kaggle -> Colab via kaggle.json, or Google Drive)
    2. !pip install -r requirements.txt
    3. python train.py --data_dir dataset --epochs 10

Outputs:
    model/plant_disease_model.h5   <- trained Keras model
    model/class_names.json         <- index -> class name mapping (needed by the API)
"""

import argparse
import json
import os

import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing.image import ImageDataGenerator

IMG_SIZE = (224, 224)
BATCH_SIZE = 32


def build_model(num_classes: int) -> tf.keras.Model:
    """MobileNetV2 backbone (frozen) + a small classification head."""
    base = MobileNetV2(input_shape=IMG_SIZE + (3,), include_top=False, weights="imagenet")
    base.trainable = False  # freeze pretrained weights for fast, stable training

    inputs = layers.Input(shape=IMG_SIZE + (3,))
    x = base(inputs, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(128, activation="relu")(x)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)

    model = models.Model(inputs, outputs)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def get_data_generators(data_dir: str):
    train_dir = os.path.join(data_dir, "train")
    val_dir = os.path.join(data_dir, "val")

    train_aug = ImageDataGenerator(
        rescale=1.0 / 255,
        rotation_range=20,
        width_shift_range=0.1,
        height_shift_range=0.1,
        zoom_range=0.15,
        horizontal_flip=True,
    )
    val_aug = ImageDataGenerator(rescale=1.0 / 255)

    train_gen = train_aug.flow_from_directory(
        train_dir, target_size=IMG_SIZE, batch_size=BATCH_SIZE, class_mode="categorical"
    )
    val_gen = val_aug.flow_from_directory(
        val_dir, target_size=IMG_SIZE, batch_size=BATCH_SIZE, class_mode="categorical"
    )
    return train_gen, val_gen


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data_dir", type=str, default="dataset")
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--out_dir", type=str, default="model")
    args = parser.parse_args()

    os.makedirs(args.out_dir, exist_ok=True)

    train_gen, val_gen = get_data_generators(args.data_dir)
    num_classes = len(train_gen.class_indices)
    print(f"Found {num_classes} classes: {train_gen.class_indices}")

    model = build_model(num_classes)

    checkpoint_path = os.path.join(args.out_dir, "plant_disease_model.h5")
    callbacks = [
        tf.keras.callbacks.ModelCheckpoint(checkpoint_path, save_best_only=True, monitor="val_accuracy"),
        tf.keras.callbacks.EarlyStopping(monitor="val_accuracy", patience=3, restore_best_weights=True),
    ]

    model.fit(train_gen, validation_data=val_gen, epochs=args.epochs, callbacks=callbacks)

    # Save class index -> name mapping (sorted by index) for the inference API
    idx_to_class = {v: k for k, v in train_gen.class_indices.items()}
    class_names = [idx_to_class[i] for i in range(num_classes)]
    with open(os.path.join(args.out_dir, "class_names.json"), "w") as f:
        json.dump(class_names, f, indent=2)

    print(f"\nSaved model to {checkpoint_path}")
    print(f"Saved class names to {args.out_dir}/class_names.json")


if __name__ == "__main__":
    main()
