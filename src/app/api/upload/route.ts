import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_URL?.match(/cloudinary:\/\/([^:]+):/)?.[1] || "",
    api_secret: process.env.CLOUDINARY_URL?.match(/:([^@]+)@/)?.[1] || "",
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { image } = body; // Base64 Data URL expected

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        // Upload directly using Cloudinary's Node SDK (authenticated)
        const result = await cloudinary.uploader.upload(image, {
            upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || "vibecheck",
            folder: "vibecheck"
        });

        return NextResponse.json({ secure_url: result.secure_url });
    } catch (error: any) {
        console.error("Cloudinary upload error:", error);
        return NextResponse.json({ error: error.message || "Failed to upload" }, { status: 500 });
    }
}
