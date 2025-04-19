"use client";

import { PulseLoader } from "react-spinners";
import { useEffect, useRef, useState } from "react";

export default function WriteWithMe() {
  const [input, setInput] = useState<string>("");
  const [suggestion, setSuggestion] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestion = async (text: string) => {
    if (!text.trim()) {
      setSuggestion("");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/gemini-autocomplete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: text }),
      });

      const data = await res.json();
      setSuggestion(data.suggestion || "");
    } catch (err) {
      console.error("Error fetching suggestion:", err);
      setSuggestion("");
    } finally {
      setIsLoading(false);
    }
  };

  const resizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;

    setInput(value);
    setSuggestion("");

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Only fetch suggestion if cursor is at the end
    // feature
    if (cursorPosition === value.length) {
      debounceTimeout.current = setTimeout(() => {
        fetchSuggestion(value);
      }, 1000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isAcceptKey = e.key === "Tab" || e.key === "Enter";

    if (isAcceptKey && suggestion) {
      e.preventDefault();
      setInput((prev) => prev + suggestion);
      setSuggestion("");
    }
  };

  useEffect(() => {
    resizeTextarea();
  }, [input]);

  return (
    <div className="mx-auto mt-10 p-6 bg-white rounded-xl shadow-sm">
      <label className="block text-xl font-semibold mb-4 text-gray-800">
        ✍️ Write with me
      </label>
      <div className="relative">
        <div
          className="absolute top-[1px] left-0 w-full text-gray-400 font-mono whitespace-pre-wrap break-words pointer-events-none p-3 leading-relaxed"
          aria-hidden="true"
        >
          <div className="inline-block">
            <span className="invisible">{input}</span>
            <PulseLoader
              color={"gray"}
              loading={isLoading}
              size={4}
              className="mt-[1px]"
              aria-label="Loading Spinner"
              data-testid="loader"
            />
            <span>{suggestion}</span>
          </div>
        </div>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          className="w-full resize-none p-3 pb-10 font-mono text-gray-900 bg-transparent border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 leading-relaxed"
          placeholder="Start typing..."
        />
      </div>
    </div>
  );
}
