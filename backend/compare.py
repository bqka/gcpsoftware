import sys
import json
import base64
import numpy as np
import cv2
from getsequence import get_single_sequence, get_double_sequence

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
    """
    Compares the detected wire sequence from an image with a desired sequence.

    Args:
        original (tuple): A tuple where the first element is the desired number
                          of wires (int) and the second element is a list of
                          desired wire colors as BGR tuples (list of tuples).
        input_image (np.array): The image (BGR format) to detect the wire sequence from.

    Returns:
        dict: A dictionary with keys "match" (bool) indicating if the sequences
              match (within threshold) and "details" (str) providing a summary
              of the comparison, including any mismatches.
    """
    desired_num_wires, desired_colors = original

    # Call the function from the previous task to get detected sequence
    detected_num_wires, detected_colors = get_single_sequence(input_image)

    # Compare the number of wires
    if detected_num_wires != desired_num_wires:
        return {
            "match": False,
            "details": f"Mismatch: Expected {desired_num_wires} wires, but detected {detected_num_wires}"
        }

    # --- Color Comparison ---
    # Define a threshold for color difference (Euclidean distance in BGR space)
    # This threshold value might need tuning based on image quality and color variations.
    color_difference_threshold = 50 # Example threshold value

    mismatches = []
    all_colors_match = True

    # Compare detected BGR values with desired BGR values
    # Assuming the detected_colors are already sorted left to right from get_single_sequence
    for i in range(desired_num_wires):
        desired_bgr = np.array(desired_colors[i])
        detected_bgr = np.array(detected_colors[i])

        # Calculate Euclidean distance between the two BGR tuples
        color_difference = np.linalg.norm(desired_bgr - detected_bgr)

        if color_difference > color_difference_threshold:
            all_colors_match = False
            mismatches.append(
                f"Wire {i+1}: Expected BGR {tuple(desired_bgr)}, "
                f"detected BGR {tuple(detected_bgr)} (Difference: {color_difference:.2f})"
            )

    if all_colors_match:
        return {"match": True, "details": "SUCCESSFUL: Number of wires and colors match within threshold."}
    else:
        return {
            "match": False,
            "details": f"Number of wires match, but color mismatches found: {'; '.join(mismatches)}"
        }

def compare_double(original, input_image):
    """
    Compares the detected wire sequences from front and back images with desired sequences.

    Args:
        original (tuple): A tuple containing two elements. The first element is the
                          desired sequence for the front image (number of wires,
                          list of BGR tuples), and the second element is the
                          desired sequence for the back image (number of wires,
                          list of BGR tuples).
        input_image (tuple): A tuple containing the front image (np.array) and
                             the back image (np.array).

    Returns:
        dict: A dictionary indicating the overall match status ("match": bool)
              and details of any mismatches ("details": str).
    """
    desired_front_seq, desired_back_seq = original
    front_image, back_image = input_image

    # Call get_double_sequence to get detected results for both images
    detected_front_seq, detected_back_seq = get_double_sequence(front_image, back_image)

    detected_front_num_wires, detected_front_colors = detected_front_seq
    detected_back_num_wires, detected_back_colors = detected_back_seq

    desired_front_num_wires, desired_front_colors = desired_front_seq
    desired_back_num_wires, desired_back_colors = desired_back_seq

    mismatches = []
    overall_match = True

    # --- Compare Front Image Sequence ---
    if detected_front_num_wires != desired_front_num_wires:
        overall_match = False
        mismatches.append(
            f"Front Image Mismatch: Expected {desired_front_num_wires} wires, "
            f"but detected {detected_front_num_wires}"
        )
    elif desired_front_num_wires > 0: # Only compare colors if wire counts match and are greater than 0
         # Define a threshold for color difference (Euclidean distance in BGR space)
        color_difference_threshold = 50 # Using the same threshold as compare_single

        front_color_mismatches = []
        for i in range(desired_front_num_wires):
            desired_bgr = np.array(desired_front_colors[i])
            detected_bgr = np.array(detected_front_colors[i])
            color_difference = np.linalg.norm(desired_bgr - detected_bgr)

            if color_difference > color_difference_threshold:
                overall_match = False
                front_color_mismatches.append(
                    f"Wire {i+1}: Expected BGR {tuple(desired_bgr)}, "
                    f"detected BGR {tuple(detected_bgr)} (Diff: {color_difference:.2f})"
                )
        if front_color_mismatches:
            mismatches.append(f"Front Image Color Mismatches: {'; '.join(front_color_mismatches)}")
    elif desired_front_num_wires == 0 and detected_front_num_wires == 0:
         # Explicitly state success if both are empty
         pass # No mismatch

    # --- Compare Back Image Sequence ---
    if detected_back_num_wires != desired_back_num_wires:
        overall_match = False
        mismatches.append(
            f"Back Image Mismatch: Expected {desired_back_num_wires} wires, "
            f"but detected {detected_back_num_wires}"
        )
    elif desired_back_num_wires > 0: # Only compare colors if wire counts match and are greater than 0
        color_difference_threshold = 50 # Using the same threshold

        back_color_mismatches = []
        for i in range(desired_back_num_wires):
            desired_bgr = np.array(desired_back_colors[i])
            detected_bgr = np.array(detected_back_colors[i])
            color_difference = np.linalg.norm(desired_bgr - detected_bgr)

            if color_difference > color_difference_threshold:
                overall_match = False
                back_color_mismatches.append(
                    f"Wire {i+1}: Expected BGR {tuple(desired_bgr)}, "
                    f"detected BGR {tuple(detected_bgr)} (Diff: {color_difference:.2f})"
                )
        if back_color_mismatches:
            mismatches.append(f"Back Image Color Mismatches: {'; '.join(back_color_mismatches)}")
    elif desired_back_num_wires == 0 and detected_back_num_wires == 0:
         # Explicitly state success if both are empty
         pass # No mismatch

    # --- Construct Result Dictionary ---
    if overall_match:
        details = "SUCCESSFUL: Both front and back sequences match within the color threshold."
    else:
        details = "Mismatches found: " + " | ".join(mismatches) if mismatches else "Unknown mismatch" # Should not happen if overall_match is False but no mismatches were added

    return {"match": overall_match, "details": details}

def main():
    try:
        raw_input = sys.stdin.read()
        data = json.loads(raw_input)
        
        wire_count = data["wire_count"]
        sequence = data["sequence"]
        stringified_rgb_list = json.loads(sequence)
        sequence = [json.loads(rgb) for rgb in stringified_rgb_list]
        test_images = base64_to_cv2_image(data["input"])
        wire_type = data["wireType"]

        if wire_type == "singlewire":
            result = compare_single([wire_count[0], sequence[0]], test_images[0])
        elif wire_type == "doublewire":
            result = compare_double([[wire_count[0], sequence[0]], [wire_count[1], sequence[1]]], test_images)
        else:
            raise ValueError("Invalid wire type")

        print(json.dumps(result))

    except Exception as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()