"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function FeedbackWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const widgetRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!feedback.trim()) return;
        setIsSubmitting(true);

        // Simulate API call for now
        await new Promise((resolve) => setTimeout(resolve, 800));

        setFeedback("");
        setIsSubmitting(false);
        setIsOpen(false);

        // Dispatch a subtle, visual toast message if needed
        // or just silently close because the user wanted to focus solely on UI
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end" ref={widgetRef}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="relative mb-4 w-[320px] rounded-[20px] bg-[#f0f0f0] dark:bg-[var(--bg-elevated)] border border-gray-200 dark:border-[var(--border)] shadow-xl p-5"
                    >
                        {/* Close Button overlapping the top right corner */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white dark:bg-[var(--bg-elevated)] border border-gray-200 dark:border-[var(--border)] shadow-md flex items-center justify-center text-gray-500 hover:text-gray-800 dark:text-[var(--text-muted)] dark:hover:text-[var(--text-primary)] transition-colors hover:scale-105 active:scale-95"
                        >
                            <X size={18} strokeWidth={1.5} />
                        </button>

                        {/* Header text */}
                        <h3 className="text-[17px] font-medium text-gray-900 dark:text-[var(--text-primary)] mb-3 pr-2 leading-snug">
                            What can we do to improve our Product?
                        </h3>

                        {/* Feedback Textarea */}
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Start typing..."
                            className="w-full h-28 p-3.5 rounded-xl border border-gray-300 dark:border-[var(--border)] bg-white dark:bg-[var(--bg-deep)] text-gray-900 dark:text-[var(--text-primary)] placeholder-gray-400 dark:placeholder-[var(--text-muted)] text-[15px] resize-none outline-none focus:border-gray-400 dark:focus:border-[var(--border-strong)] focus:ring-1 focus:ring-gray-400 dark:focus:ring-[var(--border-strong)] transition-all"
                        />

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={!feedback.trim() || isSubmitting}
                            className="w-full mt-3 py-3 rounded-xl bg-[#595959] dark:bg-[var(--accent)] hover:bg-[#4d4d4d] dark:hover:bg-[var(--accent)] text-white font-semibold text-[15px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Submitting..." : "Submit"}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            {/* We hide the FAB itself using opacity if the popover is open, or we can leave it visible.
          The screenshot implied the FAB overlaps the bottom right slightly.
          We'll keep the FAB visible, but maybe swap icon or just keep it as a message bubble. */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 rounded-full bg-[#1c1c1c] text-white shadow-lg flex items-center justify-center border-[3px] border-[#333333]"
                >
                    <MessageSquare size={22} className="text-white" strokeWidth={2} />
                </motion.button>
            )}
        </div>
    );
}
