import sys
import json
import base64
import numpy as np
import cv2

raw_input = sys.stdin.read()
# print("RAW INPUT: ", raw_input, file=sys.stderr)

# Read JSON from stdin
data = json.loads(raw_input)
original_b64 = data["original"]
input_b64 = data["input"]
wire_type = data["wireType"]

def base64_to_cv2_image(base64_str):
    if base64_str.startswith("data:image"):
        base64_str = base64_str.split(",")[1]

    # Fix padding
    base64_str += "=" * (-len(base64_str) % 4)

    decoded = base64.b64decode(base64_str)
    np_data = np.frombuffer(decoded, np.uint8)
    img = cv2.imdecode(np_data, cv2.IMREAD_COLOR)
    return img

original_img = base64_to_cv2_image(original_b64)
input_img = base64_to_cv2_image(input_b64)

# Do your comparison here
# For example: compare size
print(type(original_img), type(input_img), file=sys.stderr)
if original_img.shape == input_img.shape:
    result = "Images are the same size"
else:
    result = "Images are different sizes"

print(result)