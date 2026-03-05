"use client";

import { useEffect, useState } from "react";
import { createTrip, updateTrip } from "@/actions/tripActions";
import { useRouter } from "next/navigation";
import { ImagePlus, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function CreateTripModal({ isOpen, onClose, existingTrip }: { isOpen: boolean; onClose: () => void; existingTrip?: any }) {
    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [locationUrl, setLocationUrl] = useState("");
    const [locationImageUrl, setLocationImageUrl] = useState("");
    const [showWeather, setShowWeather] = useState(false);
    const [weatherLocation, setWeatherLocation] = useState("");
    const [weatherSuggestions, setWeatherSuggestions] = useState<any[]>([]);
    const [isSearchingWeather, setIsSearchingWeather] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!showWeather || weatherLocation.length < 2 || !showSuggestions) {
            setWeatherSuggestions([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearchingWeather(true);
            try {
                const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(weatherLocation)}&count=5&language=en&format=json`);
                const data = await res.json();
                if (data.results) {
                    setWeatherSuggestions(data.results);
                } else {
                    setWeatherSuggestions([]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsSearchingWeather(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [weatherLocation, showWeather, showSuggestions]);

    useEffect(() => {
        if (isOpen) {
            setName(existingTrip?.name || "");
            setStartDate(existingTrip?.startDate ? new Date(existingTrip.startDate).toISOString().split('T')[0] : "");
            setEndDate(existingTrip?.endDate ? new Date(existingTrip.endDate).toISOString().split('T')[0] : "");
            setLocationUrl(existingTrip?.locationUrl || "");
            setLocationImageUrl(existingTrip?.locationImageUrl || "");
            setShowWeather(existingTrip?.showWeather || false);
            setWeatherLocation(existingTrip?.weatherLocation || "");
        }
    }, [isOpen, existingTrip]);

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("name", name);
        formData.append("startDate", startDate);
        formData.append("endDate", endDate);
        if (locationUrl) formData.append("locationUrl", locationUrl);
        if (locationImageUrl) formData.append("locationImageUrl", locationImageUrl);
        formData.append("showWeather", showWeather ? "true" : "false");
        if (weatherLocation) formData.append("weatherLocation", weatherLocation);

        try {
            if (existingTrip?.id) {
                await updateTrip(existingTrip.id, formData);
            } else {
                await createTrip(formData);
            }
            onClose(); // Close modal on success
            router.refresh(); // Tell Next to refetch the `getTrips` server action!
        } catch (err: any) {
            console.error(err);
            alert("Failed to create trip, check inputs. " + (err.message || JSON.stringify(err)));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm p-6 bg-white border border-[#EAE5DF] rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200 text-left">
                <h3 className="mb-4 text-xl font-medium tracking-wide text-[#3C3833]">
                    {existingTrip ? 'Edit Trip' : 'Create New Trip'}
                </h3>

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
                                            const supabase = createClient();
                                            const fileExt = file.name ? file.name.split('.').pop() : 'jpg';
                                            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
                                            const { data, error } = await supabase.storage.from('vibecheck-images').upload(fileName, file);

                                            if (error) {
                                                alert("Upload failed: " + error.message);
                                            } else if (data) {
                                                const { data: publicUrlData } = supabase.storage.from('vibecheck-images').getPublicUrl(data.path);
                                                setLocationImageUrl(publicUrlData.publicUrl);
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

                        <label className="flex items-center gap-2 mt-4 text-sm font-medium text-[#3C3833] cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showWeather}
                                onChange={(e) => setShowWeather(e.target.checked)}
                                className="w-4 h-4 rounded border-[#EAE5DF] text-[#3C3833] focus:ring-[#3C3833] accent-[#3C3833]"
                            />
                            Show Weather Forecast
                        </label>

                        {showWeather && (
                            <div className="mt-3 animate-in fade-in slide-in-from-top-2 relative">
                                <label className="block mb-1 text-sm text-[#8A827A]">Weather Location (City, Country)</label>
                                <input
                                    type="text"
                                    value={weatherLocation}
                                    onChange={e => {
                                        setWeatherLocation(e.target.value);
                                        setShowSuggestions(true);
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                    placeholder="e.g. Paris, France"
                                    required={showWeather}
                                    className="w-full px-4 py-3 text-sm bg-[#FCFAF8] border border-[#EAE5DF] rounded-lg focus:outline-none focus:border-[#A69B90] transition-colors text-[#3C3833] placeholder-[#C4BCB3]"
                                />
                                {showSuggestions && weatherSuggestions.length > 0 && (
                                    <ul className="absolute z-50 w-full mt-1 bg-white border border-[#EAE5DF] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {weatherSuggestions.map((suggestion, idx) => (
                                            <li
                                                key={idx}
                                                className="px-4 py-2 text-sm text-[#3C3833] cursor-pointer hover:bg-[#FCFAF8] border-b border-[#EAE5DF] last:border-b-0"
                                                onClick={() => {
                                                    const formatted = `${suggestion.name}, ${suggestion.country}`;
                                                    setWeatherLocation(formatted);
                                                    setShowSuggestions(false);
                                                }}
                                            >
                                                {suggestion.name}, {suggestion.admin1 ? `${suggestion.admin1}, ` : ''}{suggestion.country}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8">
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
                            {loading ? "Saving..." : (existingTrip ? "Save Details" : "Create")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
