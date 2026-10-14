import express from "express";
import http from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type, LiveServerMessage, Modality } from "@google/genai";
import { WebSocketServer, WebSocket } from "ws";

dotenv.config();

const app = express();
const PORT = 3000;

// Support base64 image uploads from camera / card scanning
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "MediFile NG",
    timestamp: new Date().toISOString(),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// AI Paper Card / Clinic Folder Digitizer
app.post("/api/digitize-paper", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", textNotes = "" } = req.body;

    if (!imageBase64 && !textNotes) {
      return res.status(400).json({ error: "Please provide an image or text notes of the paper folder." });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: "Gemini API key is not configured. Please ensure GEMINI_API_KEY is set in settings.",
      });
    }

    const promptText = `
You are an expert Chief Health Information Management (HIM) Officer & Medical Records Registrar in a Nigerian General Hospital (e.g. LUTH, UCH, FMC Abuja, or State Specialist Hospital).
Examine this paper medical record / clinic intake card / manila folder cover / handwritten doctor clinical note sheet / laboratory slip.

Extract and transcribe all patient information accurately into the specified JSON format.
Pay special attention to Nigerian healthcare specifics:
- Hospital File Number format (e.g. UCH/2021/8920, LUTH/49201, FMC/ABJ/24/091, GH/IKJ/992)
- NIN (National Identification Number: 11 digits if found)
- NHIS / NHIA Number & HMO provider
- Nigerian state of origin / residence (e.g. Lagos, Oyo, Kano, Rivers, Anambra, Kaduna, Edo, etc.) and LGA
- Blood Group (A+, B+, AB+, O+, etc.) and Genotype (AA, AS, SS, AC, SC)
- Vitals if noted: BP (e.g. 120/80), Pulse, Temperature (°C), Weight (kg), SPO2
- Any physical folder location clues (e.g. Cabinet, Shelf, Drawer, Box, Rack)
- Doctor's handwriting / diagnosis / complaints (common in Nigeria: Malaria, Typhoid, HTN, Peptic Ulcer, Sickle Cell, URTI, Diabetes, Pelvic Inflammatory Disease, etc.)

If a field is illegible or not present, provide a reasonable empty string or null.
Also compute a transcriptionConfidence score between 0 and 100 based on legibility.
`;

    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

    if (imageBase64) {
      // Clean base64 header if present
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: cleanBase64,
        },
      });
    }

    if (textNotes) {
      parts.push({
        text: `Additional handwritten transcription notes provided by nurse/clerk: \n${textNotes}`,
      });
    }

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fullName: { type: Type.STRING, description: "Patient's full name (Surname First if indicated)" },
            fileNumber: { type: Type.STRING, description: "Hospital file number or registration code" },
            gender: { type: Type.STRING, description: "Male, Female, or Other" },
            age: { type: Type.STRING, description: "Age or Estimated Age (e.g. '34 yrs' or '4 months')" },
            dateOfBirth: { type: Type.STRING, description: "DOB if found (YYYY-MM-DD or DD/MM/YYYY)" },
            phone: { type: Type.STRING, description: "Nigerian phone number (e.g. 0803..., 0812...)" },
            residentialAddress: { type: Type.STRING, description: "Residential street address and area" },
            stateOfOrigin: { type: Type.STRING, description: "Nigerian State of Origin" },
            lga: { type: Type.STRING, description: "Local Government Area (LGA)" },
            nin: { type: Type.STRING, description: "11-digit National Identity Number if present" },
            nhisNumber: { type: Type.STRING, description: "NHIS / NHIA Insurance ID if present" },
            bloodGroup: { type: Type.STRING, description: "Blood Group: A+, A-, B+, B-, AB+, AB-, O+, O-" },
            genotype: { type: Type.STRING, description: "Genotype: AA, AS, SS, AC, SC" },
            nextOfKin: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                relationship: { type: Type.STRING },
                phone: { type: Type.STRING },
              },
            },
            physicalArchive: {
              type: Type.OBJECT,
              properties: {
                roomNumber: { type: Type.STRING },
                cabinet: { type: Type.STRING },
                shelfOrDrawer: { type: Type.STRING },
                folderColor: { type: Type.STRING },
              },
            },
            vitals: {
              type: Type.OBJECT,
              properties: {
                bp: { type: Type.STRING },
                temperature: { type: Type.STRING },
                pulse: { type: Type.STRING },
                weight: { type: Type.STRING },
                spo2: { type: Type.STRING },
              },
            },
            allergies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Known drug or food allergies (e.g. Penicillin, Sulfa, Septrin)",
            },
            chronicConditions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Chronic illnesses like Hypertension, Sickle Cell Disease, Asthma",
            },
            primaryDiagnosis: { type: Type.STRING, description: "Working diagnosis or chief presentation" },
            clinicalSummary: { type: Type.STRING, description: "Summary of past doctor notes, treatments, or prescriptions" },
            transcriptionConfidence: { type: Type.INTEGER, description: "Confidence score 0-100" },
            suggestedNextDepartment: {
              type: Type.STRING,
              description: "Suggested initial clinic queue (Records, Triage, GOPD, Antenatal, Pediatrics, Emergency)",
            },
          },
          required: ["fullName", "gender", "transcriptionConfidence"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error("Error digitizing paper record:", err);
    return res.status(500).json({
      error: err.message || "Failed to digitize paper record",
    });
  }
});

