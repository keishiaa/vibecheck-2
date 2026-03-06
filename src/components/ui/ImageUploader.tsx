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
            const imageUrl = URL.createObjectURL(file);
            setSelectedImageStr(imageUrl);
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
                        URL.revokeObjectURL(selectedImageStr);
                        setSelectedImageStr(null);
                    }}
                    onUploadComplete={(url) => {
                        URL.revokeObjectURL(selectedImageStr);
                        setSelectedImageStr(null);
                        onUploadSuccess(url);
                    }}
                />
            )}
        </>
    );
}
