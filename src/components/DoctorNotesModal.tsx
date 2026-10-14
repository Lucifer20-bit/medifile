import React, { useState, useEffect } from "react";
import { 
  X, 
  Stethoscope, 
  Mic, 
  MicOff, 
  CheckCircle2, 
  Save, 
  Sparkles, 
  AlertCircle, 
  Pill, 
  Flame, 
  Clock,
  FileEdit
} from "lucide-react";
import { Patient, ConsultationNote } from "../types";
import { 
  addConsultationNoteToPatient, 
  getActiveStaff, 
  getHospitalConfig 
} from "../lib/storage";
import { COMMON_DIAGNOSES } from "../data/nigeriaLocations";

interface DoctorNotesModalProps {
  patient: Patient;
  onClose: () => void;
  onNoteAdded?: () => void;
  onOpenPrescriptionForPatient?: (patient: Patient) => void;
}

export const DoctorNotesModal: React.FC<DoctorNotesModalProps> = ({
  patient,
  onClose,
  onNoteAdded,
  onOpenPrescriptionForPatient
}) => {
  const staff = getActiveStaff();
  const config = getHospitalConfig();

  // Structured clinical fields
  const [chiefComplaint, setChiefComplaint] = useState(
    patient.consultations[0]?.chiefComplaint ? `Follow-up on ${patient.consultations[0].chiefComplaint}` : ""
  );
  const [historyOfPresentingIllness, setHistoryOfPresentingIllness] = useState("");
  const [reviewOfSystems, setReviewOfSystems] = useState("No palpitations, no hemoptysis, no jaundice.");
  const [examinationFindings, setExaminationFindings] = useState(
    "General: Conscious, alert, febrile to touch. No pallor, no peripheral edema. Chest: Clear, vesicular breath sounds. Abdomen: Soft, non-tender."
  );
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState(
    patient.consultations[0]?.provisionalDiagnosis || "Plasmodium falciparum Malaria (Uncomplicated)"
  );
  const [plan, setPlan] = useState(
    "1. Order MP by microscopy & Full Blood Count.\n2. Prescribe Artemether-Lumefantrine 80/480mg.\n3. Adequate hydration; review in 3 days."
  );
  const [freeTextObservations, setFreeTextObservations] = useState("");
  const [doctorName, setDoctorName] = useState(
    staff.role === "Medical Doctor" ? staff.name : "Dr. Oladipo Johnson, MBBS, FWACS"
  );
  const [folioNumber, setFolioNumber] = useState("MDCN/R/58291");
  const [department, setDepartment] = useState("General Outpatient (GOPD)");

  // Speech Recognition (Voice Dictation)
  const [isListening, setIsListening] = useState(false);
  const [speechTargetField, setSpeechTargetField] = useState<"complaint" | "hpi" | "exam" | "plan" | "freeText">("freeText");
  const [speechSupported, setSpeechSupported] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
      }
    }
  }, []);

  const toggleVoiceDictation = (field: "complaint" | "hpi" | "exam" | "plan" | "freeText") => {
    setSpeechTargetField(field);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. You can type directly into the field.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-NG"; // Nigerian English dialect

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (field === "complaint") {
          setChiefComplaint((prev) => (prev ? prev + " " + transcript : transcript));
        } else if (field === "hpi") {
          setHistoryOfPresentingIllness((prev) => (prev ? prev + " " + transcript : transcript));
        } else if (field === "exam") {
          setExaminationFindings((prev) => (prev ? prev + " " + transcript : transcript));
        } else if (field === "plan") {
          setPlan((prev) => (prev ? prev + " " + transcript : transcript));
        } else if (field === "freeText") {
          setFreeTextObservations((prev) => (prev ? prev + "\n" + transcript : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error("Speech error", e);
      setIsListening(false);
    }
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chiefComplaint || !provisionalDiagnosis) {
      alert("Please provide at least Chief Complaint and Provisional Diagnosis.");
      return;
    }

    const newNote: ConsultationNote = {
      id: `note-${Date.now()}`,
      date: new Date().toISOString(),
      doctorName,
      department,
      chiefComplaint,
      historyOfPresentingIllness,
      reviewOfSystems,
      examinationFindings,
      provisionalDiagnosis,
      plan,
      freeTextObservations,
      doctorSignature: `SIG-MDCN-${doctorName.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      folioNumber
    };

    addConsultationNoteToPatient(patient.id, newNote);
    setStatusMessage("Doctor's clinical note saved to patient record successfully.");
    if (onNoteAdded) onNoteAdded();

    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleSaveAndPrescribe = (e: React.FormEvent) => {
    handleSaveNote(e);
    if (onOpenPrescriptionForPatient) {
      onOpenPrescriptionForPatient(patient);
    }
  };

  const isSickleCell = patient.genotype === "SS";

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden space-y-4">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Doctor's Clinical Notes & Consultation Sheet
                </h2>
                <span className="bg-emerald-800 text-emerald-200 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                  {patient.fileNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Patient: <span className="text-slate-200 font-semibold">{patient.lastName}, {patient.firstName}</span> ({patient.ageYears}y, {patient.gender}) • Blood Group: {patient.bloodGroup} • Genotype: {patient.genotype}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {speechSupported && (
              <span className="text-[10px] bg-slate-800 text-emerald-400 px-2.5 py-1 rounded-full font-mono flex items-center gap-1 border border-slate-700">
                <Mic className="w-3 h-3 text-emerald-400" />
                Voice Dictation Ready
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSaveNote} className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Status Message */}
          {statusMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xl flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Sickle Cell / Allergy Quick Banner */}
          {isSickleCell && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  <strong>Sickle Cell Alert (Genotype SS):</strong> Check for bone pain crisis, splenic enlargement, acute chest syndrome, or severe anemia.
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-rose-600 text-white px-2 py-0.5 rounded">
                FAST-TRACK
              </span>
            </div>
          )}

          {/* Latest Triage Vitals Quick Summary */}
          {patient.vitalsHistory && patient.vitalsHistory.length > 0 && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <span className="font-bold text-slate-700 uppercase tracking-wider">
                Current Triage Vitals:
              </span>
              <div className="flex items-center gap-3 font-mono font-bold text-slate-800">
                <span>BP: {patient.vitalsHistory[0].bloodPressureSystolic}/{patient.vitalsHistory[0].bloodPressureDiastolic} mmHg</span>
                <span>•</span>
                <span>Temp: {patient.vitalsHistory[0].temperature}°C</span>
                <span>•</span>
                <span>Pulse: {patient.vitalsHistory[0].pulse} bpm</span>
                <span>•</span>
                <span>Weight: {patient.vitalsHistory[0].weight} kg</span>
                {patient.vitalsHistory[0].spo2 && (
                  <>
                    <span>•</span>
                    <span>SPO2: {patient.vitalsHistory[0].spo2}%</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Predefined Field: Chief Complaint */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-900">
                1. Chief Complaint (Patient's Own Words) <span className="text-rose-600">*</span>
              </label>
              <button
                type="button"
                onClick={() => toggleVoiceDictation("complaint")}
                className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-colors ${
                  isListening && speechTargetField === "complaint"
                    ? "bg-rose-600 text-white animate-pulse"
                    : "bg-slate-100 text-slate-700 hover:bg-emerald-100"
                }`}
              >
                <Mic className="w-3 h-3" />
                <span>{isListening && speechTargetField === "complaint" ? "Listening..." : "Dictate Complaint"}</span>
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Severe headache, high fever, and body weakness for 4 days"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Predefined Field: History of Presenting Illness (HPI) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-900">2. History of Presenting Illness (HPI)</label>
              <button
                type="button"
                onClick={() => toggleVoiceDictation("hpi")}
                className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-colors ${
                  isListening && speechTargetField === "hpi"
                    ? "bg-rose-600 text-white animate-pulse"
                    : "bg-slate-100 text-slate-700 hover:bg-emerald-100"
                }`}
              >
                <Mic className="w-3 h-3" />
                <span>{isListening && speechTargetField === "hpi" ? "Listening..." : "Dictate HPI"}</span>
              </button>
            </div>
            <textarea
              rows={3}
              placeholder="Describe duration, severity, progression, relieving/aggravating factors, associated vomiting, chills or rigors..."
              value={historyOfPresentingIllness}
              onChange={(e) => setHistoryOfPresentingIllness(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Predefined Field: Physical Examination Findings */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-900">3. Physical Examination Findings</label>
              <button
                type="button"
                onClick={() => toggleVoiceDictation("exam")}
                className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-colors ${
                  isListening && speechTargetField === "exam"
                    ? "bg-rose-600 text-white animate-pulse"
                    : "bg-slate-100 text-slate-700 hover:bg-emerald-100"
                }`}
              >
                <Mic className="w-3 h-3" />
                <span>{isListening && speechTargetField === "exam" ? "Listening..." : "Dictate Exam"}</span>
              </button>
            </div>
            <textarea
              rows={2}
              placeholder="General appearance, pallor, icterus, cyanosis, chest auscultation, abdominal palpation, spleen, liver..."
              value={examinationFindings}
              onChange={(e) => setExaminationFindings(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Predefined Field: Provisional Diagnosis (with Nigerian clinical condition presets) */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 block">
              4. Working / Provisional Diagnosis <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Plasmodium falciparum Malaria (Uncomplicated), Enteric Fever..."
              value={provisionalDiagnosis}
              onChange={(e) => setProvisionalDiagnosis(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
            {/* Quick condition presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mr-1 self-center">
                Common Presets:
              </span>
              {COMMON_DIAGNOSES.slice(0, 6).map((diag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setProvisionalDiagnosis(diag)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-100 border border-slate-200 rounded text-[10px] text-slate-800 transition-colors cursor-pointer"
                >
                  {diag.split("(")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Predefined Field: Treatment Plan & Investigation Orders */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-900">5. Treatment Plan & Diagnostic Orders</label>
              <button
                type="button"
                onClick={() => toggleVoiceDictation("plan")}
                className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-colors ${
                  isListening && speechTargetField === "plan"
                    ? "bg-rose-600 text-white animate-pulse"
                    : "bg-slate-100 text-slate-700 hover:bg-emerald-100"
                }`}
              >
                <Mic className="w-3 h-3" />
                <span>{isListening && speechTargetField === "plan" ? "Listening..." : "Dictate Plan"}</span>
              </button>
            </div>
            <textarea
              rows={3}
              placeholder="Prescriptions, nursing care orders, lab tests (MP, Widal, PCV), diet, follow-up date..."
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Free-Text Area for Detailed Clinical Observations */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-900">
                6. Free-Text Observations, Social History & Progression Notes
              </label>
              <button
                type="button"
                onClick={() => toggleVoiceDictation("freeText")}
                className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-colors ${
                  isListening && speechTargetField === "freeText"
                    ? "bg-rose-600 text-white animate-pulse"
                    : "bg-slate-100 text-slate-700 hover:bg-emerald-100"
                }`}
              >
                <Mic className="w-3 h-3" />
                <span>{isListening && speechTargetField === "freeText" ? "Listening..." : "Dictate Observations"}</span>
              </button>
            </div>
            <textarea
              rows={3}
              placeholder="Add any additional free-form physician notes, family background, occupational exposure, counseling provided..."
              value={freeTextObservations}
              onChange={(e) => setFreeTextObservations(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Doctor Signature & Timestamp Credentials */}
          <div className="border-t border-slate-200 pt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Consultant / Attending Doctor</label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg font-medium"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">MDCN Folio Number</label>
              <input
                type="text"
                value={folioNumber}
                onChange={(e) => setFolioNumber(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono font-medium"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Clinic Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg font-medium"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Timestamp: {new Date().toLocaleString("en-NG")}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-2 shadow-md transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4 text-emerald-400" />
                <span>Save Consultation Note</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAndPrescribe}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-2 shadow-md transition-colors cursor-pointer"
              >
                <Pill className="w-4 h-4" />
                <span>Save & Generate Prescription (Rx)</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
