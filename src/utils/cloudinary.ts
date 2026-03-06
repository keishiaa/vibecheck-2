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
        const errObj = await res.json().catch(() => null);
        const errorText = errObj ? JSON.stringify(errObj) : res.statusText;
        console.error("Cloudinary upload failed:", errorText);
        throw new Error(`Cloudinary rejected upload: ${errorText}`);
    }

    const data = await res.json();
    if (!data.secure_url) {
        throw new Error("No secure URL returned from Cloudinary.");
    }
    return data.secure_url;
}
