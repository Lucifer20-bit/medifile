import React, { useState } from "react";
import { X, Globe, Volume2, Search, CheckCircle2, MessageSquare } from "lucide-react";
import { NIGERIAN_CLINICAL_PHRASES } from "../lib/i18n";

interface LanguageGuideModalProps {
  onClose: () => void;
}

export const LanguageGuideModal: React.FC<LanguageGuideModalProps> = ({ onClose }) => {
  const [activeLanguage, setActiveLanguage] = useState<"pcm" | "ha" | "yo" | "ig">("pcm");
  const [filterText, setFilterText] = useState("");

  const playSpeech = (text: string) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const filteredPhrases = NIGERIAN_CLINICAL_PHRASES.filter((p) => {
    const q = filterText.toLowerCase();
    return (
      p.english.toLowerCase().includes(q) ||
      p.pidgin.toLowerCase().includes(q) ||
      p.hausa.toLowerCase().includes(q) ||
      p.yoruba.toLowerCase().includes(q) ||
      p.igbo.toLowerCase().includes(q) ||
      p.context.toLowerCase().includes(q)
    );
  });

  const getLanguageName = (code: string) => {
    switch (code) {
      case "pcm": return "Nigerian Pidgin";
      case "ha": return "Hausa";
      case "yo": return "Yorùbá";
      case "ig": return "Igbo";
      default: return code;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Nigerian Clinical Language & Consultation Phrases
              </h2>
              <p className="text-xs text-slate-400">
                Overcoming clinic communication barriers for doctors, nurses, and patients across Nigeria
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Tabs & Filter */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-0.5 text-xs overflow-x-auto">
            <button
              onClick={() => setActiveLanguage("pcm")}
              className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                activeLanguage === "pcm" ? "bg-emerald-700 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Pidgin (Naija)
            </button>
            <button
              onClick={() => setActiveLanguage("ha")}
              className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                activeLanguage === "ha" ? "bg-emerald-700 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Hausa
            </button>
            <button
              onClick={() => setActiveLanguage("yo")}
              className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                activeLanguage === "yo" ? "bg-emerald-700 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Yorùbá
            </button>
            <button
              onClick={() => setActiveLanguage("ig")}
              className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                activeLanguage === "ig" ? "bg-emerald-700 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Igbo
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search phrases (e.g. pain, food, fever)..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full sm:w-56 pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600 font-medium"
            />
          </div>
        </div>

        {/* Phrases List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {filteredPhrases.map((item, idx) => {
            let translation = item.pidgin;
            if (activeLanguage === "ha") translation = item.hausa;
            if (activeLanguage === "yo") translation = item.yoruba;
            if (activeLanguage === "ig") translation = item.igbo;

            return (
              <div
                key={idx}
                className="bg-slate-50 hover:bg-emerald-50/40 p-3.5 rounded-xl border border-slate-200 transition-colors flex items-start justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded-full uppercase">
                      {item.context}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">English: "{item.english}"</span>
                  </div>

                  <p className="text-sm font-bold text-slate-900 pt-0.5">
                    "{translation}"
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Language: <span className="font-semibold text-slate-700">{getLanguageName(activeLanguage)}</span>
                  </p>
                </div>

                <button
                  onClick={() => playSpeech(translation)}
                  className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-white rounded-lg border border-slate-200 shadow-2xs transition-colors shrink-0"
                  title="Play audio speech"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
