"use client";

import { useState, useEffect } from "react";
import { Volume2, Pause } from "lucide-react";

type TTSButtonProps = {
  text: string;
};

const TTSButton = ({ text }: TTSButtonProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speech, setSpeech] = useState<SpeechSynthesis | null>(null);

  useEffect(() => {
    const synth = window.speechSynthesis;
    setSpeech(synth);
    return () => {
      if (synth) {
        synth.cancel();
      }
    };
  }, []);

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      if (speech) {
        speech.cancel();
      }
      setIsSpeaking(false);
    } else {
      if (speech) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {
          setIsSpeaking(false);
        };
        speech.speak(utterance);
        setIsSpeaking(true);
      }
    }
  };

  return (
    <button
      onClick={handleToggleSpeech}
      className="text-sm inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-200 hover:bg-gray-50"
    >
      {isSpeaking ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      {isSpeaking ? "Stop" : "Speak"}
    </button>
  );
};

export default TTSButton;
