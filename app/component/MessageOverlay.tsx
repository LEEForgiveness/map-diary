import React from "react";

export default function MessageOverlay({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl px-8 py-6 min-w-60 flex flex-col items-center">
        <div className="text-gray-800 text-base mb-6 text-center">
          {message}
        </div>
        <button
          onClick={onClose}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg"
        >
          확인
        </button>
      </div>
    </div>
  );
}
