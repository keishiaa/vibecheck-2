import { createClient } from "@/utils/supabase/client";

export async function uploadToSupabase(file: File | Blob | string): Promise<string> {
    const supabase = createClient();
    let blob: Blob;

    if (typeof file === "string") {
        if (file.startsWith("data:")) {
            const res = await fetch(file);
            blob = await res.blob();
        } else {
            throw new Error("Invalid string format. Must be Data URL.");
        }
    } else {
        blob = file;
    }

    const fileExt = blob.type ? blob.type.split('/')[1] : 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    const { data, error } = await supabase.storage
        .from("vibecheck")
        .upload(fileName, blob, {
            contentType: blob.type || "image/jpeg",
            upsert: false
        });

    if (error) {
        console.error("Supabase upload error:", error);
        throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
        .from("vibecheck")
        .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
}
