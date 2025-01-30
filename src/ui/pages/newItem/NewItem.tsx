import { useEffect, useRef, useState } from "react";
import CameraFeed from "../../../components/ui/CameraFeed";
import { Button } from "@/components/ui/button";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Input } from "@/components/ui/input";
import BackButton from "@/components/ui/BackButton";

interface FetchedItem {
  id: number;
  date: string;
  name: string;
  imagePath: string;
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

    const removeItem = async (key: number) => {
    try {
      const result = await window.electronAPI.deleteItem(key);
      fetchItems();
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
      <div className="flex flex-row h-[80%] w-full px-8 py-4 gap-4">
        <BackButton />
        <div className="flex flex-col gap-2">
          <CameraFeed videoRef={videoRef} />
          <Input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Enter item name"
            className="max-w-72 min-h-8"
          />
          <canvas ref={canvasRef} className="hidden"></canvas>
          <Button onClick={handleScreenshot} className="max-w-36">
            Take Image
          </Button>
        </div>
        <div className="h-full w-[50%] mx-4">
          <DataTable columns={columns(removeItem)} data={items} />
        </div>
      </div>
    </div>
  );
}
