"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";

/**
 * Word's Read Aloud and Dictate, built on the browser's own speech engines.
 *
 * Both are free and need no key or server — `speechSynthesis` for reading out,
 * `SpeechRecognition` for dictation. Neither is universal, so both hooks report
 * whether they are usable and the ribbon hides what the browser cannot do
 * rather than offering a button that fails.
 */

/** Prefers a Bangla voice, since that is what the copy is written in. */
function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith("bn")) ??
    voices.find((v) => v.lang.toLowerCase().startsWith("en")) ??
    voices[0] ??
    null
  );
}

export function useReadAloud(editor: Editor | null) {
  const [speaking, setSpeaking] = useState(false);
  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  // Voices load asynchronously in Chrome; touching the list primes it.
  useEffect(() => {
    if (!supported) return;
    window.speechSynthesis.getVoices();
    const onVoices = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener("voiceschanged", onVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  const toggle = useCallback(() => {
    if (!supported || !editor) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    // Read the selection if there is one, otherwise the whole article.
    const { from, to, empty } = editor.state.selection;
    const text = empty
      ? editor.state.doc.textBetween(0, editor.state.doc.content.size, "\n")
      : editor.state.doc.textBetween(from, to, "\n");
    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = pickVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }, [editor, supported]);

  return { supported, speaking, toggle };
}

// SpeechRecognition is not in TypeScript's DOM lib.
interface RecognitionResult {
  isFinal: boolean;
  0: { transcript: string };
}
interface RecognitionEvent {
  resultIndex: number;
  results: { length: number; [i: number]: RecognitionResult };
}
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: RecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useDictate(editor: Editor | null) {
  const [listening, setListening] = useState(false);
  const ref = useRef<Recognition | null>(null);
  const supported = recognitionCtor() !== null;

  const toggle = useCallback(() => {
    const Ctor = recognitionCtor();
    if (!Ctor || !editor) return;

    if (ref.current) {
      ref.current.stop();
      ref.current = null;
      setListening(false);
      return;
    }

    const recognition = new Ctor();
    recognition.lang = "bn-BD";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      // Only final results are inserted — interim text would flicker into the
      // document and then have to be taken back out.
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          editor.chain().focus().insertContent(result[0].transcript + " ").run();
        }
      }
    };
    recognition.onend = () => {
      ref.current = null;
      setListening(false);
    };
    recognition.onerror = () => {
      ref.current = null;
      setListening(false);
    };

    recognition.start();
    ref.current = recognition;
    setListening(true);
  }, [editor]);

  useEffect(() => () => ref.current?.stop(), []);

  return { supported, listening, toggle };
}
