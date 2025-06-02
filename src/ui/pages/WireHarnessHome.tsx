// import { Button } from "@/components/ui/button";
import CameraFeed from "@/components/ui/CameraFeed";
import { useRef, useState } from "react";
import { useEffect } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function WireHarnessHome() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [data, setData] = useState<SingleWire[]>([]);
  const [selectedWireType, setSelectedWireType] =
    useState<string>("singlewire");
  const [sequence, setSequence] = useState<string>("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchWireData = async (tableName: string) => {
    try {
      const result = await window.electron.fetchWireData(tableName);
      console.log(tableName);
      setData(result);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const removeItem = async (id: number) => {
    try {
      await window.electron.removeItem(selectedWireType, id);
      fetchWireData(selectedWireType);
    } catch (error) {
      console.error("Error removing items:", error);
    }
  };

  const fetchWireImage = async () => {
    try{
      if(!selectedId){
        console.error("No wire selected.");
        return null;
      }
      console.log(selectedWireType);
      const result = await window.electron.fetchWireImage(selectedId, selectedWireType);
      return result;
    } catch(error){
      console.error("Error:", error);
      return null;
    }
  };

  const getCurrentCanvasFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (context) {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL("image/png");
      }
    }

    return null;
  };

  const compareItem = async () => {
    try {
      if (!selectedId) {
        throw new Error("No wire selected");
      }

      const originalImage = await fetchWireImage();
      const imageToBeChecked = await getCurrentCanvasFrame();

      if(!originalImage){
        console.error("Error fetching original image.");
        return null;
      }

      if(!imageToBeChecked){
        console.error("Error fetching image to be checked.");
        return null;
      }
      const imageToBeCheckedRaw = imageToBeChecked.replace(/^data:image\/\w+;base64,/, '');

      const result = await window.electron.compareItem(originalImage, imageToBeCheckedRaw, selectedWireType)
      console.log(result)
      return result;
    } catch (error) {
      console.error("Error: ", error);
      return null;
    }
  };

  const handleScreenshot = async () => {
    // const newItem = {
    //   tableName: selectedWireType,
    //   sequence: "TestSequence",
    //   image: screenshot,
    // };
    const screenshot = await getCurrentCanvasFrame();
    if (!screenshot) {
      console.error("Screenshot not available");
      return;
    }

    try {
      await window.electron.addItem(selectedWireType, sequence, screenshot);
      fetchWireData(selectedWireType);
      setSequence("");
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  useEffect(() => {
    fetchWireData("singlewire");
  }, []);

  useEffect(() => {
    fetchWireData(selectedWireType);
    setSelectedId(null);
  }, [selectedWireType]);

  useEffect(() => {
    console.log(selectedId);
  }, [selectedId]);

  return (
    <div className="w-screen min-h-screen flex justify-center flex-row px-4 gap-4 pt-12">
      <div className="w-[650px] flex flex-col gap-4">
        <CameraFeed videoRef={videoRef} />
        <canvas ref={canvasRef} className="hidden"></canvas>
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-2 w-[60%]">
            <Select
              value={selectedWireType || ""}
              onValueChange={(value) => setSelectedWireType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Wire" />
              </SelectTrigger>
              <SelectContent className="w-[200px] max-w-full">
                <SelectItem value="singlewire">Single Wire</SelectItem>
                <SelectItem value="doublewire">Double Wire</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="text"
              value={sequence}
              onChange={(e) => setSequence(e.target.value)}
              placeholder="Enter item name"
              className="max-w-56 min-h-8"
            />
          </div>
          <Button onClick={handleScreenshot} className="max-w-36">
            Add Item
          </Button>
          <Button className="max-w-36" onClick={compareItem}>
            Compare
          </Button>
        </div>
      </div>
      <div className="w-[50%]">
        <DataTable
          columns={columns(removeItem, { selectedId, setSelectedId })}
          data={data}
          selectionActions={{ selectedId, setSelectedId }}
        />
      </div>
    </div>
  );
}
