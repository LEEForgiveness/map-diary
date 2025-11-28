"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import PhotoOverlay from "./PhotoAddOverlay";
import supabase from "../utils/supabaseConfig";
import { useRouter } from "next/navigation";
import PhotoAddOverlay from "./PhotoAddOverlay";

export default function AddOverlay({
  onClose,
  position,
  onPhotoAdded,
}: {
  onClose?: () => void;
  position: { lat: number; lng: number };
  onPhotoAdded?: () => void | Promise<void>;
}) {
  const [showPhotoOverlay, setShowPhotoOverlay] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAddClick = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      alert("로그인이 필요합니다");
      router.push("/login");
      return;
    }

    setShowPhotoOverlay(true);
  };

  if (showPhotoOverlay && isMounted) {
    return createPortal(
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={() => {
          setShowPhotoOverlay(false);
          onClose?.();
        }}
      >
        <PhotoAddOverlay
          onClose={() => {
            setShowPhotoOverlay(false);
            onClose?.();
          }}
          position={{
            lat: position.lat.toString(),
            lng: position.lng.toString(),
          }}
          onPhotoAdded={onPhotoAdded}
        />
      </div>,
      document.body
    );
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white p-4 rounded-lg shadow-lg border-2 border-gray-300 min-w-[200px]"
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-gray-800">장소 추가</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 font-bold"
          >
            ✕
          </button>
        )}
      </div>
      <button
        onClick={handleAddClick}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        추가하기
      </button>
    </div>
  );
}
