import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Button from './Button';

interface ImageCaptureProps {
  onImageCapture: (file: File) => void;
  currentImageUrl?: string;
  onRemove?: () => void;
}

export default function ImageCapture({ onImageCapture, currentImageUrl, onRemove }: ImageCaptureProps) {
  const { t } = useTranslation();
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      setStream(mediaStream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert(t('recipes.cameraAccessError'));
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
            onImageCapture(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageCapture(file);
    }
  };

  return (
    <div className="space-y-3">
      {currentImageUrl && (
        <div className="relative inline-block">
          <img
            src={currentImageUrl}
            alt="Step"
            className="w-full max-w-md h-auto rounded-lg border-2 border-gray-200 dark:border-gray-700"
          />
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700 shadow-lg"
            >
              ×
            </button>
          )}
        </div>
      )}

      {showCamera ? (
        <div className="space-y-3">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full max-w-md rounded-lg border-2 border-gray-300 dark:border-gray-600"
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex gap-2">
            <Button type="button" onClick={capturePhoto} variant="primary">
              {t('recipes.takePhoto')}
            </Button>
            <Button type="button" onClick={stopCamera} variant="ghost">
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button type="button" onClick={startCamera} variant="secondary">
            {t('recipes.captureImage')}
          </Button>
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            variant="secondary"
          >
            {t('recipes.uploadImage')}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}

// Made with Bob