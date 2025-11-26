// components/RectPhotoPin.tsx
"use client";
import React from "react";

type Props = {
  src: string;
  width?: number; // 카드 가로(px)
  height?: number; // 카드 세로(px)
  radius?: number; // 모서리 둥글기(px)
  onClick?: () => void;
  isSelected?: boolean;
};

export default function RectPhotoPin({
  src,
  width = 64,
  height = 48,
  radius = 12,
  onClick,
  isSelected = false,
}: Props) {
  return (
    <button
      onClick={onClick}
      className="group relative -translate-y-1/2"
      style={{ width, height }}
      aria-label="photo marker rectangular"
    >
      {/* 카드 사진 */}
      <div
        className={`
          relative z-10 overflow-hidden border-2 border-white bg-gray-200
          shadow-[0_8px_20px_rgba(0,0,0,0.30)]
          transition-transform duration-200 ease-out
          group-hover:scale-110
          ${isSelected ? "ring-4 ring-blue-500/60 scale-110" : ""}
        `}
        style={{
          width,
          height,
          borderRadius: radius,
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
              "https://via.placeholder.com/120x90?text=Photo";
          }}
        />

        {/* 살짝 유리광 느낌(선택) */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
      </div>

      {/* 핀 꼬리 (삼각형/마름모) */}
      <div
        className="
          absolute left-1/2 top-[85%] z-0 h-4 w-4 -translate-x-1/2 rotate-45
          bg-white shadow-[2px_2px_8px_rgba(0,0,0,0.25)]
        "
      />

      {/* 바닥 그림자 */}
      <div
        className="
          absolute left-1/2 top-[104%] h-2 w-8 -translate-x-1/2
          rounded-full bg-black/20 blur-[2px]
          transition-all duration-200
          group-hover:w-9 group-hover:bg-black/25
        "
      />
    </button>
  );
}
