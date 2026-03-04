"use client";

import { useState, useTransition } from "react";
import AddLookModal from "@/components/AddLookModal";
import AddProductModal from "@/components/AddProductModal";
import { assignOutfitToDay, deleteProduct } from "@/actions/outfitActions";
import { updateDayDetails } from "@/actions/tripActions";
import CreateTripModal from "@/components/CreateTripModal";
import Link from "next/link";

function getDisplayUrl(url: string | null | undefined): string {
    if (!url) return "";
    return url;
}

function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>, originalUrl: string) {
    const target = e.currentTarget;
    if (!target.dataset.fallback) {
        target.dataset.fallback = "true";
        try {
            const domain = new URL(originalUrl).hostname;
            target.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
            target.classList.remove('object-cover');
            target.classList.add('object-contain', 'scale-50', 'opacity-50');
        } catch {
            target.style.display = 'none';
        }
    } else {
        target.style.display = 'none';
    }
}

export default function CalendarClientWrapper({
    tripId,
    tripName,
    tripEndDate,
    tripStartDate,
    tripLocationUrl,
    tripLocationImageUrl,
    outfits,
    products = [],
    initialDayDetails = {},
    userAvatar,
    userEmail
}: {
    tripId: string;
    tripName: string;
    tripEndDate: Date;
    tripStartDate: Date;
    tripLocationUrl?: string | null;
    tripLocationImageUrl?: string | null;
    outfits: any[];
    products?: any[];
    initialDayDetails?: Record<number, any>;
    userAvatar?: string | null;
    userEmail?: string | null;
}) {
    const [activeDayModal, setActiveDayModal] = useState<number | null>(null);
    const [editingOutfit, setEditingOutfit] = useState<any>(null);
    const [activeCatalogModal, setActiveCatalogModal] = useState<boolean>(false);
    const [activeEditTripModal, setActiveEditTripModal] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'itinerary' | 'wardrobe' | 'catalog'>('itinerary');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    // State for day details
    const [dayDetails, setDayDetails] = useState<Record<number, any>>(initialDayDetails);
    const [editingDayDetails, setEditingDayDetails] = useState<number | null>(null);

    // Group outfits by day
    const outfitsByDay: Record<number, any[]> = {};
    const savedOutfits: any[] = [];
    for (const outfit of outfits) {
        if (outfit.dayNumber === null) {
            savedOutfits.push(outfit);
        } else {
            if (!outfitsByDay[outfit.dayNumber]) outfitsByDay[outfit.dayNumber] = [];
            outfitsByDay[outfit.dayNumber].push(outfit);
        }
    }

    // Calculate duration in days
    const durationTime = tripEndDate.getTime() - tripStartDate.getTime();
    const tripDuration = Math.ceil(durationTime / (1000 * 3600 * 24)) + 1;

    // Generate the timeline iterator array based on duration
    const days = Array.from({ length: tripDuration }, (_, i) => i + 1);

    const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };

    const [isPending, startTransition] = useTransition();

    const handleAssignToDay = async (outfitId: string, dayNumber: number) => {
        startTransition(async () => {
            try {
                await assignOutfitToDay(outfitId, dayNumber, tripId);
            } catch (e) {
                console.error("Failed to assign outfit.", e);
            }
        });
    };

    const handleSaveDayDetails = async (dayNum: number, e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const activities = formData.get("activities") as string;
        const locationUrl = formData.get("locationUrl") as string;

        setDayDetails(prev => ({
            ...prev,
            [dayNum]: { ...prev[dayNum], activities, locationUrl }
        }));
        setEditingDayDetails(null);

        startTransition(async () => {
            try {
                await updateDayDetails(tripId, dayNum, formData);
            } catch (err) {
                console.error(err);
                alert("Failed to save day details.");
            }
        });
    };


    const handleDeleteProduct = async (productId: string) => {
        const confirmed = window.confirm("Are you sure you want to delete this product from your catalog? This will remove it from any assigned looks.");
        if (!confirmed) return;

        startTransition(async () => {
            try {
                await deleteProduct(productId, tripId);
            } catch (err) {
                console.error("Failed to delete product.", err);
                alert("Failed to delete product.");
            }
        });
    };

    const renderOutfit = (outfit: any, isWardrobe: boolean = false) => {
        const hasImageProduct = outfit.products?.find((p: any) => p.imageUrl);
        const displayImage = getDisplayUrl(hasImageProduct?.imageUrl);
        const lookIdentifier = outfit.name ? outfit.name.replace(/\s+/g, '-').toLowerCase() : outfit.id;

        return (
            <div key={outfit.id} id={`look-${lookIdentifier}`} onClick={() => setEditingOutfit(outfit)} className="flex flex-col animate-in fade-in duration-500 relative cursor-pointer group/card">
                <div className="relative group overflow-hidden rounded-xl bg-white border border-[#EAE5DF] aspect-[3/4] group-hover/card:shadow-md transition-shadow">
                    {displayImage ? (
                        <>
                            <img src={displayImage} onError={(e) => handleImageError(e, displayImage)} alt="Main Visual" className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 pointer-events-none">
                                <h3 className="text-white font-medium text-lg leading-tight dropshadow-md">
                                    {outfit.name || "Untitled Look"}
                                </h3>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full text-[#8A827A] bg-[#FCFAF8] p-6 text-center">
                            <span className="font-semibold text-[#3C3833] mt-2 text-lg">{outfit.name || "Untitled Look"}</span>
                            <span className="text-xs opacity-70 mt-1">
                                {outfit.products?.length || 0} items
                            </span>
                        </div>
                    )}

                    {/* Overlay Metadata */}
                    <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/60 to-transparent flex justify-between">
                        {outfit.isPrivate && (
                            <span className="px-2 py-1 text-xs font-medium text-black bg-[#D1C3B4] rounded-md shadow">Draft</span>
                        )}
                        {outfit.user && (
                            <span className="ml-auto flex items-center justify-center w-6 h-6 text-xs bg-white text-[#3C3833] rounded-full shadow-sm" title={outfit.user.email}>
                                {outfit.user.email[0].toUpperCase()}
                            </span>
                        )}
                    </div>
                </div>

                {isWardrobe && (
                    <div className="mt-3 px-1 flex flex-col gap-2 relative z-10 block">
                        <select
                            className="w-full py-2 px-3 bg-white border border-[#EAE5DF] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D1C3B4]"
                            onChange={(e) => {
                                e.stopPropagation();
                                if (e.target.value) {
                                    handleAssignToDay(outfit.id, parseInt(e.target.value, 10));
                                }
                            }}
                            defaultValue=""
                        >
                            <option value="" disabled>Assign to Event...</option>
                            {days.map(d => (
                                <option key={d} value={d}>Day {d}</option>
                            ))}
                        </select>
                    </div>
                )
                }

                {/* Itinerary Details & Description */}
                {
                    (outfit.activity || outfit.locationUrl || outfit.description) && (
                        <div className="mt-3 px-1 flex flex-col gap-1.5">
                            {outfit.activity && <h4 className="text-sm font-bold text-[#3C3833]">{outfit.activity}</h4>}
                            {outfit.locationUrl && (
                                <a href={outfit.locationUrl} onClick={e => e.stopPropagation()} target="_blank" rel="noopener noreferrer" className="text-xs text-[#8A827A] truncate hover:text-[#3C3833] hover:underline flex items-center gap-1">
                                    📍 {outfit.locationUrl.replace(/^https?:\/\//, '')}
                                </a>
                            )}
                            {outfit.description && <p className="text-sm text-[#3C3833] line-clamp-2 mt-1">{outfit.description}</p>}
                        </div>
                    )
                }

                {/* Mini Products Row */}
                {
                    outfit.products && outfit.products.length > 0 && (
                        <div className="flex gap-2 mt-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none">
                            {outfit.products.map((prod: any) => {
                                const dImg = getDisplayUrl(prod.imageUrl);
                                return (
                                    <div key={prod.id} className="w-14 h-14 shrink-0 bg-white border border-[#EAE5DF] rounded-md overflow-hidden relative group cursor-pointer" title={prod.name + ' • ' + prod.category}>
                                        {dImg ? (
                                            <img src={dImg} onError={(e) => handleImageError(e, dImg)} alt={prod.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-[#8A827A] p-1 text-center bg-[#FCFAF8]">
                                                <span className="text-[9px] font-medium truncate w-full">{prod.name}</span>
                                                <span className="text-[7px] uppercase tracking-wider mt-0.5 opacity-60">{prod.category.substring(0, 3)}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )
                }
            </div >
        );
    };

    const handleCopyInvite = async () => {
        const inviteUrl = `${window.location.origin}/join/${tripId}`;
        const shareData = {
            title: `You're invited: ${tripName}`,
            text: `Join the lookbook for ${tripName} on VibeCheck!`,
            url: inviteUrl
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                return;
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    console.error("Error sharing:", err);
                }
            }
        }

        // Fallback
        navigator.clipboard.writeText(inviteUrl);
        alert("Invite link copied to clipboard!");
    };

    return (
        <>
            {/* Sticky Header */}
            <div className="sticky top-0 z-30 flex items-center justify-between p-4 sm:p-6 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#EAE5DF]">
                <div className="flex items-center gap-3">
                    <Link href="/" className="shrink-0 group overflow-hidden w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#EAE5DF] shadow-sm hover:border-[#A69B90] transition-colors relative block focus:outline-none focus:ring-2 focus:ring-[#D1C3B4]">
                        {userAvatar ? (
                            <img src={userAvatar} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Account Profile" />
                        ) : (
                            <div className="w-full h-full bg-[#D1C3B4] flex items-center justify-center text-[#3C3833] font-bold text-sm sm:text-base">
                                {userEmail ? userEmail[0].toUpperCase() : "U"}
                            </div>
                        )}
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-semibold tracking-wide text-[#3C3833] line-clamp-1">{tripName}</h1>
                        <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                            <span className="text-[10px] sm:text-sm text-[#8A827A]">
                                {tripStartDate.toLocaleDateString(undefined, dateOptions)} — {tripEndDate.toLocaleDateString(undefined, dateOptions)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 ml-4">
                    <button
                        onClick={() => setActiveEditTripModal(true)}
                        className="hidden sm:block px-4 py-2 text-sm font-medium transition-colors bg-white border border-[#EAE5DF] rounded-full text-[#3C3833] hover:bg-[#FCFAF8] shadow-sm"
                    >
                        Edit Trip
                    </button>
                    <button
                        onClick={handleCopyInvite}
                        className="px-4 py-2 text-sm font-medium transition-colors bg-white border border-[#EAE5DF] rounded-full text-[#3C3833] hover:bg-[#FCFAF8] shadow-sm"
                    >
                        + Invite Friends
                    </button>
                </div>
            </div>

            <main className="max-w-md px-4 py-8 mx-auto sm:max-w-2xl">
                {(tripLocationUrl || tripLocationImageUrl) && (
                    <div className="mb-10 bg-white border border-[#EAE5DF] rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden flex flex-col sm:flex-row">
                        <div className="relative w-full sm:w-1/2 h-48 sm:h-auto bg-[#FCFAF8] border-b sm:border-b-0 sm:border-r border-[#EAE5DF] flex items-center justify-center overflow-hidden">
                            {tripLocationImageUrl ? (
                                <img
                                    src={getDisplayUrl(tripLocationImageUrl)}
                                    onError={(e) => handleImageError(e, tripLocationImageUrl)}
                                    alt="Location Preview"
                                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                                />
                            ) : (
                                <div className="text-[#8A827A] flex w-full h-full flex-col items-center justify-center gap-2 opacity-70 bg-[#FCFAF8]">
                                    <span className="text-4xl text-center">🗺️</span>
                                </div>
                            )}
                            {tripLocationUrl && (
                                <a
                                    href={tripLocationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                                >
                                    Open Maps ↗
                                </a>
                            )}
                        </div>

                        <div className="w-full sm:w-1/2 p-5 flex flex-col justify-center bg-gradient-to-br from-white to-[#FCFAF8]">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">🌤️</span>
                                <h3 className="text-sm font-semibold tracking-wide text-[#3C3833] uppercase">Current Conditions</h3>
                            </div>

                            <div className="mt-4 flex items-end gap-3">
                                <span className="text-4xl font-light tracking-tighter text-[#3C3833]">25°C</span>
                                <span className="text-xl font-medium text-[#8A827A] mb-1">/ 78°F</span>
                            </div>
                            <span className="text-sm text-[#8A827A] mt-1 font-medium">Mostly Sunny</span>

                            <div className="mt-5 grid grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-wider text-[#A69B90] font-semibold">Humidity</span>
                                    <span className="text-sm font-medium text-[#3C3833]">64%</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-wider text-[#A69B90] font-semibold">Wind</span>
                                    <span className="text-sm font-medium text-[#3C3833]">8 mph W</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-wider text-[#A69B90] font-semibold">UV Index</span>
                                    <span className="text-sm font-medium text-[#3C3833]">High (7)</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-wider text-[#A69B90] font-semibold">Sunset</span>
                                    <span className="text-sm font-medium text-[#3C3833]">7:42 PM</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex border-b border-[#EAE5DF] mb-8 sticky top-[73px] sm:top-[89px] bg-[#FDFBF7]/95 backdrop-blur-md z-20 -mx-4 px-4 sm:-mx-0 sm:px-0">
                    <button
                        className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'itinerary' ? 'border-[#3C3833] text-[#3C3833]' : 'border-transparent text-[#8A827A] hover:text-[#3C3833]'}`}
                        onClick={() => setActiveTab('itinerary')}
                    >
                        Itinerary
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'wardrobe' ? 'border-[#3C3833] text-[#3C3833]' : 'border-transparent text-[#8A827A] hover:text-[#3C3833]'}`}
                        onClick={() => setActiveTab('wardrobe')}
                    >
                        Saved Looks
                        {savedOutfits.length > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none bg-[#D1C3B4] text-[#3C3833] rounded-full">
                                {savedOutfits.length}
                            </span>
                        )}
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'catalog' ? 'border-[#3C3833] text-[#3C3833]' : 'border-transparent text-[#8A827A] hover:text-[#3C3833]'}`}
                        onClick={() => setActiveTab('catalog')}
                    >
                        Catalog
                    </button>
                </div>

                {activeTab === 'itinerary' && (
                    <div className="flex flex-col gap-16">
                        {days.map((dayNum) => {
                            const dayOutfits = outfitsByDay[dayNum] || [];

                            // Calculate the actual date for this slot
                            const currentDate = new Date(tripStartDate);
                            currentDate.setDate(currentDate.getDate() + (dayNum - 1));

                            const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

                            return (
                                <div key={dayNum} className="flex flex-col gap-4 animate-in slide-in-from-bottom-8 fade-in duration-700" style={{ animationDelay: `${dayNum * 50}ms`, animationFillMode: "both" }}>

                                    {/* Day Header */}
                                    <div className="flex items-center gap-4 group">
                                        <div className="flex flex-col items-center justify-center w-12 h-12 bg-[#D1C3B4] text-[#3C3833] rounded-xl shrink-0 font-medium cursor-pointer" onClick={() => setActiveDayModal(dayNum)}>
                                            <span className="text-xs uppercase opacity-80 leading-none mb-0.5">Day</span>
                                            <span className="text-lg leading-none">{dayNum}</span>
                                        </div>
                                        <div className="flex flex-col flex-grow">
                                            <h2 className="text-xl font-medium tracking-wide text-[#3C3833]">{formatter.format(currentDate)}</h2>
                                        </div>
                                        <button onClick={() => setActiveDayModal(dayNum)} className="px-3 py-1.5 text-xs font-medium text-[#8A827A] border border-[#C4BCB3] transition-colors bg-white hover:bg-[#FCFAF8] rounded-lg opacity-0 group-hover:opacity-100 hidden sm:block">
                                            + Add Look
                                        </button>
                                    </div>

                                    {/* Day Content Area */}
                                    <div className="relative pl-6 ml-6 border-l-2 border-[#EAE5DF]">
                                        {dayOutfits.length === 0 ? (
                                            <div onClick={() => setActiveDayModal(dayNum)} className="flex items-center justify-center h-40 border-2 border-dashed border-[#C4BCB3] rounded-xl bg-white transition-colors hover:border-[#A69B90] hover:bg-[#FCFAF8] cursor-pointer group">
                                                <span className="text-[#8A827A] font-medium text-sm transition-transform group-hover:scale-105">+ Add Look to Day {dayNum}</span>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                                {dayOutfits.map((outfit) => renderOutfit(outfit, false))}

                                                <div onClick={() => setActiveDayModal(dayNum)} className="flex items-center justify-center border-2 border-dashed border-[#C4BCB3] rounded-xl bg-white transition-colors hover:border-[#A69B90] hover:bg-[#FCFAF8] cursor-pointer group aspect-[3/4]">
                                                    <span className="text-[#8A827A] font-medium text-sm transition-transform group-hover:scale-105">+ Add</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'wardrobe' && (
                    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-medium tracking-wide text-[#3C3833]">Trip Wardrobe</h2>
                                <p className="text-sm text-[#8A827A]">Looks saved for this trip, ready to be assigned.</p>
                            </div>
                            <button
                                onClick={() => setActiveDayModal(0)}
                                className="px-4 py-2 text-sm font-medium text-white transition-colors bg-[#3C3833] rounded-full hover:bg-black shadow-sm"
                            >
                                + Add Look
                            </button>
                        </div>

                        {savedOutfits.length === 0 ? (
                            <div onClick={() => setActiveDayModal(0)} className="flex items-center justify-center h-48 border-2 border-dashed border-[#C4BCB3] rounded-xl bg-white transition-colors hover:border-[#A69B90] hover:bg-[#FCFAF8] cursor-pointer group">
                                <span className="text-[#8A827A] font-medium transition-transform group-hover:scale-105">+ Create your first saved look</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {savedOutfits.map((outfit) => renderOutfit(outfit, true))}
                                <div onClick={() => setActiveDayModal(0)} className="flex items-center justify-center border-2 border-dashed border-[#C4BCB3] rounded-xl bg-white transition-colors hover:border-[#A69B90] hover:bg-[#FCFAF8] cursor-pointer group aspect-[3/4]">
                                    <span className="text-[#8A827A] font-medium text-sm transition-transform group-hover:scale-105">+ Add Saved Look</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'catalog' && (
                    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-medium tracking-wide text-[#3C3833]">Product Catalog</h2>
                                <p className="text-sm text-[#8A827A]">Individual items you are bringing on this trip.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                                <select
                                    className="w-full sm:w-auto px-3 py-2 text-sm bg-white border border-[#EAE5DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D1C3B4] text-[#3C3833]"
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                >
                                    <option value="all">All Categories</option>
                                    <option value="top">Top</option>
                                    <option value="bottoms">Bottoms</option>
                                    <option value="dress">Dress / One-Piece</option>
                                    <option value="shoes">Shoes</option>
                                    <option value="accessories">Accessories</option>
                                    <option value="outerwear">Outerwear</option>
                                </select>
                                <button
                                    onClick={() => setActiveCatalogModal(true)}
                                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white transition-colors bg-[#3C3833] rounded-full hover:bg-black shadow-sm whitespace-nowrap lg:shrink-0"
                                >
                                    + Add Product
                                </button>
                            </div>
                        </div>

                        {!products || products.length === 0 ? (
                            <div onClick={() => setActiveCatalogModal(true)} className="flex items-center justify-center h-48 border-2 border-dashed border-[#C4BCB3] rounded-xl bg-white transition-colors cursor-pointer group hover:bg-[#FCFAF8] hover:border-[#A69B90]">
                                <span className="text-[#8A827A] font-medium transition-transform group-hover:scale-105">+ Add an item to your catalog</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                {products.filter(p => categoryFilter === 'all' || p.category === categoryFilter).map((p: any) => (
                                    <div key={p.id} className="relative flex flex-col items-center p-3 bg-white border border-[#EAE5DF] rounded-xl shadow-sm hover:shadow-md transition-shadow group">

                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteProduct(p.id); }}
                                            className="absolute top-1 right-1 z-10 w-6 h-6 flex items-center justify-center bg-white/80 backdrop-blur-sm text-[#8A827A] hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                        >
                                            ✕
                                        </button>

                                        <div className="w-full aspect-square bg-[#FCFAF8] rounded-lg overflow-hidden border border-[#EAE5DF] mb-3 relative">
                                            {p.imageUrl ? (
                                                <img src={getDisplayUrl(p.imageUrl)} onError={(e) => handleImageError(e, p.imageUrl)} alt={p.name} className="object-cover relative w-full h-full hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full text-[#8A827A] text-xs">No Image</div>
                                            )}
                                        </div>
                                        <h3 className="text-sm font-medium text-[#3C3833] line-clamp-1 w-full text-center">{p.name}</h3>
                                        <p className="text-xs text-[#8A827A] capitalize">{p.category}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            <AddLookModal
                isOpen={activeDayModal !== null || editingOutfit !== null}
                onClose={() => { setActiveDayModal(null); setEditingOutfit(null); }}
                tripId={tripId}
                dayNumber={editingOutfit ? editingOutfit.dayNumber : (activeDayModal === 0 ? null : activeDayModal!)}
                catalogProducts={products || []}
                savedOutfits={savedOutfits}
                existingOutfit={editingOutfit}
            />

            <AddProductModal
                isOpen={activeCatalogModal}
                onClose={() => setActiveCatalogModal(false)}
                tripId={tripId}
            />

            <CreateTripModal
                isOpen={activeEditTripModal}
                onClose={() => setActiveEditTripModal(false)}
                existingTrip={{
                    id: tripId,
                    name: tripName,
                    startDate: tripStartDate,
                    endDate: tripEndDate,
                    locationUrl: tripLocationUrl,
                    locationImageUrl: tripLocationImageUrl
                }}
            />
        </>
    );
}
