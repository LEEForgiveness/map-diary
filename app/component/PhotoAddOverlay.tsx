"use client";
import { useEffect, useRef, useState } from "react";
import { AddPhoto, DeletePhotos, UpdatePhoto } from "../api/photo";
import supabase from "../utils/supabaseConfig";
import { useMessageOverlay } from "../hooks/useMessageOverlay";
import { MOCK_MODE } from "../mock/mockData";
import type { Mood } from "../types/photoType";

const MOOD_OPTIONS: { value: Mood; label: string; emoji: string }[] = [
  { value: "happy", label: "행복", emoji: "😊" },
  { value: "calm", label: "평온", emoji: "😌" },
  { value: "nostalgic", label: "그리움", emoji: "🥹" },
  { value: "excited", label: "설렘", emoji: "🤩" },
  { value: "reflective", label: "사색", emoji: "🤔" },
];

const SUGGESTED_TAGS = ["여행", "카페", "맛집", "자연", "도시", "산책", "야경", "봄", "여름", "가을", "겨울", "혼자", "친구", "가족"];

interface PhotoOverlayProps {
  onClose: () => void;
  position: { lat: string; lng: string };
  onPhotoAdded?: () => void | Promise<void>;
  onPhotoUpdated?: () => void | Promise<void>;
  photo?: {
    id: number;
    description: string;
    date: string;
    shared: boolean;
    photo_url?: string;
    tags?: string[];
    mood?: Mood;
  };
}

