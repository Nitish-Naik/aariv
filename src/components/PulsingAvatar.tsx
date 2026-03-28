"use client";

import { Logo } from "@/components/secure-agent/Logo";

interface PulsingAvatarProps {
  isThinking?: boolean;
  size?: number;
}

export function PulsingAvatar({
  isThinking = false,
  size = 32,
}: PulsingAvatarProps) {
  return (
    <div
      className={`relative flex items-center justify-center ${isThinking ? "animate-pulse" : ""}`}
      style={{ width: size, height: size }}
    >
      <Logo className="w-full h-full" />
    </div>
  );
}
