"use client";

import { useRef, useState, useEffect } from "react";
import CameraControl from "./CameraControl";
import ScreenshotList from "./ScreenshotList";
import axios from "axios";

type Camera = MediaDeviceInfo;
type MediaStreamState = MediaStream | null;

export default function CameraFeed() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStreamState>(null);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(false);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);

  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        setCameras(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error("Error fetching cameras", err);
      }
    };
    getCameras();

    return () => {
      disableVideoStream();
    };
  }, []);

  const enableVideoStream = async () => {
    try {
      if (!selectedCamera) {
        console.error("No camera selected");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedCamera },
      });
      setMediaStream(stream);
      setIsCameraOn(true);
    } catch (error) {
      console.error("Error accessing webcam", error);
    }
  };

  const disableVideoStream = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
      setMediaStream(null);
      setIsCameraOn(false);
    }
  };

  useEffect(() => {
    if (videoRef.current && mediaStream) {
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

  const deleteScreenshot = (index: number) => {
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
