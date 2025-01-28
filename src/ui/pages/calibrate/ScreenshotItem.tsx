import React from "react";
import close from "@/ui/assets/close.svg";

interface ScreenshotItemProps {
  image: string;
  index: number;
  deleteScreenshot: (index: number) => void;
}

const ScreenshotItem: React.FC<ScreenshotItemProps> = ({
  image,
  index,
  deleteScreenshot,
}) => {
  return (
    <div key={index} className="group aspect-[1.60] h-[120px] relative">
      <img
        src={image}
        alt={`Screenshot ${index + 1}`}
        className="w-full h-full object-cover rounded-lg"
      />
      <a onClick={() => deleteScreenshot(index)}>
        <img
          src={close}
          alt="Delete Screenshot"
          className="absolute opacity-0 group-hover:opacity-100 hover:cursor-pointer top-0 right-0 w-auto h-[25px] translate-x-1/2 -translate-y-1/2"
        />
      </a>
    </div>
  );
};

export default ScreenshotItem;
