"use client";

import { useEffect, useState } from "react";
import { addOutfit, assignOutfitToDay, updateOutfit, copyOutfitToWardrobe, deleteOutfit } from "@/actions/outfitActions";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus, X, GripVertical } from "lucide-react";

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
        if (target.nextElementSibling) {
            target.nextElementSibling.classList.remove('hidden');
        }
    }
}

export default function AddLookModal({
    isOpen,
    onClose,
    tripId,
    dayNumber,
    catalogProducts = [],
    savedOutfits = [],
    existingOutfit
}: {
    isOpen: boolean;
    onClose: () => void;
    tripId: string;
    dayNumber: number | null;
    catalogProducts?: any[];
    savedOutfits?: any[];
    existingOutfit?: any;
}) {
    const [name, setName] = useState(existingOutfit?.name || "");
    const [description, setDescription] = useState(existingOutfit?.description || "");
    const [activity, setActivity] = useState(existingOutfit?.activity || "");
    const [locationUrl, setLocationUrl] = useState(existingOutfit?.locationUrl || "");
    const [locationImage, setLocationImage] = useState<string | null>(null);
    const [isPrivate, setIsPrivate] = useState(existingOutfit?.isPrivate || false);

    // Products State
    const [products, setProducts] = useState<any[]>(existingOutfit?.products || []);

    const [loading, setLoading] = useState(false);
    const [uploadingImageIdx, setUploadingImageIdx] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            setName(existingOutfit?.name || "");
            setDescription(existingOutfit?.description || "");
            setActivity(existingOutfit?.activity || "");
            setLocationUrl(existingOutfit?.locationUrl || "");
            setLocationImage(null); // Reset until fetched
            setIsPrivate(existingOutfit?.isPrivate || false);
            setProducts(existingOutfit?.products || []);
        }
    }, [isOpen, existingOutfit]);

    // Auto-fetch location image
    useEffect(() => {
        if (!locationUrl || !isOpen) {
            setLocationImage(null);
            return;
        }

        const fetchImage = async () => {
            try {
                // Using internal scraper API to extract og:image
                const res = await fetch(`/api/scrape?url=${encodeURIComponent(locationUrl)}`);
                const data = await res.json();
                if (data.imageUrl) {
                    setLocationImage(data.imageUrl);
                } else {
                    setLocationImage(null);
                }
            } catch (e) {
                console.error("Failed fetching location image preview", e);
                setLocationImage(null);
            }
        };

        const timer = setTimeout(fetchImage, 500); // Debounce
        return () => clearTimeout(timer);
    }, [locationUrl, isOpen]);

    if (!isOpen) return null;

    async function handleAssignSavedLook(outfitId: string) {
        if (!dayNumber) return;
        setLoading(true);
        try {
            await assignOutfitToDay(outfitId, dayNumber, tripId);
            onClose();
            router.refresh();
        } catch (err: any) {
            console.error(err);
            alert("Failed to assign look. " + (err.message || JSON.stringify(err)));
        } finally {
            setLoading(false);
        }
    }

    async function handleCopyToWardrobe() {
        if (!existingOutfit?.id) return;
        setLoading(true);
        try {
            await copyOutfitToWardrobe(existingOutfit.id, tripId);
            onClose();
            router.refresh();
        } catch (err: any) {
            console.error(err);
            alert("Failed to copy look to wardrobe. " + (err.message || JSON.stringify(err)));
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (!existingOutfit?.id) return;

        const confirmed = window.confirm("Are you sure you want to delete this look? This action cannot be undone.");
        if (!confirmed) return;

        setLoading(true);
        try {
            await deleteOutfit(existingOutfit.id, tripId);
            onClose();
            router.refresh();
        } catch (err: any) {
            console.error(err);
            alert("Failed to delete look. " + (err.message || JSON.stringify(err)));
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                name: name || undefined,
                description,
                activity: activity || undefined,
                locationUrl: locationUrl || undefined,
                isPrivate,
                products
            };

            if (existingOutfit) {
                await updateOutfit(existingOutfit.id, tripId, payload);
            } else {
                await addOutfit(tripId, dayNumber, payload);
            }
            onClose();
            setName("");
            setDescription("");
            setActivity("");
            setLocationUrl("");
            setIsPrivate(false);
            setProducts([]);
            router.refresh();
        } catch (err: any) {
            console.error(err);
            alert("Failed to add look. " + (err.message || JSON.stringify(err)));
        } finally {
            setLoading(false);
        }
    }

    function handleAddProduct() {
        setProducts(prev => [...prev, { name: "", category: "top", imageUrl: "", tags: [], notes: "" }]);
        setTimeout(() => {
            const items = document.querySelectorAll('.product-item-card');
            const lastItem = items[items.length - 1];
            if (lastItem) {
                lastItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    }

    function handleUpdateProduct(index: number, field: string, value: any) {
        setProducts(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    }

    function handleRemoveProduct(index: number) {
        setProducts(prev => prev.filter((_, i) => i !== index));
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white sm:bg-black/40 backdrop-blur-sm sm:p-4 text-left">
            <div className="w-full h-full sm:h-[90vh] sm:max-w-5xl p-4 sm:p-6 bg-white sm:border border-[#EAE5DF] sm:rounded-2xl sm:shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col">
                <div className="flex items-center justify-between mb-4 shrink-0 pt-4 sm:pt-0 pb-3 border-b border-[#EAE5DF]">
                    <h3 className="text-xl font-semibold tracking-wide text-[#3C3833]">
                        {existingOutfit ? 'View / Edit Look Inspector' : (dayNumber ? `Day ${dayNumber} Look Inspector` : 'New Wardrobe Look')}
                    </h3>
                    <div className="flex items-center gap-2">
                        {existingOutfit && (
                            <button type="button" onClick={(e) => {
                                e.preventDefault();
                                navigator.clipboard.writeText(`${window.location.origin}/trips/${tripId}`);
                                alert("Link copied to clipboard!");
                            }} className="text-xs px-3 py-1.5 border border-[#EAE5DF] bg-[#FCFAF8] text-[#3C3833] rounded-md shadow-sm hover:bg-white transition-colors flex gap-2 items-center">
                                <span>📤</span> Share Look
                            </button>
                        )}
                        <button type="button" onClick={onClose} className="p-2 text-[#8A827A] hover:bg-[#FCFAF8] rounded-full transition">✕</button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto pr-2 pb-6 -mr-2 flex flex-col gap-6">

                        {!existingOutfit && dayNumber !== null && savedOutfits && savedOutfits.length > 0 && (
                            <div className="p-4 border border-[#EAE5DF] rounded-xl bg-[#FCFAF8]">
                                <h4 className="font-medium text-[#3C3833] text-sm uppercase tracking-wider mb-3">Assign a Saved Look</h4>
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                                    {savedOutfits.map(outfit => {
                                        const imgProd = outfit.products?.find((p: any) => p.imageUrl);
                                        const displayImage = getDisplayUrl(imgProd?.imageUrl);
                                        return (
                                            <button
                                                key={outfit.id}
                                                type="button"
                                                onClick={() => handleAssignSavedLook(outfit.id)}
                                                className="shrink-0 flex flex-col items-center gap-2 p-2 bg-white border border-[#EAE5DF] rounded-lg hover:border-[#A69B90] transition-colors group"
                                            >
                                                <div className="w-16 h-16 bg-[#FDFBF7] rounded border border-[#EAE5DF] flex items-center justify-center overflow-hidden">
                                                    {displayImage ? (
                                                        <img src={displayImage} onError={(e) => handleImageError(e, displayImage)} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                    ) : (
                                                        <span className={`text-[#8A827A] text-[10px] uppercase font-medium ${displayImage ? 'hidden' : ''}`}>No Image</span>
                                                    )}
                                                </div>
                                                <span className="text-xs font-medium text-[#3C3833] max-w-[64px] truncate" title={outfit.name || "Untitled"}>
                                                    {outfit.name || "Untitled"}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="flex items-center gap-3 mt-4">
                                    <div className="h-px flex-1 bg-[#EAE5DF]"></div>
                                    <span className="text-[10px] font-bold text-[#8A827A] uppercase tracking-wider">OR EDIT NEW PRESET</span>
                                    <div className="h-px flex-1 bg-[#EAE5DF]"></div>
                                </div>
                            </div>
                        )}

                        {/* Hero Banner Section */}
                        <div className="relative w-full h-48 md:h-56 rounded-2xl overflow-hidden bg-[#FCFAF8] border border-[#EAE5DF] shrink-0 group">
                            {locationImage ? (
                                <img src={locationImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Location Cover" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-[#C4BCB3] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat opacity-40">
                                    <span className="text-5xl opacity-30 grayscale mb-2">🗺️</span>
                                </div>
                            )}

                            {/* Gradient Overlay & Title overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>

                            <div className="absolute bottom-0 left-0 w-full p-5 flex flex-col justify-end text-white">
                                {activity && <span className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-1 dropshadow-md">{activity}</span>}
                                <h2 className="text-3xl font-bold tracking-tight dropshadow-xl leading-tight">
                                    {name || "Untitled Look"}
                                </h2>
                                {locationUrl && !locationImage && (
                                    <span className="text-xs text-white/70 mt-1 flex items-center gap-1">📍 Searching for location preview...</span>
                                )}
                            </div>
                        </div>

                        {/* Top Header Section: Metadata */}
                        <div className="bg-[#FCFAF8] p-5 rounded-2xl border border-[#EAE5DF] shadow-inner grid grid-cols-1 md:grid-cols-2 gap-5 shrink-0">
                            <div className="flex flex-col gap-4 border-r-0 md:border-r border-[#EAE5DF] md:pr-5">
                                <div>
                                    <label className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-[#A69B90]">Look Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="e.g. Dinner by the Sea"
                                        className="w-full px-4 py-2 text-sm bg-white border border-[#EAE5DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D1C3B4] transition-all text-[#3C3833] placeholder-[#C4BCB3] shadow-sm font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-[#A69B90]">Concept / Notes</label>
                                    <textarea
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="A breezy white linen look for walking the coast..."
                                        rows={2}
                                        className="w-full px-4 py-2 text-sm bg-white border border-[#EAE5DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D1C3B4] transition-all text-[#3C3833] placeholder-[#C4BCB3] resize-none shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="flex items-center gap-1.5 mb-1.5 text-xs font-bold uppercase tracking-wider text-[#A69B90]"><span className="text-sm">🎫</span> Activity / Event</label>
                                    <input
                                        type="text"
                                        value={activity}
                                        onChange={e => setActivity(e.target.value)}
                                        placeholder="Dinner, Beach, Museum..."
                                        className="w-full px-4 py-2 text-sm bg-white border border-[#EAE5DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D1C3B4] transition-all text-[#3C3833] placeholder-[#C4BCB3] shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-1.5 mb-1.5 text-xs font-bold uppercase tracking-wider text-[#A69B90]"><span className="text-sm">📍</span> Location Link</label>
                                    <input
                                        type="url"
                                        value={locationUrl}
                                        onChange={e => setLocationUrl(e.target.value)}
                                        placeholder="Google Maps URL..."
                                        className="w-full px-4 py-2 text-sm bg-white border border-[#EAE5DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D1C3B4] transition-all text-[#3C3833] placeholder-[#C4BCB3] shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Split Editor/Preview View */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[400px]">

                            {/* Left Column: Product Editor */}
                            <div className="flex flex-col gap-4 md:border-r border-[#EAE5DF] md:pr-4">
                                <div className="flex items-center justify-between pb-2 border-b border-[#EAE5DF]">
                                    <h4 className="font-semibold text-[#3C3833] text-sm uppercase tracking-wider">Look Items Editor</h4>
                                    <div className="flex gap-2 items-center">
                                        {catalogProducts && catalogProducts.length > 0 && (
                                            <select
                                                className="text-xs px-2 py-1.5 border border-[#EAE5DF] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#A69B90] bg-[#FCFAF8] hover:bg-white text-[#3C3833] shadow-sm transition-colors cursor-pointer font-medium"
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        const selectedProduct = catalogProducts.find(p => p.id === e.target.value);
                                                        if (selectedProduct) {
                                                            setProducts(prev => [...prev, selectedProduct]);
                                                            setTimeout(() => {
                                                                const items = document.querySelectorAll('.product-item-card');
                                                                const lastItem = items[items.length - 1];
                                                                if (lastItem) lastItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                            }, 100);
                                                        }
                                                        e.target.value = "";
                                                    }
                                                }}
                                                defaultValue=""
                                            >
                                                <option value="" disabled>From Catalog...</option>
                                                {catalogProducts.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        )}
                                        <button
                                            type="button"
                                            onClick={handleAddProduct}
                                            className="text-xs px-3 py-1.5 bg-[#3C3833] text-white rounded-lg font-medium hover:bg-black transition-colors shadow-sm"
                                        >
                                            + Add Item
                                        </button>
                                    </div>
                                </div>

                                <div id="product-list-container" className="flex flex-col gap-3 overflow-y-auto pb-4 px-1 scroll-smooth">
                                    {products.length === 0 && (
                                        <div className="text-sm text-[#8A827A] italic p-8 my-4 border-2 border-dashed border-[#EAE5DF] bg-[#FCFAF8] rounded-2xl text-center">
                                            No items added yet. Build your outfit by adding items below!
                                        </div>
                                    )}

                                    {products.map((p, idx) => (
                                        <div key={idx} className="product-item-card p-4 border border-[#EAE5DF] rounded-xl flex gap-4 bg-white shadow-sm hover:shadow-md transition-shadow relative group">
                                            <button type="button" onClick={() => handleRemoveProduct(idx)} className="absolute top-2 right-2 text-[#C4BCB3] hover:text-red-500 hover:bg-red-50 p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100">
                                                <X size={16} />
                                            </button>

                                            <div className="shrink-0 w-24">
                                                <div className="relative w-full aspect-square overflow-hidden flex items-center justify-center border border-[#EAE5DF] rounded-lg cursor-pointer transition-all hover:border-[#A69B90] group/img bg-white">
                                                    {uploadingImageIdx === idx && (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-30">
                                                            <div className="w-5 h-5 border-2 border-[#D1C3B4] border-t-transparent rounded-full animate-spin mb-1"></div>
                                                            <span className="text-[9px] font-medium text-[#8A827A]">Uploading...</span>
                                                        </div>
                                                    )}
                                                    {!p.imageUrl && (
                                                        <div className={`absolute inset-0 flex flex-col items-center justify-center text-[#8A827A] bg-[#FCFAF8] border-dashed border-2 rounded-lg`}>
                                                            <ImagePlus className="w-6 h-6 mb-1 opacity-50" />
                                                            <span className="text-[9px] font-medium text-center">Add Photo</span>
                                                        </div>
                                                    )}
                                                    {p.imageUrl && (
                                                        <>
                                                            <img src={getDisplayUrl(p.imageUrl)} onError={(e) => handleImageError(e, p.imageUrl)} className="absolute inset-0 w-full h-full object-cover" alt="Uploaded product" />
                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity pointer-events-none">
                                                                <span className="text-white text-[10px] font-medium">Change</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUpdateProduct(idx, "imageUrl", ""); }}
                                                                className="absolute top-1 right-1 bg-black/60 text-white rounded p-1 opacity-0 group-hover/img:opacity-100 hover:bg-black transition-opacity z-20"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </>
                                                    )}
                                                    <CldUploadWidget
                                                        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || "vibecheck"}
                                                        onSuccess={(result: any) => {
                                                            if (result?.info?.secure_url) {
                                                                handleUpdateProduct(idx, "imageUrl", result.info.secure_url);
                                                            }
                                                        }}
                                                        options={{
                                                            maxFiles: 1,
                                                            resourceType: "image",
                                                            clientAllowedFormats: ["png", "jpeg", "webp", "jpg"],
                                                        }}
                                                    >
                                                        {({ open }) => (
                                                            <div
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    open();
                                                                }}
                                                                className="absolute inset-0 w-full h-full cursor-pointer z-10"
                                                            />
                                                        )}
                                                    </CldUploadWidget>
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0 flex flex-col gap-2.5 pt-1">
                                                <div>
                                                    <input required type="text" value={p.name} onChange={e => handleUpdateProduct(idx, "name", e.target.value)} className="w-full text-sm font-semibold border-b border-transparent hover:border-[#EAE5DF] focus:border-[#C4BCB3] focus:outline-none bg-transparent placeholder-[#C4BCB3] pb-0.5" placeholder="Item Name (e.g. Silk Camisole)" />
                                                </div>
                                                <div className="flex gap-2">
                                                    <select value={p.category} onChange={e => handleUpdateProduct(idx, "category", e.target.value)} className="w-32 px-2 py-1 text-xs border border-[#EAE5DF] rounded-md focus:outline-none focus:ring-1 focus:ring-[#D1C3B4] bg-[#FCFAF8] text-[#8A827A]">
                                                        <option value="top">Top</option>
                                                        <option value="bottom">Bottoms</option>
                                                        <option value="dress">Dress</option>
                                                        <option value="shoes">Shoes</option>
                                                        <option value="accessories">Accessories</option>
                                                    </select>
                                                    <input type="text" value={p.notes} onChange={e => handleUpdateProduct(idx, "notes", e.target.value)} className="flex-1 px-2 py-1 text-xs border border-[#EAE5DF] rounded-md focus:outline-none focus:ring-1 focus:ring-[#D1C3B4] placeholder-[#C4BCB3] bg-[#FCFAF8]" placeholder="Notes or Price..." />
                                                </div>
                                                {!p.imageUrl && (
                                                    <input
                                                        type="text"
                                                        value={p.imageUrl || ""}
                                                        onChange={async (e) => {
                                                            const val = e.target.value;
                                                            handleUpdateProduct(idx, "imageUrl", val);

                                                            // If pasted text is a web link but not an explicit image file
                                                            if (val && val.startsWith('http') && !val.includes('cloudinary') && !val.match(/\.(jpeg|jpg|gif|png|webp|avif|svg)(\?.*)?$/i)) {
                                                                try {
                                                                    const res = await fetch(`/api/scrape?url=${encodeURIComponent(val)}`);
                                                                    const data = await res.json();
                                                                    if (data.imageUrl) {
                                                                        setProducts(prev => {
                                                                            const updated = [...prev];
                                                                            const item = { ...updated[idx] };
                                                                            item.imageUrl = data.imageUrl;
                                                                            if (!item.notes || !item.notes.includes(val)) {
                                                                                item.notes = item.notes ? `${item.notes} ${val}` : val;
                                                                            }
                                                                            updated[idx] = item;
                                                                            return updated;
                                                                        });
                                                                    }
                                                                } catch (err) {
                                                                    console.error("Error scraping product link image", err);
                                                                }
                                                            }
                                                        }}
                                                        className="w-full px-2 py-1 mt-1 text-[10px] border border-transparent border-b-[#EAE5DF] focus:outline-none focus:border-[#A69B90] text-[#8A827A] placeholder-[#C4BCB3]"
                                                        placeholder="...or paste raw image or product URL here"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Column: Visual Preview */}
                            <div className="flex flex-col bg-[#FDFBF7] rounded-2xl border border-[#EAE5DF] p-4 shadow-inner relative overflow-y-auto min-h-[300px] md:min-h-0">
                                <div className="absolute top-0 left-0 w-full px-4 pt-3 pb-2 bg-gradient-to-b from-[#FDFBF7] to-transparent z-10 flex justify-between items-center">
                                    <h4 className="font-semibold text-[#8A827A] text-xs uppercase tracking-widest bg-white/60 px-2 py-0.5 rounded backdrop-blur-sm shadow-sm border border-white/50">Moodboard Preview</h4>
                                </div>

                                <div className="flex-1 w-full flex flex-col pt-8 pb-4 h-full">
                                    {products.filter(p => getDisplayUrl(p.imageUrl)).length > 0 ? (
                                        <div className="columns-2 gap-3 space-y-3">
                                            {products.filter(p => getDisplayUrl(p.imageUrl)).map((p, i) => (
                                                <div key={i} className="break-inside-avoid bg-white rounded-xl border border-[#EAE5DF] overflow-hidden relative shadow-sm hover:shadow-md transition-all group/item">
                                                    <img src={getDisplayUrl(p.imageUrl)} onError={(e) => handleImageError(e, p.imageUrl)} className="w-full h-auto object-cover" alt={p.name} />
                                                    <div className="absolute bottom-0 left-0 w-full p-2.5 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                        <p className="text-xs text-white font-medium truncate leading-tight dropshadow-sm">{p.name || 'Unnamed Item'}</p>
                                                        {p.category && <p className="text-[9px] text-white/80 uppercase tracking-wider">{p.category}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="m-auto flex flex-col items-center justify-center text-[#8A827A] opacity-60">
                                            <span className="text-5xl mb-4 grayscale opacity-40">📸</span>
                                            <p className="text-sm font-medium text-center">Add product images to<br />generate your preview.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Bottom Footer Action Bar */}
                    <div className="shrink-0 pt-4 mt-auto border-t border-[#EAE5DF] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-6 w-full sm:w-auto overflow-x-auto">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative shrink-0">
                                    <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="sr-only" />
                                    <div className={`block w-11 h-6 rounded-full transition-colors border shadow-inner ${isPrivate ? 'bg-[#3C3833] border-[#3C3833]' : 'bg-[#EAE5DF] border-[#D1C3B4]'}`}></div>
                                    <div className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform bg-white shadow ${isPrivate ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                </div>
                                <div className="shrink-0">
                                    <span className="text-sm font-medium text-[#3C3833]">Keep Private (Draft)</span>
                                </div>
                            </label>

                            {existingOutfit && (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-700 transition-colors p-2 shrink-0"
                                >
                                    Delete Look
                                </button>
                            )}
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                            {existingOutfit && existingOutfit.dayNumber !== null && (
                                <button
                                    type="button"
                                    onClick={handleCopyToWardrobe}
                                    disabled={loading}
                                    title="Copies this look to your Trip Wardrobe without removing it from the calendar."
                                    className="flex-1 sm:flex-none px-3 py-2.5 text-sm font-medium transition-colors border-2 border-[#D1C3B4] text-[#8A827A] bg-[#FCFAF8] rounded-xl hover:bg-[#D1C3B4] hover:text-[#3C3833] shadow-sm disabled:opacity-50"
                                >
                                    📥 Copy
                                </button>
                            )}
                            <button type="button" onClick={onClose} disabled={loading} className="flex-1 sm:flex-none px-3 py-2.5 text-sm font-medium transition-colors border border-[#EAE5DF] text-[#8A827A] rounded-xl hover:bg-[#FCFAF8] hover:text-[#3C3833] shadow-sm disabled:opacity-50">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium text-white transition-all bg-[#3C3833] rounded-xl hover:bg-black shadow-md disabled:opacity-50 hover:shadow-lg hover:-translate-y-0.5"
                            >
                                {loading ? "Saving" : "Save Look"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
