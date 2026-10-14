import React, { useState } from "react";
import { 
  ArrowLeft, 
  Printer, 
  MapPin, 
  Activity, 
  Stethoscope, 
  FlaskConical, 
  Pill, 
  Clock, 
  AlertTriangle, 
  Flame, 
  CheckCircle2, 
  Plus, 
  QrCode, 
  Share2, 
  FileText, 
  ShieldCheck, 
  ChevronRight,
  User,
  Phone,
  Building,
  CreditCard,
  Archive,
  Volume2,
  Calendar,
  CalendarCheck2,
  Trash2,
  UserCheck,
  FolderCheck,
  Receipt
} from "lucide-react";
import { Patient, VitalsRecord, ConsultationNote, LabTest, Prescription, DepartmentType, Appointment, ClinicDepartment } from "../types";
import { COMMON_DIAGNOSES, COMMON_LAB_TESTS, COMMON_MEDICATIONS } from "../data/nigeriaLocations";
import { 
  upsertPatient, 
  getActiveStaff, 
  dispensePatientPrescription,
  getAppointmentsByPatientId,
  upsertAppointment,
  checkInAppointment,
  togglePhysicalFileRetrieved,
  deleteAppointment,
  getHospitalConfig
} from "../lib/storage";
import { CLINIC_DEPARTMENTS, HOSPITAL_DOCTORS } from "../data/initialAppointments";
import { DoctorNotesModal } from "./DoctorNotesModal";
import { PrescriptionGeneratorModal } from "./PrescriptionGeneratorModal";
import { PatientBillingSection } from "./PatientBillingSection";

interface PatientFileDetailProps {
  patient: Patient;
  onBack: () => void;
  onOpenPrintSticker: (patient: Patient) => void;
  onOpenPhysicalArchive: (patient: Patient) => void;
  onOpenScheduleAppointment?: (patient: Patient) => void;
}

