"use client";

import { useState } from "react";
import { addProductToTrip } from "@/actions/outfitActions";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus, X } from "lucide-react";

function getDisplayUrl(url: string | null | undefined): string {
    if (!url) return "";
    if (url.includes('cloudinary.com') || url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i)) {
        return url;
    }
    return `https://api.microlink.io/?url=${encodeURIComponent(url)}&embed=image.url`;
}

export default function AddProductModal({
    isOpen,
    onClose,
    tripId
}: {
    isOpen: boolean;
    onClose: () => void;
    tripId: string;
}) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("top");
    const [imageUrl, setImageUrl] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) return alert("Product name is required.");

        setLoading(true);

        try {
            await addProductToTrip(tripId, {
                name,
                category,
                imageUrl: imageUrl || undefined,
                notes: notes || undefined
            });
            onClose();
            setName("");
            setCategory("top");
            setImageUrl("");
            setNotes("");
            router.refresh();
        } catch (err: any) {
            console.error(err);
            alert("Failed to add product. " + (err.message || JSON.stringify(err)));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center p-4">
            <div className="w-full max-w-lg bg-[#FAF8F5] sm:rounded-2xl rounded-t-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-white border-b border-[#EAE5DF]">
                    <h2 className="text-lg font-medium text-[#3C3833]">
                        Add to Catalog
                    </h2>
                    <button onClick={onClose} className="p-2 text-[#8A827A] transition-colors rounded-full hover:bg-[#F5F2EE] hover:text-[#3C3833]">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-grow bg-[#FAF8F5]">
                    <form id="add-product-form" onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">

                        {/* Image Upload Area */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-[#5C564D]">Product Image</label>
                            {imageUrl ? (
                                <div className="relative w-full aspect-square max-h-[250px] bg-[#EAE5DF] rounded-xl overflow-hidden group">
                                    <img src={getDisplayUrl(imageUrl)} alt="Preview" className="object-cover w-full h-full" />
                                    <button
                                        type="button"
                                        onClick={() => setImageUrl("")}
                                        className="absolute top-3 right-3 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <CldUploadWidget
                                    uploadPreset="vibecheck_outfits"
                                    onSuccess={(results: any) => {
                                        if (results.info?.secure_url) {
                                            setImageUrl(results.info.secure_url);
                                        }
                                    }}
                                >
                                    {({ open }) => (
                                        <div
                                            onClick={() => open()}
                                            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#C4BCB3] rounded-xl bg-white/50 transition-colors hover:border-[#A69B90] hover:bg-white cursor-pointer group"
                                        >
                                            <div className="p-3 mb-3 text-[#A69B90] bg-[#F5F2EE] rounded-full group-hover:text-[#8A827A] group-hover:scale-110 transition-all">
                                                <ImagePlus className="w-6 h-6" />
                                            </div>
                                            <span className="text-sm font-medium text-[#8A827A]">Upload Image</span>
                                        </div>
                                    )}
                                </CldUploadWidget>
                            )}
                            <div className="mt-3 flex gap-2 w-full justify-between items-center text-sm">
                                <span className="text-xs text-[#8A827A]">Or paste a link:</span>
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    className="flex-1 px-3 py-1.5 bg-white border border-[#EAE5DF] rounded-md focus:outline-none focus:ring-2 focus:ring-[#D1C3B4] text-[#3C3833] text-sm"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Name Input */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-[#5C564D]">Name</label>
                            <input
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. White Linen Shirt"
                                className="w-full px-4 py-3 bg-white border border-[#EAE5DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D1C3B4] placeholder:text-[#A69B90] text-[#3C3833]"
                            />
                        </div>

                        {/* Category Select */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-[#5C564D]">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-[#EAE5DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D1C3B4] text-[#3C3833 capitalize"
                            >
                                <option value="top">Top</option>
                                <option value="bottoms">Bottoms</option>
                                <option value="dress">Dress / One-Piece</option>
                                <option value="shoes">Shoes</option>
                                <option value="accessories">Accessories</option>
                                <option value="outerwear">Outerwear</option>
                            </select>
                        </div>

                    </form>
                </div>

                {/* Footer Controls */}
                <div className="p-4 bg-white border-t border-[#EAE5DF] flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-[#5C564D] bg-white border border-[#EAE5DF] rounded-xl hover:bg-[#F5F2EE] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        form="add-product-form"
                        type="submit"
                        disabled={loading || !name.trim()}
                        className="px-6 py-2.5 text-sm font-medium text-white bg-[#3C3833] hover:bg-black rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                    >
                        {loading ? "Adding..." : "Add to Catalog"}
                    </button>
                </div>
            </div>
        </div>
    );
}
