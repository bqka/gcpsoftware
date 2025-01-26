import numpy as np
import cv2 as cv
import os
import pickle


chessboardSize = (9,7)
frameSize = (640,480)
size_of_chessboard_squares_mm = 25

def calibrate(images, chessboardSize, frameSize, size_of_chessboard_squares_mm):

    criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)

    objp = np.zeros((chessboardSize[0] * chessboardSize[1], 3), np.float32)
    objp[:,:2] = np.mgrid[0:chessboardSize[0],0:chessboardSize[1]].T.reshape(-1,2)

    objp = objp * size_of_chessboard_squares_mm

    objpoints = [] # 3d point in real world space
    imgpoints = [] # 2d points in image plane.

    for image in images:

        img = cv.imread(image)
        gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)

        ret, corners = cv.findChessboardCorners(gray, chessboardSize, None)

        if ret == True:
            objpoints.append(objp)
            imgpoints.append(corners)

    ############## CALIBRATION #######################################################

    ret, cameraMatrix, dist, rvecs, tvecs = cv.calibrateCamera(objpoints, imgpoints, frameSize, None, None)

    pickle.dump((cameraMatrix, dist), open( "calibration.pkl", "wb" ))

    ############## UNDISTORTION #####################################################

    # img = cv.imread('images/img5.png')
    # h,  w = img.shape[:2]
    # newCameraMatrix, roi = cv.getOptimalNewCameraMatrix(cameraMatrix, dist, (w,h), 0, (w,h))



    # # Undistort
    # dst = cv.undistort(img, cameraMatrix, dist, None, newCameraMatrix)

    # # crop the image
    # x, y, w, h = roi
    # cv.imwrite('caliResult1.png', dst)
    # dst = dst[y:y+h, x:x+w]


    # # Undistort with Remapping
    # mapx, mapy = cv.initUndistortRectifyMap(cameraMatrix, dist, None, newCameraMatrix, (w,h), 5)
    # dst = cv.remap(img, mapx, mapy, cv.INTER_LINEAR)

    # # crop the image
    # x, y, w, h = roi
    # cv.imwrite('caliResult2.png', dst)
    # dst = dst[y:y+h, x:x+w]

    # Reprojection Error
    mean_error = 0

    for i in range(len(objpoints)):
        imgpoints2, _ = cv.projectPoints(objpoints[i], rvecs[i], tvecs[i], cameraMatrix, dist)
        error = cv.norm(imgpoints[i], imgpoints2, cv.NORM_L2)/len(imgpoints2)
        mean_error += error

    reprojection_error = mean_error/len(objpoints)

    return reprojection_error