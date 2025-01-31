"use client";

import { useRef, useState } from "react";
import ScreenshotList from "./ScreenshotList";
import axios from "axios";
import { Button } from "@/components/ui/button";
import CameraFeed from "../../../components/ui/CameraFeed";
import BackButton from "@/components/ui/BackButton";

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
    <div className="flex flex-col p-6 w-screen mx-auto items-center">
      <div className="flex justify-start w-full">
        <BackButton />
      </div>

      <div className="flex flex-col items-center justify-center gap-4 p-6 rounded-xl shadow-md w-[875px]">
        <div className="flex justify-center w-full">
          <CameraFeed videoRef={videoRef} />
        </div>

        <div className="flex gap-4 w-full justify-end">
          <Button onClick={handleScreenshot} variant={"outline"} className="px-6 py-3 text-sm">
            Take Image
          </Button>
          <Button onClick={handleUpload} className="px-6 py-3 text-sm">
            Continue
          </Button>
        </div>
      </div>

      <div className="w-[1200px]">
        <ScreenshotList
          capturedImages={capturedImages}
          clearScreenshots={clearScreenshots}
          deleteScreenshot={deleteScreenshot}
        />
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}