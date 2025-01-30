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
    <div className="w-full max-w-[1200px] h-[300px] gap-4 flex flex-col items-center justify-between bg-background p-4 rounded-lg shadow-lg overflow-hidden border">
      <div className="flex flex-row w-full items-center justify-start gap-4">
        <h2 className="text-md font-semibold">Captured Screenshots</h2>
        <a onClick={clearScreenshots} className="hover:cursor-pointer">
          <Trash color="red" size={18} />
        </a>
      </div>
      <div className="flex flex-row gap-4 max-w-full overflow-x-auto flex-grow items-center">
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
