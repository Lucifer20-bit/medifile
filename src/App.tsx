import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { DepartmentTray } from "./components/DepartmentTray";
import { PatientFileDetail } from "./components/PatientFileDetail";
import { PhysicalFolderLocator } from "./components/PhysicalFolderLocator";
import { PaperCardDigitizerModal } from "./components/PaperCardDigitizerModal";
import { PatientRegistrationModal } from "./components/PatientRegistrationModal";
import { PrintableFolderStickers } from "./components/PrintableFolderStickers";
import { QRScannerModal } from "./components/QRScannerModal";
import { BackupManagerModal } from "./components/BackupManagerModal";
import { LanguageGuideModal } from "./components/LanguageGuideModal";
import { PharmacyInventoryModal } from "./components/PharmacyInventoryModal";
import { ClinicalSearchAgentModal } from "./components/ClinicalSearchAgentModal";
import { AppointmentSchedulerModal } from "./components/AppointmentSchedulerModal";
import { LandingPage } from "./components/LandingPage";
import { 
  getPatients, 
  subscribePatients, 
  getHospitalConfig 
} from "./lib/storage";
import { Patient, DepartmentType } from "./types";
import { AppLanguage, TRANSLATIONS } from "./lib/i18n";
import { 
  Flame, 
  Archive, 
  Activity, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  Package,
  Globe
} from "lucide-react";

