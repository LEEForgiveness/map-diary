"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import MessageOverlay from "../component/MessageOverlay";

export function useMessageOverlay() {
  const [message, setMessage] = useState<string | null>(null);
  const [onCloseCallback, setOnCloseCallback] = useState<(() => void) | null>(
    null
  );
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showMessage = (msg: string, callback?: () => void) => {
    setMessage(msg);
    setOnCloseCallback(() => callback || null);
  };

  const handleClose = () => {
    setMessage(null);
    if (onCloseCallback) {
      onCloseCallback();
      setOnCloseCallback(null);
    }
  };

  const overlay =
    message && isMounted
      ? createPortal(
          <MessageOverlay message={message} onClose={handleClose} />,
          document.body
        )
      : null;

  return { showMessage, overlay };
}
