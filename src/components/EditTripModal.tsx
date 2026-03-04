"use client";

import { useState, useEffect } from "react";
import { updateTrip } from "@/actions/tripActions";
import { useRouter } from "next/navigation";
import { ImagePlus, X } from "lucide-react";

export default function EditTripModal({ isOpen, onClose, trip }: { isOpen: boolean; onClose: () => void; trip: any }) {
    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [locationUrl, setLocationUrl] = useState("");
    const [locationImageUrl, setLocationImageUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (trip) {
            setName(trip.name || "");
            if (trip.startDate) {
                const date = new Date(trip.startDate);
                setStartDate(date.toISOString().split('T')[0]);
            }
            if (trip.endDate) {
                const date = new Date(trip.endDate);
                setEndDate(date.toISOString().split('T')[0]);
            }
            if (trip.locationUrl) {
                setLocationUrl(trip.locationUrl);
            } else {
                setLocationUrl("");
            }
            if (trip.locationImageUrl) {
                setLocationImageUrl(trip.locationImageUrl);
            } else {
                setLocationImageUrl("");
            }
        }
    }, [trip]);

    if (!isOpen || !trip) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("name", name);
        formData.append("startDate", startDate);
        formData.append("endDate", endDate);
        if (locationUrl) formData.append("locationUrl", locationUrl);
        if (locationImageUrl) formData.append("locationImageUrl", locationImageUrl);

        try {
            await updateTrip(trip.id, formData);
            onClose(); // Close modal on success
            router.refresh();
        } catch (err: any) {
            console.error(err);
            alert("Failed to edit trip, check inputs. " + (err.message || JSON.stringify(err)));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm p-6 bg-white border border-[#EAE5DF] rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200">
                <h3 className="mb-4 text-xl font-medium tracking-wide text-[#3C3833]">Edit Trip</h3>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block mb-1 text-sm text-[#8A827A]">Trip Name</label>
                        <input
                            required
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Italy July 2026"
                            className="w-full px-4 py-3 text-sm bg-[#FCFAF8] border border-[#EAE5DF] rounded-lg focus:outline-none focus:border-[#A69B90] transition-colors text-[#3C3833] placeholder-[#C4BCB3]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 text-sm text-[#8A827A]">Start Date</label>
                            <input
                                required
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="w-full px-4 py-3 text-sm bg-[#FCFAF8] border border-[#EAE5DF] rounded-lg focus:outline-none focus:border-[#A69B90] transition-colors text-[#3C3833]"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-sm text-[#8A827A]">End Date</label>
                            <input
                                required
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                min={startDate}
                                className="w-full px-4 py-3 text-sm bg-[#FCFAF8] border border-[#EAE5DF] rounded-lg focus:outline-none focus:border-[#A69B90] transition-colors text-[#3C3833]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-1 text-sm text-[#8A827A]">Location Image (Optional)</label>
                        <div className={`relative w-full h-32 overflow-hidden flex items-center justify-center border-2 border-dashed rounded-xl transition-colors mt-2 mb-4 ${(locationImageUrl || isUploadingImage) ? 'border-[#C4BCB3] bg-white' : 'border-[#EAE5DF] bg-[#FCFAF8] hover:border-[#A69B90]'}`}>
                            {isUploadingImage ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-6 h-6 border-2 border-[#D1C3B4] border-t-transparent rounded-full animate-spin mb-2"></div>
                                    <span className="text-xs text-[#8A827A]">Uploading...</span>
                                </div>
                            ) : locationImageUrl ? (
                                <>
                                    <img src={locationImageUrl} className="w-full h-full object-cover rounded-xl" alt="Location preview" />
                                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLocationImageUrl(""); }} className="absolute z-20 top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-2 text-[#8A827A]">
                                    <ImagePlus className="w-5 h-5 mb-1 opacity-60" />
                                    <span className="text-[10px] font-medium text-center">Upload Cover Image</span>
                                </div>
                            )}

                            {!locationImageUrl && !isUploadingImage && (
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        try {
                                            setIsUploadingImage(true);
                                            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dzzv2vmy3";
                                            const formData = new FormData();
                                            formData.append("file", file);
                                            formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || "vibecheck");

                                            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                                                method: "POST",
                                                body: formData
                                            });
                                            const data = await res.json();
                                            if (data.secure_url) {
                                                setLocationImageUrl(data.secure_url);
                                            } else if (data.error) {
                                                alert("Upload failed: " + data.error.message);
                                            }
                                        } catch (err: any) {
                                            console.error("Upload failed", err);
                                            alert("Upload failed. Please check your connection.");
                                        } finally {
                                            setIsUploadingImage(false);
                                            e.target.value = "";
                                        }
                                    }}
                                />
                            )}
                        </div>

                        <label className="block mb-1 text-sm text-[#8A827A]">Location URL (Google Maps etc.) - Optional</label>
                        <input
                            type="url"
                            value={locationUrl}
                            onChange={e => setLocationUrl(e.target.value)}
                            placeholder="https://maps.google.com/..."
                            className="w-full px-4 py-3 text-sm bg-[#FCFAF8] border border-[#EAE5DF] rounded-lg focus:outline-none focus:border-[#A69B90] transition-colors text-[#3C3833] placeholder-[#C4BCB3]"
                        />
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 py-3 text-sm font-medium transition-colors border border-[#EAE5DF] text-[#8A827A] rounded-lg hover:bg-[#FCFAF8] disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 text-sm font-medium text-[#3C3833] transition-all bg-[#D1C3B4] rounded-lg hover:bg-[#C2B2A1] disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
