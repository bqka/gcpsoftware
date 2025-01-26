// @ts-nocheck
import React from 'react';
import trash from './assets/trash.svg';
import ScreenshotItem from './ScreenshotItem';

const ScreenshotList = ({ capturedImages, clearScreenshots, deleteScreenshot }) => {
  return (
    <div className="w-[260px] h-[460px] flex flex-col items-center">
      <div className="flex flex-row w-full">
        <h2 className="text-lg font-bold flex-1">Captured Screenshots</h2>
        <a onClick={clearScreenshots} className="hover:cursor-pointer">
          <img src={trash} alt="Delete all Screenshots" className="h-[24px] w-auto" />
        </a>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {capturedImages.map((image, index) => (
          <ScreenshotItem
            key={index}
            index={index}
            image={image}
            deleteScreenshot={deleteScreenshot}
          />
        ))}
      </div>
    </div>
  );
};

export default ScreenshotList;