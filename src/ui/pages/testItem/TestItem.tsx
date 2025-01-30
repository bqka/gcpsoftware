import { useEffect, useRef, useState } from "react";
import CameraFeed from "../../../components/ui/CameraFeed";
import { Button } from "@/components/ui/button";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  // const handleScreenshot = async () => {
  //   if (videoRef.current && canvasRef.current) {
  //     const video = videoRef.current;
  //     const canvas = canvasRef.current;
  //     const context = canvas.getContext("2d");

  //     canvas.width = video.videoWidth;
  //     canvas.height = video.videoHeight;

  //     if (context) {
  //       context.translate(canvas.width, 0);
  //       context.scale(-1, 1);

  //       context.drawImage(video, 0, 0, canvas.width, canvas.height);

  //       const screenshot = canvas.toDataURL("image/png");

  //       const newItem = {
  //         name: itemName,
  //         image: screenshot,
  //       };
  //     } else {
  //       console.error("Video or canvas reference is missing");
  //     }
  //   }
  // };

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="flex flex-row h-[80%] w-full px-8 py-4 gap-2">
        <BackButton />
        <div className="flex flex-col gap-2">
          <CameraFeed videoRef={videoRef} />
          <div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Item" />
              </SelectTrigger>
              <SelectContent>
                {items.map((item) => (
                  <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <canvas ref={canvasRef} className="hidden"></canvas>
          <Button className="max-w-36">
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
