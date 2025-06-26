"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, RotateCcw, Save, Check, AlertCircle } from "lucide-react";
import CameraFeed from "@/components/ui/CameraFeed";
import BackButton from "@/components/ui/BackButton";

export default function AddItemPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // const { wireType } = useParams<{ wireType: string }>();
  const wireType = useParams<{ wireType?: string }>().wireType ?? "singlewire";

  const [wireName, setWireName] = useState("");
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentStep, setCurrentStep] = useState<"front" | "back" | "complete">(
    "front"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detSequence, setDetSequence] = useState<string[]>([]);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);

  const isDoubleWire = wireType === "doublewire";
  const totalSteps = isDoubleWire ? 2 : 1;
  const completedSteps = frontImage ? (backImage || !isDoubleWire ? 2 : 1) : 0;

  const getCurrentCanvasFrame = async (): Promise<string | null> => {
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

  const handleScreenshot = async () => {
    if (isCapturing) return;

    setIsCapturing(true);
    setError(null);

    try {
      const screenshot = await getCurrentCanvasFrame();
      if (!screenshot) throw new Error("Failed to capture image");

      if (currentStep === "front") {
        setFrontImage(screenshot);
        if (isDoubleWire) {
          setCurrentStep("back");
        } else {
          setCurrentStep("complete");
        }
      } else if (currentStep === "back") {
        setBackImage(screenshot);
        setCurrentStep("complete");
      }
    } catch (err) {
      setError("Failed to capture image. Please try again.");
      console.error("Screenshot error:", err);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRetake = (imageType: "front" | "back") => {
    if (imageType === "front") {
      setFrontImage(null);
      setCurrentStep("front");
      if (isDoubleWire) {
        setBackImage(null);
      }
    } else if (imageType === "back") {
      setBackImage(null);
      setCurrentStep("back");
    }
    setDetSequence([]);
    setError(null);
  };

  const handleSave = async () => {
    if (!wireName.trim()) {
      setError("Please enter an item name");
      return;
    }

    if (!frontImage || (isDoubleWire && !backImage)) {
      setError("Please capture all required images");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (isDoubleWire) {
        if (!backImage) {
          setError("Could not process back image");
          return;
        }
          await window.electron.addWire(wireType, wireName, JSON.stringify(detSequence), [
            frontImage,
            backImage,
          ]);
      } else {
          await window.electron.addWire(wireType, wireName, JSON.stringify(detSequence), [
            frontImage,
          ]);
      }

      setWireName("");
      setDetSequence([]);
      setFrontImage(null);
      setBackImage(null);
      setCurrentStep("front");
    } catch (err) {
      setError("Failed to save item. Please try again.");
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInvalid = async () => {
    setIsSaving(true);
    try {
      if (!frontImage) {
        setError("Could not process back image");
        return;
      }
      if (isDoubleWire) {
        if (!backImage) {
          setError("Could not process back image");
          return;
        }
        await window.electron.addMismatch(wireType, wireName, detSequence.toString(), [
          frontImage,
          backImage,
        ]);
      } else {
          await window.electron.addMismatch(wireType, wireName, detSequence.toString(), [
            frontImage,
          ]);
      }

      setWireName("");
      setFrontImage(null);
      setDetSequence([]);
      setBackImage(null);
      setCurrentStep("front");
    } catch (err) {
      setError("Failed to add item to mismatch list. Please try again.");
      console.error("Save error:", err);
    } finally{
      setIsSaving(false);
    }
  };

  const getStepTitle = () => {
    if (currentStep === "front") return "Capture Front View";
    if (currentStep === "back") return "Capture Back View";
    return "Review & Save";
  };

  const getStepDescription = () => {
    if (currentStep === "front")
      return "Position the item and capture the front view";
    if (currentStep === "back")
      return "Flip the item and capture the back view";
    return "Review your captures and save the item";
  };

  const shouldShowCamera = () => {
    if (!frontImage && currentStep === "front") return true;
    if (isDoubleWire && !backImage && currentStep === "back") return true;
    return false;
  };

  const getDetectedSequence = async () => {
    if (!frontImage) {
      setError("Could not process front image.");
      return;
    }
    if (isDoubleWire) {
      if (!backImage) {
        setError("Could not process back image");
        return;
      }
      return await window.electron.getSequence(
        [frontImage, backImage],
        wireType
      );
    } else {
      return await window.electron.getSequence([frontImage], wireType);
    }
  };

  useEffect(() => {
    if (currentStep === "complete") {
      const fetchSequence = async () => {
        setIsDetecting(true);
        try {
          const detected = await getDetectedSequence();
          if (!detected) throw new Error("Error detecting sequence.");
          if (detected.type === "singlewire") {
            setDetSequence([JSON.stringify(detected.sequence)]);
          } else {
            setDetSequence([JSON.stringify(detected.sequence_front), JSON.stringify(detected.sequence_back)]);
          }
        } catch (err) {
          console.error("Error detecting sequence:", err);
          setError("An error occurred while detecting the sequence.");
        } finally {
          setIsDetecting(false);
        }
      };
      fetchSequence();
    }
  }, [currentStep]);

  const canSave = wireName.trim() && frontImage && (!isDoubleWire || backImage) && detSequence.length > 0 && !isDetecting;

  return (
    <div className="min-h-screen bg-blac p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <BackButton />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-50">
              Add {isDoubleWire ? "Double Wire" : "Single Wire"} Item
            </h1>
            <p className="text-gray-300 mt-1">
              Capture {totalSteps} image{totalSteps > 1 ? "s" : ""} and add item
              details
            </p>
          </div>
          <Badge variant={currentStep === "complete" ? "default" : "secondary"}>
            Step {Math.min(completedSteps + 1, totalSteps + 1)} of{" "}
            {totalSteps + 1}
          </Badge>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Camera/Capture Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    {getStepTitle()}
                  </div>
                  {isDoubleWire && (
                    <Badge variant="outline">
                      {currentStep === "front"
                        ? "Front"
                        : currentStep === "back"
                        ? "Back"
                        : "Complete"}
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-gray-300">{getStepDescription()}</p>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {shouldShowCamera() ? (
                    <div className="aspect-video w-full rounded-lg bg-black">
                      <CameraFeed videoRef={videoRef} />
                    </div>
                  ) : (
                    <div className="aspect-video w-full rounded-lg overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Check className="h-12 w-12 mx-auto mb-2 text-green-500" />
                        <p className="font-medium">Images Captured</p>
                        <p className="text-sm">Review your captures below</p>
                      </div>
                    </div>
                  )}
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                <div className="flex gap-3 mt-6">
                  {shouldShowCamera() && (
                    <Button
                      onClick={handleScreenshot}
                      disabled={isCapturing}
                      className="flex items-center gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      {isCapturing
                        ? "Capturing..."
                        : `Capture ${
                            currentStep === "front" ? "Front" : "Back"
                          } Image`}
                    </Button>
                  )}

                  {(frontImage || backImage) && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        handleRetake(
                          (currentStep === "back" ||
                            currentStep == "complete") &&
                            backImage
                            ? "back"
                            : "front"
                        )
                      }
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Retake{" "}
                      {(currentStep === "back" || currentStep == "complete") &&
                      backImage
                        ? "Back"
                        : "Front"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Item Details Form */}
            <Card>
              <CardHeader>
                <CardTitle>Item Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="sequence">Item Name *</Label>
                  <Input
                    id="sequence"
                    value={wireName}
                    onChange={(e) => setWireName(e.target.value)}
                    placeholder="Enter item name or sequence"
                    className="mt-1"
                  />
                </div>

                <div className="flex flex-row gap-4 items-center">
                  <Button
                    onClick={handleSave}
                    disabled={(!canSave || isSaving )}
                    className="flex items-center gap-2"
                    size="lg"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? "Saving..." : "Validate"}
                  </Button>

                  <Button
                    size="lg"
                    variant="destructive"
                    disabled={!canSave || isSaving}
                    onClick={handleInvalid}
                  >
                    Invalidate
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Image Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Front Image */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Front View</Label>
                    {frontImage && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRetake("front")}
                        className="h-6 px-2 text-xs"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Retake
                      </Button>
                    )}
                  </div>
                  <div className="aspect-video w-full border border-gray-300 rounded-lg overflow-hidden">
                    {frontImage ? (
                      <div className="w-full h-full">
                        <img
                          src={frontImage}
                          alt="Front view"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Front image not captured</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {currentStep === "complete" &&
                    (isDetecting ? (
                      <span className="font-mono text-white text-sm">
                        Loading...
                      </span>
                    ) : (
                      <p className="text-sm text-gray-300">
                        Detected Sequence:{" "}
                        <span className="font-mono text-white">
                          {detSequence[0]}
                        </span>
                      </p>
                    ))}
                </div>

                {/* Back Image (for double wire) */}
                {isDoubleWire && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Back View</Label>
                      {backImage && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRetake("back")}
                          className="h-6 px-2 text-xs"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Retake
                        </Button>
                      )}
                    </div>
                    <div className="aspect-video w-full border border-gray-300 rounded-lg overflow-hidden">
                      {backImage ? (
                        <div className="w-full h-full">
                          <img
                            src={backImage}
                            alt="Back view"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <div className="text-center">
                            <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Back image not captured</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {currentStep === "complete" &&
                      (isDetecting ? (
                        <span className="font-mono text-white text-sm">
                          Loading...
                        </span>
                      ) : (
                        <p className="text-sm text-gray-300">
                          Detected Sequence:{" "}
                          <span className="font-mono text-white">
                            {detSequence[1]}
                          </span>
                        </p>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Progress Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Front Image</span>
                  <Badge variant={frontImage ? "default" : "secondary"}>
                    {frontImage ? "Captured" : "Pending"}
                  </Badge>
                </div>
                {isDoubleWire && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Back Image</span>
                    <Badge variant={backImage ? "default" : "secondary"}>
                      {backImage ? "Captured" : "Pending"}
                    </Badge>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span>Item Name</span>
                  <Badge variant={wireName.trim() ? "default" : "secondary"}>
                    {wireName.trim() ? "Added" : "Pending"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
