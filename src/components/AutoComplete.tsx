"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Textfield } from "./Textfield";
import { cn } from "@/lib/utils";
import axios from "axios";

interface Suggestion {
  text: string;
}

const GeminiAutocomplete = () => {
  const [inputText, setInputText] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionListRef = useRef<HTMLUListElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const justSelectedRef = useRef(false);

  const fetchSuggestions = useCallback(async (text: string) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `/api/gemini-autocomplete?text=${encodeURIComponent(text)}`
      );
      const data = response.data;
      setSuggestions(data.suggestions || []);
      setIsSuggestionOpen((data.suggestions || []).length > 0);
      setFocusedIndex(null);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
      setIsSuggestionOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    if (inputText.trim() === "") {
      setSuggestions([]);
      setIsSuggestionOpen(false);
      return;
    }

    typingTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(inputText);
    }, 800);

    return () => clearTimeout(typingTimeoutRef.current!);
  }, [inputText, fetchSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    justSelectedRef.current = true;

    const lastWordMatch = inputText.match(/(\S+)$/);
    const lastWord = lastWordMatch ? lastWordMatch[0] : "";

    const suggestionStartsWithLastWord = suggestion.startsWith(lastWord);

    let completedText = "";

    if (suggestionStartsWithLastWord) {
      completedText = inputText.slice(0, -lastWord.length) + suggestion;
    } else {
      // Normal concatenation
      completedText = inputText.trimEnd() + " " + suggestion.trimStart();
    }

    setInputText(completedText);
    setSuggestions([]);
    setIsSuggestionOpen(false);

    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSuggestionOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) =>
        prev === null ? 0 : Math.min(prev + 1, suggestions.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) =>
        prev === null ? suggestions.length - 1 : Math.max(prev - 1, 0)
      );
    } else if (e.key === "Enter" && focusedIndex !== null) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[focusedIndex].text);
    } else if (e.key === "Escape") {
      setIsSuggestionOpen(false);
      setSuggestions([]);
      setFocusedIndex(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionListRef.current &&
        !suggestionListRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsSuggestionOpen(false);
        setSuggestions([]);
        setFocusedIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <Textfield
        type="text"
        value={inputText}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Type something..."
        className="pr-10 text-black placeholder-gray-500"
      />

      {isLoading && (
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-gray-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      <AnimatePresence>
        {isSuggestionOpen && (
          <motion.ul
            ref={suggestionListRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg"
          >
            {suggestions.map((s, i) => (
              <motion.li
                key={s.text}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                className={cn(
                  "px-4 py-2 cursor-pointer text-gray-800 hover:bg-gray-100",
                  i === focusedIndex && "bg-gray-200 font-semibold"
                )}
                onClick={() => handleSelectSuggestion(s.text)}
              >
                {s.text}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GeminiAutocomplete;
