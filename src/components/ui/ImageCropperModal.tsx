"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/utils/cropImage";
import { uploadToCloudinary } from "@/utils/cloudinary";

export default function ImageCropperModal({
    imageSrc,
    onClose,
    onUploadComplete,
}: {
    imageSrc: string;
    onClose: () => void;
    onUploadComplete: (url: string) => void;
}) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (!croppedAreaPixels) return;
        setIsUploading(true);
        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, 0);
            if (!croppedBlob) throw new Error("Failed to crop image");

            const url = await uploadToCloudinary(croppedBlob);
            onUploadComplete(url);
        } catch (e: any) {
            console.error("Cropping/upload failed", e);
            alert("Failed to process image: " + (e.message || String(e)));
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex flex-col justify-end sm:justify-center items-center bg-black/80 backdrop-blur-sm sm:p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col relative overflow-hidden h-fit max-h-[90vh]">
                <div className="p-4 border-b border-[#EAE5DF] flex justify-between items-center bg-[#FCFAF8]">
                    <h3 className="text-lg font-medium text-[#3C3833]">Crop Photo</h3>
                    {!isUploading && (
                        <button onClick={onClose} className="text-[#8A827A] hover:bg-black/10 rounded-full w-8 h-8 flex items-center justify-center">✕</button>
                    )}
                </div>

                <div className="relative w-full aspect-square bg-[#E8DDD5]">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                    />
                </div>

                <div className="p-6 bg-white flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-[#8A827A]">Zoom</span>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full accent-[#3C3833]"
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={isUploading}
                        className="w-full py-3.5 bg-[#3C3833] text-white rounded-xl font-medium tracking-wide shadow-sm hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {isUploading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                Uploading...
                            </>
                        ) : (
                            "Done Crop & Upload"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
