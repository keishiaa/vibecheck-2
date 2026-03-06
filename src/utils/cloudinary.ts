export async function uploadToCloudinary(file: File | Blob | string): Promise<string> {
    const formData = new FormData();
    if (typeof file === "string") {
        formData.append("file", file);
    } else {
        formData.append("file", file, "upload.jpg");
    }
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || "vibecheck");

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) throw new Error("Cloudinary configuration missing");

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error("Cloudinary upload failed:", errorText);
        throw new Error(`Failed to upload image. Cloudinary says: ${errorText}`);
    }

    const data = await res.json();
    return data.secure_url;
}
