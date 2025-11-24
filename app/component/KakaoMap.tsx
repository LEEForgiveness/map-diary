"use client";
import Script from "next/script";
import React, { useRef } from "react";
import {
  CustomOverlayMap,
  Map,
  MapMarker,
  MapTypeId,
  Roadview,
} from "react-kakao-maps-sdk";
import { useState } from "react";
import AddOverlay from "./AddOverlay";
import { useEffect } from "react";

const testMaker = [
  {
    lat: 33.5563,
    lng: 126.79581,
    image: {
      src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3saeTNuIeCcWOd9LXmLB694kbY1f-9chJgA&s",
      size: { width: 25, height: 40 },
      options: {
        offset: { x: 12, y: 40 }, // 이미지 하단 중앙을 기준점으로
      },
    },
  },
  {
    lat: 33.55637325032181,
    lng: 126.79572990383876,
    image: {
      src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3saeTNuIeCcWOd9LXmLB694kbY1f-9chJgA&s",
      size: { width: 25, height: 40 },
      options: {
        offset: { x: 12, y: 40 }, // 이미지 하단 중앙을 기준점으로
      },
    },
  },
];

export default function KakaoMap() {
  const [center, setCenter] = useState({
    lat: 33.450422139819736,
    lng: 126.5709139924533,
  });
  const [overlayPosition, setOverlayPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCenter = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCenter(newCenter);
          //TODO: 테스트용 하드코딩
          setCenter({ lat: 33.55619546148889, lng: 126.79589723542207 });
        },
        (err) => {
          console.error("위치 가져오기 실패:", err.message);
        }
      );
    } else {
      console.log("geolocation을 사용할수 없어요..");
    }
  }, []);

  const [onRoadview, setOnRoadview] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showOverlayForm, setShowOverlayForm] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);

  const handleSearch = () => {
    if (!isKakaoLoaded) {
      alert("지도를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    if (!searchKeyword.trim()) {
      alert("검색어를 입력해주세요");
      return;
    }
  };

  return (
    <div className="relative">
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`}
        strategy="beforeInteractive"
      ></Script>
      <Map
        center={center}
        level={3}
        style={{ width: "100vw", height: "100vh" }}
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
        {showOverlayForm && overlayPosition && (
          <CustomOverlayMap
            position={overlayPosition}
            yAnchor={1.5}
            clickable={true}
          >
            <AddOverlay onClose={() => setShowOverlayForm(false)} />
          </CustomOverlayMap>
        )}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          <button
            onClick={() => {
              setOnRoadview(!onRoadview);
            }}
            className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-lg"
          >
            {onRoadview ? "지도 모드" : "로드뷰 모드"}
          </button>
          <button
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    setCenter({
                      lat: position.coords.latitude,
                      lng: position.coords.longitude,
                    });
                  },
                  (err) => {
                    console.error("위치 가져오기 실패:", err.message);
                  }
                );
              }
            }}
            className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-lg"
          >
            📍 내 위치
          </button>
          <div className="flex gap-2">
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
              className="bg-white text-gray-800 py-2 px-4 rounded-lg shadow-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-lg"
            >
              🔍
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
        {testMaker.map((marker) => (
          <MapMarker
            key={`${marker.lat}-${marker.lng}`}
            position={{ lat: marker.lat, lng: marker.lng }}
            clickable={true}
            onClick={() => alert("마커 클릭됨")}
            image={marker.image}
          />
        ))}
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
        ></Roadview>
      )}
    </div>
  );
}
