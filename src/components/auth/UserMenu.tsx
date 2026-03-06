"use client";

import { useState } from "react";
import AccountSettingsModal from "./AccountSettingsModal";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { User2, LogOut, Settings } from "lucide-react";

export default function UserMenu({ dbUser }: { dbUser: any }) {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isProfileIncomplete = !dbUser?.name || !dbUser?.avatarUrl;
    const [isSettingsOpen, setIsSettingsOpen] = useState(isProfileIncomplete);
    const [loading, setLoading] = useState(false);

    const handleSignOut = async () => {
        setLoading(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        router.refresh();
        setLoading(false);
    };

    const getInitials = (str: string) => {
        if (!str) return "U";
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

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-10 h-10 rounded-full border border-[#EAE5DF] bg-[#FCFAF8] shadow-sm flex items-center justify-center overflow-hidden transition-all active:scale-95 hover:border-[#D1C3B4] group ml-4"
            >
                {dbUser?.avatarUrl ? (
                    <img src={dbUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                ) : (
                    <span className="text-xs font-bold text-[#8A827A]">{getInitials(dbUser?.name || dbUser?.email)}</span>
                )}
            </button>

            {isMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+0.5rem)] w-48 bg-white border border-[#EAE5DF] rounded-2xl shadow-[0_12px_24px_rgba(0,0,0,0.06)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-[#EAE5DF]/50 bg-[#FCFAF8]">
                        <p className="text-sm font-medium text-[#3C3833] line-clamp-1">{dbUser?.name || "Welcome"}</p>
                        <p className="text-[10px] text-[#8A827A] line-clamp-1">{dbUser?.email}</p>
                    </div>

                    <button
                        onClick={() => { setIsSettingsOpen(true); setIsMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-medium text-[#5C564D] hover:bg-[#F5F2EE] hover:text-[#3C3833] transition-colors"
                    >
                        <Settings className="w-4 h-4" />
                        Account Settings
                    </button>

                    <button
                        onClick={handleSignOut}
                        disabled={loading}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-medium text-[#5C564D] border-t border-[#EAE5DF]/50 hover:bg-neutral-50 hover:text-red-500 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        {loading ? "Signing out..." : "Sign Out"}
                    </button>
                </div>
            )}

            <AccountSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                user={dbUser}
            />

            {/* Click outside backdrop for menu */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 z-[-1]"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}
        </div>
    );
}
