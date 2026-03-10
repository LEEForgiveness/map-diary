import React from "react";

export default function MessageOverlay({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in"
      style={{ background: "rgba(30,42,58,0.55)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-xs rounded-3xl px-6 py-6 flex flex-col items-center gap-4 animate-fade-in-up"
        style={{ background: "var(--color-cream)", boxShadow: "var(--card-shadow)" }}
      >
        <p
          className="text-base text-center leading-relaxed"
          style={{ color: "var(--color-deep-navy)" }}
        >
          {message}
        </p>
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: "var(--color-coral)" }}
        >
          확인
        </button>
      </div>
    </div>
  );
}
