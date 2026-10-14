import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Sparkles, 
  Globe, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  ExternalLink, 
  Search, 
  AlertCircle,
  Radio,
  PhoneCall,
  PhoneOff,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  Info
} from "lucide-react";

interface SearchSource {
  title: string;
  url: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  sources?: SearchSource[];
  webSearchQueries?: string[];
  timestamp: string;
}

interface ClinicalSearchAgentModalProps {
  onClose: () => void;
}

// Convert Float32 to 16-bit linear PCM ArrayBuffer
function floatTo16BitPCM(input: Float32Array): ArrayBuffer {
  const output = new DataView(new ArrayBuffer(input.length * 2));
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return output.buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Convert base64 linear PCM 24kHz to Float32Array
function base64To16BitPCM(base64: string): Float32Array {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const dataView = new DataView(bytes.buffer);
  const float32 = new Float32Array(len / 2);
  for (let i = 0; i < float32.length; i++) {
    const int16 = dataView.getInt16(i * 2, true);
    float32[i] = int16 / 32768.0;
  }
  return float32;
}

export const ClinicalSearchAgentModal: React.FC<ClinicalSearchAgentModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<"search" | "live_voice">("live_voice");

  // Search Grounded Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      text: "Hello, Doctor. I am your MediFile NG Clinical AI Assistant, connected to real-time Google Search and Nigerian medical protocols. You can ask me verbally or in writing about current disease outbreak advisories (NCDC Lassa Fever, Cholera, Mpox), standard dosage guidelines, drug interactions, or translation of instructions to Pidgin.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoVoiceReply, setAutoVoiceReply] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Gemini Live Voice Call State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [liveStatus, setLiveStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [liveErrorMessage, setLiveErrorMessage] = useState("");
  const [liveConversation, setLiveConversation] = useState<Array<{ sender: "user" | "gemini"; text: string }>>([
    {
      sender: "gemini",
      text: "MediFile NG Voice link ready. Tap 'Start Live Voice Call' to speak directly with Gemini Live."
    }
  ]);
  const [audioLevel, setAudioLevel] = useState(0);

  // Audio Context References
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Clean up WebAudio & WebSocket on unmount
  useEffect(() => {
    return () => {
      endLiveSession();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Quick preset clinical questions
  const quickPrompts = [
    "What are the latest NCDC advisories on Lassa Fever and Cholera outbreaks in Nigeria?",
    "First-line antimalarial treatment guidelines in pregnancy (Nigeria National Policy)?",
    "Adult fluid resuscitation and analgesic protocol for Sickle Cell pain crisis",
    "How to counsel a patient taking Artemether-Lumefantrine in Nigerian Pidgin?",
    "Fact-check: What should patients know about fake or counterfeit paracetamol syrups?"
  ];

  // Voice Text-to-Speech (TTS)
  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/[*#_`]/g, "")
      .replace(/\[.*?\]\(.*?\)/g, "")
      .slice(0, 350);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Mic Dictation for Search Chat
  const toggleDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type your query.");
      return;
    }

    if (isDictating) {
      setIsDictating(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-NG";

      recognition.onstart = () => setIsDictating(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsDictating(false);
      };
      recognition.onerror = () => setIsDictating(false);
      recognition.onend = () => setIsDictating(false);
      recognition.start();
    } catch (e) {
      console.error("Speech Recognition error", e);
      setIsDictating(false);
    }
  };

  // Grounded Search Handler
  const handleSendMessage = async (queryText?: string) => {
    const query = queryText || inputText;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/assistant/search-grounded", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          conversationHistory: messages.map((m) => ({ role: m.role, text: m.text }))
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI assistant");
      }

      const data = await response.json();
      const modelMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "model",
        text: data.text || "No response received.",
        sources: data.sources || [],
        webSearchQueries: data.webSearchQueries || [],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, modelMsg]);

      if (autoVoiceReply) {
        speakText(modelMsg.text);
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "model",
        text: "Could not retrieve real-time search results right now. Please ensure your GEMINI_API_KEY is configured in settings or check your network connection.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- GEMINI LIVE API IMPLEMENTATION ---
  const startLiveSession = async () => {
    setLiveErrorMessage("");
    setLiveStatus("connecting");

    try {
      // 1. Output audio context (24kHz for Gemini Live model output playback)
      const outputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000
      });
      outputAudioCtxRef.current = outputAudioCtx;

      // 2. Input audio context (16kHz for mic capture)
      const inputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000
      });
      inputAudioCtxRef.current = inputAudioCtx;

      // 3. User media stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // 4. WebSocket setup
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/live-stream`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setLiveStatus("connected");
        setIsLiveActive(true);
        setLiveConversation((prev) => [
          ...prev,
          { sender: "gemini", text: "🟢 Live voice session connected. Start speaking..." }
        ]);

        // Connect mic stream
        const source = inputAudioCtx.createMediaStreamSource(stream);
        const processor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
        scriptProcessorRef.current = processor;

        processor.onaudioprocess = (e) => {
          const inputChannel = e.inputBuffer.getChannelData(0);

          // Calculate audio level for waveform visualizer
          let sum = 0;
          for (let i = 0; i < inputChannel.length; i++) {
            sum += Math.abs(inputChannel[i]);
          }
          const avg = sum / inputChannel.length;
          setAudioLevel(Math.min(100, Math.round(avg * 400)));

          // Convert to 16-bit PCM and send to Gemini Live WebSocket
          if (ws.readyState === WebSocket.OPEN) {
            const pcmBuffer = floatTo16BitPCM(inputChannel);
            const base64Audio = arrayBufferToBase64(pcmBuffer);
            ws.send(JSON.stringify({ audio: base64Audio }));
          }
        };

        source.connect(processor);
        processor.connect(inputAudioCtx.destination);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.error) {
            setLiveErrorMessage(data.error);
            setLiveStatus("error");
          }

          if (data.text) {
            setLiveConversation((prev) => [...prev, { sender: "gemini", text: data.text }]);
          }

          if (data.audio) {
            // Play back PCM 24kHz audio chunk from Gemini Live
            playLiveAudioChunk(outputAudioCtx, data.audio);
          }
        } catch (e) {
          console.error("Error parsing live message", e);
        }
      };

      ws.onerror = (err) => {
        console.error("Live WebSocket error", err);
        setLiveStatus("error");
        setLiveErrorMessage("WebSocket connection failed. Falling back to voice assistant.");
      };

      ws.onclose = () => {
        setLiveStatus("idle");
        setIsLiveActive(false);
      };
    } catch (err: any) {
      console.error("Live session start error:", err);
      setLiveStatus("error");
      setLiveErrorMessage(err.message || "Failed to initialize microphone or Live API");
    }
  };

  const playLiveAudioChunk = (audioCtx: AudioContext, base64Pcm: string) => {
    try {
      const float32 = base64To16BitPCM(base64Pcm);
      const buffer = audioCtx.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.start();
    } catch (e) {
      console.error("Error playing audio chunk", e);
    }
  };

  const endLiveSession = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close();
      outputAudioCtxRef.current = null;
    }
    setIsLiveActive(false);
    setLiveStatus("idle");
    setAudioLevel(0);
  };

  // Send quick voice text input into the Live session
  const [liveTextInput, setLiveTextInput] = useState("");
  const handleSendLiveText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveTextInput.trim()) return;
    const textToSend = liveTextInput.trim();
    setLiveTextInput("");

    setLiveConversation((prev) => [...prev, { sender: "user", text: textToSend }]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text: textToSend }));
    } else {
      // Fallback to voice-chat REST endpoint
      try {
        const res = await fetch("/api/assistant/voice-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: textToSend })
        });
        const data = await res.json();
        if (data.text) {
          setLiveConversation((prev) => [...prev, { sender: "gemini", text: data.text }]);
          speakText(data.text);
        }
      } catch (err: any) {
        console.error(err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  MediFile NG Clinical AI
                </h2>
                <span className="bg-blue-900/80 text-blue-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-blue-700 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-blue-400 animate-pulse" />
                  Gemini Live API & Google Search
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Real-time conversational voice experience & live outbreak intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher Tabs */}
            <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-700">
              <button
                onClick={() => setActiveTab("live_voice")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "live_voice"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <PhoneCall className="w-3 h-3" />
                <span>Gemini Live Voice</span>
              </button>
              <button
                onClick={() => setActiveTab("search")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "search"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Globe className="w-3 h-3" />
                <span>Search Grounding</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB 1: GEMINI LIVE API CONVERSATIONAL VOICE CALL */}
        {activeTab === "live_voice" && (
          <div className="flex-1 flex flex-col bg-slate-950 text-white p-6 justify-between overflow-y-auto">
            {/* Live Call Stage Header */}
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">
                <span className={`w-2 h-2 rounded-full ${isLiveActive ? "bg-emerald-500 animate-ping" : "bg-slate-500"}`} />
                <span>
                  {liveStatus === "connected"
                    ? "Live Voice Channel Connected (16kHz in • 24kHz out)"
                    : liveStatus === "connecting"
                    ? "Connecting to Gemini Live API..."
                    : "Gemini Live Voice Session Ready"}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Hands-Free Conversational Voice Call
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Speak naturally with Gemini Live to look up drug dosages, discuss patient symptoms, review Nigerian NCDC protocols, or translate instructions without looking away from your patient.
              </p>
            </div>

            {/* Central Animated Audio Visualizer */}
            <div className="my-6 flex flex-col items-center justify-center space-y-6">
              <div className="relative flex items-center justify-center">
                {/* Visualizer Pulsing Glow */}
                <div
                  className={`w-36 h-36 rounded-full transition-all duration-300 flex items-center justify-center ${
                    isLiveActive
                      ? "bg-blue-600/30 ring-8 ring-blue-500/20 scale-105"
                      : "bg-slate-800/40 ring-4 ring-slate-800"
                  }`}
                >
                  <button
                    onClick={isLiveActive ? endLiveSession : startLiveSession}
                    disabled={liveStatus === "connecting"}
                    className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all cursor-pointer ${
                      isLiveActive
                        ? "bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-500/50 scale-105"
                        : "bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white"
                    }`}
                    title={isLiveActive ? "End Call" : "Start Live Voice Call"}
                  >
                    {isLiveActive ? (
                      <PhoneOff className="w-8 h-8 animate-pulse" />
                    ) : (
                      <PhoneCall className="w-8 h-8" />
                    )}
                  </button>
                </div>
              </div>

              {/* Dynamic Equalizer Bars */}
              <div className="flex items-center gap-1.5 h-10">
                {[40, 65, 90, 75, 50, 85, 60, 95, 45, 70].map((h, i) => {
                  const activeHeight = isLiveActive ? Math.max(10, Math.min(100, audioLevel + (h % 30))) : 8;
                  return (
                    <div
                      key={i}
                      style={{ height: `${activeHeight}%` }}
                      className={`w-1.5 rounded-full transition-all duration-100 ${
                        isLiveActive
                          ? "bg-gradient-to-t from-blue-600 to-emerald-400"
                          : "bg-slate-800"
                      }`}
                    />
                  );
                })}
              </div>

              {liveStatus === "error" && (
                <div className="bg-rose-950/80 border border-rose-800 text-rose-300 p-3 rounded-xl text-xs max-w-md text-center">
                  <AlertCircle className="w-4 h-4 inline mr-1 text-rose-400" />
                  {liveErrorMessage || "Live API session encountered an issue."}
                </div>
              )}
            </div>

            {/* Live Conversation Stream Transcript */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 max-h-48 overflow-y-auto space-y-2 text-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span>Live Voice Dialogue Transcript</span>
                <span className="text-emerald-400 font-mono">Gemini 3.1 Live Preview</span>
              </div>
              <div className="space-y-2">
                {liveConversation.slice(-4).map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2 ${
                      msg.sender === "user" ? "text-blue-300" : "text-slate-200"
                    }`}
                  >
                    <span className="font-bold shrink-0 text-[10px] uppercase">
                      {msg.sender === "user" ? "Doctor:" : "Gemini:"}
                    </span>
                    <span className="leading-relaxed">{msg.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Text / Command Box */}
            <form onSubmit={handleSendLiveText} className="mt-4 flex items-center gap-2">
              <input
                type="text"
                value={liveTextInput}
                onChange={(e) => setLiveTextInput(e.target.value)}
                placeholder="Type a clinical query into the voice session (or speak aloud)..."
                className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: GOOGLE SEARCH GROUNDED ASSISTANT */}
        {activeTab === "search" && (
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            {/* Chat History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs bg-slate-50/70">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-2xl rounded-2xl p-4 shadow-2xs space-y-2.5 ${
                      msg.role === "user"
                        ? "bg-slate-900 text-white rounded-br-none"
                        : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[10px] opacity-75">
                      <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                        {msg.role === "user" ? "Medical Officer" : "Clinical AI (Search Grounded)"}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div className="whitespace-pre-wrap leading-relaxed font-sans text-xs">
                      {msg.text}
                    </div>

                    {/* Search Queries Executed */}
                    {msg.webSearchQueries && msg.webSearchQueries.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                        <span className="font-bold">Grounding Search: </span>
                        {msg.webSearchQueries.join(" • ")}
                      </div>
                    )}

                    {/* Sources and External Citations */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Live Verified Sources & Citations:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.sources.map((src, idx) => (
                            <a
                              key={idx}
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded border border-blue-200 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              <span className="max-w-[180px] truncate">{src.title}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Read aloud button for model response */}
                    {msg.role === "model" && (
                      <div className="pt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => speakText(msg.text)}
                          className="text-[10px] text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                          title="Read response aloud"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Speak</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-3.5 flex items-center gap-2 shadow-2xs">
                    <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
                    <span className="text-xs text-slate-600 font-medium">
                      Searching live medical literature, NCDC advisories, and clinical guidelines...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Preset Prompt Suggestions */}
            <div className="px-4 py-2 bg-white border-t border-slate-200 shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                  Suggestions:
                </span>
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isLoading}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-full text-[11px] text-slate-700 whitespace-nowrap transition-colors cursor-pointer shrink-0"
                  >
                    {prompt.length > 45 ? prompt.slice(0, 45) + "..." : prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar with Voice Dictation */}
            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={toggleDictation}
                  className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                    isDictating
                      ? "bg-rose-600 text-white border-rose-700 animate-pulse"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300"
                  }`}
                  title={isDictating ? "Listening... click to stop" : "Speak into microphone"}
                >
                  {isDictating ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  placeholder={isDictating ? "Listening to your voice..." : "Ask clinical question, drug check, or NCDC advisory..."}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 p-2.5 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-xs shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask Agent</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