export default function App() {
  const [view, setView] = useState<"landing" | "portal">("landing");
  const [patients, setPatients] = useState<Patient[]>(getPatients());
  const [activeDepartment, setActiveDepartment] = useState<DepartmentType | "all">("all");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<AppLanguage>("en");

  // Modals state
  const [isDigitizerOpen, setIsDigitizerOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isPhysicalArchiveOpen, setIsPhysicalArchiveOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isLanguageGuideOpen, setIsLanguageGuideOpen] = useState(false);
  const [isPharmacyOpen, setIsPharmacyOpen] = useState(false);
  const [isClinicalAgentOpen, setIsClinicalAgentOpen] = useState(false);
  const [isAppointmentsOpen, setIsAppointmentsOpen] = useState(false);
  const [preselectedAppointmentPatient, setPreselectedAppointmentPatient] = useState<Patient | undefined>(undefined);
  const [printStickerPatient, setPrintStickerPatient] = useState<Patient | null>(null);

  // Sync state with storage updates
  useEffect(() => {
    const unsubscribe = subscribePatients((updatedList) => {
      setPatients(updatedList);
      // Keep selected patient updated if active
      if (selectedPatient) {
        const found = updatedList.find((p) => p.id === selectedPatient.id);
        if (found) {
          setSelectedPatient(found);
        }
      }
    });
    return () => unsubscribe();
  }, [selectedPatient]);

  const handleSelectPatient = (p: Patient) => {
    setSelectedPatient(p);
  };

  const handlePatientDigitized = (p: Patient) => {
    setSelectedPatient(p);
  };

  const handlePatientCreated = (p: Patient) => {
    setSelectedPatient(p);
    setPrintStickerPatient(p); // Prompt sticker print immediately
  };

  // Metrics
  const totalPatients = patients.length;
  const pendingTriage = patients.filter((p) => p.currentDepartment === "triage").length;
  const waitingDoctor = patients.filter((p) => p.currentDepartment === "doctor").length;
  const checkedOutPhysical = patients.filter((p) => p.physicalArchive.physicalStatus === "checked_out").length;
  const sickleCellWarriors = patients.filter((p) => p.genotype === "SS").length;

  const t = TRANSLATIONS[currentLanguage];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-emerald-200">
      {view === "landing" ? (
        <LandingPage
          onEnterPortal={() => setView("portal")}
          onOpenDigitizer={() => setIsDigitizerOpen(true)}
          onOpenScanner={() => setIsScannerOpen(true)}
          onOpenPhysicalArchive={() => {
            setView("portal");
            setIsPhysicalArchiveOpen(true);
          }}
          onOpenPharmacy={() => setIsPharmacyOpen(true)}
          onOpenClinicalAgent={() => setIsClinicalAgentOpen(true)}
        />
      ) : (
        <>
          {/* Top Header */}
          <Header
            currentLanguage={currentLanguage}
            onLanguageChange={setCurrentLanguage}
            onOpenDigitizer={() => setIsDigitizerOpen(true)}
            onOpenRegistration={() => setIsRegistrationOpen(true)}
            onOpenPhysicalArchive={() => setIsPhysicalArchiveOpen(true)}
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenBackup={() => setIsBackupOpen(true)}
            onSelectPatient={handleSelectPatient}
            onOpenLanguageGuide={() => setIsLanguageGuideOpen(true)}
            onOpenPharmacy={() => setIsPharmacyOpen(true)}
            onOpenClinicalAgent={() => setIsClinicalAgentOpen(true)}
            onNavigateToLanding={() => setView("landing")}
            onOpenAppointments={() => {
              setPreselectedAppointmentPatient(undefined);
              setIsAppointmentsOpen(true);
            }}
          />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Hospital Metrics Summary Bar */}
        {!selectedPatient && !isPhysicalArchiveOpen && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Folders</span>
                <Users className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="text-xl font-extrabold text-slate-900 mt-1">{totalPatients}</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Indexed in facility</p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-bold uppercase tracking-wider">Triage Queue</span>
                <Activity className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="text-xl font-extrabold text-blue-700 mt-1">{pendingTriage}</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Vitals verification</p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-bold uppercase tracking-wider">Doctor GOPD</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="text-xl font-extrabold text-emerald-800 mt-1">{waitingDoctor}</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Awaiting consultation</p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-bold uppercase tracking-wider">Checked Out</span>
                <Archive className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-extrabold text-amber-800 mt-1">{checkedOutPhysical}</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Physical files in clinics</p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-rose-200 shadow-2xs col-span-2 sm:col-span-1 bg-rose-50/40">
              <div className="flex items-center justify-between text-rose-700">
                <span className="text-[10px] font-bold uppercase tracking-wider">Sickle Cell (SS)</span>
                <Flame className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <div className="text-xl font-extrabold text-rose-700 mt-1">{sickleCellWarriors}</div>
              <p className="text-[10px] text-rose-600/80 mt-0.5">Fast-track protocol</p>
            </div>
          </div>
        )}

        {/* View 1: Patient File Detail (Digital Manila Folder) */}
        {selectedPatient ? (
          <PatientFileDetail
            patient={selectedPatient}
            onBack={() => setSelectedPatient(null)}
            onOpenPrintSticker={(p) => setPrintStickerPatient(p)}
            onOpenPhysicalArchive={() => {
              setIsPhysicalArchiveOpen(true);
            }}
            onOpenScheduleAppointment={(p) => {
              setPreselectedAppointmentPatient(p);
              setIsAppointmentsOpen(true);
            }}
          />
        ) : isPhysicalArchiveOpen ? (
          /* View 2: Physical Shelf & Cabinet Navigator */
          <PhysicalFolderLocator
            patients={patients}
            onSelectPatient={handleSelectPatient}
            onOpenPrintSticker={(p) => setPrintStickerPatient(p)}
            onClose={() => setIsPhysicalArchiveOpen(false)}
          />
        ) : (
          /* View 3: Station Department Folders Queue */
          <DepartmentTray
            patients={patients}
            activeDepartment={activeDepartment}
            onSelectDepartment={setActiveDepartment}
            onSelectPatient={handleSelectPatient}
            onOpenPrintSticker={(p) => setPrintStickerPatient(p)}
            onOpenPhysicalArchive={() => setIsPhysicalArchiveOpen(true)}
            onOpenRegistration={() => setIsRegistrationOpen(true)}
            onOpenAppointmentsScheduler={() => {
              setPreselectedAppointmentPatient(undefined);
              setIsAppointmentsOpen(true);
            }}
            onBookFollowUp={(p) => {
              setPreselectedAppointmentPatient(p);
              setIsAppointmentsOpen(true);
            }}
            currentLanguage={currentLanguage}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">MediFile NG</span>
            <span>•</span>
            <span>Bridging Nigeria's Paper Medical Records to Digital Standards</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Offline-First (PWA Ready)</span>
            <span>•</span>
            <span>NIN & NHIA Compatible</span>
            <span>•</span>
            <span>Thermal Label & Manila Card Compatible</span>
          </div>
        </div>
      </footer>
    </>
  )}

  {/* MODALS */}
      {/* 1. AI Paper Card Digitizer */}
      {isDigitizerOpen && (
        <PaperCardDigitizerModal
          onClose={() => setIsDigitizerOpen(false)}
          onPatientDigitized={handlePatientDigitized}
        />
      )}

      {/* 2. New Patient Intake Registration */}
      {isRegistrationOpen && (
        <PatientRegistrationModal
          onClose={() => setIsRegistrationOpen(false)}
          onPatientCreated={handlePatientCreated}
        />
      )}

      {/* 3. QR / Barcode Scanner */}
      {isScannerOpen && (
        <QRScannerModal
          onClose={() => setIsScannerOpen(false)}
          onPatientFound={handleSelectPatient}
        />
      )}

      {/* 4. Printable Manila Folder Sticker & Patient Plastic Card */}
      {printStickerPatient && (
        <PrintableFolderStickers
          patient={printStickerPatient}
          onClose={() => setPrintStickerPatient(null)}
        />
      )}

      {/* 5. Offline Database & Daily Flash Drive Backup */}
      {isBackupOpen && (
        <BackupManagerModal
          onClose={() => setIsBackupOpen(false)}
          onDataChanged={() => setPatients(getPatients())}
        />
      )}

      {/* 6. Nigerian Clinical Language Phrases */}
      {isLanguageGuideOpen && (
        <LanguageGuideModal
          onClose={() => setIsLanguageGuideOpen(false)}
        />
      )}

      {/* 7. Pharmacy Inventory & Stock Management */}
      {isPharmacyOpen && (
        <PharmacyInventoryModal
          onClose={() => setIsPharmacyOpen(false)}
        />
      )}

      {/* 8. Clinical AI Intelligence & Gemini Live Voice Assistant */}
      {isClinicalAgentOpen && (
        <ClinicalSearchAgentModal
          onClose={() => setIsClinicalAgentOpen(false)}
        />
      )}

      {/* 9. Front Desk Outpatient Appointment Scheduling Modal */}
      {isAppointmentsOpen && (
        <AppointmentSchedulerModal
          onClose={() => {
            setIsAppointmentsOpen(false);
            setPreselectedAppointmentPatient(undefined);
          }}
          preselectedPatient={preselectedAppointmentPatient}
          onSelectPatient={(p) => {
            setIsAppointmentsOpen(false);
            setSelectedPatient(p);
          }}
        />
      )}
    </div>
  );
}
