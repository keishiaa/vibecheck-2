"use client";

import { useState, useEffect } from "react";
import { updateTrip } from "@/actions/tripActions";
import { useRouter } from "next/navigation";
import { ImagePlus, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { deleteTrip } from "@/actions/tripActions";

export default function EditTripModal({ isOpen, onClose, trip }: { isOpen: boolean; onClose: () => void; trip: any }) {
    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showWeather, setShowWeather] = useState(false);
    const [weatherLocation, setWeatherLocation] = useState("");
    const [weatherSuggestions, setWeatherSuggestions] = useState<any[]>([]);
    const [isSearchingWeather, setIsSearchingWeather] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
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
            setShowWeather(trip.showWeather || false);
            setWeatherLocation(trip.weatherLocation || "");
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
        formData.append("showWeather", showWeather ? "true" : "false");
        if (weatherLocation) formData.append("weatherLocation", weatherLocation);

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

    async function handleDeleteTrip(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();

        if (!trip?.id) return;

        const confirmed = window.confirm("Are you sure you want to delete this trip entirely? This action cannot be undone and will permanently delete all associated looks and items.");
        if (!confirmed) return;

        setLoading(true);
        try {
            await deleteTrip(trip.id);
            onClose();
            router.push('/');
        } catch (err: any) {
            if (err?.message?.includes("NEXT_REDIRECT") || err?.digest?.includes("NEXT_REDIRECT")) {
                return;
            }
            console.error(err);
            alert("Failed to delete trip. " + (err.message || JSON.stringify(err)));
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-md p-0 sm:p-4 transition-all">
            <div className="w-full max-w-sm p-6 sm:p-6 pb-10 sm:pb-6 bg-white border-t sm:border border-[#EAE5DF] rounded-t-3xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
                <div className="w-12 h-1.5 bg-[#EAE5DF] rounded-full mx-auto mb-6 sm:hidden pointer-events-none" />
                <h3 className="mb-4 text-xl font-semibold tracking-wide text-[#3C3833]">Edit Trip</h3>

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

                    <div className="flex flex-col gap-4">
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

                    <div className="flex flex-col gap-2 mt-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-[#3C3833] cursor-pointer">
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
                        {trip && (
                            <button
                                type="button"
                                onClick={handleDeleteTrip}
                                disabled={loading}
                                className="flex-1 py-3.5 text-sm font-medium transition-all active:scale-95 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 disabled:opacity-50"
                            >
                                Delete Trip
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 py-3.5 text-sm font-medium transition-all active:scale-95 border border-[#EAE5DF] text-[#8A827A] rounded-xl hover:bg-[#FCFAF8] disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3.5 text-sm font-medium text-[#3C3833] transition-all active:scale-95 bg-[#D1C3B4] rounded-xl hover:bg-[#C2B2A1] shadow-sm disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
