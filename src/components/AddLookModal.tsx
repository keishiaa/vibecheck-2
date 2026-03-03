"use client";

import { useState } from "react";
import { addOutfit } from "@/actions/outfitActions";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus, X, GripVertical } from "lucide-react";

function getDisplayUrl(url: string | null | undefined): string {
    if (!url) return "";
    if (url.includes('cloudinary.com') || url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i)) {
        return url;
    }
    return `https://api.microlink.io/?url=${encodeURIComponent(url)}&embed=image.url`;
}

export default function AddLookModal({
    isOpen,
    onClose,
    tripId,
    dayNumber,
    catalogProducts = []
}: {
    isOpen: boolean;
    onClose: () => void;
    tripId: string;
    dayNumber: number | null;
    catalogProducts?: any[];
}) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);

    // Products State
    const [products, setProducts] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);
    const router = useRouter();

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            await addOutfit(tripId, dayNumber, {
                name: name || undefined,
                description,
                isPrivate,
                products
            });
            onClose();
            setName("");
            setDescription("");
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
        setProducts([...products, { name: "", category: "top", imageUrl: "", tags: [], notes: "" }]);
    }

    function handleUpdateProduct(index: number, field: string, value: any) {
        const updated = [...products];
        updated[index] = { ...updated[index], [field]: value };
        setProducts(updated);
    }

    function handleRemoveProduct(index: number) {
        setProducts(products.filter((_, i) => i !== index));
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white sm:bg-black/30 backdrop-blur-sm sm:p-4 text-left">
            <div className="w-full h-full sm:h-auto sm:max-w-xl p-4 sm:p-6 bg-white sm:border border-[#EAE5DF] sm:rounded-2xl sm:shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-200 flex flex-col">
                <div className="flex items-center justify-between mb-6 shrink-0 pt-4 sm:pt-0">
                    <h3 className="text-2xl font-medium tracking-wide text-[#3C3833]">Day {dayNumber} Look</h3>
                    <button type="button" onClick={onClose} className="p-2 text-[#8A827A] hover:bg-[#FCFAF8] rounded-full transition">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6 overflow-y-auto pr-2 pb-6 -mr-2">

                    <div>
                        <label className="block mb-2 text-sm font-medium text-[#3C3833]">Look Name</label>
                        <input
                            required
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Dinner by the Sea"
                            className="w-full px-4 py-3 text-sm bg-white border border-[#EAE5DF] rounded-xl focus:outline-none focus:border-[#A69B90] transition-colors text-[#3C3833] placeholder-[#C4BCB3]"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-[#3C3833]">Concept Summary</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="A breezy white linen look for walking the coast..."
                            rows={3}
                            className="w-full px-4 py-3 text-sm bg-white border border-[#EAE5DF] rounded-xl focus:outline-none focus:border-[#A69B90] transition-colors text-[#3C3833] placeholder-[#C4BCB3] resize-none"
                        />
                    </div>

                    {/* Nested Products Section */}
                    <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                        <h4 className="font-medium text-[#3C3833] text-sm uppercase tracking-wider">Look Items</h4>
                        <div className="flex gap-2 items-center">
                            {catalogProducts && catalogProducts.length > 0 && (
                                <select
                                    className="text-xs px-2 py-1.5 border border-[#EAE5DF] rounded-md focus:outline-none focus:border-[#A69B90] bg-white text-[#8A827A]"
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            const selectedProduct = catalogProducts.find(p => p.id === e.target.value);
                                            if (selectedProduct) {
                                                setProducts([...products, selectedProduct]);
                                            }
                                            e.target.value = ""; // Reset to default
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
                                className="text-xs px-3 py-1.5 bg-[#D1C3B4] text-[#3C3833] rounded-md font-medium hover:bg-[#C2B2A1] transition"
                            >
                                + New Item
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        {products.length === 0 && (
                            <div className="text-sm text-[#8A827A] italic p-4 border border-dashed border-[#EAE5DF] rounded-xl text-center">
                                No specific items added yet. Click above to break down this look.
                            </div>
                        )}

                        {products.map((p, idx) => (
                            <div key={idx} className="p-4 border border-[#EAE5DF] rounded-xl flex flex-col gap-3 bg-white relative group">
                                <button type="button" onClick={() => handleRemoveProduct(idx)} className="absolute top-2 right-2 text-[#8A827A] hover:text-red-500 font-bold opacity-0 group-hover:opacity-100 transition">✕</button>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block mb-1 text-xs text-[#8A827A]">Item Name *</label>
                                        <input required type="text" value={p.name} onChange={e => handleUpdateProduct(idx, "name", e.target.value)} className="w-full px-2 py-1.5 text-sm border border-[#EAE5DF] rounded focus:outline-none focus:border-[#A69B90]" placeholder="Silk Camisole" />
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-xs text-[#8A827A]">Category</label>
                                        <select value={p.category} onChange={e => handleUpdateProduct(idx, "category", e.target.value)} className="w-full px-2 py-1.5 text-sm border border-[#EAE5DF] rounded focus:outline-none focus:border-[#A69B90] bg-white">
                                            <option value="top">Top</option>
                                            <option value="bottom">Bottoms</option>
                                            <option value="dress">Dress</option>
                                            <option value="shoes">Shoes</option>
                                            <option value="accessories">Accessories</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block mb-1 text-xs text-[#8A827A]">Product Image</label>
                                    <CldUploadWidget
                                        uploadPreset="vibecheck"
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
                                                    open();
                                                }}
                                                className={`w-full aspect-square max-h-32 sm:h-32 overflow-hidden flex items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-colors ${p.imageUrl ? 'border-[#C4BCB3] bg-white' : 'border-[#EAE5DF] bg-[#FCFAF8] hover:border-[#A69B90]'}`}
                                            >
                                                {p.imageUrl ? (
                                                    <img src={getDisplayUrl(p.imageUrl)} className="w-full h-full object-cover rounded-xl" alt="Uploaded product" />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center p-2 text-[#8A827A]">
                                                        <ImagePlus className="w-5 h-5 mb-1 opacity-60" />
                                                        <span className="text-[10px] font-medium text-center">Upload Image<br />or Paste URL</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CldUploadWidget>

                                    {/* Fallback Manual URL Input */}
                                    <div className="mt-2">
                                        <input type="text" value={p.imageUrl} onChange={e => handleUpdateProduct(idx, "imageUrl", e.target.value)} className="w-full px-2 py-1.5 text-xs border border-[#EAE5DF] rounded focus:outline-none focus:border-[#A69B90] bg-[#FCFAF8] placeholder-[#C4BCB3]" placeholder="...or paste raw URL" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block mb-1 text-xs text-[#8A827A]">Notes / Price</label>
                                    <input type="text" value={p.notes} onChange={e => handleUpdateProduct(idx, "notes", e.target.value)} className="w-full px-2 py-1.5 text-sm border border-[#EAE5DF] rounded focus:outline-none focus:border-[#A69B90]" placeholder="Size M, on sale..." />
                                </div>
                            </div>
                        ))}
                    </div>

                    <label className="flex items-center gap-3 mt-4 cursor-pointer group">
                        <div className="relative">
                            <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="sr-only" />
                            <div className={`block w-10 h-6 bg-[#FCFAF8] border border-[#C4BCB3] rounded-full transition-colors ${isPrivate ? 'bg-[#D1C3B4]' : ''}`}></div>
                            <div className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform ${isPrivate ? 'translate-x-4 bg-white shadow-sm' : 'bg-[#A69B90]'}`}></div>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-[#3C3833]">Keep Private (Draft)</span>
                            <p className="text-xs text-[#8A827A]">Only visible to you until ready to share.</p>
                        </div>
                    </label>

                    <div className="flex gap-3 mt-4 shrink-0 pt-4 border-t border-[#EAE5DF] pb-4 sm:pb-0">
                        <button type="button" onClick={onClose} disabled={loading} className="flex-1 py-4 font-medium transition-colors border border-[#EAE5DF] text-[#8A827A] rounded-xl hover:bg-[#FCFAF8] disabled:opacity-50">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-4 font-medium text-[#3C3833] transition-all bg-[#D1C3B4] rounded-xl hover:bg-[#C2B2A1] disabled:opacity-50"
                        >
                            {loading ? "Adding..." : "Save Look"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
