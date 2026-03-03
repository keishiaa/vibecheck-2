"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignOutButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSignOut = async () => {
        setLoading(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        router.refresh();
        setLoading(false);
    };

    return (
        <button
            onClick={handleSignOut}
            disabled={loading}
            className="px-5 py-2 text-sm font-medium transition-colors bg-white border border-[#EAE5DF] rounded-full text-[#8A827A] hover:bg-[#FCFAF8] shadow-sm ml-4"
        >
            {loading ? "Signing out..." : "Sign Out"}
        </button>
    );
}
