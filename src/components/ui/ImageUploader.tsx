"use client";

import { useState, useRef } from "react";
import ImageCropperModal from "./ImageCropperModal";
import { uploadToCloudinary } from "@/utils/cloudinary";

export default function ImageUploader({
    onUploadSuccess,
    children,
    className
}: {
    onUploadSuccess: (url: string) => void;
    children?: React.ReactNode;
    className?: string;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedImageStr, setSelectedImageStr] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setSelectedImageStr(reader.result as string);
            };
            reader.onerror = () => {
                console.error("FileReader failed");
                alert("Could not load local image file.");
            };
        }
        // reset input so the exact same file can be selected again
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <>
            <div onClick={() => !selectedImageStr && fileInputRef.current?.click()} className={className}>
                {children}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />

            {selectedImageStr && (
                <ImageCropperModal
                    imageSrc={selectedImageStr}
                    onClose={() => {
                        setSelectedImageStr(null);
                    }}
                    onUploadComplete={(url) => {
                        setSelectedImageStr(null);
                        onUploadSuccess(url);
                    }}
                />
            )}
        </>
    );
}
