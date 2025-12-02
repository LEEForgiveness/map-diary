// components/PhotoPin.tsx
"use client";
import React from "react";

type Props = {
  src: string;
  size?: number; // 지름(px)
  onClick?: () => void;
};

export default function PhotoPin({ src, size = 44, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="group relative -translate-y-1/2"
      style={{ width: size, height: size }}
      aria-label="photo marker"
    >
      {/* 원형 사진 */}
      <div
        className="
          relative z-10 overflow-hidden rounded-full border-2 border-white
          shadow-[0_6px_18px_rgba(0,0,0,0.30)]
          transition-transform duration-200 ease-out
          group-hover:scale-110
          bg-gray-200
        "
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(e) => {
            // 이미지 깨질 때 대비
            (e.currentTarget as HTMLImageElement).src =
              "https://via.placeholder.com/80x80?text=Photo";
          }}
        />
      </div>

      {/* 핀 꼬리 */}
      <div
        className="
          absolute left-1/2 top-[70%] z-0 h-4 w-4 -translate-x-1/2 rotate-45
          bg-white shadow-[2px_2px_8px_rgba(0,0,0,0.25)]
        "
      />

      {/* 바닥 그림자 */}
      <div
        className="
          absolute left-1/2 top-full h-2 w-6 -translate-x-1/2
          rounded-full bg-black/20 blur-[2px]
          transition-all duration-200
          group-hover:w-7 group-hover:bg-black/25
        "
      />
    </button>
  );
}
