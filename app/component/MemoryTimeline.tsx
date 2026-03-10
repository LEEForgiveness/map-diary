"use client";
import { groupPhotosByMonth } from "../utils/memory";
import type { Photo, Mood } from "../types/photoType";

const MOOD_EMOJI: Record<Mood, string> = {
  happy: "😊",
  calm: "😌",
  nostalgic: "🥹",
  excited: "🤩",
  reflective: "🤔",
};

interface MemoryTimelineProps {
  photos: Photo[];
  onPhotoClick?: (photo: Photo) => void;
}

export default function MemoryTimeline({ photos, onPhotoClick }: MemoryTimelineProps) {
  const groups = groupPhotosByMonth(photos);

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <span className="text-4xl">🗺️</span>
        <p className="text-sm font-medium" style={{ color: "var(--color-warm-gray)" }}>
          아직 기록된 추억이 없어요
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-4">
      {groups.map((group) => (
        <div key={group.yearMonth}>
          {/* 월 헤더 */}
          <div className="flex items-center gap-3 mb-3">
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: "var(--color-deep-navy)", color: "#fff" }}
            >
              {group.label}
            </span>
            <span className="text-[11px]" style={{ color: "var(--color-warm-gray)" }}>
              {group.photos.length}개
            </span>
            <div className="flex-1 h-px" style={{ background: "var(--color-sand)" }} />
          </div>

          {/* 카드 리스트 */}
          <div className="flex flex-col gap-3">
            {group.photos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => onPhotoClick?.(photo)}
                className="memory-card flex gap-3 items-stretch text-left w-full hover:opacity-90 transition-all active:scale-[0.99]"
              >
                {/* 썸네일 */}
                <div
                  className="w-20 shrink-0 rounded-xl overflow-hidden"
                  style={{ minHeight: 72 }}
                >
                  <img
                    src={photo.photo_url}
                    alt={photo.description ?? ""}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 정보 */}
                <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                  <div>
                    <p
                      className="text-sm font-semibold leading-snug line-clamp-2"
                      style={{ color: "var(--color-deep-navy)" }}
                    >
                      {photo.description || "기록 없음"}
                    </p>
                    {photo.date && (
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--color-warm-gray)" }}>
                        {new Date(photo.date).toLocaleDateString("ko-KR", {
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </div>

                  {/* 태그 + 감정 */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-1">
                    {photo.mood && (
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "var(--color-coral)", color: "#fff" }}
                      >
                        {MOOD_EMOJI[photo.mood]}
                      </span>
                    )}
                    {photo.tags?.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{
                          background: "var(--color-sand)",
                          color: "var(--color-deep-navy)",
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                    {photo.shared && (
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full ml-auto"
                        style={{ background: "var(--color-sky)", color: "var(--color-deep-navy)" }}
                      >
                        공개
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
