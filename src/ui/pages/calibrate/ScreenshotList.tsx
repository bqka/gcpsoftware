import React from "react";
import { Trash } from "lucide-react";
import ScreenshotItem from "./ScreenshotItem";

interface ScreenshotListProps {
  capturedImages: string[];
  clearScreenshots: () => void;
  deleteScreenshot: (index: number) => void;
}

const ScreenshotList: React.FC<ScreenshotListProps> = ({
  capturedImages,
  clearScreenshots,
  deleteScreenshot,
}) => {
  return (
    <div className="w-full max-w-[400px] h-[500px] flex flex-col items-center bg-background p-4 rounded-lg shadow-lg overflow-hidden">
      <div className="flex flex-row w-full items-center justify-between">
        <h2 className="text-md font-semibold">Captured Screenshots</h2>
        <a onClick={clearScreenshots} className="hover:cursor-pointer">
          <Trash color="red" size={20} />
        </a>
      </div>
      <div className="flex flex-col gap-4 mt-4 overflow-y-auto max-h-[380px]">
        {/* Render captured images */}
        {capturedImages.length === 0 ? (
          <p className="text-center text-gray-500">No screenshots captured</p>
        ) : (
          capturedImages.map((image, index) => (
            <ScreenshotItem
              key={index}
              index={index}
              image={image}
              deleteScreenshot={deleteScreenshot}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ScreenshotList;
