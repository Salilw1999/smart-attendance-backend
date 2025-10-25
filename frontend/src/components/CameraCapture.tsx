import React, { useRef, useState } from 'react';

interface CameraCaptureProps {
  onCapture: (photo: string) => Promise<void>;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [image, setImage] = useState<string | null>(null);

    const startCamera = async () => {
        if (videoRef.current) {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
        }
    };

    const captureImage = () => {
        if (canvasRef.current && videoRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                const dataUrl = canvasRef.current.toDataURL('image/png');
                setImage(dataUrl);
            }
        }
    };

    const saveImage = async () => {
        if (image) {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: JSON.stringify({ image }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                alert('Image uploaded successfully!');
            } else {
                alert('Failed to upload image.');
            }
        }
    };

    return (
        <div>
            <h2>Camera Capture</h2>
            <video ref={videoRef} autoPlay onLoadedMetadata={startCamera} />
            <button onClick={captureImage}>Capture</button>
            <canvas ref={canvasRef} width={640} height={480} style={{ display: 'none' }} />
            {image && (
                <div>
                    <img src={image} alt="Captured" />
                    <button onClick={saveImage}>Upload Image</button>
                </div>
            )}
        </div>
    );
};

export default CameraCapture;