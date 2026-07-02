import { useRef, useState, useEffect } from "react";

interface CustomCameraProps {
  onCapture: (blob: Blob) => void;
  onClose: () => void;
}

export default function CustomCamera({ onCapture, onClose }: CustomCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Camera access nahi mil paayi. Permission check karo.");
      console.error(err);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCapture(blob);
          stopCamera();
        }
      },
      "image/jpeg",
      0.8
    );
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "black",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {error ? (
        <div style={{ color: "white", padding: 20, textAlign: "center", margin: "auto" }}>
          {error}
          <br />
          <button onClick={handleClose} style={{ marginTop: 20 }}>
            Band Karo
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ flex: 1, width: "100%", objectFit: "cover" }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              padding: 20,
              background: "black",
            }}
          >
            <button
              onClick={handleClose}
              style={{
                padding: "12px 24px",
                background: "transparent",
                color: "white",
                border: "1px solid white",
                borderRadius: 8,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleCapture}
              style={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                background: "white",
                border: "4px solid #ccc",
                cursor: "pointer",
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}