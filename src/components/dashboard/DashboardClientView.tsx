"use client";

import { useState } from "react";
import CreateTripModal from "@/components/CreateTripModal";
import EditTripModal from "@/components/EditTripModal";

import Link from "next/link";

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
            <div className="flex items-end justify-between mb-8">
                <h2 className="text-3xl font-light tracking-tight text-[#59524A]">Current Trips</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-5 py-2 text-sm font-medium transition-all bg-[#D1C3B4] text-[#3C3833] rounded-full hover:bg-[#C2B2A1]"
                >
                    + Create New Trip
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">


                {/* Dynamic Map of the database trips */}
                {trips.map((trip) => {
                    const displayImage = trip.locationImageUrl ? getDisplayUrl(trip.locationImageUrl) : null;

                    return (
                        <div key={trip.id} className="relative group block">
                            <Link href={`/trips/${trip.id}`} className="relative overflow-hidden h-28 border border-[#EAE5DF] rounded-xl bg-white transition-all shadow-sm hover:shadow-md hover:border-[#C4BCB3] cursor-pointer group flex flex-col">
                                {displayImage && (
                                    <div className="absolute inset-0">
                                        <img src={displayImage} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.style.display = 'none'; }} alt={trip.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    </div>
                                )}
                                <div className={`absolute inset-0 p-3.5 flex flex-col justify-end ${displayImage ? 'bg-gradient-to-t from-black/80 via-black/20 to-transparent' : 'bg-gradient-to-t from-white via-white/80 to-transparent'} z-10`}>
                                    <h3 className={`text-base font-medium tracking-wide leading-tight mb-1 ${displayImage ? 'text-white drop-shadow-md' : 'text-[#3C3833]'}`}>{trip.name}</h3>
                                    <div className="flex items-center justify-between gap-2">
                                        <p className={`text-xs ${displayImage ? 'text-white/80' : 'text-[#8A827A]'}`}>
                                            {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                                        </p>

                                        {/* Floating Participant Bubbles */}
                                        <div className="flex -space-x-1.5 z-20">
                                            <UserBubble user={trip.owner} isOwner={true} />
                                            {trip.members && trip.members.map((member: any) => (
                                                <UserBubble key={member.id} user={member.user} isOwner={false} />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {!displayImage && <div className="absolute inset-0 bg-[#A69B90] opacity-0 group-hover:opacity-5 transition-opacity"></div>}
                            </Link>

                            {/* Edit Button overlay */}
                            <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setEditingTrip(trip);
                                    }}
                                    className="px-3 py-1.5 text-xs font-medium text-[#8A827A] border border-[#EAE5DF] bg-white rounded-md shadow-sm hover:bg-[#FCFAF8] hover:text-[#3C3833] transition-colors"
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            <CreateTripModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <EditTripModal isOpen={!!editingTrip} onClose={() => setEditingTrip(null)} trip={editingTrip} />
        </>
    );
}
