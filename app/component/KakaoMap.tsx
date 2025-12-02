"use client";
import Script from "next/script";
import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  CustomOverlayMap,
  CustomOverlayRoadview,
  Map,
  MapMarker,
  MapTypeId,
  Roadview,
} from "react-kakao-maps-sdk";
import AddOverlay from "./AddOverlay";
import { useRouter } from "next/navigation";
import supabase from "../utils/supabaseConfig";
import { GetPhotos } from "../api/photo";
import RectPhotoPin from "./RectPhotoPin";
import PhotoAddOverlay from "./PhotoAddOverlay";
import { useMessageOverlay } from "../hooks/useMessageOverlay";

export default function KakaoMap() {
  const [center, setCenter] = useState({
    lat: 33.55619546148889,
    lng: 126.79589723542207,
  });
  const [overlayPosition, setOverlayPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [map, setMap] = useState<kakao.maps.Map | null>(null);
  const [searchMarkers, setSearchMarkers] = useState<
    {
      id: string;
      position: { lat: number; lng: number };
      content: string;
    }[]
  >([]);
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<any | null>(null);
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [isPhotoEditorReady, setIsPhotoEditorReady] = useState(false);
  const { showMessage, overlay: messageOverlay } = useMessageOverlay();

  useEffect(() => {
    // 세션 확인
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setUserId(session?.user?.id ?? null);
    };

    checkSession();

    // 세션 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const newCenter = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCenter(newCenter);
        //TODO: 테스트용 하드코딩
      });
    } else {
      console.log("geolocation을 사용할수 없어요..");
    }
  }, []);

  const fetchPhotos = useCallback(async () => {
    const latestPhotos = await GetPhotos();
    setPhotos(latestPhotos || []);
    // 사진 추가/수정 후 검색 마커 초기화
    setSearchMarkers([]);
    setSelectedPlace(null);
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  useEffect(() => {
    setIsPhotoEditorReady(true);
  }, []);

  const [onRoadview, setOnRoadview] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showOverlayForm, setShowOverlayForm] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);
  const router = useRouter();
  const handleSearch = useCallback(() => {
    if (!isKakaoLoaded || !map) {
      showMessage("지도를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    if (!searchKeyword.trim()) {
      showMessage("검색어를 입력해주세요");
      return;
    }
    if (!window.kakao?.maps?.services) {
      showMessage("검색 서비스를 사용할 수 없습니다.");
      return;
    }

    const places = new kakao.maps.services.Places();
    places.keywordSearch(searchKeyword, (data, status) => {
      if (status !== kakao.maps.services.Status.OK) {
        showMessage("검색 결과가 없습니다.");
        setSearchMarkers([]);
        setSelectedPlace(null);
        return;
      }

      const bounds = new kakao.maps.LatLngBounds();
      const markers = data.map((place) => {
        const lat = Number(place.y);
        const lng = Number(place.x);
        bounds.extend(new kakao.maps.LatLng(lat, lng));
        return {
          id: place.id || `${place.place_name}-${lat}-${lng}`,
          position: { lat, lng },
          content: place.place_name,
        };
      });

      setSearchMarkers(markers);
      setSelectedPlace(null);
      map.setBounds(bounds);
    });
  }, [isKakaoLoaded, map, searchKeyword]);

  const handleAuthClick = async () => {
    if (isLoggedIn) {
      // 로그아웃
      await supabase.auth.signOut();
      setIsLoggedIn(false);
      window.location.reload();
    } else {
      // 로그인 페이지로 이동
      router.push("/login");
    }
  };

  return (
    <>
      <div className="relative">
        <Script
          src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false&libraries=services`}
          strategy="beforeInteractive"
        ></Script>
        <Map
          center={center}
          level={3}
          style={{ width: "100vw", height: "100vh" }}
          onCreate={(mapInstance) => {
            setMap(mapInstance);
            setIsKakaoLoaded(true);
          }}
          onClick={(_, mouseEvent) => {
            const latlng = mouseEvent.latLng;
            const clickedPosition = {
              lat: latlng.getLat(),
              lng: latlng.getLng(),
            };

            if (onRoadview) {
              setCenter(clickedPosition);
            } else {
              // 일반 지도 모드에서는 오버레이 위치만 변경
              setOverlayPosition(clickedPosition);
            }
            //TODO: 테스트용
            console.log(clickedPosition);
          }}
        >
          {!onRoadview && overlayPosition && (
            <MapMarker
              position={overlayPosition}
              onClick={() => setShowOverlayForm(!showOverlayForm)}
            />
          )}
          {searchMarkers.map((marker) => (
            <React.Fragment key={`search-${marker.id}`}>
              <MapMarker
                position={marker.position}
                onClick={() => {
                  setShowOverlayForm(true);
                  setOverlayPosition(marker.position);
                }}
                clickable={true}
                onMouseOver={() => setSelectedPlace(marker.id)}
                onMouseOut={() => setSelectedPlace(null)}
              />
              {selectedPlace === marker.id && (
                <CustomOverlayMap position={marker.position} yAnchor={2}>
                  <div className="bg-white text-gray-800 px-3 py-2 rounded-xl shadow-lg border border-gray-200 text-sm font-semibold whitespace-nowrap">
                    {marker.content}
                  </div>
                </CustomOverlayMap>
              )}
            </React.Fragment>
          ))}
          {showOverlayForm && overlayPosition && (
            <CustomOverlayMap
              position={overlayPosition}
              yAnchor={1.5}
              clickable={true}
            >
              <AddOverlay
                onClose={() => {
                  setShowOverlayForm(false);
                  setOverlayPosition(null);
                }}
                position={overlayPosition}
                onPhotoAdded={fetchPhotos}
              />
            </CustomOverlayMap>
          )}
          <div className="absolute top-4 z-10 w-full px-4 flex flex-wrap gap-3 items-start md:items-end">
            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={() => {
                  setOnRoadview(!onRoadview);
                }}
                className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-lg flex items-center justify-center gap-1"
                aria-label={onRoadview ? "지도 모드" : "로드뷰 모드"}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 15h18" />
                  <path d="M5 15l1.5-4.5A2 2 0 0 1 8.4 9h7.2a2 2 0 0 1 1.9 1.5L19 15" />
                  <circle cx="7" cy="18" r="1.5" />
                  <circle cx="17" cy="18" r="1.5" />
                </svg>
                <span className="hidden md:inline">
                  {onRoadview ? "지도 모드" : "로드뷰 모드"}
                </span>
              </button>
              <button
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        const currentPosition = {
                          lat: position.coords.latitude,
                          lng: position.coords.longitude,
                        };
                        setCenter(currentPosition);
                      },
                      (err) => {
                        console.error("위치 가져오기 실패:", err.message);
                      }
                    );
                  }
                }}
                className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-lg flex items-center justify-center gap-1"
                aria-label="내 위치"
              >
                <span aria-hidden="true" className="text-lg">
                  📍
                </span>
                <span className="hidden md:inline">내 위치</span>
              </button>
              <div className="flex flex-wrap gap-2 items-center">
                <div className="relative flex-1 min-w-[200px] md:w-64">
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    placeholder="장소 검색"
                    className="bg-white text-gray-800 py-2 pl-4 pr-12 rounded-lg shadow-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute inset-y-1 right-1 px-3 rounded-md text-gray-700 hover:text-gray-900 flex items-center justify-center"
                    aria-label="검색"
                  >
                    🔍
                  </button>
                </div>
              </div>
            </div>
            <div className="flex md:ml-auto shrink-0">
              <button
                onClick={handleAuthClick}
                className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-lg text-center"
              >
                {isLoggedIn ? "로그아웃" : "로그인"}
              </button>
            </div>
          </div>
          {onRoadview && (
            <>
              <MapTypeId type={kakao.maps.MapTypeId.ROADVIEW} />
              <MapMarker
                position={center}
                draggable={true}
                onDragEnd={(marker) => {
                  setCenter({
                    // @ts-ignore
                    lat: marker.getPosition().getLat(),
                    // @ts-ignore
                    lng: marker.getPosition().getLng(),
                  });
                  setIsError(false);
                }}
                image={{
                  src: "https://t1.daumcdn.net/localimg/localimages/07/2018/pc/roadview_minimap_wk_2018.png",
                  size: { width: 26, height: 46 },
                  options: {
                    spriteSize: { width: 1666, height: 168 },
                    spriteOrigin: { x: 705, y: 114 },
                    offset: { x: 13, y: 46 },
                  },
                }}
              />
            </>
          )}
          {photos.map((photo) => {
            const canOpen = userId && photo.uuid === userId;
            return (
              <CustomOverlayMap
                key={
                  photo.id ||
                  `${photo.latitude}-${photo.longitude}-${photo.photo_url}`
                }
                position={{ lat: photo.latitude, lng: photo.longitude }}
                yAnchor={0.7}
                clickable={!!canOpen}
              >
                <RectPhotoPin
                  src={photo.photo_url}
                  onClick={
                    canOpen
                      ? () => {
                          setEditingPhoto(photo);
                          setShowPhotoEditor(true);
                        }
                      : undefined
                  }
                  width={46}
                  height={46}
                  disabled={!canOpen}
                />
              </CustomOverlayMap>
            );
          })}
        </Map>
        {onRoadview && (
          <Roadview
            position={{ ...center, radius: 50 }}
            style={{
              width: isError ? "0" : "50%",
              height: "300px",
            }}
            onErrorGetNearestPanoId={() => setIsError(true)}
            className="absolute top-10 right-10 z-10"
          >
            {photos.map((photo) => {
              const canOpen = userId && photo.uuid === userId;
              return (
                <CustomOverlayRoadview
                  key={
                    photo.id ||
                    `${photo.latitude}-${photo.longitude}-${photo.photo_url}`
                  }
                  position={{ lat: photo.latitude, lng: photo.longitude }}
                  yAnchor={0.7}
                  clickable={!!canOpen}
                >
                  <RectPhotoPin
                    src={photo.photo_url}
                    onClick={
                      canOpen
                        ? () => {
                            setEditingPhoto(photo);
                            setShowPhotoEditor(true);
                          }
                        : undefined
                    }
                    width={100}
                    height={100}
                    disabled={!canOpen}
                  />
                </CustomOverlayRoadview>
              );
            })}
          </Roadview>
        )}
      </div>
      {isPhotoEditorReady && showPhotoEditor && editingPhoto
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              onClick={() => {
                setShowPhotoEditor(false);
                setEditingPhoto(null);
              }}
            >
              <PhotoAddOverlay
                onClose={() => {
                  setShowPhotoEditor(false);
                  setEditingPhoto(null);
                }}
                position={{
                  lat:
                    editingPhoto.latitude?.toString() ??
                    editingPhoto.lat?.toString() ??
                    "0",
                  lng:
                    editingPhoto.longitude?.toString() ??
                    editingPhoto.lng?.toString() ??
                    "0",
                }}
                onPhotoUpdated={fetchPhotos}
                photo={{
                  id: editingPhoto.id,
                  description: editingPhoto.description,
                  date: editingPhoto.date,
                  shared: editingPhoto.shared,
                  photo_url: editingPhoto.photo_url,
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
