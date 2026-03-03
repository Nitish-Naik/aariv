"use client";

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
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <div
        className="rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold"
        style={{
          width: size * 0.85,
          height: size * 0.85,
          fontSize: size * 0.35,
        }}
      >
        A
      </div>
    </div>
  );
}
