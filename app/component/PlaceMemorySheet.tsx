"use client";
import { useState } from "react";
import type { PlaceGroup } from "../utils/memory";
import type { Photo, Mood } from "../types/photoType";

const MOOD_EMOJI: Record<Mood, string> = {
  happy: "😊",
  calm: "😌",
  nostalgic: "🥹",
  excited: "🤩",
  reflective: "🤔",
};

interface PlaceMemorySheetProps {
  groups: PlaceGroup[];
  onPhotoClick?: (photo: Photo) => void;
}

export default function PlaceMemorySheet({ groups, onPhotoClick }: PlaceMemorySheetProps) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <span className="text-4xl">📍</span>
        <p className="text-sm font-medium" style={{ color: "var(--color-warm-gray)" }}>
          아직 기록된 장소가 없어요
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      {groups.map((group) => {
        const isExpanded = expandedKey === group.placeKey;
        const rep = group.representative;
        const extra = group.photos.length - 1;

        return (
          <div
            key={group.placeKey}
            className="rounded-2xl overflow-hidden animate-fade-in"
            style={{
              background: "var(--color-ivory)",
              border: "1.5px solid var(--color-sand)",
            }}
          >
            {/* 장소 헤더 — 클릭 시 펼치기/접기 */}
            <button
              type="button"
              onClick={() => setExpandedKey(isExpanded ? null : group.placeKey)}
              className="w-full flex items-center gap-3 p-3 text-left transition-all hover:opacity-90"
            >
              {/* 대표 썸네일 + +N 뱃지 */}
              <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden">
                <img
                  src={rep.photo_url}
                  alt={rep.description ?? ""}
                  className="w-full h-full object-cover"
                />
                {extra > 0 && (
                  <span
                    className="absolute bottom-0.5 right-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-lg text-white"
                    style={{ background: "rgba(30,42,58,0.75)" }}
                  >
                    +{extra}
                  </span>
                )}
              </div>

              {/* 장소 정보 */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-bold leading-snug truncate"
                  style={{ color: "var(--color-deep-navy)" }}
                >
                  {rep.description || "이름 없는 장소"}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--color-warm-gray)" }}>
                  📍 {group.lat.toFixed(3)}, {group.lng.toFixed(3)}
                </p>
                <p className="text-[11px]" style={{ color: "var(--color-warm-gray)" }}>
                  추억 {group.photos.length}개
                </p>
              </div>

              {/* 화살표 */}
              <span
                className="text-sm transition-transform duration-200"
                style={{
                  color: "var(--color-warm-gray)",
                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  display: "inline-block",
                }}
              >
                ▾
              </span>
            </button>

            {/* 사진 목록 (펼쳐졌을 때) */}
            {isExpanded && (
              <div
                className="border-t px-3 pb-3 pt-2 flex flex-col gap-2 animate-fade-in"
                style={{ borderColor: "var(--color-sand)" }}
              >
                {group.photos.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => onPhotoClick?.(photo)}
                    className="flex gap-3 items-center text-left w-full rounded-xl p-2 transition-all hover:opacity-90 active:scale-[0.99]"
                    style={{ background: "var(--color-cream)" }}
                  >
                    <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden">
                      <img
                        src={photo.photo_url}
                        alt={photo.description ?? ""}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-semibold truncate"
                        style={{ color: "var(--color-deep-navy)" }}
                      >
                        {photo.description || "기록 없음"}
                      </p>
                      {photo.date && (
                        <p className="text-[10px] mt-0.5" style={{ color: "var(--color-warm-gray)" }}>
                          {new Date(photo.date).toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                        {photo.mood && (
                          <span className="text-[10px]">{MOOD_EMOJI[photo.mood]}</span>
                        )}
                        {photo.tags?.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] px-1.5 py-0.5 rounded-full"
                            style={{ background: "var(--color-sand)", color: "var(--color-deep-navy)" }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
