export async function uploadToCloudinary(file: File | Blob | string): Promise<string> {
    // Determine the base64 string to upload
    let base64String = "";
    if (typeof file === "string") {
        base64String = file;
    } else {
        // Fallback converter if passed a raw Blob
        const reader = new FileReader();
        base64String = await new Promise((resolve, reject) => {
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
        });
    }

    const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64String }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to upload image securely.");
    }

    const data = await res.json();
    if (!data.secure_url) {
        throw new Error("No secure URL returned from server.");
    }

    return data.secure_url;
}
