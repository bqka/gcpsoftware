"use client";

import { useRef, useState } from "react";
import ScreenshotList from "./ScreenshotList";
import axios from "axios";
import { Button } from "@/components/ui/button";
import CameraFeed from "../../../components/ui/CameraFeed";

export default function Calibrate() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);

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
        <div className="flex flex-col gap-2">
          <CameraFeed videoRef={videoRef} />
          <Button onClick={handleScreenshot} className="max-w-36">Take Image</Button>
          <Button onClick={handleUpload} className="max-w-28">Continue</Button>
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
