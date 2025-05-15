import { useState, useEffect } from "react";

export const useTypewriter = (text: string, speed = 50, enabled = true) => {
  const [displayText, setDisplayText] = useState("");
  const [isCursorVisible, setIsCursorVisible] = useState(true);
  const [index, setIndex] = useState(0);

  // Reset when text changes or enabled status changes
  useEffect(() => {
    if (enabled) {
      setDisplayText("");
      setIndex(0);
      setIsCursorVisible(true);
    } else {
      // When disabled, immediately show full text and hide cursor
      setDisplayText(text);
      setIsCursorVisible(false);
    }
  }, [text, enabled]);

  // Only run the typing effect when enabled
  useEffect(() => {
    if (!enabled) return;

    if (index >= text.length) {
      setIsCursorVisible(false);
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayText((prev) => prev + text.charAt(index));
      setIndex((prev) => prev + 1);
    }, speed);

    return () => clearTimeout(timeout);
  }, [index, text, speed, enabled]);

  return { displayText, isCursorVisible };
};
