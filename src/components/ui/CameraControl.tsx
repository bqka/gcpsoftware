import React from "react";
import { Button } from "@/components/ui/button";

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
  return (
    <div className="flex flex-row items-center gap-4 justify-items-start w-full mt-2">
      <Button onClick={isCameraOn ? disableVideoStream : enableVideoStream}>
        {isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
      </Button>
      <div className="max-w-[180px]">
        <div className="relative">
          <select
            className="px-2 bg-primary-50 py-2 rounded-lg w-full text-white"
            onChange={(e) => setSelectedCamera(e.target.value)}
            value={selectedCamera || ""}
          >
            {cameras.map((camera, index) => (
              <option key={camera.deviceId} value={camera.label}>
                {camera.label || `Camera ${index + 1}`}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default CameraControl;
