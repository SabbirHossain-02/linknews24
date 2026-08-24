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

const BANGLA = /[ঀ-৿]/;

function voiceFor(prefix: string): SpeechSynthesisVoice | null {
  return (
    window.speechSynthesis
      .getVoices()
      .find((v) => v.lang.toLowerCase().startsWith(prefix)) ?? null
  );
}

/**
 * Split the copy into Bangla and non-Bangla runs.
 *
 * An article is usually Bangla with English names, numbers and quotes mixed in.
 * A single utterance can only carry one voice, so reading the whole thing with
 * one voice is what made Bangla come out wrong: an English engine handed
 * Bengali letters simply skips them. Each run is spoken by the engine that can
 * actually pronounce it.
 */
function splitRuns(text: string): { text: string; bangla: boolean }[] {
  const runs: { text: string; bangla: boolean }[] = [];
  for (const part of text.split(/(s+)/)) {
    if (!part) continue;
    const bangla = BANGLA.test(part);
    const last = runs[runs.length - 1];
    // Whitespace joins whichever run it follows, so words are not chopped up.
    if (last && (last.bangla === bangla || !part.trim())) last.text += part;
    else runs.push({ text: part, bangla });
  }
  return runs.filter((r) => r.text.trim().length > 0);
}

export interface ReadAloud {
  supported: boolean;
  speaking: boolean;
  toggle: () => void;
  notice: string | null;
  dismissNotice: () => void;
}

export function useReadAloud(editor: Editor | null): ReadAloud {
  const [speaking, setSpeaking] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
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
    window.speechSynthesis.cancel();

    // Read the selection if there is one, otherwise the whole article.
    const { from, to, empty } = editor.state.selection;
    const text = empty
      ? editor.state.doc.textBetween(0, editor.state.doc.content.size, "\n")
      : editor.state.doc.textBetween(from, to, "\n");
    if (!text.trim()) return;

    const bn = voiceFor("bn");
    const en = voiceFor("en");
    const runs = splitRuns(text);

    // Be straight about it rather than reading Bengali with an English engine
    // and letting it come out as silence.
    if (runs.some((r) => r.bangla) && !bn) {
      setNotice(
        "এই কম্পিউটারে বাংলা ভয়েস ইন্সটল করা নেই, তাই বাংলা অংশটুকু পড়া যাচ্ছে না। " +
          "Windows Settings → Time & language → Speech → Manage voices → Add voices " +
          "থেকে বাংলা যোগ করলে এখানেই কাজ করবে।",
      );
    } else {
      setNotice(null);
    }

    // Drop only what no installed engine can pronounce.
    const queue = runs.filter((r) => (r.bangla ? bn : en) !== null);
    if (!queue.length) return;

    let index = 0;
    const next = () => {
      if (index >= queue.length) {
        setSpeaking(false);
        return;
      }
      const run = queue[index];
      index += 1;
      const utterance = new SpeechSynthesisUtterance(run.text);
      const voice = run.bangla ? bn : en;
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      }
      // Bangla reads more clearly a shade slower than English does.
      utterance.rate = run.bangla ? 0.9 : 1;
      utterance.onend = next;
      utterance.onerror = next;
      window.speechSynthesis.speak(utterance);
    };

    setSpeaking(true);
    next();
  }, [editor, supported]);

  return {
    supported,
    speaking,
    toggle,
    notice,
    dismissNotice: () => setNotice(null),
  };
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
