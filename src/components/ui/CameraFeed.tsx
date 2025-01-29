import React, { useEffect, useState } from "react";
import CameraControl from "./CameraControl";

type Camera = MediaDeviceInfo;
type MediaStreamState = MediaStream | null;

interface CameraFeedProps {
  videoRef: React.MutableRefObject<HTMLVideoElement | null>;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ videoRef }) => {
  const [isCameraOn, setIsCameraOn] = useState<boolean>(false);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [mediaStream, setMediaStream] = useState<MediaStreamState>(null);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);

  const enableVideoStream = async () => {
    try {
      if (!selectedCamera) {
        console.error("No camera selected");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedCamera },
      });
      setMediaStream(stream);
      setIsCameraOn(true);
    } catch (error) {
      console.error("Error accessing webcam", error);
    }
  };

  const disableVideoStream = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
      setMediaStream(null);
      setIsCameraOn(false);
    }
  };

  useEffect(() => {
    if(isCameraOn && selectedCamera){
      disableVideoStream();
      enableVideoStream();
    }
  }, [selectedCamera])

  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        setCameras(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error("Error fetching cameras", err);
      }
    };
    getCameras();

    return () => {
      disableVideoStream();
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [videoRef, mediaStream]);

  return (
    <div className="w-[820px]">
      <div
        className={`relative w-full aspect-video bg-background-100 rounded-xl overflow-hidden bg-blue-400`}
      >
        {mediaStream != null ? (
          <video
            ref={videoRef}
            autoPlay={true}
            className="object-cover aspect-video w-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -scale-x-100"
          />
        ) : (
          <div className="h-full w-full bg-gray-700 flex justify-center items-center text-white font-semibold">
            <div>Camera is Off</div>
          </div>
        )}
      </div>
      <CameraControl
        isCameraOn={isCameraOn}
        enableVideoStream={enableVideoStream}
        disableVideoStream={disableVideoStream}
        selectedCamera={selectedCamera}
        setSelectedCamera={setSelectedCamera}
        cameras={cameras}
      />
    </div>
  );
};

export default CameraFeed;
