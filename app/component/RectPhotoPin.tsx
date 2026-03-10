// components/RectPhotoPin.tsx
"use client";
import React from "react";

type Props = {
  src: string;
  width?: number;
  height?: number;
  radius?: number;
  onClick?: () => void;
  isSelected?: boolean;
  disabled?: boolean;
};

export default function RectPhotoPin({
  src,
  width = 56,
  height = 56,
  radius = 14,
  onClick,
  isSelected = false,
  disabled = false,
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type="button"
      className={`group relative -translate-y-1/2 ${
        disabled ? "cursor-default" : "cursor-pointer"
      }`}
      style={{ width, height: height + 14 }}
      aria-label="photo marker"
    >
      {/* 사진 카드 */}
      <div
        className={`
          relative z-10 overflow-hidden
          border-[2.5px] border-white bg-[var(--color-sand)]
          transition-all duration-200 ease-out
          ${disabled ? "" : "group-hover:scale-110 group-hover:border-[var(--color-coral)]"}
          ${isSelected ? "scale-110 border-[var(--color-coral)] ring-4 ring-[var(--color-coral)]/30" : ""}
        `}
        style={{
          width,
          height,
          borderRadius: radius,
          boxShadow: isSelected
            ? "0 8px 28px rgba(232,113,74,0.35)"
            : "0 6px 20px rgba(30,42,58,0.22)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://via.placeholder.com/120x90?text=📷";
          }}
        />

        {/* 상단 유리 하이라이트 */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent" />

        {/* 내 사진 표시 (활성 상태) */}
        {!disabled && (
          <div
            className="pointer-events-none absolute bottom-1 right-1 w-2 h-2 rounded-full"
            style={{ background: "var(--color-coral)" }}
          />
        )}
      </div>

      {/* 핀 꼬리 */}
      <div
        className="absolute left-1/2 z-0 -translate-x-1/2 rotate-45 border-b-0 border-r-0"
        style={{
          top: height - 4,
          width: 10,
          height: 10,
          background: "#fff",
          borderRadius: 2,
          boxShadow: "2px 2px 6px rgba(30,42,58,0.18)",
        }}
      />

      {/* 바닥 그림자 */}
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full blur-sm transition-all duration-200 group-hover:w-10 group-hover:opacity-30"
        style={{
          bottom: 0,
          width: 28,
          height: 6,
          background: "rgba(30,42,58,0.22)",
        }}
      />
    </button>
  );
}
