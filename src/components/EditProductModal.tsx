"use client";

import { useState, useEffect } from "react";
import { updateProductInTrip, deleteProduct } from "@/actions/outfitActions";
import { useRouter } from "next/navigation";
import { ImagePlus, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { CldUploadWidget } from "next-cloudinary";

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

export default function EditProductModal({
    isOpen,
    onClose,
    tripId,
    product
}: {
    isOpen: boolean;
    onClose: () => void;
    tripId: string;
    product: any;
}) {
    const [name, setName] = useState(product?.name || "");
    const [category, setCategory] = useState(product?.category || "top");
    const [imageUrl, setImageUrl] = useState(product?.imageUrl || "");
    const [notes, setNotes] = useState(product?.notes || "");
    const [loading, setLoading] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (isOpen && product) {
            setName(product.name || "");
            setCategory(product.category || "top");
            setImageUrl(product.imageUrl || "");
            setNotes(product.notes || "");
        }
    }, [isOpen, product]);

    if (!isOpen) return null;

    async function handleImageUrlBlur(url: string) {
        if (!url || !url.startsWith('http')) return;
        // If it's an image explicitly, do nothing
        if (url.match(/\.(jpeg|jpg|gif|png|webp|avif|svg)(\?.*)?$/i) || url.includes('supabase') || url.includes('cloudinary')) return;

        try {
            const res = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`);
            const data = await res.json();
            if (data.imageUrl) {
                setImageUrl(data.imageUrl);
            }
        } catch (e) {
            console.error("Failed to scrape link for product image", e);
        }
    }

    async function handleDeleteProduct() {
        if (!product?.id) return;
        const confirmed = window.confirm("Are you sure you want to delete this product? It will be removed from all looks.");
        if (!confirmed) return;

        setLoading(true);
        try {
            await deleteProduct(product.id, tripId);
            onClose();
            router.refresh();
        } catch (err: any) {
            console.error(err);
            alert("Failed to delete product. " + (err.message || JSON.stringify(err)));
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) return alert("Product name is required.");

        setLoading(true);

        try {
            if (!product?.id) return;
            await updateProductInTrip(product.id, tripId, {
                name,
                category,
                imageUrl: imageUrl || undefined,
                notes: notes || undefined
            });
            onClose();
            router.refresh();
        } catch (err: any) {
            console.error(err);
            alert("Failed to update product. " + (err.message || JSON.stringify(err)));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center items-center bg-black/40 backdrop-blur-sm pb-0 sm:p-4">
            <div className="w-full max-w-lg bg-[#FAF8F5] sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[90dvh] sm:max-h-[85vh] mt-auto sm:mt-0 relative">

                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-white border-b border-[#EAE5DF]">
                    <h2 className="text-lg font-medium text-[#3C3833]">
                        Edit Product
                    </h2>
                    <button onClick={onClose} className="p-2 text-[#8A827A] transition-colors rounded-full hover:bg-[#F5F2EE] hover:text-[#3C3833]">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-grow bg-[#FAF8F5]">
                    <form id="add-product-form" onSubmit={handleSubmit} className="p-6 pb-48 sm:pb-6 flex flex-col gap-6">

                        {/* Image Upload Area */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-[#5C564D]">Product Image</label>
                            {imageUrl ? (
                                <div className="relative w-full aspect-square max-h-[250px] bg-[#EAE5DF] rounded-xl overflow-hidden group">
                                    <img src={getDisplayUrl(imageUrl)} onError={(e) => handleImageError(e, imageUrl)} alt="Preview" className="object-cover w-full h-full" />
                                    <button
                                        type="button"
                                        onClick={() => setImageUrl("")}
                                        className="absolute top-3 right-3 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="relative flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#C4BCB3] rounded-xl bg-white/50 transition-colors hover:border-[#A69B90] hover:bg-white cursor-pointer group">
                                    {isUploadingImage ? (
                                        <>
                                            <div className="w-8 h-8 border-4 border-[#D1C3B4] border-t-transparent rounded-full animate-spin mb-3"></div>
                                            <span className="text-sm font-medium text-[#8A827A]">Uploading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="p-3 mb-3 text-[#A69B90] bg-[#F5F2EE] rounded-full group-hover:text-[#8A827A] group-hover:scale-110 transition-all">
                                                <ImagePlus className="w-6 h-6" />
                                            </div>
                                            <span className="text-sm font-medium text-[#8A827A]">Upload Image</span>
                                            <input
                                                type="file"
                                                accept="image/*"
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
                                                            setImageUrl(publicUrlData.publicUrl);
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
                                        </>
                                    )}
                                </div>
                            )}
                            <div className="mt-3 flex gap-2 w-full justify-between items-center text-sm">
                                <span className="text-xs text-[#8A827A]">Or paste a link:</span>
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    className="flex-1 px-3 py-1.5 bg-white border border-[#EAE5DF] rounded-md focus:outline-none focus:ring-2 focus:ring-[#D1C3B4] text-[#3C3833] text-sm"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    onBlur={(e) => handleImageUrlBlur(e.target.value)}
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
                                className="w-full px-4 py-3 bg-white border border-[#EAE5DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D1C3B4] text-[#3C3833] capitalize"
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
                <div className="p-4 bg-white border-t border-[#EAE5DF] flex flex-col sm:flex-row justify-between gap-3">
                    <button
                        type="button"
                        onClick={handleDeleteProduct}
                        className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                    >
                        Delete Product
                    </button>
                    <div className="flex flex-col-reverse sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-[#5C564D] bg-white border border-[#EAE5DF] rounded-xl hover:bg-[#F5F2EE] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            form="add-product-form"
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-[#3C3833] hover:bg-black rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
