"use client";
import { useEffect, useState } from "react";
import { AddPhoto, DeletePhotos, UpdatePhoto } from "../api/photo";
import supabase from "../utils/supabaseConfig";
import { useMessageOverlay } from "../hooks/useMessageOverlay";

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
  const [preview, setPreview] = useState<string | null>(
    photo?.photo_url ?? null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    (photo?.date ? new Date(photo.date) : new Date())
      .toISOString()
      .split("T")[0]
  );
  const [isShared, setIsShared] = useState(photo?.shared ?? false);
  const isEditMode = !!photo;
  const { showMessage, overlay: messageOverlay } = useMessageOverlay();

  useEffect(() => {
    if (!photo) {
      return;
    }
    setDescription(photo.description ?? "");
    setPreview(photo.photo_url ?? null);
    setSelectedDate(
      (photo.date ? new Date(photo.date) : new Date())
        .toISOString()
        .split("T")[0]
    );
    setIsShared(photo.shared ?? false);
    setFile(null);
  }, [photo]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!isEditMode && !file) {
      showMessage("사진을 선택해주세요");
      return;
    }

    setIsUploading(true);
    try {
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
          },
          file ?? undefined
        );
        await onPhotoUpdated?.();
        showMessage("사진이 수정되었습니다", onClose);
      } else if (file) {
        await AddPhoto(session, file, {
          description,
          lat: position.lat,
          lng: position.lng,
          date: new Date(selectedDate).toISOString(),
          shared: isShared,
        });
        await onPhotoAdded?.();
        showMessage("사진이 추가되었습니다", onClose);
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      showMessage(
        isEditMode ? "사진 수정에 실패했습니다" : "사진 업로드에 실패했습니다"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (isEditMode && photo) {
      const confirmDelete = confirm("정말로 이 사진을 삭제하시겠습니까?");
      if (!confirmDelete) {
        return;
      }
      await DeletePhotos(photo.id, photo.photo_url ?? "");
      await onPhotoUpdated?.();
      onClose();
    }
  };

  return (
    <>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-xl p-6 min-w-[400px]"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            {isEditMode ? "사진 수정하기" : "사진 추가하기"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              사진 선택
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {preview && (
            <div className="mt-4">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              날짜 선택
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="사진에 대한 설명을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={isUploading || (!isEditMode && !file)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg"
            >
              {isUploading
                ? isEditMode
                  ? "수정 중..."
                  : "업로드 중..."
                : isEditMode
                ? "수정하기"
                : "추가하기"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg"
            >
              취소
            </button>
          </div>

          <div className="text-xs text-gray-500 space-y-2">
            <p>
              위치: {parseFloat(position.lat)}, {parseFloat(position.lng)}
            </p>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isShared}
                onChange={(e) => setIsShared(e.target.checked)}
                className="mr-2"
              />
              <label className="text-sm text-gray-600">다른 사람과 공유</label>
              {isEditMode ? (
                <button
                  className="ml-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg"
                  onClick={handleDelete}
                >
                  삭제
                </button>
              ) : null}
            </div>
            <p className="text-xs text-gray-400">
              *다른 사람과 공유된 사진은 모두가 볼 수 있습니다.
            </p>
          </div>
        </div>
      </div>
      {messageOverlay}
    </>
  );
}