export const PatientFileDetail: React.FC<PatientFileDetailProps> = ({
  patient,
  onBack,
  onOpenPrintSticker,
  onOpenPhysicalArchive,
  onOpenScheduleAppointment
}) => {
  const [activeTab, setActiveTab] = useState<"vitals" | "notes" | "lab" | "pharmacy" | "billing" | "physical" | "appointments" | "audit">("vitals");
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showLabModal, setShowLabModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  // Appointments state for this patient
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>(() => getAppointmentsByPatientId(patient.id));
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schDate, setSchDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14); // 2 weeks default
    return d.toISOString().split("T")[0];
  });
  const [schTime, setSchTime] = useState("09:30 AM");
  const [schClinic, setSchClinic] = useState<ClinicDepartment>("General Outpatient (GOPD)");
  const [schDoctor, setSchDoctor] = useState("Dr. Oladipo Johnson");
  const [schType, setSchType] = useState<Appointment["appointmentType"]>("Routine Follow-up");
  const [schReason, setSchReason] = useState("Routine clinical review & prescription refill");
  const [schNotes, setSchNotes] = useState("");

  const refreshPatientAppointments = () => {
    setPatientAppointments(getAppointmentsByPatientId(patient.id));
  };

  const upcomingAppointments = patientAppointments.filter(
    (a) => a.status !== "completed" && a.status !== "cancelled"
  ).sort((a, b) => a.date.localeCompare(b.date) || a.timeSlot.localeCompare(b.timeSlot));
  const nextAppointment = upcomingAppointments[0];

  const handleCreateFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      patientId: patient.id,
      patientName: `${patient.lastName}, ${patient.firstName} ${patient.middleName || ""}`.trim(),
      patientFileNumber: patient.fileNumber,
      patientPhone: patient.phone,
      patientGender: patient.gender,
      patientAge: patient.ageYears,
      patientGenotype: patient.genotype,
      patientBloodGroup: patient.bloodGroup,
      clinic: schClinic,
      doctorAssigned: schDoctor,
      date: schDate,
      timeSlot: schTime,
      durationMinutes: 30,
      appointmentType: schType,
      priority: patient.genotype === "SS" ? "urgent" : "normal",
      reason: schReason || "Scheduled clinical follow-up visit",
      notes: schNotes,
      status: "scheduled",
      bookedBy: getActiveStaff().name,
      bookedAt: new Date().toISOString(),
      smsReminderSent: false,
      physicalFileRetrieved: false,
      physicalShelfLocation: `${patient.physicalArchive.cabinet} • ${patient.physicalArchive.shelfOrDrawer}`
    };
    upsertAppointment(newApt, {
      action: "BOOKED_APPOINTMENT",
      details: `Scheduled ${schType} for ${patient.lastName} (${schClinic}, ${schDate} at ${schTime})`
    });
    refreshPatientAppointments();
    setShowScheduleModal(false);
  };

  const handleQuickSchedulePreset = (daysOffset: number, reasonText: string, clinicType: ClinicDepartment = "General Outpatient (GOPD)") => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    const dateStr = d.toISOString().split("T")[0];
    setSchDate(dateStr);
    setSchClinic(clinicType);
    setSchReason(reasonText);
    setShowScheduleModal(true);
  };

  const handleCheckInApt = (apt: Appointment) => {
    checkInAppointment(apt.id, "doctor");
    refreshPatientAppointments();
  };

  const handleCompleteApt = (apt: Appointment) => {
    const updated: Appointment = {
      ...apt,
      status: "completed",
      completedAt: new Date().toISOString()
    };
    upsertAppointment(updated, {
      action: "UPDATED_APPOINTMENT",
      details: `Doctor completed appointment for ${patient.lastName}`
    });
    refreshPatientAppointments();
  };

  const handleCancelApt = (apt: Appointment) => {
    const updated: Appointment = {
      ...apt,
      status: "cancelled"
    };
    upsertAppointment(updated, {
      action: "CANCELLED_APPOINTMENT",
      details: `Cancelled appointment on ${apt.date} for ${patient.lastName}`
    });
    refreshPatientAppointments();
  };

  const handleToggleFile = (apt: Appointment) => {
    togglePhysicalFileRetrieved(apt.id);
    refreshPatientAppointments();
  };

  // Specialized Comprehensive Modals
  const [isDoctorNotesModalOpen, setIsDoctorNotesModalOpen] = useState(false);
  const [isPrescriptionGeneratorModalOpen, setIsPrescriptionGeneratorModalOpen] = useState(false);

  // New Vitals Form State
  const [newBpSys, setNewBpSys] = useState(120);
  const [newBpDia, setNewBpDia] = useState(80);
  const [newTemp, setNewTemp] = useState(36.8);
  const [newPulse, setNewPulse] = useState(76);
  const [newWeight, setNewWeight] = useState(70);
  const [newSpo2, setNewSpo2] = useState(98);
  const [newBloodSugar, setNewBloodSugar] = useState<number | undefined>(undefined);
  const [newNurseNotes, setNewNurseNotes] = useState("");

  // New Note Form State
  const [newChiefComplaint, setNewChiefComplaint] = useState("");
  const [newHpi, setNewHpi] = useState("");
  const [newExam, setNewExam] = useState("");
  const [newDiagnosis, setNewDiagnosis] = useState(COMMON_DIAGNOSES[0]);
  const [newPlan, setNewPlan] = useState("");

  // New Lab Form State
  const [selectedLabTest, setSelectedLabTest] = useState(COMMON_LAB_TESTS[0].name);

  // New Rx Form State
  const [selectedMed, setSelectedMed] = useState(COMMON_MEDICATIONS[0]);
  const [rxDuration, setRxDuration] = useState("3 days");

  const staff = getActiveStaff();
  const isSickleCell = patient.genotype === "SS";

  const handleAddVitals = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: VitalsRecord = {
      id: "vit-" + Date.now(),
      recordedAt: new Date().toISOString(),
      recordedBy: `${staff.name} (${staff.role})`,
      bloodPressureSystolic: Number(newBpSys),
      bloodPressureDiastolic: Number(newBpDia),
      temperature: Number(newTemp),
      pulse: Number(newPulse),
      weight: Number(newWeight),
      spo2: Number(newSpo2),
      bloodSugar: newBloodSugar ? Number(newBloodSugar) : undefined,
      nurseNotes: newNurseNotes.trim() || undefined
    };

    const updated: Patient = {
      ...patient,
      vitalsHistory: [...patient.vitalsHistory, newRecord]
    };

    upsertPatient(updated, {
      action: "RECORDED_VITALS",
      details: `Recorded vitals: BP ${newRecord.bloodPressureSystolic}/${newRecord.bloodPressureDiastolic}, Temp ${newRecord.temperature}°C, Pulse ${newRecord.pulse}`
    });

    setShowVitalsModal(false);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    const newNote: ConsultationNote = {
      id: "con-" + Date.now(),
      date: new Date().toISOString(),
      doctorName: staff.name,
      department: "General Outpatient (GOPD)",
      chiefComplaint: newChiefComplaint,
      historyOfPresentingIllness: newHpi,
      examinationFindings: newExam,
      provisionalDiagnosis: newDiagnosis,
      plan: newPlan
    };

    const updated: Patient = {
      ...patient,
      consultations: [...patient.consultations, newNote]
    };

    upsertPatient(updated, {
      action: "ADDED_NOTE",
      details: `Added consultation note with provisional diagnosis: ${newDiagnosis}`
    });

    setShowNoteModal(false);
    setNewChiefComplaint("");
    setNewHpi("");
    setNewExam("");
    setNewPlan("");
  };

  const handleAddLab = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder: LabTest = {
      id: "lab-" + Date.now(),
      testName: selectedLabTest,
      requestedBy: staff.name,
      requestedAt: new Date().toISOString(),
      status: "pending"
    };

    const updated: Patient = {
      ...patient,
      labOrders: [...patient.labOrders, newOrder]
    };

    upsertPatient(updated, {
      action: "ORDERED_LAB",
      details: `Requested laboratory investigation: ${selectedLabTest}`
    });

    setShowLabModal(false);
  };

  const handleCompleteLab = (testId: string, results: string) => {
    const updatedTests = patient.labOrders.map((t) => {
      if (t.id === testId) {
        return {
          ...t,
          status: "completed" as const,
          results,
          labTechnician: staff.name,
          completedAt: new Date().toISOString()
        };
      }
      return t;
    });

    const updated: Patient = {
      ...patient,
      labOrders: updatedTests
    };

    upsertPatient(updated, {
      action: "ORDERED_LAB",
      details: `Entered results for test: ${results}`
    });
  };

  const handleAddPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    const newRx: Prescription = {
      id: "rx-" + Date.now(),
      drugName: selectedMed.name,
      dosage: selectedMed.dose,
      pidginInstructions: selectedMed.pidgin,
      duration: rxDuration,
      prescribedBy: staff.name,
      prescribedAt: new Date().toISOString(),
      dispensed: false
    };

    const updated: Patient = {
      ...patient,
      prescriptions: [...patient.prescriptions, newRx]
    };

    upsertPatient(updated, {
      action: "DISPENSED_DRUGS",
      details: `Prescribed ${newRx.drugName} for ${newRx.duration}`
    });

    setShowPrescriptionModal(false);
  };

  const handleToggleDispense = (rxId: string) => {
    const updatedRx = patient.prescriptions.map((rx) => {
      if (rx.id === rxId) {
        const nextDispensed = !rx.dispensed;
        return {
          ...rx,
          dispensed: nextDispensed,
          dispensedAt: nextDispensed ? new Date().toISOString() : undefined,
          dispensedBy: nextDispensed ? staff.name : undefined
        };
      }
      return rx;
    });

    const updated: Patient = {
      ...patient,
      prescriptions: updatedRx
    };

    upsertPatient(updated, {
      action: "DISPENSED_DRUGS",
      details: `Updated dispensing status in pharmacy dispensary.`
    });
  };

  const handleRouteFolder = (dept: DepartmentType) => {
    const updated: Patient = {
      ...patient,
      currentDepartment: dept,
      patientStatus: dept === "doctor" ? "in_consultation" : "waiting"
    };

    upsertPatient(updated, {
      action: "ROUTED_PATIENT",
      details: `Routed folder from ${patient.currentDepartment.toUpperCase()} to ${dept.toUpperCase()}`
    });
  };

  // Play Pidgin instructions using web speech audio
  const playPidginAudio = (text?: string) => {
    if (!text || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Breadcrumb & Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Folder Queue</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Current Routing Department */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-500 font-medium">Folder Station:</span>
            <select
              value={patient.currentDepartment}
              onChange={(e) => handleRouteFolder(e.target.value as DepartmentType)}
              className="bg-transparent font-bold text-emerald-800 focus:outline-hidden cursor-pointer"
            >
              <option value="records">Records & HIM</option>
              <option value="triage">Triage & Nursing</option>
              <option value="doctor">Doctor's Room (GOPD)</option>
              <option value="laboratory">Laboratory</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="billing">Billing & Cashier</option>
            </select>
          </div>

          {/* Print Sticker Button */}
          <button
            onClick={() => onOpenPrintSticker(patient)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Manila Folder Label</span>
          </button>
        </div>
      </div>

      {/* Main Manila Paper Folder Header simulation */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50/60 rounded-2xl border-2 border-amber-300/80 p-5 sm:p-6 shadow-sm space-y-4 relative">
        {/* Top Folder Tab Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-200 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded bg-amber-900 text-amber-50 font-mono text-sm font-bold shadow-xs">
                {patient.fileNumber}
              </span>
              {patient.legacyPaperFileNumber && (
                <span className="text-xs bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded border border-amber-300">
                  Old Stamped Manila Card: {patient.legacyPaperFileNumber}
                </span>
              )}
              <span className="text-xs bg-white text-slate-700 font-mono font-medium px-2 py-0.5 rounded border border-amber-200">
                Barcode: {patient.barcodeNumber}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight pt-1">
              {patient.lastName}, {patient.firstName} {patient.middleName || ""}
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
              <span>{patient.gender} • {patient.ageYears} years (DOB: {patient.dateOfBirth})</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                {patient.phone}
              </span>
              <span>•</span>
              <span>{patient.residentialAddress}</span>
            </div>
          </div>

          {/* Prominent Clinical Badges (Blood Group & Genotype) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Genotype Badge */}
            <div className={`text-center px-4 py-2 rounded-xl shadow-xs border ${
              isSickleCell 
                ? "bg-rose-600 text-white border-rose-700 animate-pulse" 
                : "bg-slate-900 text-white border-slate-800"
            }`}>
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">GENOTYPE</div>
              <div className="text-xl font-black">{patient.genotype}</div>
            </div>

            {/* Blood Group Badge */}
            <div className="text-center px-3.5 py-2 rounded-xl bg-white border border-amber-300 text-slate-900 shadow-xs">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">BLOOD GP</div>
              <div className="text-xl font-black text-slate-900">{patient.bloodGroup}</div>
            </div>
          </div>
        </div>

        {/* Clinical Alerts / Sickle Cell Protocol */}
        {isSickleCell && (
          <div className="bg-rose-50 border-2 border-rose-300 text-rose-900 p-3 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <span className="font-bold">SICKLE CELL WARRIOR (Hb SS) — HOSPITAL FAST-TRACK PROTOCOL</span>
                <p className="text-[11px] text-rose-700">
                  Priority triage mandatory. Any fever (&gt;38°C) or acute bone pain requires immediate IV rehydration and analgesia. Avoid dehydration.
                </p>
              </div>
            </div>
            <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded shrink-0 uppercase">
              High Priority
            </span>
          </div>
        )}

        {/* Demographics & Physical Archive Cards Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Identity & Origin Card */}
          <div className="bg-white/90 p-3 rounded-xl border border-amber-200 space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="font-semibold text-[10px] uppercase">Identity & Origin</span>
              <Building className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="font-medium text-slate-800">
              {patient.stateOfOrigin} State ({patient.lga} LGA)
            </div>
            <div className="text-[11px] text-slate-600 font-mono">
              NIN: {patient.nin || "Not registered"}
            </div>
            <div className="text-[11px] text-emerald-800 font-semibold">
              {patient.nhisNumber ? `NHIA: ${patient.hmoProvider || "National Scheme"}` : "Self-Pay (Fee for Service)"}
            </div>
          </div>

          {/* Physical Shelf Locator Card */}
          <div className="bg-white/90 p-3 rounded-xl border border-amber-200 space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="font-semibold text-[10px] uppercase">Physical Manila Shelf</span>
              <button
                onClick={() => onOpenPhysicalArchive(patient)}
                className="text-[10px] text-emerald-700 hover:underline font-bold"
              >
                Shelf View
              </button>
            </div>
            <div className="font-bold text-slate-900">
              {patient.physicalArchive.cabinet} • {patient.physicalArchive.shelfOrDrawer}
            </div>
            <div className="text-[11px] text-slate-600">
              {patient.physicalArchive.roomNumber} ({patient.physicalArchive.folderColor})
            </div>
            <div className="text-[10px]">
              Status:{" "}
              <span className={`font-bold ${
                patient.physicalArchive.physicalStatus === "in_shelf" ? "text-emerald-700" : "text-amber-700"
              }`}>
                {patient.physicalArchive.physicalStatus === "in_shelf" ? "In Shelf" : `Checked Out (${patient.physicalArchive.checkedOutTo})`}
              </span>
            </div>
          </div>

          {/* Next of Kin & Allergies */}
          <div className="bg-white/90 p-3 rounded-xl border border-amber-200 space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="font-semibold text-[10px] uppercase">Next of Kin & Safety</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="font-medium text-slate-800 truncate">
              {patient.nextOfKin.name} ({patient.nextOfKin.relationship})
            </div>
            <div className="text-[11px] text-slate-600">
              Phone: {patient.nextOfKin.phone}
            </div>
            <div className="text-[11px] text-rose-700 font-semibold truncate">
              Allergies: {patient.allergies.length > 0 ? patient.allergies.join(", ") : "None known (NKDA)"}
            </div>
          </div>
        </div>

        {/* Scheduled Clinic Appointment Banner */}
        {nextAppointment && (
          <div className="bg-emerald-100/90 border border-emerald-300 text-emerald-950 p-3 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <CalendarCheck2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <span className="font-bold">Next Clinic Appointment: </span>
                <span className="font-semibold">{nextAppointment.date} at {nextAppointment.timeSlot}</span>
                <span className="text-slate-600 ml-1">({nextAppointment.clinic} • {nextAppointment.doctorAssigned})</span>
                <span className="ml-2 font-mono text-[10px] bg-white px-1.5 py-0.2 rounded border border-emerald-300 text-emerald-900 uppercase font-bold">
                  {nextAppointment.status.replace("_", " ")}
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("appointments")}
              className="px-2.5 py-1 text-[11px] font-bold text-emerald-900 bg-white hover:bg-emerald-50 rounded-lg border border-emerald-300 transition-colors cursor-pointer shrink-0"
            >
              View Schedule
            </button>
          </div>
        )}
      </div>

      {/* Detail Tab Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("vitals")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "vitals"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Clinical Vitals & Triage</span>
            <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">
              {patient.vitalsHistory.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("notes")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "notes"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctor Consultations & Diagnoses</span>
            <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">
              {patient.consultations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("lab")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "lab"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Laboratory Tests</span>
            <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">
              {patient.labOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("pharmacy")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "pharmacy"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Pharmacy & Prescriptions</span>
            <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">
              {patient.prescriptions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("billing")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "billing"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
            id="tab-patient-billing"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Billing & Receipts</span>
          </button>

          <button
            onClick={() => setActiveTab("appointments")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "appointments"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
            id="tab-patient-appointments"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Appointments & Follow-ups</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === "appointments" 
                ? "bg-emerald-900 text-white" 
                : patientAppointments.length > 0 
                ? "bg-emerald-100 text-emerald-800 font-bold" 
                : "bg-slate-200 text-slate-600"
            }`}>
              {patientAppointments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("physical")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "physical"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Manila Folder & QR Stickers</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Vitals & Triage History */}
      {activeTab === "vitals" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Clinical Vitals & Triage Records</h3>
              <p className="text-xs text-slate-500">Historical blood pressure, temperature, pulse, SPO2, and nurse notes</p>
            </div>
            <button
              onClick={() => setShowVitalsModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record New Vitals</span>
            </button>
          </div>

          {patient.vitalsHistory.length > 0 ? (
            <div className="space-y-3">
              {patient.vitalsHistory.map((v) => (
                <div key={v.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 pb-2">
                    <span className="font-semibold text-slate-700">{v.recordedBy}</span>
                    <span>{new Date(v.recordedAt).toLocaleString()}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center pt-1">
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Blood Pressure</span>
                      <p className={`text-sm font-bold ${
                        v.bloodPressureSystolic >= 140 || v.bloodPressureDiastolic >= 90 ? "text-rose-600" : "text-slate-900"
                      }`}>
                        {v.bloodPressureSystolic}/{v.bloodPressureDiastolic} mmHg
                      </p>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Temperature</span>
                      <p className={`text-sm font-bold ${v.temperature >= 38.0 ? "text-rose-600" : "text-slate-900"}`}>
                        {v.temperature}°C
                      </p>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Pulse Rate</span>
                      <p className="text-sm font-bold text-slate-900">{v.pulse} bpm</p>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Body Weight</span>
                      <p className="text-sm font-bold text-slate-900">{v.weight} kg</p>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">SPO2 Oxygen</span>
                      <p className={`text-sm font-bold ${v.spo2 && v.spo2 < 95 ? "text-rose-600" : "text-slate-900"}`}>
                        {v.spo2 ? `${v.spo2}%` : "—"}
                      </p>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Blood Sugar</span>
                      <p className="text-sm font-bold text-slate-900">
                        {v.bloodSugar ? `${v.bloodSugar} mg/dL` : "—"}
                      </p>
                    </div>
                  </div>

                  {v.nurseNotes && (
                    <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 mt-2">
                      <span className="font-semibold text-slate-800">Nurse Notes: </span>
                      {v.nurseNotes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center italic">No vitals recorded yet. Click above to record triage vitals.</p>
          )}
        </div>
      )}

      {/* Tab 2: Doctor Consultations */}
      {activeTab === "notes" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Doctor Clinical Notes & Diagnoses</h3>
              <p className="text-xs text-slate-500">Documented medical history, examinations, management plans & voice dictation</p>
            </div>
            <button
              onClick={() => setIsDoctorNotesModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-2xs cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Doctor's Clinical Note</span>
            </button>
          </div>

          {patient.consultations.length > 0 ? (
            <div className="space-y-4">
              {patient.consultations.map((note) => (
                <div key={note.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
                    <div>
                      <span className="font-bold text-slate-900">{note.doctorName}</span>
                      <span className="text-slate-500 ml-2">({note.department})</span>
                      {note.folioNumber && (
                        <span className="text-slate-400 font-mono text-[10px] ml-2">[{note.folioNumber}]</span>
                      )}
                    </div>
                    <span className="text-slate-400">{new Date(note.date).toLocaleString()}</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">Chief Complaint:</span>
                      <p className="text-slate-900 font-medium">{note.chiefComplaint}</p>
                    </div>

                    {note.historyOfPresentingIllness && (
                      <div>
                        <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">History of Presenting Illness (HPI):</span>
                        <p className="text-slate-700 whitespace-pre-wrap">{note.historyOfPresentingIllness}</p>
                      </div>
                    )}

                    {note.examinationFindings && (
                      <div>
                        <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">Physical Examination Findings:</span>
                        <p className="text-slate-700 whitespace-pre-wrap">{note.examinationFindings}</p>
                      </div>
                    )}

                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="font-bold text-emerald-900 uppercase text-[10px] tracking-wider">Working / Provisional Diagnosis:</span>
                        <p className="font-bold text-emerald-900 text-sm mt-0.5">{note.provisionalDiagnosis}</p>
                      </div>
                      <button
                        onClick={() => setIsPrescriptionGeneratorModalOpen(true)}
                        className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Pill className="w-3.5 h-3.5" />
                        <span>Prescribe for this Diagnosis</span>
                      </button>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">Management Plan:</span>
                      <p className="text-slate-700 whitespace-pre-wrap bg-white p-2.5 rounded-lg border border-slate-200 mt-1">
                        {note.plan}
                      </p>
                    </div>

                    {note.freeTextObservations && (
                      <div>
                        <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">Additional Clinical Observations & Counseling:</span>
                        <p className="text-slate-600 italic whitespace-pre-wrap bg-white p-2.5 rounded-lg border border-slate-200 mt-1">
                          {note.freeTextObservations}
                        </p>
                      </div>
                    )}

                    {note.doctorSignature && (
                      <div className="text-right text-[10px] text-slate-400 font-mono">
                        Digital Signature: {note.doctorSignature}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center italic">No doctor consultation notes entered yet. Click above to record.</p>
          )}
        </div>
      )}

      {/* Tab 3: Laboratory Tests */}
      {activeTab === "lab" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Laboratory Pathology & Investigations</h3>
              <p className="text-xs text-slate-500">Malaria microscopy, Widal, PCV, Urinalysis, and blood chemistry</p>
            </div>
            <button
              onClick={() => setShowLabModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-purple-700 hover:bg-purple-800 text-white rounded-lg shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Order Lab Test</span>
            </button>
          </div>

          {patient.labOrders.length > 0 ? (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {patient.labOrders.map((test) => (
                <div key={test.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{test.testName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        test.status === "completed"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}>
                        {test.status === "completed" ? "Completed" : "Processing / Pending"}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Requested by {test.requestedBy} • {new Date(test.requestedAt).toLocaleTimeString()}
                    </div>
                    {test.results && (
                      <div className="mt-2 bg-purple-50 border border-purple-200 text-purple-900 p-2.5 rounded-lg text-xs font-mono">
                        <span className="font-bold font-sans">Lab Finding: </span> {test.results}
                        {test.normalRange && (
                          <span className="text-slate-500 text-[10px] block font-sans mt-0.5">Reference: {test.normalRange}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {test.status !== "completed" && (
                    <button
                      onClick={() => {
                        const res = prompt("Enter laboratory result for " + test.testName + ":", "Normal / Reactive");
                        if (res) handleCompleteLab(test.id, res);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg shrink-0 transition-colors"
                    >
                      Enter Findings
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center italic">No lab tests ordered for this patient yet.</p>
          )}
        </div>
      )}

      {/* Tab 4: Pharmacy Prescriptions */}
      {activeTab === "pharmacy" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hospital Pharmacy Dispensary</h3>
              <p className="text-xs text-slate-500">Digital prescriptions, inventory stock linking, and official printable slips</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPrescriptionGeneratorModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white rounded-lg shadow-2xs cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Digital Prescription (Rx)</span>
              </button>
              {patient.prescriptions.length > 0 && (
                <button
                  onClick={() => setIsPrescriptionGeneratorModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white rounded-lg shadow-2xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip / PDF</span>
                </button>
              )}
            </div>
          </div>

          {patient.prescriptions.length > 0 ? (
            <div className="space-y-3">
              {patient.prescriptions.map((rx) => (
                <div key={rx.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{rx.drugName}</span>
                        {rx.quantity && (
                          <span className="bg-slate-200 text-slate-800 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded">
                            Qty: {rx.quantity}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        <span className="font-semibold">Regimen:</span> {rx.dosage} • {rx.frequency || "As instructed"} ({rx.duration})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        rx.dispensed ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}>
                        {rx.dispensed ? "Dispensed ✓" : "Pending Dispense"}
                      </span>
                      {!rx.dispensed ? (
                        <button
                          onClick={() => {
                            const res = dispensePatientPrescription(patient.id, rx.id, true);
                            alert(res.message);
                          }}
                          className="px-3 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-2xs transition-colors cursor-pointer"
                        >
                          Dispense & Deduct Stock
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">
                          {rx.dispensedAt ? new Date(rx.dispensedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Completed"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pidgin Patient Directions */}
                  {rx.pidginInstructions && (
                    <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-2.5 flex items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-bold text-amber-900 text-[11px] uppercase block">
                          Patient Direction for Pidgin:
                        </span>
                        <p className="text-slate-800 italic mt-0.5">"{rx.pidginInstructions}"</p>
                      </div>
                      <button
                        onClick={() => playPidginAudio(rx.pidginInstructions)}
                        className="p-2 text-amber-800 hover:bg-amber-100 rounded-lg shrink-0"
                        title="Read out loud in Pidgin"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                    <div>
                      Prescribed by {rx.prescribedBy} • {new Date(rx.prescribedAt).toLocaleTimeString()}
                      {rx.dispensedBy && ` • Dispensed by ${rx.dispensedBy}`}
                    </div>
                    {rx.doctorSignature && (
                      <span className="font-mono text-[9px]">Sig: {rx.doctorSignature}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center italic">No prescriptions recorded yet. Click above to create a digital prescription.</p>
          )}
        </div>
      )}

      {/* Tab 5: Manila Folder & Stickers */}
      {activeTab === "physical" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Physical Manila Folder Bridge & Labels</h3>
              <p className="text-xs text-slate-500">Printable sticky labels with QR code and shelf coordinates for existing paper files</p>
            </div>
            <button
              onClick={() => onOpenPrintSticker(patient)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Launch Print Dialog</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Manila Folder Cover Label Preview */}
            <div className="border-2 border-amber-300 bg-amber-50/50 rounded-xl p-5 space-y-3 font-mono text-xs">
              <div className="text-center border-b border-amber-200 pb-2">
                <p className="font-bold font-sans text-slate-900 text-sm">FEDERAL MEDICAL CENTRE / GENERAL HOSPITAL</p>
                <p className="text-[10px] text-slate-500 font-sans">HEALTH RECORDS & INFORMATION DIVISION</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">HOSPITAL FILE NUMBER</span>
                  <span className="text-lg font-bold text-slate-900">{patient.fileNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">LEGACY PAPER STAMP</span>
                  <span className="text-xs font-bold text-amber-900">{patient.legacyPaperFileNumber || "NEW-DIGITAL"}</span>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                <span className="text-[10px] text-slate-400 block font-sans">PATIENT NAME</span>
                <span className="font-bold text-sm text-slate-900 font-sans">
                  {patient.lastName.toUpperCase()}, {patient.firstName} {patient.middleName || ""}
                </span>
                <p className="text-[11px] text-slate-600 font-sans mt-0.5">
                  {patient.gender} • {patient.ageYears} yrs • NIN: {patient.nin || "N/A"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-900 text-white p-2 rounded-lg">
                  <span className="text-[9px] block text-slate-400 font-sans">GENOTYPE</span>
                  <span className="text-base font-bold">{patient.genotype}</span>
                </div>
                <div className="bg-white border border-slate-300 text-slate-900 p-2 rounded-lg">
                  <span className="text-[9px] block text-slate-500 font-sans">BLOOD GROUP</span>
                  <span className="text-base font-bold">{patient.bloodGroup}</span>
                </div>
              </div>

              <div className="bg-amber-100 text-amber-950 p-2 rounded-lg font-sans text-[11px]">
                <span className="font-bold block text-[10px] uppercase text-amber-800">PHYSICAL ARCHIVE COORDINATES</span>
                <span>{patient.physicalArchive.roomNumber}</span> • <span>{patient.physicalArchive.cabinet}</span> • <span>{patient.physicalArchive.shelfOrDrawer}</span>
              </div>
            </div>

            {/* Shelf Instructions */}
            <div className="space-y-3 text-xs text-slate-600 bg-slate-50 p-5 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm font-sans flex items-center gap-1.5">
                <Archive className="w-4 h-4 text-emerald-600" />
                How the Paper Bridge Works
              </h4>
              <p>
                1. <strong>Do not throw away old paper folders:</strong> Stick this printed QR label directly onto the front cover of the existing brown Manila card.
              </p>
              <p>
                2. <strong>Instant retrieval:</strong> Whenever the patient returns, staff can scan the QR code with any camera or phone to instantly load their digital chart in 0.5 seconds.
              </p>
              <p>
                3. <strong>Cabinet Tracking:</strong> The physical file is indexed by cabinet and row, ensuring records officers know exactly where to find old surgery reports or physical papers during power outages.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Patient Billing, Invoicing & Receipts */}
      {activeTab === "billing" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
          <PatientBillingSection patient={patient} />
        </div>
      )}

      {/* Tab 6: Patient Appointments & Clinic Visits */}
      {activeTab === "appointments" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Clinic Appointments & Follow-up Visits</h3>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  Linked to File #{patient.fileNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Outpatient clinic schedules, specialist bookings, physical folder retrieval & visit histories
              </p>
            </div>

            <button
              onClick={() => {
                if (onOpenScheduleAppointment) {
                  onOpenScheduleAppointment(patient);
                } else {
                  setShowScheduleModal(true);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-2xs cursor-pointer shrink-0 transition-colors"
              id="btn-book-patient-appointment"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book Follow-up Appointment</span>
            </button>
          </div>

          {/* Quick Schedule Presets for Clinicians */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1 pr-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              Quick Doctor Presets:
            </span>
            <button
              onClick={() => handleQuickSchedulePreset(3, "Review laboratory & diagnostic test results")}
              className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-300 hover:border-emerald-300 rounded-md text-xs font-medium transition-colors cursor-pointer"
            >
              + 3 Days (Lab Review)
            </button>
            <button
              onClick={() => handleQuickSchedulePreset(14, "Routine chronic illness review & medication refill")}
              className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-300 hover:border-emerald-300 rounded-md text-xs font-medium transition-colors cursor-pointer"
            >
              + 2 Weeks (Routine Refill)
            </button>
            <button
              onClick={() => handleQuickSchedulePreset(28, "Blood pressure & glycemic control review")}
              className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-300 hover:border-emerald-300 rounded-md text-xs font-medium transition-colors cursor-pointer"
            >
              + 4 Weeks (BP / Sugar Review)
            </button>
            {patient.genotype === "SS" && (
              <button
                onClick={() => handleQuickSchedulePreset(30, "Monthly sickle cell maintenance & hydroxyurea review", "Hematology & Sickle Cell Clinic")}
                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-md text-xs font-semibold transition-colors cursor-pointer"
              >
                + 1 Month (Hematology & Sickle Cell)
              </button>
            )}
          </div>

          {/* List of Appointments */}
          {patientAppointments.length > 0 ? (
            <div className="space-y-3">
              {patientAppointments.map((apt) => {
                const isScheduled = apt.status === "scheduled";
                const isWaiting = apt.status === "checked_in";
                const isInConsult = apt.status === "in_consultation";
                const isCompleted = apt.status === "completed";
                const isCancelled = apt.status === "cancelled";

                return (
                  <div
                    key={apt.id}
                    className={`rounded-xl border p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isWaiting
                        ? "border-blue-400 bg-blue-50/40 shadow-xs"
                        : isInConsult
                        ? "border-emerald-400 bg-emerald-50/40 shadow-xs"
                        : isCompleted
                        ? "border-slate-200 bg-slate-50/60 opacity-80"
                        : isCancelled
                        ? "border-rose-200 bg-rose-50/40 opacity-70"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 text-white font-extrabold text-xs rounded-lg">
                          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{apt.date}</span>
                          <span className="text-slate-400">•</span>
                          <span>{apt.timeSlot}</span>
                        </div>

                        {/* Status Badge */}
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          isWaiting
                            ? "bg-blue-600 text-white animate-pulse"
                            : isInConsult
                            ? "bg-emerald-600 text-white"
                            : isCompleted
                            ? "bg-slate-200 text-slate-700"
                            : isCancelled
                            ? "bg-rose-100 text-rose-700"
                            : "bg-slate-100 text-slate-700 border border-slate-300"
                        }`}>
                          {apt.status.replace("_", " ")}
                        </span>

                        <span className="text-xs text-slate-500 font-medium">
                          {apt.appointmentType}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-700 flex-wrap">
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {apt.clinic}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-slate-900">{apt.doctorAssigned}</span>
                        {apt.roomNumber && <span className="text-slate-500">({apt.roomNumber})</span>}
                      </div>

                      <div className="text-xs text-slate-700">
                        <span className="text-slate-400 font-medium">Purpose: </span>
                        <span className="font-medium text-slate-900">{apt.reason}</span>
                        {apt.notes && (
                          <span className="text-slate-500 italic block mt-0.5">"{apt.notes}"</span>
                        )}
                      </div>

                      {/* Physical folder status */}
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                        <FolderCheck className={`w-3.5 h-3.5 ${apt.physicalFileRetrieved ? "text-emerald-600" : "text-amber-600"}`} />
                        <span>
                          {apt.physicalFileRetrieved ? "Physical folder pulled & delivered to doctor" : "Physical folder in archive cabinet"}
                        </span>
                        <button
                          onClick={() => handleToggleFile(apt)}
                          className="text-[10px] text-emerald-700 hover:underline cursor-pointer font-bold"
                        >
                          [{apt.physicalFileRetrieved ? "Mark In Archive" : "Mark Retrieved"}]
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {isScheduled && (
                        <button
                          onClick={() => handleCheckInApt(apt)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Check In</span>
                        </button>
                      )}

                      {(isWaiting || isInConsult) && (
                        <button
                          onClick={() => handleCompleteApt(apt)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Conclude</span>
                        </button>
                      )}

                      {!isCompleted && !isCancelled && (
                        <button
                          onClick={() => handleCancelApt(apt)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Cancel appointment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center space-y-2">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">No appointments scheduled for this patient</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Use the button above or quick doctor presets to book an upcoming clinic consult or prescription refill.
              </p>
            </div>
          )}
        </div>
      )}

      {/* MODAL: Book Patient Appointment */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Schedule Clinic Appointment</h3>
                <p className="text-xs text-slate-500">For {patient.lastName}, {patient.firstName} (#{patient.fileNumber})</p>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFollowUp} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Appointment Date</label>
                  <input
                    type="date"
                    value={schDate}
                    onChange={(e) => setSchDate(e.target.value)}
                    required
                    className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Time Slot</label>
                  <select
                    value={schTime}
                    onChange={(e) => setSchTime(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                  >
                    <option value="08:30 AM">08:30 AM</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="09:30 AM">09:30 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="01:30 PM">01:30 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Clinic Department</label>
                <select
                  value={schClinic}
                  onChange={(e) => setSchClinic(e.target.value as ClinicDepartment)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                >
                  {CLINIC_DEPARTMENTS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Assigned Doctor / Clinician</label>
                <select
                  value={schDoctor}
                  onChange={(e) => setSchDoctor(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                >
                  {HOSPITAL_DOCTORS.map((d) => (
                    <option key={d.name} value={d.name}>{d.name} ({d.specialty})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Appointment Type</label>
                <select
                  value={schType}
                  onChange={(e) => setSchType(e.target.value as Appointment["appointmentType"])}
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                >
                  <option value="Routine Follow-up">Routine Follow-up</option>
                  <option value="Lab Result Review">Lab Result Review</option>
                  <option value="Medication Refill">Medication Refill</option>
                  <option value="Antenatal Routine">Antenatal Routine</option>
                  <option value="Post-Op Check">Post-Op Check</option>
                  <option value="Specialist Consultation">Specialist Consultation</option>
                  <option value="Sickle Cell Wellness Review">Sickle Cell Wellness Review</option>
                  <option value="New Patient Intake">New Patient Intake</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Clinical Reason / Purpose</label>
                <input
                  type="text"
                  value={schReason}
                  onChange={(e) => setSchReason(e.target.value)}
                  placeholder="e.g. 2-week blood pressure check & refill"
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Clinical Notes (Optional)</label>
                <textarea
                  value={schNotes}
                  onChange={(e) => setSchNotes(e.target.value)}
                  placeholder="Additional instructions for records or nurse..."
                  rows={2}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs cursor-pointer"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Record Vitals */}
      {showVitalsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 text-sm">Record Triage Clinical Vitals</h3>
            <form onSubmit={handleAddVitals} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={newBpSys}
                    onChange={(e) => setNewBpSys(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={newBpDia}
                    onChange={(e) => setNewBpDia(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newTemp}
                    onChange={(e) => setNewTemp(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Pulse Rate (bpm)</label>
                  <input
                    type="number"
                    value={newPulse}
                    onChange={(e) => setNewPulse(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Body Weight (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newWeight}
                    onChange={(e) => setNewWeight(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Oxygen SPO2 (%)</label>
                  <input
                    type="number"
                    value={newSpo2}
                    onChange={(e) => setNewSpo2(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nurse Triage Notes</label>
                <textarea
                  value={newNurseNotes}
                  onChange={(e) => setNewNurseNotes(e.target.value)}
                  placeholder="Patient reports weakness, headache, fever..."
                  rows={2}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowVitalsModal(false)}
                  className="px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
                >
                  Save Vitals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Consultation Note */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 text-sm">Add Doctor Consultation Note</h3>
            <form onSubmit={handleAddNote} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Chief Complaint</label>
                <input
                  type="text"
                  value={newChiefComplaint}
                  onChange={(e) => setNewChiefComplaint(e.target.value)}
                  placeholder="e.g. Fever x 3 days, body aches, vomiting"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">History of Presenting Illness</label>
                <textarea
                  value={newHpi}
                  onChange={(e) => setNewHpi(e.target.value)}
                  placeholder="Onset, duration, associated symptoms, drug history..."
                  rows={3}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Physical Examination Findings</label>
                <textarea
                  value={newExam}
                  onChange={(e) => setNewExam(e.target.value)}
                  placeholder="Conscious, pallor, chest sounds, abdomen soft..."
                  rows={2}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Provisional / Working Diagnosis</label>
                <select
                  value={newDiagnosis}
                  onChange={(e) => setNewDiagnosis(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                >
                  {COMMON_DIAGNOSES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Treatment Plan & Orders</label>
                <textarea
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value)}
                  placeholder="1. Start oral ACT. 2. Prescribe analgesics. 3. Follow up in 3 days..."
                  rows={3}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
                >
                  Save Consultation Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Order Lab */}
      {showLabModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">Order Laboratory Test</h3>
            <form onSubmit={handleAddLab} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Test</label>
                <select
                  value={selectedLabTest}
                  onChange={(e) => setSelectedLabTest(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-medium"
                >
                  {COMMON_LAB_TESTS.map((t) => (
                    <option key={t.name} value={t.name}>{t.name} ({t.range})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLabModal(false)}
                  className="px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-xs"
                >
                  Confirm Lab Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Prescribe Medicine */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">Prescribe Medication</h3>
            <form onSubmit={handleAddPrescription} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Common Essential Medicine</label>
                <select
                  value={selectedMed.name}
                  onChange={(e) => {
                    const found = COMMON_MEDICATIONS.find((m) => m.name === e.target.value);
                    if (found) setSelectedMed(found);
                  }}
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                >
                  {COMMON_MEDICATIONS.map((m) => (
                    <option key={m.name} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Clinical Dosage Schedule</label>
                <input
                  type="text"
                  value={selectedMed.dose}
                  onChange={(e) => setSelectedMed({ ...selectedMed, dose: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Duration</label>
                <input
                  type="text"
                  value={rxDuration}
                  onChange={(e) => setRxDuration(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nigerian Pidgin Directions (Counseling)</label>
                <textarea
                  value={selectedMed.pidgin}
                  onChange={(e) => setSelectedMed({ ...selectedMed, pidgin: e.target.value })}
                  rows={2}
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-700 italic"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPrescriptionModal(false)}
                  className="px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs"
                >
                  Add to Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Doctor Clinical Notes Modal with Voice Dictation */}
      {isDoctorNotesModalOpen && (
        <DoctorNotesModal
          patient={patient}
          onClose={() => setIsDoctorNotesModalOpen(false)}
          onOpenPrescriptionForPatient={() => {
            setIsDoctorNotesModalOpen(false);
            setIsPrescriptionGeneratorModalOpen(true);
          }}
        />
      )}

      {/* Comprehensive Prescription Generator Modal with PDF & Print */}
      {isPrescriptionGeneratorModalOpen && (
        <PrescriptionGeneratorModal
          patient={patient}
          onClose={() => setIsPrescriptionGeneratorModalOpen(false)}
        />
      )}
    </div>
  );
};
