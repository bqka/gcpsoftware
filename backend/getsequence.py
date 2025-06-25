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
    """
    Detects the number of wires and their color sequence from left to right in the input image.

    Args:
        image (np.array): Input image in BGR format.

    Returns:
        tuple: A tuple containing the number of detected wires (int) and a list
               of their BGR color values (list of tuples).
               Returns (0, []) if no wires are detected or processing fails.
    """
    # Ensure image is valid
    if image is None or image.size == 0:
        print("Error: Input image is None or empty.", file=sys.stderr)
        return 0, []

    # --- Phase 1: Preprocessing (Adapted from load_and_preprocess_image) ---
    # The input 'image' is already the original color image.
    original_image = image.copy() # Work on a copy
    gray_image = cv2.cvtColor(original_image, cv2.COLOR_BGR2GRAY)
    blurred_gray = cv2.GaussianBlur(gray_image, (7, 7), 0)

    # --- Phase 2: Segment Connector (Adapted from segment_connector) ---
    # Use the blurred_gray image
    binary_image = cv2.adaptiveThreshold(
        blurred_gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY, 21, 5
    )

    kernel = np.ones((7, 7), np.uint8)
    closed_mask = cv2.morphologyEx(binary_image, cv2.MORPH_CLOSE, kernel, iterations=2)
    opened_mask = cv2.morphologyEx(closed_mask, cv2.MORPH_OPEN, kernel, iterations=1)

    # Check the "whiteness" of the initial opened_mask
    mean_opened_mask_val = np.mean(opened_mask)
    #print(f"Initial opened_mask mean value (0-255): {mean_opened_mask_val:.2f}") # Removed print

    # If the mask is mostly white, invert
    if mean_opened_mask_val > 127:
        #print("Mask is predominantly white, inverting thresholding.") # Removed print
        binary_image = cv2.adaptiveThreshold(
            blurred_gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY_INV, 21, 5
        )
        closed_mask = cv2.morphologyEx(binary_image, cv2.MORPH_CLOSE, kernel, iterations=2)
        opened_mask = cv2.morphologyEx(closed_mask, cv2.MORPH_OPEN, kernel, iterations=1)
        #print(f"Inverted opened_mask mean value: {np.mean(opened_mask):.2f}") # Removed print

    # Final check: Ensure the largest contour is white against black
    contours, _ = cv2.findContours(opened_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        largest_contour = max(contours, key=cv2.contourArea)
        temp_mask_for_contour_check = np.zeros(opened_mask.shape, dtype=np.uint8)
        cv2.drawContours(temp_mask_for_contour_check, [largest_contour], -1, 255, cv2.FILLED)
        mean_val_in_contour = cv2.mean(opened_mask, mask=temp_mask_for_contour_check)[0]
        if mean_val_in_contour < 127:
            #print("Largest contour is dark, inverting final mask.") # Removed print
            connector_mask = cv2.bitwise_not(opened_mask)
        else:
            connector_mask = opened_mask
    else:
        # No connector found
        print("No contours found for the connector after mask generation.", file=sys.stderr)
        return 0, []

    # --- Phase 3: Crop Connector and Wires (Adapted from crop_connector_and_wires) ---
    contours_for_bbox, _ = cv2.findContours(connector_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours_for_bbox:
        print("No contours found after segmentation. Cropping aborted.", file=sys.stderr)
        return 0, []

    largest_contour_for_bbox = max(contours_for_bbox, key=cv2.contourArea)
    x, y, w, h = cv2.boundingRect(largest_contour_for_bbox)

    # Expansion factors (Matching values from executed code)
    expand_factor_y_up = 2.5
    expand_factor_y_down = 0.5
    expand_factor_x = 0.3

    new_y = max(0, int(y - h * expand_factor_y_up))
    new_height = min(original_image.shape[0], int(y + h + h * expand_factor_y_down)) - new_y
    new_x = max(0, int(x - w * expand_factor_x))
    new_width = min(original_image.shape[1], int(x + w + w * expand_factor_x)) - new_x

    new_x = max(0, new_x)
    new_y = max(0, new_y)
    new_width = min(new_width, original_image.shape[1] - new_x)
    new_height = min(new_height, original_image.shape[0] - new_y)

    if new_width <= 0 or new_height <= 0:
        print(f"Calculated crop dimensions are invalid: w={new_width}, h={new_height}. Using full image.", file=sys.stderr)
        cropped_image_roi = original_image
        cropped_y = 0 # Offset is 0 if full image is used
    else:
        cropped_image_roi = original_image[new_y : new_y + new_height, new_x : new_x + new_width]
        cropped_y = new_y # Keep track of the Y offset from the original image

    if cropped_image_roi is None or cropped_image_roi.size == 0:
        print("Failed to crop image ROI.", file=sys.stderr)
        return 0, []

    # --- Phase 4: Detect Wires and Sample Colors (Adapted from detect_wires_by_edge_on_line) ---
    img = cropped_image_roi
    img_height, img_width = img.shape[:2]

    # Parameters from the executed detect_wires_by_edge_on_line call
    sampling_line_y = 200 # From executed code
    canny_thresh_low = 30  # From executed code
    canny_thresh_high = 90 # From executed code
    min_segment_width = 1 # From executed code
    sample_offset = 3 # From executed code
    sample_width = 7 # From executed code
    sample_strip_height = 7 # From executed code
    min_wire_body_width = 8 # From executed code
    min_wire_spacing = 2 # From executed code

    # Ensure sampling line is within cropped image bounds
    sampling_line_y = max(0, min(sampling_line_y, img_height - 1))
    #print(f"Using sampling line at Y-coordinate: {sampling_line_y} (relative to cropped image top).") # Removed print

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, canny_thresh_low, canny_thresh_high)

    is_on_edge_segment = False
    segment_start_x = -1
    detected_edge_segments_x = []

    for x in range(img_width):
        edge_pixel_value = edges[sampling_line_y, x]
        if edge_pixel_value > 0:
            if not is_on_edge_segment:
                is_on_edge_segment = True
                segment_start_x = x
        else:
            if is_on_edge_segment:
                segment_end_x = x - 1
                segment_width = segment_end_x - segment_start_x + 1
                if segment_width >= min_segment_width:
                    detected_edge_segments_x.append((segment_start_x, segment_end_x))
                is_on_edge_segment = False
                segment_start_x = -1

    if is_on_edge_segment:
        segment_end_x = img_width - 1
        segment_width = segment_end_x - segment_start_x + 1
        if segment_width >= min_segment_width:
            detected_edge_segments_x.append((segment_start_x, segment_end_x))

    detected_edge_segments_x.sort(key=lambda item: item[0])

    wire_count = 0
    detected_wires_info = [] # Store wire details (color, approximate position)
    last_sampled_wire_end_x = -min_wire_spacing

    i = 0
    while i < len(detected_edge_segments_x):
        left_edge_start, left_edge_end = detected_edge_segments_x[i]
        potential_right_edge_index = -1
        for j in range(i + 1, len(detected_edge_segments_x)):
            right_edge_start, right_edge_end = detected_edge_segments_x[j]
            distance_between_edges = right_edge_start - left_edge_end - 1
            potential_wire_body_width = right_edge_start - left_edge_end + 1

            if (right_edge_start > left_edge_end and
                distance_between_edges >= 0 and distance_between_edges < min_wire_body_width * 3 and
                potential_wire_body_width > min_wire_body_width and
                left_edge_start > last_sampled_wire_end_x + min_wire_spacing):
                potential_right_edge_index = j
                break

        if potential_right_edge_index != -1:
            right_edge_start, right_edge_end = detected_edge_segments_x[potential_right_edge_index]
            wire_body_center_x = (left_edge_start + right_edge_end) // 2
            sample_start_x = max(left_edge_end + 1, wire_body_center_x - sample_width // 2)
            sample_end_x = min(right_edge_start - 1, wire_body_center_x + sample_width // 2)

            if sample_start_x > sample_end_x:
                 sample_start_x = left_edge_end + sample_offset
                 sample_end_x = sample_start_x + sample_width
                 sample_end_x = min(sample_end_x, img_width - 1)
                 if sample_start_x > sample_end_x:
                     i = potential_right_edge_index + 1
                     continue

            sample_start_x = max(0, sample_start_x)
            sample_end_x = min(img_width - 1, sample_end_x)
            sample_top_y = max(0, sampling_line_y - sample_strip_height)
            sample_bottom_y = min(img_height - 1, sampling_line_y + sample_strip_height)

            if sample_top_y >= sample_bottom_y or sample_start_x >= sample_end_x:
                #print(f"Warning: Invalid sample region calculated for potential wire at edges {left_edge_start}-{left_edge_end} and {right_edge_start}-{right_edge_end}. Skipping color sampling.") # Removed print
                i = potential_right_edge_index + 1
                continue

            color_sample_region = img[sample_top_y : sample_bottom_y + 1, sample_start_x : sample_end_x + 1]

            if color_sample_region.size > 0:
                average_color_bgr = np.mean(color_sample_region, axis=(0, 1)).astype(np.uint8).tolist()
                detected_wires_info.append(tuple(average_color_bgr)) # Store BGR tuple directly
                wire_count += 1

                last_sampled_wire_end_x = right_edge_end
                i = potential_right_edge_index + 1
            else:
                 #print(f"Warning: Sample region size is zero for potential wire at edges {left_edge_start}-{left_edge_end} and {right_edge_start}-{right_edge_end}. Skipping color sampling.", file=sys.stderr) # Removed print
                 i = potential_right_edge_index + 1

        else:
            i += 1
        

    return wire_count, detected_wires_info

def get_double_sequence(front_image, back_image):
    """
    Detects the wire sequence (number of wires and BGR colors) for both the front and back sides of a connector.

    Args:
        front_image (np.array): The image (BGR format) of the front side.
        back_image (np.array): The image (BGR format) of the back side.

    Returns:
        tuple: A tuple containing two elements. The first element is the result
               for the front image (number of wires, list of BGR tuples), and
               the second element is the result for the back image
               (number of wires, list of BGR tuples). Returns ((0, []), (0, []))
               if processing fails for either image.
    """
    front_result = get_single_sequence(front_image)
    back_result = get_single_sequence(back_image)

    # Ensure results are in the expected format even if get_single_sequence failed
    if not isinstance(front_result, tuple) or len(front_result) != 2:
        front_result = (0, [])
    if not isinstance(back_result, tuple) or len(back_result) != 2:
        back_result = (0, [])

    return front_result, back_result

def main():
    try:
        raw_input = sys.stdin.read()
        data = json.loads(raw_input)

        images = data["input"]
        wire_type = data["wireType"]

        if wire_type == "singlewire":
            image_cv2 = base64_to_cv2_image(images[0])
            result = get_single_sequence(image_cv2)
            print(json.dumps([{"sequence": json.dumps(result[1])}]))
        elif wire_type == "doublewire":
            front_cv2 = base64_to_cv2_image(images[0])
            back_cv2 = base64_to_cv2_image(images[1])
            front_result, back_result = get_double_sequence(front_cv2, back_cv2)
            print(json.dumps([{"sequence": json.dumps(front_result[1])}, {"sequence": json.dumps(back_result[1])}]))
        else:
            raise ValueError("Invalid wire type")
    except Exception as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()