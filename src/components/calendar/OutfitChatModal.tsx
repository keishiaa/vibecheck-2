"use client";

import { useState } from "react";
import { addComment } from "@/actions/outfitActions";

export default function OutfitChatModal({
    isOpen,
    onClose,
    outfit
}: {
    isOpen: boolean;
    onClose: () => void;
    outfit: any;
}) {
    const [loading, setLoading] = useState(false);
    const [commentText, setCommentText] = useState("");

    if (!isOpen || !outfit) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!commentText.trim()) return;

        setLoading(true);

        try {
            await addComment(outfit.id, commentText);
            setCommentText("");
        } catch (err) {
            console.error(err);
            alert("Failed to send message.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm sm:items-center p-4">
            <div className="w-full max-w-sm bg-white border border-[#EAE5DF] rounded-t-2xl sm:rounded-2xl shadow-xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-200 flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#EAE5DF]">
                    <h3 className="font-medium tracking-wide text-[#3C3833]">Outfit Chat</h3>
                    <button onClick={onClose} className="p-1 text-[#8A827A] hover:text-[#3C3833] transition-colors">
                        ✕
                    </button>
                </div>

                {/* Messages List Area */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#FCFAF8]">
                    {outfit.comments?.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-sm text-[#A69B90]">
                            No messages yet. Start evaluating the vibes!
                        </div>
                    ) : (
                        outfit.comments.map((comment: any) => {
                            const userInitial = comment.user?.email?.[0].toUpperCase() || "?";
                            const userEmail = comment.user?.email || "Unknown";

                            return (
                                <div key={comment.id} className="flex items-start gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#D1C3B4] shrink-0 text-sm font-medium text-[#3C3833]" title={userEmail}>
                                        {userInitial}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-[#8A827A] mb-0.5">{userEmail.split('@')[0]}</span>
                                        <div className="px-4 py-2 text-sm bg-white border border-[#EAE5DF] shadow-sm rounded-2xl rounded-tl-none text-[#3C3833]">
                                            {comment.textContent}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Message Input Area */}
                <form onSubmit={handleSubmit} className="p-4 border-t border-[#EAE5DF] bg-white sm:rounded-b-2xl">
                    <div className="flex gap-2">
                        <input
                            required
                            type="text"
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            placeholder="Message..."
                            className="flex-1 px-4 py-2 text-sm bg-[#FCFAF8] border border-[#EAE5DF] rounded-full focus:outline-none focus:border-[#A69B90] transition-colors text-[#3C3833] placeholder-[#C4BCB3]"
                        />
                        <button
                            type="submit"
                            disabled={loading || !commentText.trim()}
                            className="px-4 py-2 text-sm font-medium text-[#3C3833] transition-all bg-[#D1C3B4] rounded-full hover:bg-[#C2B2A1] disabled:opacity-50"
                        >
                            {loading ? "..." : "Send"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
