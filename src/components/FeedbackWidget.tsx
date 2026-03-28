"use client";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";
import {
    Bug,
    Lightbulb,
    MessageSquare,
    MousePointerClick,
    Star,
    X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const CATEGORIES = [
  { id: "bug", label: "Bug", icon: Bug },
  { id: "feature", label: "Feature", icon: Lightbulb },
  { id: "integration", label: "App Request", icon: MousePointerClick },
  { id: "general", label: "General", icon: MessageSquare },
] as const;

type Category = (typeof CATEGORIES)[number]["id"];

export function FeedbackWidget() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Listen for external open events (e.g., from Integrations page)
  const skipClickOutsideRef = useRef(false);
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.category) setCategory(detail.category);
      // Prevent the click-outside handler from immediately closing
      skipClickOutsideRef.current = true;
      setIsOpen(true);
      setTimeout(() => { skipClickOutsideRef.current = false; }, 100);
    };
    window.addEventListener("open-feedback", handler);
    return () => window.removeEventListener("open-feedback", handler);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (skipClickOutsideRef.current) return;
      if (
        widgetRef.current &&
        !widgetRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const resetForm = () => {
    setCategory(null);
    setRating(null);
    setHoveredStar(null);
    setMessage("");
    setSubmitted(false);
  };

  const handleSubmit = async () => {
    if (!message.trim() || !category || !user?.id) return;
    setIsSubmitting(true);

    try {
      await api.post("/feedback", {
        category,
        rating,
        message: message.trim(),
        page: pathname,
      });
      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        resetForm();
      }, 1500);
    } catch {
      // Non-fatal — feedback submission failed silently
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="hidden md:flex fixed bottom-6 right-6 z-50 flex-col items-end"
      ref={widgetRef}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative mb-4 w-[340px] rounded-[20px] bg-card border border-white/[0.08] shadow-floating p-5"
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setIsOpen(false);
                resetForm();
              }}
              className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-background border border-white/[0.08] shadow-soft flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors hover:scale-105 active:scale-95"
            >
              <X size={18} strokeWidth={1.5} />
            </button>

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="text-3xl mb-3">Thanks!</div>
                <p className="text-sm text-muted-foreground">
                  Your feedback helps us improve.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-[17px] font-medium text-foreground mb-4 pr-6 leading-snug">
                  How can we improve?
                </h3>

                {/* Category selector */}
                <div className="flex gap-2 mb-4">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl text-[11px] font-medium transition-all ${
                          isActive
                            ? "bg-background text-foreground shadow-soft"
                            : "bg-muted/60 text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <Icon size={16} strokeWidth={1.5} />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>

                {/* Star rating */}
                <div className="flex items-center gap-1 mb-4">
                  <span className="text-xs text-muted-foreground mr-2">
                    Rating
                  </span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star === rating ? null : star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(null)}
                      className="p-0.5 transition-transform hover:scale-110"
                    >
                      <Star
                        strokeWidth={1.5}
                        size={20}
                        className={`transition-colors ${
                          star <= (hoveredStar ?? rating ?? 0)
                            ? "fill-warning text-warning"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                  {rating && (
                    <span className="text-xs text-muted-foreground ml-1">
                      {rating}/5
                    </span>
                  )}
                </div>

                {/* Message */}
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    category === "bug"
                      ? "What happened? Steps to reproduce..."
                      : category === "feature"
                        ? "What feature would help you?"
                        : "Tell us more..."
                  }
                  className="w-full h-24 p-3.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground text-[15px] resize-none outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-all"
                />

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={!message.trim() || !category || isSubmitting}
                  className="w-full mt-3 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-[15px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-floating flex items-center justify-center border-[3px] border-primary/30"
        >
          <MessageSquare
            size={22}
            className="text-primary-foreground"
            strokeWidth={2}
          />
        </motion.button>
      )}
    </div>
  );
}
