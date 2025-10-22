import { useState, useEffect } from 'react';

const useCamera = () => {
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [imageSrc, setImageSrc] = useState('');

    const startCamera = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                const video = document.createElement('video');
                video.srcObject = stream;
                video.play();
                setIsCameraActive(true);
                video.addEventListener('loadedmetadata', () => {
                    video.play();
                });
                document.body.appendChild(video);
            })
            .catch((error) => {
                console.error('Error accessing the camera: ', error);
            });
    };

    const captureImage = () => {
        const video = document.querySelector('video');
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/png');
        setImageSrc(imageData);
        stopCamera();
    };

    const stopCamera = () => {
        const video = document.querySelector('video');
        if (video) {
            const stream = video.srcObject;
            if (stream) {
                const tracks = stream.getTracks();
                tracks.forEach((track) => track.stop());
            }
            video.srcObject = null;
            setIsCameraActive(false);
        }
    };

    useEffect(() => {
        if (isCameraActive) {
            startCamera();
        }
        return () => stopCamera();
    }, [isCameraActive]);

    return { isCameraActive, imageSrc, startCamera, captureImage, stopCamera };
};

export default useCamera;