// Real-Time Google Search Grounded Clinical & Public Health Assistant
app.post("/api/assistant/search-grounded", async (req, res) => {
  try {
    const { query, conversationHistory = [] } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Please provide a query." });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: "Gemini API key is not configured. Please verify GEMINI_API_KEY.",
      });
    }

    const systemInstruction = `
You are the MediFile NG Clinical AI Intelligence & Public Health Consultant for Nigerian hospitals (Federal Medical Centres, Teaching Hospitals, and State General Hospitals).
You assist Nigerian doctors, medical officers, nurses, and pharmacists with:
1. Real-time updates on disease outbreaks in Nigeria (e.g. NCDC advisories on Lassa Fever, Cholera, Mpox, Diphtheria, Meningitis, Yellow Fever).
2. Standard treatment guidelines in Nigeria (e.g., National Antimalarial Treatment Policy - Artemether-Lumefantrine first-line, IV Artesunate for severe malaria; Typhoid / Widal interpretations; Sickle Cell Anemia crisis management protocols; Hypertension in Black African patients).
3. Drug-drug interactions and dosage calculations.
4. Explaining medical prescriptions clearly in Nigerian Pidgin, Hausa, Yoruba, or Igbo.
5. Verifying current health news and fact-checking medical claims with citations.

You MUST use Google Search to cite up-to-date sources, NCDC guidelines, WHO Africa advisories, and official medical literature. Provide concise, actionable bullet points with reference links whenever relevant.
`;

    // Construct contents
    const contents: any[] = [];
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory.slice(-6)) {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: query }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "No response generated.";
    // Extract search grounding metadata / citations if available
    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;
    const webSearchQueries = groundingMetadata?.webSearchQueries || [];
    const searchChunks = groundingMetadata?.groundingChunks || [];

    const sources = searchChunks
      .filter((chunk: any) => chunk.web?.uri)
      .map((chunk: any) => ({
        title: chunk.web.title || "Reference",
        url: chunk.web.uri
      }));

    return res.json({
      success: true,
      text,
      sources,
      webSearchQueries
    });
  } catch (err: any) {
    console.error("Error with search-grounded assistant:", err);
    return res.status(500).json({
      error: err.message || "Failed to process search-grounded query"
    });
  }
});

// Conversational Voice Assistant endpoint
app.post("/api/assistant/voice-chat", async (req, res) => {
  try {
    const { prompt, conversationHistory = [] } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing voice prompt" });
    }
    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({ error: "Gemini API key is not configured" });
    }

    const contents: any[] = [];
    if (Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory.slice(-8)) {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      }
    }
    contents.push({ role: "user", parts: [{ text: prompt }] });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction: `You are the MediFile NG Voice Assistant, an empathetic clinical consultant built for Nigerian healthcare workers and patients.
Speak in a warm, direct, conversational voice.
Explain treatments, diagnostic implications, dosages, or paper filing lookups clearly.
If the question is about medication instructions or patient counseling, include clear terms and simple Nigerian Pidgin counseling where beneficial.
Keep replies punchy and natural for spoken audio listening (2 to 4 sentences).`
      }
    });

    return res.json({
      success: true,
      text: response.text || "I am here to assist."
    });
  } catch (err: any) {
    console.error("Error with voice chat:", err);
    return res.status(500).json({ error: err.message || "Voice processing failed" });
  }
});

// Vite middleware or production static serving
async function startServer() {
  const server = http.createServer(app);

  // Gemini Live API WebSocket Bridge
  const wss = new WebSocketServer({ server, path: "/api/live-stream" });

  wss.on("connection", async (clientWs) => {
    console.log("Client connected to Gemini Live stream WebSocket");
    const ai = getGenAI();
    if (!ai) {
      clientWs.send(JSON.stringify({ error: "Gemini API key is not configured on the server." }));
      clientWs.close();
      return;
    }

    try {
      const session = await ai.live.connect({
        model: "gemini-3.8-live",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: `You are the MediFile NG Conversational Clinical Voice Assistant for Nigerian hospitals.
You assist Nigerian doctors, nurses, pharmacists, and medical records clerks.
Speak concisely, warmly, and clearly in natural conversational medical English with full awareness of Nigerian healthcare terminology, common drugs (e.g. Coartem, Paracetamol, Ciprofloxacin, Amalar, Rocephin, IV Artesunate), diseases (Malaria, Typhoid, Sickle cell, Cholera, Lassa fever), and hospital routines.
Keep your voice responses concise, conversational, and direct so clinical staff can listen during consultations.`,
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            const text = message.serverContent?.modelTurn?.parts?.[0]?.text;
            if (audio) {
              clientWs.send(JSON.stringify({ audio, text }));
            } else if (text) {
              clientWs.send(JSON.stringify({ text }));
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
          onclose: () => {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: "session_closed" }));
            }
          },
        },
      });

      clientWs.on("message", (raw) => {
        try {
          const msg = JSON.parse(raw.toString());
          if (msg.audio) {
            session.sendRealtimeInput({
              audio: { data: msg.audio, mimeType: "audio/pcm;rate=16000" },
            });
          } else if (msg.text) {
            session.sendClientContent({
              turns: [{ role: "user", parts: [{ text: msg.text }] }],
              turnComplete: true,
            });
          }
        } catch (e) {
          console.error("Error sending input to Gemini Live session:", e);
        }
      });

      clientWs.on("close", () => {
        try {
          session.close();
        } catch {}
      });
    } catch (err: any) {
      console.error("Error opening Gemini Live connection:", err);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ error: err.message || "Failed to establish Live session" }));
        clientWs.close();
      }
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`MediFile NG Server with Gemini Live running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
