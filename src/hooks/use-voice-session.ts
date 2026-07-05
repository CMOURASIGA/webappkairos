"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { OrbState } from "@/types/domain";

declare global {
  interface SpeechRecognition extends EventTarget {
    lang: string;
    interimResults: boolean;
    continuous: boolean;
    onstart: (() => void) | null;
    onend: (() => void) | null;
    onerror: (() => void) | null;
    onresult: ((event: Event & { results: SpeechRecognitionResultList }) => void | Promise<void>) | null;
    start: () => void;
    stop: () => void;
  }

  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

export function useVoiceSession({
  onTranscript,
  onAnswer,
}: {
  onTranscript: (transcript: string) => void;
  onAnswer: (transcript: string) => Promise<void>;
}) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [orbState, setOrbState] = useState<OrbState>("Idle");
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!Recognition) {
      setSupported(false);
      return;
    }

    setSupported(true);
    const recognition = new Recognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => {
      setListening(true);
      setOrbState("Listening");
    };

    recognition.onend = () => {
      setListening(false);
      setOrbState("Idle");
    };

    recognition.onerror = () => {
      setOrbState("Error");
      toast.error("Falha na captura de voz.");
    };

    recognition.onresult = async (event: Event & { results: SpeechRecognitionResultList }) => {
      const text = Array.from({ length: event.results.length }, (_, index) => event.results[index])
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();

      setTranscript(text);
      onTranscript(text);

      const lastResult = event.results[event.results.length - 1];
      if (lastResult?.isFinal && text) {
        setOrbState("Thinking");
        await onAnswer(text);
        setTranscript("");
        setOrbState("Answering");
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [onAnswer, onTranscript]);

  const controls = useMemo(
    () => ({
      start() {
        if (!recognitionRef.current || muted) {
          return;
        }
        recognitionRef.current.start();
      },
      stop() {
        recognitionRef.current?.stop();
      },
      interrupt() {
        speechSynthesis.cancel();
        recognitionRef.current?.stop();
        setOrbState("Listening");
      },
      speak(text: string) {
        if (muted) {
          return;
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "pt-BR";
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.onend = () => setOrbState("Idle");
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
      },
      toggleMute() {
        setMuted((current) => !current);
      },
    }),
    [muted],
  );

  return {
    supported,
    listening,
    transcript,
    orbState,
    muted,
    ...controls,
  };
}
