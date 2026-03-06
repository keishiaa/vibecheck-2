"use client";

import { useState } from "react";
import CreateTripModal from "@/components/CreateTripModal";
import EditTripModal from "@/components/EditTripModal";

import { Playfair_Display } from "next/font/google";
import Link from "next/link";

const playfair = Playfair_Display({ subsets: ["latin"] });

function getDisplayUrl(url: string | null | undefined): string {
    if (!url) return "";

    // Cloudinary URLs
    if (url.includes('cloudinary.com') || url.includes('supabase.co')) return url;

    // Explicit image file extensions
    if (url.match(/\.(jpeg|jpg|gif|png|webp|avif|svg)(\?.*)?$/i)) return url;

    // For any unhandled webpage link, fallback beautifully to its domain logo
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
    } catch {
        return "";
    }
}

const UserBubble = ({ user, isOwner = false }: { user: any, isOwner?: boolean }) => {
    if (!user) return null;
    const avatar = user.avatarUrl;
    const nameStr = user.name || user.email || "U";

    const getInitials = (str: string) => {
        if (str.includes('@')) {
            const prefix = str.split('@')[0];
            const parts = prefix.split(/[._-]/);
            if (parts.length > 1 && parts[0] && parts[parts.length - 1]) {
                return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
            }
            return prefix.substring(0, 2).toUpperCase();
        }
        const parts = str.split(' ');
        if (parts.length > 1 && parts[0] && parts[parts.length - 1]) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return str.substring(0, 2).toUpperCase();
    };

    const initials = getInitials(nameStr);
    const bgColor = isOwner ? 'bg-[#D1C3B4]' : 'bg-[#FCFAF8]';
    const textColor = isOwner ? 'text-[#3C3833]' : 'text-[#8A827A]';

    return (
        <div
            className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-bold ${bgColor} ${textColor} shadow-sm overflow-hidden shrink-0 hover:z-30 relative`}
            title={`${isOwner ? 'Owner' : 'Member'}: ${user.name || user.email}`}
        >
            {avatar ? (
                <img src={avatar} alt={nameStr} className="w-full h-full object-cover" />
            ) : (
                initials
            )}
        </div>
    );
};

export default function DashboardClientView({ trips }: { trips: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTrip, setEditingTrip] = useState<any>(null);

    return (
        <>
            <div className="flex items-end justify-between gap-4 mb-10">
                <div className="flex flex-col gap-1">
                    <h2 className={`text-4xl sm:text-5xl text-[#3C3833] ${playfair.className} tracking-tight`}>
                        <span className="italic text-[#8A827A] pr-1">Current</span> Trips.
                    </h2>
                    <div className="w-12 h-[2px] bg-[#D1C3B4] mt-2 rounded-full"></div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="hidden md:block px-5 py-2.5 text-sm font-medium transition-all active:scale-95 bg-[#D1C3B4] text-[#3C3833] rounded-full hover:bg-[#C2B2A1]"
                >
                    + Create New Trip
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 w-full md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">


                {/* Dynamic Map of the database trips */}
                {trips.map((trip) => {
                    // Generate a deterministic color based on the trip's id string length + name chars
                    const TRIP_COLORS = [
                        "bg-[#E8DDD5]", // Warm Sand
                        "bg-[#D5DCE8]", // Muted Blue
                        "bg-[#E8D5D5]", // Dusty Rose
                        "bg-[#D5E8DD]", // Sage Green
                        "bg-[#E6E8D5]", // Soft Olive
                        "bg-[#DDD5E8]", // Lavender Gray
                        "bg-[#E8E2D5]", // Warm Cream
                        "bg-[#D5E8E8]", // Pale Cyan
                    ];
                    let hashCode = 0;
                    const hashStr = trip.id + trip.name;
                    for (let i = 0; i < hashStr.length; i++) hashCode += hashStr.charCodeAt(i);
                    const colorClass = TRIP_COLORS[hashCode % TRIP_COLORS.length];

                    const tripDurationDays = Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 3600 * 24)) + 1;

                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const start = new Date(trip.startDate);
                    start.setHours(0, 0, 0, 0);
                    const end = new Date(trip.endDate);
                    end.setHours(0, 0, 0, 0);

                    const diffStart = Math.ceil((start.getTime() - today.getTime()) / (1000 * 3600 * 24));
                    const diffEnd = Math.ceil((end.getTime() - today.getTime()) / (1000 * 3600 * 24));

                    let countdownText = "";
                    if (diffStart > 0) {
                        countdownText = `In ${diffStart} day${diffStart === 1 ? '' : 's'}`;
                    } else if (diffStart <= 0 && diffEnd >= 0) {
                        countdownText = "Happening now";
                    } else {
                        countdownText = "Past trip";
                    }

                    return (
                        <div key={trip.id} className="relative group block">
                            <Link href={`/trips/${trip.id}`} className={`relative overflow-hidden h-32 border border-[#EAE5DF] rounded-xl transition-all active:scale-[0.98] shadow-sm hover:shadow-md hover:border-[#C4BCB3] cursor-pointer group flex flex-col ${colorClass} bg-opacity-90 backdrop-blur-sm`}>

                                {/* Countdown Timer */}
                                <div className="absolute top-3 right-3 z-20 group-hover:opacity-0 transition-opacity duration-300">
                                    <span className="bg-white/60 text-[#3C3833] px-2.5 py-1 rounded-full border border-white/40 text-[9px] font-bold tracking-wider uppercase shadow-sm backdrop-blur-md">
                                        {countdownText}
                                    </span>
                                </div>

                                <div className="absolute inset-0 p-3.5 flex flex-col justify-end bg-gradient-to-t from-black/25 via-transparent to-transparent z-10">
                                    <h3 className={`text-base font-semibold tracking-wide leading-tight text-[#3C3833]`}>{trip.name}</h3>
                                    <span className="text-[9px] mt-0.5 font-bold text-[#5C564D] tracking-wider uppercase bg-white/50 border border-white/30 self-start px-2 py-0.5 rounded-full shadow-sm backdrop-blur-md">
                                        {tripDurationDays} {tripDurationDays === 1 ? 'Day' : 'Days'}
                                    </span>
                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center justify-between sm:gap-2 w-full mt-1">
                                        <p className={`text-[10px] sm:text-xs text-[#5C564D] opacity-90 font-medium whitespace-nowrap`}>
                                            {new Date(trip.startDate).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric', year: '2-digit' })} - {new Date(trip.endDate).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric', year: '2-digit' })}
                                        </p>

                                        {/* Floating Participant Bubbles */}
                                        <div className="flex -space-x-1.5 z-20 self-end sm:self-auto">
                                            <UserBubble user={trip.owner} isOwner={true} />
                                            {trip.members && trip.members.map((member: any) => (
                                                <UserBubble key={member.id} user={member.user} isOwner={false} />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                            </Link>

                            {/* Edit Button overlay */}
                            <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setEditingTrip(trip);
                                    }}
                                    className="px-3 py-1 text-[10px] sm:text-[9px] font-bold tracking-wider uppercase text-[#5C564D] border border-white/60 bg-white/90 backdrop-blur-md rounded-full shadow-sm hover:bg-white hover:text-[#3C3833] transition-all active:scale-95"
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            <button
                onClick={() => setIsModalOpen(true)}
                className="mt-8 w-full block md:hidden px-5 py-4 text-sm font-medium tracking-wide transition-all active:scale-95 bg-white border border-[#EAE5DF] text-[#3C3833] rounded-2xl hover:bg-[#FCFAF8] shadow-sm"
            >
                + Create New Trip
            </button>

            <CreateTripModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <EditTripModal isOpen={!!editingTrip} onClose={() => setEditingTrip(null)} trip={editingTrip} />
        </>
    );
}
