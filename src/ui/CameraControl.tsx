// @ts-nocheck
import React from "react";

type Camera = string[];

interface CameraControlProps {
  isCameraOn: boolean;
  enableVideoStream: () => void;
  disableVideoStream: () => void;
  selectedCamera: string;
  setSelectedCamera: (deviceId: string) => void;
  cameras: Camera[];
  handleScreenshot: () => void;
}

const CameraControl: React.FC<CameraControlProps> = ({
  isCameraOn,
  enableVideoStream,
  disableVideoStream,
  selectedCamera,
  setSelectedCamera,
  cameras,
  handleScreenshot,
}) => {
  return (
    <div className="flex flex-row items-center gap-4 justify-items-start w-full">
      <button
        className="px-4 bg-secondary-50 text-text-950 font-semibold rounded-lg shadow-md py-2"
        onClick={isCameraOn ? disableVideoStream : enableVideoStream}
      >
        {isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
      </button>
      <button
        className="bg-accent-500 text-text-950 p-2 font-semibold rounded-lg shadow-md hover:bg-accent-400"
        onClick={handleScreenshot}
      >
        Take Screenshot
      </button>
      <div className="max-w-[180px]">
        <div className="relative">
          <select
            className="px-2 bg-primary-50 py-2 rounded-lg w-full"
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