export default function PhotoAddOverlay({
  onClose,
  position,
  onPhotoAdded,
  onPhotoUpdated,
  photo,
}: PhotoOverlayProps) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState(photo?.description ?? "");
  const [preview, setPreview] = useState<string | null>(photo?.photo_url ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    (photo?.date ? new Date(photo.date) : new Date()).toISOString().split("T")[0]
  );
  const [isShared, setIsShared] = useState(photo?.shared ?? false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [tags, setTags] = useState<string[]>(photo?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [mood, setMood] = useState<Mood | null>(photo?.mood ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = !!photo;
  const { showMessage, overlay: messageOverlay } = useMessageOverlay();

  useEffect(() => {
    if (!photo) return;
    setDescription(photo.description ?? "");
    setPreview(photo.photo_url ?? null);
    setSelectedDate(
      (photo.date ? new Date(photo.date) : new Date()).toISOString().split("T")[0]
    );
    setIsShared(photo.shared ?? false);
    setTags(photo.tags ?? []);
    setMood(photo.mood ?? null);
    setFile(null);
  }, [photo]);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || tags.includes(trimmed) || tags.length >= 5) return;
    setTags([...tags, trimmed]);
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const applyFile = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) applyFile(selected);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith("image/")) applyFile(dropped);
  };

  const handleSubmit = async () => {
    if (!isEditMode && !file) {
      showMessage("사진을 선택해주세요");
      return;
    }
    setIsUploading(true);
    try {
      if (MOCK_MODE) {
        // Mock 모드: 실제 업로드 없이 성공 메시지만 표시
        await new Promise((r) => setTimeout(r, 600)); // 업로드 느낌
        if (isEditMode) {
          showMessage("추억이 수정되었습니다 (미리보기 모드)", onClose);
        } else {
          showMessage("추억이 기록되었습니다 (미리보기 모드)", onClose);
        }
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        showMessage("로그인이 필요합니다");
        return;
      }
      if (isEditMode && photo) {
        await UpdatePhoto(
          session,
          photo.id,
          {
            description,
            lat: parseFloat(position.lat),
            lng: parseFloat(position.lng),
            date: new Date(selectedDate).toISOString(),
            shared: isShared,
            tags,
            mood: mood ?? undefined,
          },
          file ?? undefined
        );
        await onPhotoUpdated?.();
        showMessage("추억이 수정되었습니다", onClose);
      } else if (file) {
        await AddPhoto(session, file, {
          description,
          lat: position.lat,
          lng: position.lng,
          date: new Date(selectedDate).toISOString(),
          shared: isShared,
          tags,
          mood: mood ?? undefined,
        });
        await onPhotoAdded?.();
        showMessage("추억이 기록되었습니다", onClose);
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      showMessage(isEditMode ? "수정에 실패했습니다" : "기록에 실패했습니다");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (MOCK_MODE) {
      showMessage("삭제되었습니다 (미리보기 모드)");
      setShowDeleteConfirm(false);
      onClose();
      return;
    }
    if (isEditMode && photo) {
      await DeletePhotos(photo.id, photo.photo_url ?? "");
      await onPhotoUpdated?.();
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  return (
    <>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm mx-auto rounded-3xl overflow-hidden animate-fade-in-up"
        style={{
          background: "var(--color-cream)",
          boxShadow: "var(--card-shadow)",
        }}
      >
        {/* 헤더 */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ background: "var(--color-ivory)", borderBottom: "1px solid var(--color-sand)" }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-sm"
              style={{ background: "var(--color-coral)" }}
            >
              {isEditMode ? "✏️" : "📸"}
            </span>
            <h3 className="text-base font-bold" style={{ color: "var(--color-deep-navy)" }}>
              {isEditMode ? "추억 수정하기" : "추억 남기기"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors"
            style={{ color: "var(--color-warm-gray)", background: "var(--color-sand)" }}
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* 사진 드래그존 */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: "var(--color-warm-gray)" }}>
              사진
            </label>
            {preview ? (
              <div className="relative rounded-2xl overflow-hidden" style={{ height: 180 }}>
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                {/* 변경 버튼 */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: "rgba(30,42,58,0.6)", backdropFilter: "blur(6px)" }}
                >
                  사진 변경
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className="w-full rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
                style={{
                  height: 140,
                  background: isDragging ? "var(--color-sand)" : "var(--color-ivory)",
                  border: `2px dashed ${isDragging ? "var(--color-coral)" : "var(--color-sand)"}`,
                }}
              >
                <span className="text-3xl">📷</span>
                <span className="text-sm font-medium" style={{ color: "var(--color-warm-gray)" }}>
                  사진을 선택하거나 드래그하세요
                </span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* 날짜 */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: "var(--color-warm-gray)" }}>
              날짜
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
              style={{
                background: "var(--color-ivory)",
                border: "1.5px solid var(--color-sand)",
                color: "var(--color-deep-navy)",
              }}
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: "var(--color-warm-gray)" }}>
              이 날의 기억
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="어떤 순간이었나요? 짧게 남겨보세요"
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none resize-none transition-all"
              style={{
                background: "var(--color-ivory)",
                border: "1.5px solid var(--color-sand)",
                color: "var(--color-deep-navy)",
              }}
            />
          </div>

          {/* 감정 */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: "var(--color-warm-gray)" }}>
              감정 <span className="font-normal">(선택)</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(mood === m.value ? null : m.value)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: mood === m.value ? "var(--color-coral)" : "var(--color-ivory)",
                    color: mood === m.value ? "#fff" : "var(--color-deep-navy)",
                    border: `1.5px solid ${mood === m.value ? "var(--color-coral)" : "var(--color-sand)"}`,
                  }}
                >
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 태그 */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: "var(--color-warm-gray)" }}>
              태그 <span className="font-normal">(최대 5개)</span>
            </label>
            {/* 선택된 태그 */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{ background: "var(--color-deep-navy)", color: "#fff" }}
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-0.5 opacity-70 hover:opacity-100"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
            {/* 직접 입력 */}
            {tags.length < 5 && (
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(tagInput); } }}
                  placeholder="태그 직접 입력 후 Enter"
                  className="flex-1 px-3 py-2 rounded-xl text-xs focus:outline-none"
                  style={{
                    background: "var(--color-ivory)",
                    border: "1.5px solid var(--color-sand)",
                    color: "var(--color-deep-navy)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => addTag(tagInput)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-white"
                  style={{ background: "var(--color-coral)" }}
                >
                  추가
                </button>
              </div>
            )}
            {/* 추천 태그 */}
            {tags.length < 5 && (
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).slice(0, 8).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    className="px-2.5 py-1 rounded-lg text-xs transition-all hover:opacity-80"
                    style={{
                      background: "var(--color-sand)",
                      color: "var(--color-deep-navy)",
                    }}
                  >
                    +{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 공유 옵션 */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className="relative w-10 h-6 rounded-full transition-colors duration-200"
              style={{ background: isShared ? "var(--color-coral)" : "var(--color-sand)" }}
              onClick={() => setIsShared(!isShared)}
            >
              <div
                className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200"
                style={{ left: isShared ? "calc(100% - 20px)" : 4 }}
              />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--color-deep-navy)" }}>
                지도에 공개
              </p>
              <p className="text-[11px]" style={{ color: "var(--color-warm-gray)" }}>
                다른 사람도 이 추억을 볼 수 있어요
              </p>
            </div>
          </label>

          {/* 위치 */}
          <p className="text-[11px]" style={{ color: "var(--color-warm-gray)" }}>
            📍 {parseFloat(position.lat).toFixed(5)}, {parseFloat(position.lng).toFixed(5)}
          </p>

          {/* 액션 버튼 */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSubmit}
              disabled={isUploading || (!isEditMode && !file)}
              className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-50"
              style={{ background: "var(--color-coral)" }}
            >
              {isUploading
                ? isEditMode ? "수정 중…" : "기록 중…"
                : isEditMode ? "수정하기" : "기록 남기기"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 hover:opacity-80 active:scale-95"
              style={{
                background: "var(--color-ivory)",
                color: "var(--color-warm-gray)",
                border: "1.5px solid var(--color-sand)",
              }}
            >
              취소
            </button>
          </div>

          {/* 삭제 버튼 (수정 모드) */}
          {isEditMode && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
              style={{ color: "#e05050", background: "transparent" }}
            >
              이 추억 삭제하기
            </button>
          )}
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in"
          style={{ background: "rgba(30,42,58,0.55)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="w-full max-w-xs rounded-3xl p-6 flex flex-col items-center gap-4 animate-fade-in-up"
            style={{ background: "var(--color-cream)", boxShadow: "var(--card-shadow)" }}
          >
            <span className="text-4xl">🗑</span>
            <div className="text-center">
              <p className="text-base font-bold" style={{ color: "var(--color-deep-navy)" }}>
                추억을 삭제할까요?
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--color-warm-gray)" }}>
                삭제된 기록은 되돌릴 수 없어요
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-all hover:opacity-80"
                style={{
                  background: "var(--color-ivory)",
                  color: "var(--color-warm-gray)",
                  border: "1.5px solid var(--color-sand)",
                }}
              >
                취소
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: "#e05050" }}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {messageOverlay}
    </>
  );
}
