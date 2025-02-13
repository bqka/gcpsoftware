import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Power } from "lucide-react";

type Camera = MediaDeviceInfo[];

interface CameraControlProps {
  isCameraOn: boolean;
  enableVideoStream: () => void;
  disableVideoStream: () => void;
  selectedCamera: string | null;
  setSelectedCamera: (deviceId: string) => void;
  cameras: Camera;
}

const CameraControl: React.FC<CameraControlProps> = ({
  isCameraOn,
  enableVideoStream,
  disableVideoStream,
  selectedCamera,
  setSelectedCamera,
  cameras,
}) => {
  const [selectedCameraLabel, setSelectedCameraLabel] = useState<string | "">("");

  useEffect(() => {
    const cameraLabel = cameras.find(
      (camera) => camera.deviceId === selectedCamera
    )?.label || "";
    setSelectedCameraLabel(cameraLabel);
  }, [selectedCamera, cameras]);
  
  return (
    <div className="flex flex-row items-center gap-4 justify-items-start w-full mt-2">
      <Button onClick={isCameraOn ? disableVideoStream : enableVideoStream} variant={isCameraOn ? "destructive" : "default"}>
        <Power className="size-4" />
        {isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
      </Button>
      <div className="max-w-[180px]">
        <div className="relative">
          <div className="w-[200px]">
            <Select
              value={selectedCamera || ""}
              onValueChange={(value) => setSelectedCamera(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Camera">{selectedCameraLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent className="w-[200px] max-w-full">
                {cameras.map((camera, index) => (
                  <SelectItem key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Camera ${index + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraControl;