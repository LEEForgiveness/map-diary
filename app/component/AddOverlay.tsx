import React from "react";

export default function AddOverlay({ onClose }: { onClose?: () => void }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-gray-300 min-w-[200px]">
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
      <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full">
        추가하기
      </button>
    </div>
  );
}
