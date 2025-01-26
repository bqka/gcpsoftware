"use client";

// @ts-nocheck

import { useRef, useState, useEffect } from "react";
import CameraControl from "./CameraControl";
import ScreenshotList from "./ScreenshotList";
import axios from "axios";

export default function CameraFeed() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);

  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        // @ts-ignore
        setCameras(videoDevices);
        if (videoDevices.length > 0) {
          // @ts-ignore
          setSelectedCamera(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error("Error fetching cameras", err);
      }
    };

    getCameras();
  }, []);

  const enableVideoStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // @ts-ignore
      setMediaStream(stream);
      setIsCameraOn(true);
    } catch (error) {
      console.error("Error accessing webcam", error);
    }
  };

  const disableVideoStream = () => {
    if (mediaStream) {
      // @ts-ignore
      mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
      setMediaStream(null);
      setIsCameraOn(false);
    }
  };

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      // @ts-ignore
      videoRef.current.srcObject = mediaStream;
    }
  }, [videoRef, mediaStream]);

  const handleScreenshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (context) {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const screenshot = canvas.toDataURL("image/png");

        setCapturedImages((prevImages) => [...prevImages, screenshot]);
      } else {
        console.error("Canvas context is not available");
      }
    } else {
      console.error("Video or canvas reference is missing");
    }
  };

  const clearScreenshots = () => {
    setCapturedImages([]);
  };

  // @ts-ignore
  const deleteScreenshot = (index) => {
    setCapturedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/calibrate",
        {
          images: capturedImages,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Backend response:", response.data);
    } catch (error: any) {
      // @ts-ignore
      if (error.response) {
        console.log(
          "Error from backend:",
          error.response.data?.detail || "Calibration Failed"
        );
      } else {
        console.error("Error:", error.message);
      }
    }
  };

  return (
    <div className="flex flex-row">
      <div className="flex flex-col items-center justify-center rounded-2xl p-4">
        <div className="flex flex-col gap-4 w-[595px]">
          <div
            className={`relative h-[335px] max-w-full bg-background-100 rounded-xl -z-10 overflow-hidden`}
          >
            {mediaStream != null ? (
              <video
                ref={videoRef}
                autoPlay={true}
                className="object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -scale-x-100"
              />
            ) : (
              <div className="h-full w-full bg-gray-700 flex justify-center items-center text-text-50 font-semibold">
                <div>Camera is Off</div>
              </div>
            )}
          </div>

          <CameraControl
            isCameraOn={isCameraOn}
            enableVideoStream={enableVideoStream}
            disableVideoStream={disableVideoStream}
            selectedCamera={selectedCamera}
            setSelectedCamera={setSelectedCamera}
            cameras={cameras}
            handleScreenshot={handleScreenshot}
          />
          <button
            className="bg-accent-500 text-text-950 p-2 font-semibold rounded-lg shadow-md hover:bg-accent-400"
            onClick={handleUpload}
          >
            Continue
          </button>
        </div>
      </div>

      <ScreenshotList
        capturedImages={capturedImages}
        clearScreenshots={clearScreenshots}
        deleteScreenshot={deleteScreenshot}
      />

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
