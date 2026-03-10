"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import supabase from "@/app/utils/supabaseConfig";
import { GetPhotos } from "@/app/api/photo";
import { MOCK_MODE, MOCK_SESSION, MOCK_PHOTOS } from "@/app/mock/mockData";
import { extractAllTags, groupPhotosByPlace } from "@/app/utils/memory";
import type { Photo, Mood } from "@/app/types/photoType";

const MOOD_EMOJI: Record<Mood, string> = {
  happy: "😊",
  calm: "😌",
  nostalgic: "🥹",
  excited: "🤩",
  reflective: "🤔",
};
const MOOD_LABEL: Record<Mood, string> = {
  happy: "행복",
  calm: "평온",
  nostalgic: "그리움",
  excited: "설렘",
  reflective: "사색",
};

type UserInfo = {
  email: string;
  name: string;
  createdAt: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (MOCK_MODE) {
        const u = MOCK_SESSION.user;
        setUser({
          email: u.email,
          name: u.user_metadata.name,
          createdAt: u.created_at,
        });
        setPhotos(MOCK_PHOTOS as Photo[]);
        setLoading(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const u = session.user;
        setUser({
          email: u.email ?? "",
          name: u.user_metadata?.name ?? "여행자",
          createdAt: u.created_at,
        });

        const fetched = await GetPhotos();
        setPhotos((fetched as Photo[]) ?? []);
      }

      setLoading(false);
    };
    load();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const joinedYear = user?.createdAt ? new Date(user.createdAt).getFullYear() : null;
  const joinedMonth = user?.createdAt ? new Date(user.createdAt).getMonth() + 1 : null;

  // 통계 계산
  const photoCount = photos.length;
  const sharedCount = photos.filter((p) => p.shared).length;
  const allTags = extractAllTags(photos);
  const placeGroups = groupPhotosByPlace(photos);

  // 감정 분포
  const moodCounts = photos.reduce<Partial<Record<Mood, number>>>((acc, p) => {
    if (p.mood) acc[p.mood] = (acc[p.mood] ?? 0) + 1;
    return acc;
  }, {});
  const topMood = (Object.entries(moodCounts) as [Mood, number][]).sort((a, b) => b[1] - a[1])[0];

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: "var(--color-cream)" }}
    >
      {/* 배경 장식 */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-20" style={{ background: "var(--color-sand)" }} />
        <div className="absolute -bottom-24 -right-16 w-72 h-72 rounded-full opacity-15" style={{ background: "var(--color-coral-light)" }} />
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <div
            className="w-10 h-10 rounded-full border-[3px] animate-spin"
            style={{ borderColor: "var(--color-sand)", borderTopColor: "var(--color-coral)" }}
          />
          <p className="text-sm" style={{ color: "var(--color-warm-gray)" }}>불러오는 중...</p>
        </div>
      ) : user ? (
        /* ── 로그인 상태 ── */
        <div className="glass-panel animate-fade-in-up w-full max-w-sm rounded-3xl px-8 py-10 relative z-10">
          {/* 아바타 */}
          <div className="flex flex-col items-center mb-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-4"
              style={{ background: "var(--color-coral)" }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-xl font-bold" style={{ color: "var(--color-deep-navy)" }}>{user.name}</h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-warm-gray)" }}>{user.email}</p>
            {joinedYear && (
              <p className="text-xs mt-1" style={{ color: "var(--color-warm-gray)" }}>
                {joinedYear}년 {joinedMonth}월부터 추억을 기록 중
              </p>
            )}
          </div>

          {/* 주요 통계 */}
          <div
            className="grid grid-cols-3 rounded-2xl overflow-hidden mb-4"
            style={{ background: "rgba(255,255,255,0.5)", border: "1px solid var(--color-sand)" }}
          >
            <div className="flex flex-col items-center py-4 gap-1">
              <span className="text-2xl font-bold" style={{ color: "var(--color-coral)" }}>{photoCount}</span>
              <span className="text-[11px]" style={{ color: "var(--color-warm-gray)" }}>전체 추억</span>
            </div>
            <div className="flex flex-col items-center py-4 gap-1" style={{ borderLeft: "1px solid var(--color-sand)", borderRight: "1px solid var(--color-sand)" }}>
              <span className="text-2xl font-bold" style={{ color: "var(--color-sky)" }}>{sharedCount}</span>
              <span className="text-[11px]" style={{ color: "var(--color-warm-gray)" }}>공개됨</span>
            </div>
            <div className="flex flex-col items-center py-4 gap-1">
              <span className="text-2xl font-bold" style={{ color: "var(--color-deep-navy)" }}>{placeGroups.length}</span>
              <span className="text-[11px]" style={{ color: "var(--color-warm-gray)" }}>장소</span>
            </div>
          </div>

          {/* 태그 + 감정 통계 */}
          {photoCount > 0 && (
            <div
              className="rounded-2xl p-4 mb-4 flex flex-col gap-3"
              style={{ background: "rgba(255,255,255,0.5)", border: "1px solid var(--color-sand)" }}
            >
              {/* 태그 */}
              {allTags.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold mb-2" style={{ color: "var(--color-warm-gray)" }}>
                    태그 {allTags.length}개
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {allTags.slice(0, 10).map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] px-2 py-0.5 rounded-full"
                        style={{ background: "var(--color-sand)", color: "var(--color-deep-navy)" }}
                      >
                        #{tag}
                      </span>
                    ))}
                    {allTags.length > 10 && (
                      <span className="text-[11px]" style={{ color: "var(--color-warm-gray)" }}>
                        +{allTags.length - 10}개
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* 감정 분포 */}
              {Object.keys(moodCounts).length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold mb-2" style={{ color: "var(--color-warm-gray)" }}>
                    감정 기록
                    {topMood && (
                      <span className="ml-1.5 font-normal">
                        — 가장 많은 감정: {MOOD_EMOJI[topMood[0]]} {MOOD_LABEL[topMood[0]]}
                      </span>
                    )}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {(Object.entries(moodCounts) as [Mood, number][])
                      .sort((a, b) => b[1] - a[1])
                      .map(([mood, count]) => (
                        <div
                          key={mood}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs"
                          style={{
                            background: "var(--color-ivory)",
                            border: "1px solid var(--color-sand)",
                            color: "var(--color-deep-navy)",
                          }}
                        >
                          <span>{MOOD_EMOJI[mood]}</span>
                          <span className="font-semibold">{count}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center transition-all active:scale-95 hover:opacity-90"
              style={{ background: "var(--color-coral)", color: "white" }}
            >
              내 추억 지도로
            </Link>
            <button
              onClick={handleLogout}
              className="w-full h-12 rounded-xl text-sm font-medium transition-all active:scale-95"
              style={{ background: "rgba(255,255,255,0.5)", border: "1px solid var(--color-sand)", color: "var(--color-warm-gray)" }}
            >
              로그아웃
            </button>
          </div>
        </div>
      ) : (
        /* ── 비로그인 상태 ── */
        <div className="glass-panel animate-fade-in-up w-full max-w-sm rounded-3xl px-8 py-10 relative z-10">
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg mb-4"
              style={{ background: "var(--color-sand)" }}
            >
              👤
            </div>
            <h1 className="text-xl font-bold" style={{ color: "var(--color-deep-navy)" }}>비로그인 상태</h1>
            <p className="text-sm mt-1 text-center" style={{ color: "var(--color-warm-gray)" }}>
              로그인하면 나만의 추억 지도를<br />만들 수 있어요
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center transition-all active:scale-95 hover:opacity-90"
              style={{ background: "var(--color-coral)", color: "white" }}
            >
              로그인
            </Link>
            <Link
              href="/join"
              className="w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center transition-all active:scale-95"
              style={{ background: "rgba(255,255,255,0.5)", border: "1px solid var(--color-sand)", color: "var(--color-warm-gray)" }}
            >
              회원가입
            </Link>
            <Link
              href="/"
              className="w-full h-12 rounded-xl text-sm font-medium flex items-center justify-center transition-all active:scale-95"
              style={{ color: "var(--color-warm-gray)" }}
            >
              지도로 돌아가기
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
