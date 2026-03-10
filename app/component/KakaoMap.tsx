"use client";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import AddOverlay from "./AddOverlay";
import { useRouter } from "next/navigation";
import RectPhotoPin from "./RectPhotoPin";
import PhotoAddOverlay from "./PhotoAddOverlay";
import FilterBar from "./FilterBar";
import MemoryTimeline from "./MemoryTimeline";
import PlaceMemorySheet from "./PlaceMemorySheet";
import { useMessageOverlay } from "../hooks/useMessageOverlay";
import { MOCK_PHOTOS, MOCK_USER_ID } from "../mock/mockData";
import {
  filterPhotos,
  groupPhotosByPlace,
  extractAllTags,
  extractAllYears,
  DEFAULT_FILTER,
} from "../utils/memory";
import type { FilterState } from "../utils/memory";
import type { Photo } from "../types/photoType";

const MOCK_MODE = true;

type BottomTab = "thumbnails" | "timeline" | "places";

const KAKAO_SDK_URL = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false&libraries=services`;

/* ──────────────────────────────────────────
   상단 플로팅 툴바
────────────────────────────────────────── */
function FloatingToolbar({
  isLoggedIn,
  onRoadview,
  searchKeyword,
  onSearchChange,
  onSearchSubmit,
  onLocationClick,
  onRoadviewToggle,
  onAuthClick,
}: {
  isLoggedIn: boolean;
  onRoadview: boolean;
  searchKeyword: string;
  onSearchChange: (v: string) => void;
  onSearchSubmit: () => void;
  onLocationClick: () => void;
  onRoadviewToggle: () => void;
  onAuthClick: () => void;
}) {
  return (
    <div className="absolute top-4 left-0 right-0 z-10 px-4 flex items-center gap-2">
      <div className="flex flex-1 items-center gap-2 glass-panel rounded-2xl px-4 py-2.5">
        <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" style={{ color: "var(--color-warm-gray)" }} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearchSubmit()}
          placeholder="장소 검색"
          className="flex-1 bg-transparent text-sm focus:outline-none min-w-0"
          style={{ color: "var(--color-deep-navy)" }}
        />
        {searchKeyword && (
          <button onClick={onSearchSubmit} className="shrink-0">
            <svg viewBox="0 0 24 24" className="w-4 h-4" style={{ color: "var(--color-coral)" }} fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      <button onClick={onLocationClick} title="내 위치" className="glass-panel w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-95">
        <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ color: "var(--color-sky)" }} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /><circle cx="12" cy="12" r="8" strokeDasharray="2 2" />
        </svg>
      </button>

      <button
        onClick={onRoadviewToggle}
        title={onRoadview ? "지도 모드" : "로드뷰"}
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-95"
        style={{
          background: onRoadview ? "var(--color-coral)" : "var(--glass-bg)",
          border: "1px solid " + (onRoadview ? "var(--color-coral)" : "var(--glass-border)"),
          boxShadow: "var(--glass-shadow)",
          backdropFilter: "blur(12px)",
          color: onRoadview ? "#fff" : "var(--color-warm-gray)",
        }}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 15h18" /><path d="M5 15l1.5-4.5A2 2 0 0 1 8.4 9h7.2a2 2 0 0 1 1.9 1.5L19 15" />
          <circle cx="7" cy="18" r="1.5" /><circle cx="17" cy="18" r="1.5" />
        </svg>
      </button>

      <button
        onClick={onAuthClick}
        className="glass-panel h-10 px-3 rounded-xl flex items-center gap-1.5 shrink-0 text-xs font-semibold transition-all active:scale-95"
        style={{ color: isLoggedIn ? "var(--color-warm-gray)" : "var(--color-coral)" }}
      >
        {isLoggedIn ? (
          <>
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="hidden sm:inline">로그아웃</span>
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            <span className="hidden sm:inline">로그인</span>
          </>
        )}
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────
   하단 추억 패널 (탭형)
────────────────────────────────────────── */
function MemoryBottomSheet({
  photos,
  userId,
  onPhotoClick,
  filter,
  onFilterChange,
}: {
  photos: Photo[];
  userId: string | null;
  onPhotoClick: (photo: Photo) => void;
  filter: FilterState;
  onFilterChange: (f: FilterState) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<BottomTab>("thumbnails");
  const [showFilter, setShowFilter] = useState(false);

  const allTags = extractAllTags(photos);
  const allYears = extractAllYears(photos);
  const filtered = filterPhotos(photos, filter);
  const placeGroups = groupPhotosByPlace(filtered);

  const hasActiveFilter =
    filter.sharedOnly ||
    filter.years.length > 0 ||
    filter.tags.length > 0 ||
    filter.moods.length > 0;

  const TAB_LABELS: { id: BottomTab; label: string }[] = [
    { id: "thumbnails", label: "썸네일" },
    { id: "timeline", label: "타임라인" },
    { id: "places", label: "장소별" },
  ];

  if (photos.length === 0) {
    return (
      <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none animate-fade-in-up">
        <div className="glass-panel rounded-2xl px-5 py-4 flex items-center gap-3">
          <span className="text-2xl shrink-0">🗺</span>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--color-deep-navy)" }}>지도를 클릭해 첫 추억을 남겨보세요</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-warm-gray)" }}>사진과 함께 그날의 기억을 기록할 수 있어요</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-4 left-0 right-0 z-10 px-4 animate-fade-in-up">
      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col" style={{ maxHeight: isExpanded ? "70vh" : undefined }}>

        {/* 헤더 */}
        <div className="flex items-center px-4 pt-3 pb-2 gap-2">
          {/* 탭 */}
          <div className="flex gap-1 flex-1">
            {TAB_LABELS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setIsExpanded(true); }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: activeTab === tab.id ? "var(--color-deep-navy)" : "var(--color-sand)",
                  color: activeTab === tab.id ? "#fff" : "var(--color-deep-navy)",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 필터 토글 */}
          <button
            onClick={() => setShowFilter((v) => !v)}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all relative"
            style={{
              background: hasActiveFilter ? "var(--color-coral)" : "var(--color-sand)",
              color: hasActiveFilter ? "#fff" : "var(--color-deep-navy)",
            }}
            title="필터"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M7 12h10M11 18h2" />
            </svg>
            {hasActiveFilter && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-white" />
            )}
          </button>

          {/* 접기/펼치기 */}
          <button
            onClick={() => setIsExpanded((v) => !v)}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{ background: "var(--color-sand)", color: "var(--color-warm-gray)" }}
          >
            <svg viewBox="0 0 24 24" className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>
        </div>

        {/* 필터바 */}
        {showFilter && (
          <FilterBar
            filter={filter}
            onChange={onFilterChange}
            availableYears={allYears}
            availableTags={allTags}
          />
        )}

        {/* 콘텐츠 */}
        <div className={`transition-all duration-300 overflow-y-auto ${isExpanded ? "max-h-[50vh]" : "max-h-20"}`}>
          {activeTab === "thumbnails" && (
            <div className="flex gap-2 px-4 py-3 overflow-x-auto hide-scrollbar">
              {filtered.length === 0 ? (
                <p className="text-xs py-2" style={{ color: "var(--color-warm-gray)" }}>
                  조건에 맞는 추억이 없어요
                </p>
              ) : (
                filtered
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .slice(0, 30)
                  .map((photo) => (
                    <button
                      key={photo.id}
                      onClick={() => onPhotoClick(photo)}
                      className="shrink-0 rounded-xl overflow-hidden border-2 transition-all hover:scale-105 active:scale-95"
                      style={{ borderColor: "var(--color-sand)", width: 64, height: 64 }}
                    >
                      <img src={photo.photo_url} alt={photo.description ?? "추억"} className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))
              )}
            </div>
          )}

          {activeTab === "timeline" && (
            <MemoryTimeline photos={filtered} onPhotoClick={onPhotoClick} />
          )}

          {activeTab === "places" && (
            <PlaceMemorySheet groups={placeGroups} onPhotoClick={onPhotoClick} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   메인 컴포넌트
────────────────────────────────────────── */
export default function KakaoMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const isLoggedInRef = useRef<boolean>(false);
  const initCalledRef = useRef(false);

  const [isKakaoReady, setIsKakaoReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [overlayPosition, setOverlayPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [showOverlayForm, setShowOverlayForm] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [onRoadview, setOnRoadview] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchMarkers, setSearchMarkers] = useState<{ id: string; position: { lat: number; lng: number }; content: string }[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);

  const { showMessage, overlay: messageOverlay } = useMessageOverlay();
  const router = useRouter();

  // isLoggedIn ref 동기화 (클릭 이벤트 클로저에서 최신값 참조)
  useEffect(() => {
    isLoggedInRef.current = !!isLoggedIn;
  }, [isLoggedIn]);

  /* ── 세션 초기화 ── */
  useEffect(() => {
    if (MOCK_MODE) {
      setIsLoggedIn(true);
      setUserId(MOCK_USER_ID);
      setPhotos(MOCK_PHOTOS as Photo[]);
    } else {
      (async () => {
        const supabase = (await import("../utils/supabaseConfig")).default;
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
        setUserId(session?.user?.id ?? null);
        const { GetPhotos } = await import("../api/photo");
        setPhotos((await GetPhotos()) || []);
        supabase.auth.onAuthStateChange((_e, sess) => {
          setIsLoggedIn(!!sess);
          setUserId(sess?.user?.id ?? null);
        });
      })();
    }
  }, []);

  /* ── 카카오 지도 초기화 (한 번만) ── */
  const initKakaoMap = useCallback(() => {
    if (initCalledRef.current) return;
    if (!mapContainerRef.current) return;
    if (!window.kakao?.maps) return;

    initCalledRef.current = true;

    window.kakao.maps.load(() => {
      const container = mapContainerRef.current!;
      const map = new window.kakao.maps.Map(container, {
        center: new window.kakao.maps.LatLng(37.5665, 126.978),
        level: 7,
      });
      mapRef.current = map;
      setIsKakaoReady(true);

      window.kakao.maps.event.addListener(map, "click", (mouseEvent: any) => {
        if (!isLoggedInRef.current) return;
        const latlng = mouseEvent.latLng;
        setOverlayPosition({ lat: latlng.getLat(), lng: latlng.getLng() });
        setShowOverlayForm(true);
      });
    });
  }, []); // 의존성 없음 — 한 번만 실행

  /* ── SDK 스크립트 직접 주입 (Next.js Script 컴포넌트 타이밍 문제 우회) ── */
  useEffect(() => {
    // 이미 로드된 경우
    if (window.kakao?.maps) {
      initKakaoMap();
      return;
    }
    // 이미 script 태그가 있는 경우
    if (document.querySelector(`script[src*="dapi.kakao.com"]`)) {
      const poll = setInterval(() => {
        if (window.kakao?.maps) {
          clearInterval(poll);
          initKakaoMap();
        }
      }, 100);
      return () => clearInterval(poll);
    }
    // 직접 script 삽입
    const script = document.createElement("script");
    script.src = KAKAO_SDK_URL;
    script.async = true;
    script.onload = () => initKakaoMap();
    document.head.appendChild(script);
  }, [initKakaoMap]);

  /* ── 내 위치 이동 ── */
  const handleLocationClick = useCallback(() => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = new window.kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        mapRef.current.setCenter(latlng);
      },
      (err) => console.error("위치 가져오기 실패:", err.message)
    );
  }, []);

  /* ── 장소 검색 ── */
  const handleSearch = useCallback(() => {
    if (!isKakaoReady || !mapRef.current) {
      showMessage("지도를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    if (!searchKeyword.trim()) { showMessage("검색어를 입력해주세요"); return; }
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(searchKeyword, (data: any[], status: string) => {
      if (status !== window.kakao.maps.services.Status.OK) {
        showMessage("검색 결과가 없습니다."); setSearchMarkers([]); return;
      }
      const bounds = new window.kakao.maps.LatLngBounds();
      const markers = data.map((place) => {
        const lat = Number(place.y), lng = Number(place.x);
        bounds.extend(new window.kakao.maps.LatLng(lat, lng));
        return { id: place.id ?? `${place.place_name}-${lat}-${lng}`, position: { lat, lng }, content: place.place_name };
      });
      setSearchMarkers(markers);
      setSelectedPlace(null);
      mapRef.current.setBounds(bounds);
    });
  }, [isKakaoReady, searchKeyword, showMessage]);

  /* ── 로그인/아웃 ── */
  const handleAuthClick = async () => {
    if (MOCK_MODE) {
      setIsLoggedIn((prev) => { const next = !prev; setUserId(next ? MOCK_USER_ID : null); return next; });
      return;
    }
    if (isLoggedIn) {
      const supabase = (await import("../utils/supabaseConfig")).default;
      await supabase.auth.signOut();
      window.location.reload();
    } else {
      router.push("/login");
    }
  };

  const fetchPhotos = useCallback(async () => {
    if (MOCK_MODE) return;
    const { GetPhotos } = await import("../api/photo");
    setPhotos((await GetPhotos()) || []);
  }, []);

  /* ── 세션 로딩 중 ── */
  if (isLoggedIn === null) {
    return (
      <div className="relative w-screen h-screen flex items-center justify-center" style={{ background: "var(--color-cream)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-[3px] animate-spin" style={{ borderColor: "var(--color-sand)", borderTopColor: "var(--color-coral)" }} />
          <p className="text-sm" style={{ color: "var(--color-warm-gray)" }}>불러오는 중…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative w-screen h-screen overflow-hidden">
        {/* 지도 DOM 컨테이너 */}
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* 지도 로딩 중 */}
        {!isKakaoReady && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none" style={{ background: "var(--color-cream)" }}>
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-[3px] animate-spin" style={{ borderColor: "var(--color-sand)", borderTopColor: "var(--color-coral)" }} />
              <p className="text-sm" style={{ color: "var(--color-warm-gray)" }}>지도를 불러오는 중…</p>
            </div>
          </div>
        )}

        {/* 사진 핀 — 필터 적용 */}
        {isKakaoReady && filterPhotos(photos, filter).map((photo) => (
          <KakaoPhotoPin
            key={photo.id ?? `${photo.latitude}-${photo.longitude}`}
            map={mapRef.current}
            photo={photo}
            isOwner={!!isLoggedIn && photo.uuid === userId}
            onClick={() => { setEditingPhoto(photo); setShowPhotoEditor(true); }}
          />
        ))}

        {/* 검색 결과 마커 */}
        {isKakaoReady && searchMarkers.map((marker) => (
          <KakaoSearchMarker
            key={marker.id}
            map={mapRef.current}
            marker={marker}
            selected={selectedPlace === marker.id}
            onSelect={() => setSelectedPlace(marker.id)}
            onDeselect={() => setSelectedPlace(null)}
            onClick={() => { setOverlayPosition(marker.position); setShowOverlayForm(true); }}
          />
        ))}

        {/* AddOverlay */}
        {isLoggedIn && showOverlayForm && overlayPosition && isKakaoReady && (
          <KakaoAddOverlay
            map={mapRef.current}
            position={overlayPosition}
            onClose={() => { setShowOverlayForm(false); setOverlayPosition(null); }}
            onPhotoAdded={fetchPhotos}
          />
        )}

        {/* 플로팅 툴바 */}
        <FloatingToolbar
          isLoggedIn={!!isLoggedIn}
          onRoadview={onRoadview}
          searchKeyword={searchKeyword}
          onSearchChange={setSearchKeyword}
          onSearchSubmit={handleSearch}
          onLocationClick={handleLocationClick}
          onRoadviewToggle={() => setOnRoadview((v) => !v)}
          onAuthClick={handleAuthClick}
        />

        {/* Mock 배지 */}
        {MOCK_MODE && (
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full text-xs font-semibold pointer-events-none"
            style={{ background: "rgba(232,113,74,0.15)", border: "1px solid var(--color-coral)", color: "var(--color-coral)" }}
          >
            미리보기 모드
          </div>
        )}

        {/* 비로그인 안내 배너 */}
        {!isLoggedIn && (
          <div className="absolute top-20 left-4 right-4 z-10 animate-fade-in-up pointer-events-none">
            <div className="glass-panel rounded-2xl px-4 py-3 flex items-center gap-3">
              <span className="text-xl shrink-0">🗺</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--color-deep-navy)" }}>지도 위에, 당신의 추억을 남겨보세요</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-warm-gray)" }}>로그인하면 나만의 추억 지도를 만들 수 있어요</p>
              </div>
            </div>
          </div>
        )}

        {/* 하단 추억 패널 */}
        {isLoggedIn && (
          <MemoryBottomSheet
            photos={photos}
            userId={userId}
            filter={filter}
            onFilterChange={setFilter}
            onPhotoClick={(photo) => { setEditingPhoto(photo); setShowPhotoEditor(true); }}
          />
        )}
      </div>

      {/* 사진 편집 모달 */}
      {showPhotoEditor && editingPhoto
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
              style={{ background: "rgba(30,42,58,0.55)", backdropFilter: "blur(4px)" }}
              onClick={() => { setShowPhotoEditor(false); setEditingPhoto(null); }}
            >
              <PhotoAddOverlay
                onClose={() => { setShowPhotoEditor(false); setEditingPhoto(null); }}
                position={{
                  lat: editingPhoto.latitude.toString(),
                  lng: editingPhoto.longitude.toString(),
                }}
                onPhotoUpdated={fetchPhotos}
                photo={{
                  id: editingPhoto.id,
                  description: editingPhoto.description ?? "",
                  date: editingPhoto.date ?? "",
                  shared: editingPhoto.shared,
                  photo_url: editingPhoto.photo_url,
                  tags: editingPhoto.tags,
                  mood: editingPhoto.mood,
                }}
              />
            </div>,
            document.body
          )
        : null}

      {messageOverlay}
    </>
  );
}

/* ──────────────────────────────────────────
   사진 핀
────────────────────────────────────────── */
function KakaoPhotoPin({ map, photo, isOwner, onClick }: { map: any; photo: any; isOwner: boolean; onClick: () => void }) {
  const containerRef = useRef<HTMLDivElement>(document.createElement("div"));

  useEffect(() => {
    if (!map || !window.kakao?.maps) return;
    const overlay = new window.kakao.maps.CustomOverlay({
      position: new window.kakao.maps.LatLng(photo.latitude, photo.longitude),
      content: containerRef.current,
      yAnchor: 1.1,
      zIndex: 3,
    });
    overlay.setMap(map);
    return () => overlay.setMap(null);
  }, [map, photo.latitude, photo.longitude]);

  return createPortal(
    <RectPhotoPin src={photo.photo_url} onClick={isOwner ? onClick : undefined} width={52} height={52} disabled={!isOwner} />,
    containerRef.current
  );
}

/* ──────────────────────────────────────────
   검색 마커
────────────────────────────────────────── */
function KakaoSearchMarker({ map, marker, onSelect, onDeselect, onClick }: { map: any; marker: any; selected: boolean; onSelect: () => void; onDeselect: () => void; onClick: () => void }) {
  useEffect(() => {
    if (!map || !window.kakao?.maps) return;
    const m = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(marker.position.lat, marker.position.lng),
      map,
    });
    window.kakao.maps.event.addListener(m, "click", onClick);
    window.kakao.maps.event.addListener(m, "mouseover", onSelect);
    window.kakao.maps.event.addListener(m, "mouseout", onDeselect);
    return () => m.setMap(null);
  }, [map, marker.position.lat, marker.position.lng, onClick, onSelect, onDeselect]);
  return null;
}

/* ──────────────────────────────────────────
   AddOverlay (지도 위 팝업)
────────────────────────────────────────── */
function KakaoAddOverlay({ map, position, onClose, onPhotoAdded }: { map: any; position: { lat: number; lng: number }; onClose: () => void; onPhotoAdded: () => void }) {
  const containerRef = useRef<HTMLDivElement>(document.createElement("div"));

  useEffect(() => {
    if (!map || !window.kakao?.maps) return;
    const latlng = new window.kakao.maps.LatLng(position.lat, position.lng);
    const marker = new window.kakao.maps.Marker({ position: latlng, map });
    const overlay = new window.kakao.maps.CustomOverlay({ position: latlng, content: containerRef.current, yAnchor: 1.5, zIndex: 5, clickable: true });
    overlay.setMap(map);
    return () => { marker.setMap(null); overlay.setMap(null); };
  }, [map, position.lat, position.lng]);

  return createPortal(
    <AddOverlay onClose={onClose} position={position} onPhotoAdded={onPhotoAdded} />,
    containerRef.current
  );
}
