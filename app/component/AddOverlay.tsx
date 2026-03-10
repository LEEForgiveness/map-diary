"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import PhotoAddOverlay from "./PhotoAddOverlay";
import supabase from "../utils/supabaseConfig";
import { useRouter } from "next/navigation";
import { useMessageOverlay } from "../hooks/useMessageOverlay";
import { MOCK_MODE, MOCK_SESSION } from "../mock/mockData";

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
  const { showMessage, overlay: messageOverlay } = useMessageOverlay();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAddClick = async () => {
    if (MOCK_MODE) {
      setShowPhotoOverlay(true);
      return;
    }
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      showMessage("로그인이 필요합니다", () => router.push("/login"));
      return;
    }

    setShowPhotoOverlay(true);
  };

  if (showPhotoOverlay && isMounted) {
    return (
      <>
        {createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
            style={{
              background: "rgba(30,42,58,0.55)",
              backdropFilter: "blur(4px)",
            }}
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
        )}
        {messageOverlay}
      </>
    );
  }

  return (
    <>
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel rounded-2xl overflow-hidden animate-fade-in-up"
        style={{ minWidth: 200 }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="flex items-center gap-2">
            <span
              className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs"
              style={{ background: "var(--color-coral)" }}
            >
              📍
            </span>
            <span
              className="text-sm font-bold"
              style={{ color: "var(--color-deep-navy)" }}
            >
              이곳의 추억
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors hover:bg-[var(--color-sand)]"
              style={{ color: "var(--color-warm-gray)" }}
            >
              ✕
            </button>
          )}
        </div>

        {/* 좌표 */}
        <p
          className="px-4 pb-2 text-[11px]"
          style={{ color: "var(--color-warm-gray)" }}
        >
          {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
        </p>

        {/* 버튼 */}
        <div className="px-3 pb-3">
          <button
            onClick={handleAddClick}
            className="w-full py-2 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{ background: "var(--color-coral)" }}
          >
            추억 남기기
          </button>
        </div>
      </div>
      {messageOverlay}
    </>
  );
}
