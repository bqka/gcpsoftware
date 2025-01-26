from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
import numpy as np
import cv2 as cv
import pickle
import os
import base64
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

class ImageData(BaseModel):
    images: list[str]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5123"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CALIBRATION_FILE_PATH = "cameraMatrix.pkl"

def calibrate(images, chessboard_size=(9, 7), square_size_mm=25):
    criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)
    objp = np.zeros((chessboard_size[0] * chessboard_size[1], 3), np.float32)
    objp[:, :2] = np.mgrid[0:chessboard_size[0], 0:chessboard_size[1]].T.reshape(-1, 2)
    objp = objp * square_size_mm

    objpoints = []  # 3d point in real-world space
    imgpoints = []  # 2d points in image plane

    for image in images:
        # img = cv.imdecode(np.frombuffer(image, np.uint8), cv.IMREAD_COLOR)
        gray = cv.cvtColor(image, cv.COLOR_BGR2GRAY)
        ret, corners = cv.findChessboardCorners(gray, chessboard_size, None)
        if ret:
            objpoints.append(objp)
            imgpoints.append(corners)

    if(len(objpoints) == 0):
        raise HTTPException(400, detail="Not enough images with checkboard visible")
    
    ret, camera_matrix, dist, rvecs, tvecs = cv.calibrateCamera(
        objpoints, imgpoints, (640, 480), None, None
    )

    mean_error = 0

    for i in range(len(objpoints)):
        imgpoints2, _ = cv.projectPoints(objpoints[i], rvecs[i], tvecs[i], camera_matrix, dist)
        error = cv.norm(imgpoints[i], imgpoints2, cv.NORM_L2)/len(imgpoints2)
        mean_error += error

    reprojection_error = mean_error/len(objpoints)

    if(reprojection_error > 0.05):
        raise HTTPException(400, "Camera was not properly calibrated")

    with open(CALIBRATION_FILE_PATH, "wb") as f:
        pickle.dump((camera_matrix, dist), f)

    return camera_matrix, dist, error

def decode_base64_to_image(base64_str: str):
    """Decodes a base64 string to an image in memory."""

    if base64_str.startswith('data:image/png;base64,'):
        base64_str = base64_str[len('data:image/png;base64,'):]


    image_bytes = base64.b64decode(base64_str)
    np_arr = np.frombuffer(image_bytes, np.uint8)
    image = cv.imdecode(np_arr, cv.IMREAD_COLOR)
    
    return image

@app.post("/calibrate") 
async def calibrate_camera(image_data: ImageData):
    if(len(image_data.images) < 10):
        raise HTTPException(400, "Not enough images for calibration")
    
    images = []

    for base64_image in image_data.images:
        images.append(decode_base64_to_image(base64_image))

    camera_matrix, dist, error = calibrate(images)

    return {"message": "Calibration successful with Reprojection Error: " + str(round(error, 3)),"camera_matrix": camera_matrix.tolist()}


@app.get("/download_matrix")
async def download_matrix():
    if os.path.exists(CALIBRATION_FILE_PATH):
        return FileResponse(CALIBRATION_FILE_PATH)
    else:
        raise HTTPException(status_code=404, detail="Camera matrix not found")

@app.get("/test")
def test():
    return "Hello"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)