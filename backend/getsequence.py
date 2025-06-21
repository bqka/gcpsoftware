import sys
import json
import base64
import numpy as np
import cv2

def base64_to_cv2_image(base64_str):
    if base64_str.startswith("data:image"):
        base64_str = base64_str.split(",")[1]
    base64_str += "=" * (-len(base64_str) % 4)  # Fix padding
    decoded = base64.b64decode(base64_str)
    np_data = np.frombuffer(decoded, np.uint8)
    img = cv2.imdecode(np_data, cv2.IMREAD_COLOR)
    return img

def get_single_sequence(image):
    # RUN ALGORITHM
    return [{"sequence": "TESTSEQUENCE1"}]

def get_double_sequence(front_image, back_image):
    return [
            {"sequence": "TESTSEQUENCE1"},
            {"sequence": "TESTSEQUENCE2"}
        ]

def main():
    try:
        raw_input = sys.stdin.read()
        data = json.loads(raw_input)

        images = data["input"]
        wire_type = data["wireType"]

        if wire_type == "singlewire":
            image_cv2 = base64_to_cv2_image(images[0])
            result = get_single_sequence(image_cv2)
        elif wire_type == "doublewire":
            result = get_double_sequence(images[0], images[1])
        else:
            raise ValueError("Invalid wire type")

        print(json.dumps(result))

    except Exception as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()