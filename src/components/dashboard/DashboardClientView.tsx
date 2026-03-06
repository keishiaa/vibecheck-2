"use client";

import { useState } from "react";
import CreateTripModal from "@/components/CreateTripModal";
import EditTripModal from "@/components/EditTripModal";
import { FiMapPin, FiUsers, FiShoppingBag, FiStar, FiCalendar } from 'react-icons/fi';

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

            {trips.length === 0 ? (
                <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto mt-8 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="w-full bg-white border border-[#EAE5DF] rounded-[2.5rem] p-8 sm:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden">

                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle,rgba(244,208,181,0.2)_0%,transparent_70%)] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[radial-gradient(circle,rgba(209,195,180,0.15)_0%,transparent_70%)] rounded-full translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col items-center text-center mb-10">
                            <span className="text-[10px] font-bold tracking-[0.2em] text-[#8A827A] uppercase mb-4 opacity-80">Quick Start Guide</span>
                            <h3 className={`text-2xl sm:text-3xl text-[#3C3833] ${playfair.className} italic`}>Welcome to VibeCheck.</h3>
                            <p className="text-sm text-[#8A827A] font-medium mt-3 max-w-[280px]">Your aesthetic outfit planner. Here is how to plan your next trip.</p>
                        </div>

                        <div className="flex flex-col gap-8 sm:gap-10 relative z-10 w-full md:px-6">
                            {/* Step 1 */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 group">
                                <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#FCFAF8] border border-[#EAE5DF] flex items-center justify-center text-[#D1C3B4] group-hover:scale-110 group-hover:bg-[#FDFBF7] group-hover:text-[#E07A5F] transition-all duration-300 shadow-sm">
                                    <FiMapPin size={20} strokeWidth={1.5} />
                                </div>
                                <div className="flex flex-col gap-1.5 mt-1">
                                    <h4 className="text-[15px] font-semibold text-[#3C3833] tracking-tight">1. Start Your Journey</h4>
                                    <p className="text-[13px] text-[#8A827A] leading-relaxed max-w-sm">Tap to create a new Trip. Set your destination, and we'll grab the local weather forecast so you pack perfectly.</p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 group">
                                <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#FCFAF8] border border-[#EAE5DF] flex items-center justify-center text-[#D1C3B4] group-hover:scale-110 group-hover:bg-[#FDFBF7] group-hover:text-[#E07A5F] transition-all duration-300 shadow-sm">
                                    <FiUsers size={20} strokeWidth={1.5} />
                                </div>
                                <div className="flex flex-col gap-1.5 mt-1">
                                    <h4 className="text-[15px] font-semibold text-[#3C3833] tracking-tight">2. Invite The Group Chat</h4>
                                    <p className="text-[13px] text-[#8A827A] leading-relaxed max-w-sm">Planning is better together. Tap "Invite" to share a simple join link with your friends to collaborate on the itinerary.</p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 group">
                                <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#FCFAF8] border border-[#EAE5DF] flex items-center justify-center text-[#D1C3B4] group-hover:scale-110 group-hover:bg-[#FDFBF7] group-hover:text-[#E07A5F] transition-all duration-300 shadow-sm">
                                    <FiShoppingBag size={20} strokeWidth={1.5} />
                                </div>
                                <div className="flex flex-col gap-1.5 mt-1">
                                    <h4 className="text-[15px] font-semibold text-[#3C3833] tracking-tight">3. Your Pieces</h4>
                                    <p className="text-[13px] text-[#8A827A] leading-relaxed max-w-sm">See an item you love online? Paste the link, or upload photos from your camera roll. VibeCheck organizes your Pieces by category.</p>
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 group">
                                <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#FCFAF8] border border-[#EAE5DF] flex items-center justify-center text-[#D1C3B4] group-hover:scale-110 group-hover:bg-[#FDFBF7] group-hover:text-[#E07A5F] transition-all duration-300 shadow-sm">
                                    <FiStar size={20} strokeWidth={1.5} />
                                </div>
                                <div className="flex flex-col gap-1.5 mt-1">
                                    <h4 className="text-[15px] font-semibold text-[#3C3833] tracking-tight">4. The Ensemble</h4>
                                    <p className="text-[13px] text-[#8A827A] leading-relaxed max-w-sm">Mix and match your saved Pieces to build flawless outfits. Tap to save full "Ensembles" for the airport, dinner, or the club.</p>
                                </div>
                            </div>

                            {/* Step 5 */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 group">
                                <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#FCFAF8] border border-[#EAE5DF] flex items-center justify-center text-[#D1C3B4] group-hover:scale-110 group-hover:bg-[#FDFBF7] group-hover:text-[#E07A5F] transition-all duration-300 shadow-sm">
                                    <FiCalendar size={20} strokeWidth={1.5} />
                                </div>
                                <div className="flex flex-col gap-1.5 mt-1">
                                    <h4 className="text-[15px] font-semibold text-[#3C3833] tracking-tight">5. The Vacation Calendar</h4>
                                    <p className="text-[13px] text-[#8A827A] leading-relaxed max-w-sm">Tap assignments on your timeline to set your customized Ensembles to specific days or events, so you never overpack.</p>
                                </div>
                            </div>
                        </div>

                        <div className="w-full mt-12 flex justify-center relative z-10">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-8 py-4 text-[13px] sm:text-sm font-semibold tracking-wide transition-all active:scale-95 bg-[#3C3833] text-white rounded-full hover:bg-black shadow-[0_8px_20px_rgba(60,56,51,0.15)]"
                            >
                                + Create Your First Trip
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
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
                                <Link href={`/trips/${trip.id}`} className={`relative overflow-hidden h-32 sm:h-40 border border-[#EAE5DF] rounded-2xl transition-all active:scale-[0.98] shadow-sm hover:shadow-md hover:border-[#C4BCB3] cursor-pointer group flex flex-col ${colorClass} bg-opacity-90 backdrop-blur-sm`}>

                                    {/* Soft Glassmorphic Bottom Gradient */}
                                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/10 to-transparent pointer-events-none z-0" />

                                    {/* Top Left: Dates & Duration */}
                                    <div className="absolute top-3.5 left-4 z-20 pointer-events-none">
                                        <p className="text-[10px] sm:text-[11px] text-[#5C564D] opacity-80 font-medium tracking-wide">
                                            {new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            <span className="opacity-50 mx-1">-</span>
                                            {new Date(trip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            <span className="opacity-60 ml-1.5 tracking-normal font-normal">({tripDurationDays} Days)</span>
                                        </p>
                                    </div>

                                    {/* Top Right: Countdown Timer */}
                                    <div className="absolute top-3 right-3 z-30 group-hover:opacity-0 transition-opacity duration-300">
                                        <span className="bg-white/60 text-[#3C3833] px-2.5 py-1 rounded-full border border-white/40 text-[9px] font-bold tracking-wider uppercase shadow-sm backdrop-blur-md">
                                            {countdownText}
                                        </span>
                                    </div>

                                    {/* Center: Large Trip Title */}
                                    <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 z-10 pointer-events-none">
                                        <h3 className="text-xl sm:text-2xl xl:text-3xl font-bold tracking-tight text-[#3C3833] text-center drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)] line-clamp-2 leading-tight px-4">{trip.name}</h3>
                                    </div>

                                    {/* Bottom Right: Scaled User Bubbles */}
                                    <div className="absolute bottom-3 right-3 z-20 pointer-events-none">
                                        <div className="flex -space-x-1.5 shrink-0 scale-90 origin-bottom-right drop-shadow-sm">
                                            <UserBubble user={trip.owner} isOwner={true} />
                                            {trip.members && trip.members.slice(0, 8).map((member: any) => (
                                                <UserBubble key={member.id} user={member.user} isOwner={false} />
                                            ))}
                                            {trip.members && trip.members.length > 8 && (
                                                <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold bg-[#FCFAF8] text-[#8A827A] shadow-sm shrink-0 relative z-10">
                                                    +{trip.members.length - 8}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
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
            )}

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
