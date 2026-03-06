"use client";

import { useState } from "react";
import { updateUserProfile, deleteUserAccount } from "@/actions/accountActions";
import ImageUploader from "@/components/ui/ImageUploader";
import { X, User2, TriangleAlert } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function AccountSettingsModal({ isOpen, onClose, user }: { isOpen: boolean, onClose: () => void, user: any }) {
    const [name, setName] = useState(user?.name || "");
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
    const [preferredTemperatureUnit, setPreferredTemperatureUnit] = useState(user?.preferredTemperatureUnit || "C");
    const [view, setView] = useState<"profile" | "danger">("profile");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    if (!isOpen) return null;

    const isProfileIncomplete = !user?.name || !user?.avatarUrl;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateUserProfile({ name, avatarUrl, preferredTemperatureUnit });
            onClose();
            router.refresh();
        } catch (err: any) {
            console.error(err);
            alert("Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm("Are you absolutely sure you want to delete your VibeCheck account? All your trips, outfits, and products will be permanently wiped out. This cannot be undone.")) {
            return;
        }

        setLoading(true);
        try {
            await deleteUserAccount();
            const supabase = createClient();
            await supabase.auth.signOut();
            window.location.href = "/login";
        } catch (err: any) {
            console.error(err);
            alert("Failed to delete account.");
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center items-center bg-black/40 backdrop-blur-sm pb-0 sm:p-4">
            <div className="w-full max-w-sm bg-[#FAF8F5] sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col mt-auto sm:mt-0 relative overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-white border-b border-[#EAE5DF]">
                    <h2 className="text-lg font-medium text-[#3C3833]">
                        {isProfileIncomplete ? "Welcome to VibeCheck" : "Account Settings"}
                    </h2>
                    {!isProfileIncomplete && (
                        <button onClick={onClose} className="p-2 text-[#8A827A] transition-colors rounded-full hover:bg-[#F5F2EE] hover:text-[#3C3833]">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <div className="flex bg-[#F5F2EE] border-b border-[#EAE5DF]">
                    <button
                        onClick={() => setView("profile")}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${view === "profile" ? "bg-white text-[#3C3833] border-b-2 border-[#3C3833]" : "text-[#8A827A] hover:bg-[#FCFAF8]"}`}
                    >
                        Profile
                    </button>
                    {!isProfileIncomplete && (
                        <button
                            onClick={() => setView("danger")}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${view === "danger" ? "bg-red-50 text-red-600 border-b-2 border-red-500" : "text-[#8A827A] hover:bg-red-50/50 hover:text-red-500"}`}
                        >
                            Danger Zone
                        </button>
                    )}
                </div>

                <div className="overflow-y-auto bg-[#FAF8F5] p-6 pb-12 sm:pb-6">
                    {view === "profile" && (
                        <form onSubmit={handleSave} className="flex flex-col gap-6">
                            {isProfileIncomplete && (
                                <p className="text-sm text-[#8A827A] text-center mb-2">
                                    Let's set up your profile aesthetic before diving in. This is how friends will see you.
                                </p>
                            )}

                            <div className="flex flex-col items-center gap-4">
                                <div className="relative w-24 h-24 rounded-full border border-[#EAE5DF] bg-white shadow-sm overflow-hidden group flex items-center justify-center">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="object-cover w-full h-full" />
                                    ) : (
                                        <User2 className="w-10 h-10 text-[#C4BCB3]" />
                                    )}
                                    <ImageUploader
                                        onUploadSuccess={(url) => setAvatarUrl(url)}
                                        className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                                    >
                                        <span className="text-[10px] font-medium text-white px-2 py-1 bg-black/60 rounded-full">
                                            {avatarUrl ? "Change" : "Upload"}
                                        </span>
                                    </ImageUploader>
                                </div>
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-[#5C564D]">Display Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-white border border-[#EAE5DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D1C3B4] focus:border-transparent text-[#3C3833] placeholder:text-[#A69B90] transition-shadow text-sm"
                                    placeholder="Your preferred name"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-[#5C564D]">Preferred Temperature Unit</label>
                                <div className="flex bg-[#EAE5DF] rounded-xl p-1 gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setPreferredTemperatureUnit("C")}
                                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${preferredTemperatureUnit === "C" ? "bg-white text-[#3C3833] shadow-sm" : "bg-transparent text-[#8A827A] hover:bg-[#F5F2EE]"}`}
                                    >
                                        Celsius (°C)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPreferredTemperatureUnit("F")}
                                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${preferredTemperatureUnit === "F" ? "bg-white text-[#3C3833] shadow-sm" : "bg-transparent text-[#8A827A] hover:bg-[#F5F2EE]"}`}
                                    >
                                        Fahrenheit (°F)
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !name || !avatarUrl}
                                className="mt-4 w-full py-3.5 bg-[#3C3833] hover:bg-black text-white rounded-xl text-sm font-semibold tracking-wide transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Saving..." : (isProfileIncomplete ? "Complete Profile" : "Save Changes")}
                            </button>
                        </form>
                    )}

                    {view === "danger" && (
                        <div className="flex flex-col gap-6 items-center text-center">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2">
                                <TriangleAlert className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-red-600">Delete Account</h3>
                                <p className="text-sm text-[#8A827A] mt-2 leading-relaxed">
                                    Once you delete your account, there is no going back. All of your uploaded pieces, outfits, and trip memberships will be permanently destroyed.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleDeleteAccount}
                                disabled={loading}
                                className="w-full py-3.5 bg-red-50 border border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 text-red-600 rounded-xl text-sm font-semibold tracking-wide transition-all shadow-sm active:scale-95 disabled:opacity-50 mt-4"
                            >
                                {loading ? "Processing..." : "I understand, delete my account"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
