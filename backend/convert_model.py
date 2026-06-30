"""
Convert plant_disease_model.h5 (Keras 3 legacy H5 weights format)
to a proper Keras 3 .keras saved model that can be loaded with load_model().

Run once:
    python convert_model.py
"""

import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

import json
import numpy as np
import h5py
import tensorflow as tf

MODEL_DIR = "model"
H5_PATH   = os.path.join(MODEL_DIR, "plant_disease_model.h5")
OUT_PATH  = os.path.join(MODEL_DIR, "plant_disease_model.keras")
CLASS_NAMES_PATH = os.path.join(MODEL_DIR, "class_names.json")

IMG_SIZE = (224, 224)

print("Reading class names...")
with open(CLASS_NAMES_PATH) as f:
    class_map = json.load(f)
num_classes = len(class_map)
print(f"  {num_classes} classes")

print("Building model (exact architecture from saved config)...")
base_model = tf.keras.applications.MobileNetV2(
    input_shape=IMG_SIZE + (3,), include_top=False, weights=None
)
inputs = tf.keras.Input(shape=IMG_SIZE + (3,))
x = tf.keras.applications.mobilenet_v2.preprocess_input(inputs)
x = base_model(x, training=False)
x = tf.keras.layers.GlobalAveragePooling2D()(x)
x = tf.keras.layers.Dropout(0.3)(x)
x = tf.keras.layers.Dense(128, activation="relu", name="dense")(x)
x = tf.keras.layers.Dropout(0.2)(x)
outputs = tf.keras.layers.Dense(num_classes, activation="softmax", name="dense_1")(x)
model = tf.keras.Model(inputs, outputs)

# Build by running a dummy forward pass
model(tf.zeros([1, *IMG_SIZE, 3]), training=False)
print(f"  Model has {model.count_params():,} parameters")
print("  Layers:", [l.name for l in model.layers])

print("\nLoading weights directly from H5 file...")
with h5py.File(H5_PATH, "r") as f:
    mw = f["model_weights"]

    def get_weights_from_group(grp):
        weight_names = list(grp.attrs.get("weight_names", []))
        if not weight_names:
            return []
        weights = []
        for wn in weight_names:
            parts = wn.split("/")
            node = grp
            for part in parts:
                node = node[part]
            weights.append(np.array(node))
        return weights

    # Load MobileNetV2 base
    mobilenet_weights = get_weights_from_group(mw["mobilenetv2_1.00_224"])
    print(f"  MobileNetV2: {len(mobilenet_weights)} weight tensors")
    base_model.set_weights(mobilenet_weights)

    # Find and load Dense layers by name
    for layer_name in ["dense", "dense_1"]:
        layer = model.get_layer(layer_name)
        weights = get_weights_from_group(mw[layer_name])
        print(f"  {layer_name}: {len(weights)} weight tensors, shapes: {[w.shape for w in weights]}")
        layer.set_weights(weights)

print(f"\nSaving converted model to {OUT_PATH}...")
model.save(OUT_PATH)
print("Done!")

# Quick sanity check
print("\nVerifying saved model loads correctly...")
m2 = tf.keras.models.load_model(OUT_PATH)
dummy = np.zeros((1, 224, 224, 3), dtype="float32")
out = m2.predict(dummy, verbose=0)
print(f"  Output shape: {out.shape}  (expected: (1, {num_classes}))")
print(f"  Sum of probabilities: {out.sum():.4f}  (expected: ~1.0)")
print("Conversion successful!")
