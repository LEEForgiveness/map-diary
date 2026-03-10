"use client";
import type { FilterState } from "../utils/memory";
import type { Mood } from "../types/photoType";

const MOOD_OPTIONS: { value: Mood; label: string; emoji: string }[] = [
  { value: "happy", label: "행복", emoji: "😊" },
  { value: "calm", label: "평온", emoji: "😌" },
  { value: "nostalgic", label: "그리움", emoji: "🥹" },
  { value: "excited", label: "설렘", emoji: "🤩" },
  { value: "reflective", label: "사색", emoji: "🤔" },
];

interface FilterBarProps {
  filter: FilterState;
  onChange: (next: FilterState) => void;
  availableYears: number[];
  availableTags: string[];
}

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

export default function FilterBar({
  filter,
  onChange,
  availableYears,
  availableTags,
}: FilterBarProps) {
  const hasActive =
    filter.sharedOnly ||
    filter.years.length > 0 ||
    filter.tags.length > 0 ||
    filter.moods.length > 0;

  return (
    <div
      className="w-full px-4 py-3 flex flex-col gap-3 animate-fade-in"
      style={{
        background: "var(--color-cream)",
        borderBottom: "1px solid var(--color-sand)",
      }}
    >
      {/* 상단: 공개 토글 + 초기화 */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            className="relative w-9 h-5 rounded-full transition-colors duration-200"
            style={{ background: filter.sharedOnly ? "var(--color-coral)" : "var(--color-sand)" }}
            onClick={() => onChange({ ...filter, sharedOnly: !filter.sharedOnly })}
          >
            <div
              className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200"
              style={{ left: filter.sharedOnly ? "calc(100% - 18px)" : 2 }}
            />
          </div>
          <span className="text-xs font-semibold" style={{ color: "var(--color-deep-navy)" }}>
            공개만 보기
          </span>
        </label>

        {hasActive && (
          <button
            onClick={() =>
              onChange({ sharedOnly: false, years: [], tags: [], moods: [], placeKeys: [] })
            }
            className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-all hover:opacity-80"
            style={{ background: "var(--color-sand)", color: "var(--color-warm-gray)" }}
          >
            초기화
          </button>
        )}
      </div>

      {/* 연도 */}
      {availableYears.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold shrink-0" style={{ color: "var(--color-warm-gray)" }}>
            연도
          </span>
          {availableYears.map((y) => (
            <button
              key={y}
              onClick={() => onChange({ ...filter, years: toggle(filter.years, y) })}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: filter.years.includes(y) ? "var(--color-deep-navy)" : "var(--color-ivory)",
                color: filter.years.includes(y) ? "#fff" : "var(--color-deep-navy)",
                border: "1.5px solid var(--color-sand)",
              }}
            >
              {y}
            </button>
          ))}
        </div>
      )}

      {/* 감정 */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-semibold shrink-0" style={{ color: "var(--color-warm-gray)" }}>
          감정
        </span>
        {MOOD_OPTIONS.map((m) => (
          <button
            key={m.value}
            onClick={() => onChange({ ...filter, moods: toggle(filter.moods, m.value) })}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: filter.moods.includes(m.value) ? "var(--color-coral)" : "var(--color-ivory)",
              color: filter.moods.includes(m.value) ? "#fff" : "var(--color-deep-navy)",
              border: `1.5px solid ${filter.moods.includes(m.value) ? "var(--color-coral)" : "var(--color-sand)"}`,
            }}
          >
            <span>{m.emoji}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* 태그 */}
      {availableTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold shrink-0" style={{ color: "var(--color-warm-gray)" }}>
            태그
          </span>
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onChange({ ...filter, tags: toggle(filter.tags, tag) })}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: filter.tags.includes(tag) ? "var(--color-sky)" : "var(--color-ivory)",
                color: filter.tags.includes(tag) ? "var(--color-deep-navy)" : "var(--color-deep-navy)",
                border: `1.5px solid ${filter.tags.includes(tag) ? "var(--color-sky)" : "var(--color-sand)"}`,
              }}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
