import sys
import json
import base64
import numpy as np
import cv2

def base64_to_cv2_image(base64_list):
    images = []
    for base64_str in base64_list:
        if base64_str.startswith("data:image"):
            base64_str = base64_str.split(",")[1]
        base64_str += "=" * (-len(base64_str) % 4)  # Fix padding
        decoded = base64.b64decode(base64_str)
        np_data = np.frombuffer(decoded, np.uint8)
        img = cv2.imdecode(np_data, cv2.IMREAD_COLOR)
        images.append(img)
    return images

def compare_single(original, input_image):
    # Example logic: compare image sizes
    return {"match": True, "details": "SUCCESSFUL"}

def compare_double(original, input_image):
    return {"match": False, "details": "WIRE MISMATCH AT POSITION 7"}

def main():
    try:
        raw_input = sys.stdin.read()
        data = json.loads(raw_input)

        ref_images = base64_to_cv2_image(data["original"])
        test_images = base64_to_cv2_image(data["input"])
        wire_type = data["wireType"]

        if wire_type == "singlewire":
            result = compare_single(ref_images, test_images)
        elif wire_type == "doublewire":
            result = compare_double(ref_images, test_images)
        else:
            raise ValueError("Invalid wire type")

        print(json.dumps(result))

    except Exception as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()