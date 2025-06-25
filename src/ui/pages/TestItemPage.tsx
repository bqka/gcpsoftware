"use client";

import { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, RotateCcw, Check, X } from "lucide-react";
import CameraFeed from "@/components/ui/CameraFeed";
import BackButton from "../../components/ui/BackButton";
import { useUsername } from "./AppContexts";

type ComparisonResult = {
  match: boolean;
  details: string;
};

export default function TestItemPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { wireType, selectedId } = useParams<{
    wireType: string;
    selectedId: string;
  }>();
  const wireTypeSafe = wireType!;
  const selectedWireId = Number(selectedId!);

  const [refImages, setRefImages] = useState<string[]>([]);
  const [testImages, setTestImages] = useState<string[]>([]);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const { username } = useUsername();

  const isDoubleWire = wireType === "doublewire";
  const requiredImages = isDoubleWire ? 2 : 1;

  const getCurrentCanvasFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (context) {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL("image/png");
      }
    }

    return null;
  };

  const fetchWireImages = async () => {
    if (!selectedId) return;
    try {
      const result = await window.electron.fetchWireImage(
        selectedWireId,
        wireType || "singlewire"
      );
      if (!result) {
        throw new Error("Error calling fetchWireImage API");
      }
      setRefImages(result);
    } catch (error) {
      console.error("Error fetching wire image:", error);
    }
  };

  const handleScreenshot = async () => {
    setIsCapturing(true);
    const screenshot = await getCurrentCanvasFrame();

    if (!screenshot) {
      setIsCapturing(false);
      return;
    }

    if (isDoubleWire) {
      if (testImages.length < 2) {
        setTestImages((prev) => [...prev, screenshot]);
      }
      if (testImages.length === 1) {
        setIsPreviewing(true);
      }
    } else {
      setTestImages([screenshot]);
      setIsPreviewing(true);
    }

    setIsCapturing(false);
  };

  const handleRetake = (imageIndex?: number) => {
    if (imageIndex !== undefined) {
      // Retake specific image
      const newTestImages = [...testImages];
      newTestImages.splice(imageIndex, 1);
      setTestImages(newTestImages);
      if (newTestImages.length === 0) {
        setIsPreviewing(false);
      }
    } else {
      // Retake all images
      setTestImages([]);
      setIsPreviewing(false);
    }
  };

  const handleTestClick = async () => {
    if (!selectedId || testImages.length === 0) {
      alert("Please capture required images first.");
      return;
    }

    try {
      const testImagesStripped = testImages.map(testImage => testImage.replace(/^data:image\/\w+;base64,/, ""));

      const result: ComparisonResult = await window.electron.compareItem(
        refImages,
        testImagesStripped,
        wireTypeSafe
      );
      if (result?.match === true) {
        alert("RESULT: OK");
      } else {
        alert(`RESULT: Mismatch\nLog: ${result.details}`);
      }

      if(!username) throw new Error("No Username provided")
      await window.electron.addResult(wireTypeSafe, selectedWireId, result.match, result.details, username, testImages)
    } catch (error) {
      console.error("Error comparing:", error);
    }
  };

  const getImageLabel = (index: number) => {
    if (isDoubleWire) {
      return index === 0 ? "Front View" : "Back View";
    }
    return "Single View";
  };

  const getCaptureButtonText = () => {
    if (isCapturing) return "Capturing...";
    if (isDoubleWire) {
      if (testImages.length === 0) return "Capture Front Image";
      if (testImages.length === 1) return "Capture Back Image";
    }
    return "Capture Image";
  };

  useEffect(() => {
    fetchWireImages();
  }, [selectedId, wireType]);

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <BackButton />
          <div>
            <h1 className="text-2xl font-bold text-gray-50">
              Test {isDoubleWire ? "Double Wire" : "Single Wire"}
            </h1>
            <p className="text-gray-300 mt-1">
              Capture {requiredImages} image{requiredImages > 1 ? "s" : ""} to
              compare with reference
            </p>
          </div>
          <div className="ml-auto">
            <Badge
              variant={
                testImages.length === requiredImages ? "default" : "secondary"
              }
            >
              {testImages.length}/{requiredImages} Images Captured
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Camera Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Live Camera Feed
                  {isDoubleWire && testImages.length < 2 && (
                    <Badge variant="outline" className="ml-auto">
                      {testImages.length === 0 ? "Front View" : "Back View"}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isPreviewing && (
                  <div className="relative">
                    <CameraFeed videoRef={videoRef} />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                )}

                {isPreviewing && testImages.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-300">
                      Preview Captured Images
                    </h3>
                    <div className="grid gap-4">
                      {testImages.map((src, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={src || "/placeholder.svg"}
                            alt={`Captured ${getImageLabel(idx)}`}
                            className="w-full aspect-video object-cover border rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleRetake(idx)}
                              className="flex items-center gap-2"
                            >
                              <RotateCcw className="h-4 w-4" />
                              Retake
                            </Button>
                          </div>
                          <Badge className="absolute top-2 left-2">
                            {getImageLabel(idx)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  {!isPreviewing && (
                    <Button
                      onClick={handleScreenshot}
                      disabled={
                        isCapturing || (isDoubleWire && testImages.length >= 2)
                      }
                      className="flex items-center gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      {getCaptureButtonText()}
                    </Button>
                  )}

                  {testImages.length > 0 && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleRetake()}
                        className="flex items-center gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Retake All
                      </Button>

                      {!isPreviewing && (
                        <Button
                          variant="secondary"
                          onClick={() => setIsPreviewing(true)}
                          className="flex items-center gap-2"
                        >
                          <Check className="h-4 w-4" />
                          Preview
                        </Button>
                      )}

                      {isPreviewing && (
                        <Button
                          variant="secondary"
                          onClick={() => setIsPreviewing(false)}
                          className="flex items-center gap-2"
                        >
                          <Camera className="h-4 w-4" />
                          Continue Capturing
                        </Button>
                      )}
                    </>
                  )}

                  <Button
                    onClick={handleTestClick}
                    disabled={testImages.length < requiredImages}
                    className="ml-auto flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Run Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reference and Captured Images */}
          <div className="space-y-6">
            {/* Reference Images */}
            <Card>
              <CardHeader>
                <CardTitle>Reference Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {refImages.map((src, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={src || "/placeholder.svg"}
                        alt={`Reference ${getImageLabel(idx)}`}
                        className="w-full aspect-video object-cover border rounded-lg"
                      />
                      <Badge className="absolute top-2 left-2 bg-blue-500">
                        Reference {getImageLabel(idx)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Captured Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Your Captured Images
                  <Badge
                    variant={
                      testImages.length === requiredImages
                        ? "default"
                        : "secondary"
                    }
                  >
                    {testImages.length}/{requiredImages}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {testImages.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No images captured yet</p>
                    <p className="text-sm">
                      Use the camera to capture {requiredImages} image
                      {requiredImages > 1 ? "s" : ""}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {testImages.map((src, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={src || "/placeholder.svg"}
                          alt={`Captured ${getImageLabel(idx)}`}
                          className="w-full aspect-video object-cover border rounded-lg"
                        />
                        <Badge className="absolute top-2 left-2 bg-green-500">
                          Captured {getImageLabel(idx)}
                        </Badge>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRetake(idx)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    {/* Placeholder for remaining images */}
                    {Array.from({
                      length: requiredImages - testImages.length,
                    }).map((_, idx) => (
                      <div
                        key={`placeholder-${idx}`}
                        className="w-full aspect-video border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500"
                      >
                        <div className="text-center">
                          <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">
                            {getImageLabel(testImages.length + idx)} needed
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
