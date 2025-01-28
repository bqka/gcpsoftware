import { useRef } from "react";
import CameraFeed from "../../../components/ui/CameraFeed";


export default function NewItem() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  return (
    <div className="h-screen w-screen">
      <CameraFeed videoRef={videoRef}/>
    </div>
  );
}
