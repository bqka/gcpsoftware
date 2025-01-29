import { useEffect, useRef, useState } from "react";
import CameraFeed from "../../../components/ui/CameraFeed";
import { Button } from "@/components/ui/button";
import { Item, columns } from "./columns";
import { DataTable } from "./data-table";

interface FetchedItem {
  id: number;
  date: string;
  name: string;
  image: string;
}

export default function NewItem() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [items, setItems] = useState<FetchedItem[]>([]);
  const [itemName, setItemName] = useState<string>("");

  const fetchItems = async () => {
    try {
      const result = await window.electronAPI.getItems();
      setItems(result);
      console.log(result);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleScreenshot = async () => {
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

        const newItem = {
          name: itemName,
          image: screenshot,
        };

        window.electronAPI.addItem(newItem);

        fetchItems();

        setItemName("");
      } else {
        console.error("Video or canvas reference is missing");
      }
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="flex flex-row h-[80%] w-full px-8 py-4 bg-red-300">
        <div className="flex flex-col gap-2">
          <CameraFeed videoRef={videoRef} />
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Enter item name"
            className="p-2 border border-gray-300 rounded mb-2 text-white"
          />
          <canvas ref={canvasRef} className="hidden"></canvas>
          <Button onClick={handleScreenshot} className="max-w-36">
            Take Image
          </Button>
        </div>
        <div className="bg-blue-300 h-full w-[50%] mx-4">
          <DataTable columns={columns} data={items} />
        </div>
      </div>
    </div>
  );
}
