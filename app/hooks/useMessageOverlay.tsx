"use client";

import { useCallback, useMemo, useState } from "react";
import MessageOverlay from "../component/MessageOverlay";

export function useMessageOverlay() {
  const [message, setMessage] = useState<string | null>(null);
  const [afterClose, setAfterClose] = useState<(() => void) | null>(null);

  const showMessage = useCallback(
    (text: string, onClose?: () => void) => {
      setMessage(text);
      setAfterClose(() => onClose ?? null);
    },
    []
  );

  const handleClose = useCallback(() => {
    const callback = afterClose;
    setMessage(null);
    setAfterClose(null);
    callback?.();
  }, [afterClose]);

  const overlay = useMemo(
    () =>
      message ? (
        <MessageOverlay message={message} onClose={handleClose} />
      ) : null,
    [handleClose, message]
  );

  return { showMessage, overlay };
}
