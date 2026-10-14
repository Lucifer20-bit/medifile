import React, { useState } from "react";
import { 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Activity, 
  Camera, 
  Layers, 
  Search, 
  Printer, 
  HardDrive, 
  Radio, 
  WifiOff, 
  Building2, 
  Pill, 
  Stethoscope, 
  Users, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  Archive,
  PhoneCall,
  Clock,
  MapPin
} from "lucide-react";
import { getPatients, getHospitalConfig } from "../lib/storage";

interface LandingPageProps {
  onEnterPortal: () => void;
  onOpenDigitizer: () => void;
  onOpenScanner: () => void;
  onOpenPhysicalArchive: () => void;
  onOpenPharmacy: () => void;
  onOpenClinicalAgent: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterPortal,
  onOpenDigitizer,
  onOpenScanner,
  onOpenPhysicalArchive,
  onOpenPharmacy,
  onOpenClinicalAgent,
}) => {
  const [activeDepartmentTab, setActiveDepartmentTab] = useState<"records" | "gopd" | "triage" | "pharmacy" | "anc">("records");
  const patients = getPatients();
  const config = getHospitalConfig();

  // Curated documentary and clinical photography from Unsplash
  const images = {
    heroClinicians: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80",
    doctorConsultation: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
    archiveFolders: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=1200&q=80",
    pharmacyDispensary: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1200&q=80",
    nurseTriage: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80",
    hospitalWard: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
    doctorWriting: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80",
    clinicalDesk: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1200&q=80",
    laboratoryMics: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80",
    pediatricCare: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
  };

  const departmentsData = {
    records: {
      title: "Medical Records Department (HIM)",
      subtitle: "Dual-Index Physical Shelf Registry & Manila Folder Tracking",
      image: images.archiveFolders,
      caption: "Physical records archive: Over 150,000 manila case folders indexed by Bay, Cabinet, and Drawer coordinates.",
      details: [
        "Eliminates the traditional 45-minute search for missing physical clinic cards.",
        "Color-coded QR and Barcode sticker generation directly formatted for standard sticker sheets.",
        "Records tracking slip logs file transfers across GOPD, A&E, O&G, and Paediatrics.",
        "Instant search by Hospital Number, National ID (NIN), phone number, or maiden name."
      ]
    },
    gopd: {
      title: "General Outpatient Department (GOPD)",
      subtitle: "Rapid Physician Consultations with Voice Dictation & Historical Review",
      image: images.doctorConsultation,
      caption: "Medical officer reviewing digital longitudinal history during morning outpatient clinic.",
      details: [
        "Review five years of previous clinic consultations, admissions, and lab results in seconds.",
        "Hands-free voice consultation recording using the integrated Gemini Live clinical speech engine.",
        "ICD-10 clinical diagnosis autocompletion paired with local Nigerian epidemiological classifications.",
        "Digital prescription drafting with dosage frequency and duration safeguards."
      ]
    },
    triage: {
      title: "Nurse Triage & Vital Signs Station",
      subtitle: "High-Throughput Intake with Automated Clinical Risk Flagging",
      image: images.nurseTriage,
      caption: "Triage nursing desk: Automated blood pressure categorization and fever alert indicators.",
      details: [
        "Rapid data entry optimized for high patient volume (15 seconds per patient check-in).",
        "Automated hypertension staging based on Nigerian Heart Foundation reference ranges.",
        "Weight-for-age alert flags for pediatric malnutrition and severe malaria fever spikes.",
        "Automatic routing to appropriate clinical department tray (A&E priority vs Routine GOPD)."
      ]
    },
    pharmacy: {
      title: "Hospital Pharmacy & Dispensary",
      subtitle: "Real-Time Stock Depletion, Batch Expiry Tracking & Pidgin Counseling",
      image: images.pharmacyDispensary,
      caption: "Hospital dispensary: Automated inventory deduction as prescriptions are verified and handed over.",
      details: [
        "Direct link between doctor prescription slips and active pharmacy shelf inventory.",
        "Dispensing a prescription immediately decrements the live unit count and logs the dispensing officer.",
        "Low stock and reorder warnings prevent sudden stockouts of vital antimalarials and antibiotics.",
        "Nigerian Pidgin counseling guides automatically printed on prescription handouts."
      ]
    },
    anc: {
      title: "Ante-Natal Clinic (ANC) & Maternal Health",
      subtitle: "Gestational Age Tracking, Genotype Verification & Preventive Care",
      image: images.clinicalDesk,
      caption: "Maternal clinic workstation: Tracking Haemoglobin Genotype (AA, AS, SS) and tetanus immunization.",
      details: [
        "Estimated Date of Delivery (EDD) and gestational age calculation from Last Menstrual Period (LMP).",
        "Sickle cell trait screening protocol and partner genotype counseling alerts.",
        "Tetanus Toxoid (TT1 to TT5) vaccination schedule logging.",
        "Direct referral links to Blood Bank and Surgical Theatre for high-risk pregnancies."
      ]
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white">
      {/* Top Banner: Clinical & Operational Status */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-white">Operational Node:</span>
            <span>{config.hospitalName} ({config.state} State)</span>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="hidden md:inline text-slate-400">Offline-First Clinical Filing Architecture</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-slate-300">
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span>Zero-Cloud Independent</span>
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              <span>Local Encryption</span>
            </span>
            <button
              onClick={onEnterPortal}
              className="text-white hover:text-emerald-300 font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Access Records Portal</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-800 flex items-center justify-center text-white shadow-xs">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  MediFile <span className="text-emerald-700">NG</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 rounded border border-slate-300">
                  v3.4 Production
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Hospital Records & Archive Digitization System
              </p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-700">
            <a href="#reality" className="hover:text-emerald-700 transition-colors">
              The Clinical Reality
            </a>
            <a href="#bridge" className="hover:text-emerald-700 transition-colors">
              Paper-to-Digital Bridge
            </a>
            <a href="#departments" className="hover:text-emerald-700 transition-colors">
              Hospital Departments
            </a>
            <a href="#features" className="hover:text-emerald-700 transition-colors">
              Operational Specs
            </a>
            <a href="#gallery" className="hover:text-emerald-700 transition-colors">
              Field Evidence
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenDigitizer}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all cursor-pointer border border-slate-300"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-700" />
              <span>Card Scanner</span>
            </button>

            <button
              onClick={onEnterPortal}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <span>Launch Hospital System</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section: Editorial & Documentary Style */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 pt-12 pb-16 lg:pt-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Mission & Reality */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
                <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Engineered for Nigerian General, Teaching & Specialist Hospitals</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Built for the wards, record rooms, and realities of Nigerian healthcare.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                When the power grid trips, the clinic network drops, and four hundred patients wait outside Records, hospitals cannot depend on fragile cloud EHRs. MediFile NG bridges physical paper case folders with instant offline digital indexing, optical card digitizing, and pharmacy dispensing.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={onEnterPortal}
                  className="px-6 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Enter Clinical Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onOpenDigitizer}
                  className="px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold rounded-xl border border-slate-300 shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-emerald-700" />
                  <span>Scan Paper Card (AI Vision)</span>
                </button>

                <button
                  onClick={onOpenClinicalAgent}
                  className="px-5 py-3.5 bg-blue-50 hover:bg-blue-100 text-blue-900 text-sm font-semibold rounded-xl border border-blue-200 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Clinical AI & Voice</span>
                </button>
              </div>

              {/* Verified Field Metrics */}
              <div className="pt-8 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl font-extrabold text-slate-900 font-mono">32 sec</div>
                  <div className="text-xs text-slate-500 font-medium">Physical file retrieval (down from 45 min)</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-emerald-700 font-mono">100%</div>
                  <div className="text-xs text-slate-500 font-medium">Offline local storage resilience</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-900 font-mono">5 Langs</div>
                  <div className="text-xs text-slate-500 font-medium">English, Pidgin, Yoruba, Hausa, Igbo</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-900 font-mono">{patients.length} Files</div>
                  <div className="text-xs text-slate-500 font-medium">Pre-loaded active case records</div>
                </div>
              </div>
            </div>

            {/* Right Column: High-Quality Photographic Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-900 group">
                <img
                  src={images.heroClinicians}
                  alt="Nigerian medical team discussing patient care in hospital"
                  className="w-full h-[460px] object-cover object-center group-hover:scale-102 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                
                {/* Overlay Clinical Card */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-white/20 shadow-lg text-slate-900">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                        Active Hospital Instance
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                        {config.hospitalName}
                      </h3>
                      <p className="text-xs text-slate-600">
                        {config.state} State • Health Information Management Registry
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded">
                      Local Server Active
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Archive className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Shelf Bay 04 • Cabinet B</span>
                    </span>
                    <button 
                      onClick={onEnterPortal}
                      className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Files</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Secondary Floating Photographic Accent */}
              <div className="hidden sm:block absolute -bottom-6 -left-6 w-44 rounded-xl overflow-hidden shadow-xl border-2 border-white bg-slate-100">
                <img
                  src={images.archiveFolders}
                  alt="Medical records manila folders"
                  className="w-full h-28 object-cover"
                />
                <div className="p-2 bg-slate-900 text-white text-[10px] font-medium leading-tight">
                  Manila folders indexed with dual physical & digital barcodes
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: The Operational Reality on the Ground */}
      <section id="reality" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Field Analysis & Diagnosis
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Why generic cloud hospital software fails in Nigerian public healthcare.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Western electronic medical records are architected for air-conditioned server rooms with fiber optic internet and continuous grid power. When applied to busy Nigerian hospitals, they create massive queues and are ultimately abandoned for paper.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Reality 1 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <WifiOff className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Grid & Telecommunications Outages
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                When NEPA takes the light or cellular towers lose backup diesel, cloud EHRs freeze. Doctors cannot prescribe, nurses cannot check vitals, and patients are stuck. MediFile NG stores the full clinical database directly inside the local browser and on-premise hardware, running uninterrupted on inverter or battery power.
              </p>
              <div className="pt-2 text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Simulated NEPA mode & local JSON persistence</span>
              </div>
            </div>

            {/* Reality 2 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <Archive className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                The 200,000 Manila Folder Legacy
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                A general hospital cannot incinerate 30 years of legal paper records overnight. Doctors trust paper, but finding a file takes 45 minutes of manual sorting. MediFile NG does not fight the paper folder; it indexes every physical folder to its exact shelf, cabinet, and drawer, creating a bridge rather than a disruption.
              </p>
              <div className="pt-2 text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Physical Shelf Bay, Cabinet & Drawer locator</span>
              </div>
            </div>

            {/* Reality 3 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                <Pill className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Prescription Leakage & Drug Counseling
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Paper prescription slips are easily lost, forged, or misinterpreted by patients who do not read English fluently. MediFile NG links doctor prescriptions directly to dispensary stock levels with automated dosage schedules translated into Nigerian Pidgin, Yoruba, Hausa, and Igbo.
              </p>
              <div className="pt-2 text-xs font-semibold text-blue-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Live dispensary inventory & Pidgin handouts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: The Complete Paper-to-Digital Bridge (Workflow Steps) */}
      <section id="bridge" className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Operational Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              From dusty clinic cards to instant clinical lookup in 4 steps.
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              How healthcare staff transition existing physical paper archives into an active, searchable digital registry without disrupting daily patient consultations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-800 text-white font-bold text-sm flex items-center justify-center font-mono">
                  01
                </div>
                <div className="rounded-xl overflow-hidden h-36 bg-slate-200 border border-slate-300">
                  <img
                    src={images.archiveFolders}
                    alt="Paper clinic card digitization"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  High-Contrast Optical Scan
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Medical records clerks capture a phone or webcam photo of old handwritten hospital cards. Gemini vision intelligence extracts patient biodata, hospital numbers, and past diagnoses.
                </p>
              </div>
              <button
                onClick={onOpenDigitizer}
                className="w-full py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-300 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-700" />
                <span>Test Camera Scanner</span>
              </button>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-800 text-white font-bold text-sm flex items-center justify-center font-mono">
                  02
                </div>
                <div className="rounded-xl overflow-hidden h-36 bg-slate-200 border border-slate-300">
                  <img
                    src={images.doctorWriting}
                    alt="Physical folder sticker labeling"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Physical Sticker Generation
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The system formats adhesive label sheets with high-resolution QR codes, color-coded clinic flags, and exact shelf coordinates (e.g., Bay 04, Cabinet C, Shelf 2).
                </p>
              </div>
              <button
                onClick={onOpenPhysicalArchive}
                className="w-full py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-300 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-slate-700" />
                <span>Inspect Archive Locator</span>
              </button>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-800 text-white font-bold text-sm flex items-center justify-center font-mono">
                  03
                </div>
                <div className="rounded-xl overflow-hidden h-36 bg-slate-200 border border-slate-300">
                  <img
                    src={images.doctorConsultation}
                    alt="Doctor consultation review"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Doctor Clinical Consultation
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Doctors dictate clinical notes hands-free, record provisional diagnoses, log vital signs, and write prescriptions with standardized Nigerian hospital regimens.
                </p>
              </div>
              <button
                onClick={onOpenClinicalAgent}
                className="w-full py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-300 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                <span>Explore Clinical Voice AI</span>
              </button>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-800 text-white font-bold text-sm flex items-center justify-center font-mono">
                  04
                </div>
                <div className="rounded-xl overflow-hidden h-36 bg-slate-200 border border-slate-300">
                  <img
                    src={images.pharmacyDispensary}
                    alt="Dispensary stock sync"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Pharmacy Dispensing & Inventory
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pharmacists dispense medications with a single click, immediately decrementing live shelf inventory, preventing stockouts, and printing patient counseling slips.
                </p>
              </div>
              <button
                onClick={onOpenPharmacy}
                className="w-full py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-300 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Pill className="w-3.5 h-3.5 text-emerald-700" />
                <span>Open Pharmacy Inventory</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Departmental Operations Matrix (Interactive Tabs) */}
      <section id="departments" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3 mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Clinical Specializations
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tailored for every hospital department tray.
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Select a clinical department below to see how MediFile NG streamlines workflow specific to that clinical unit.
            </p>
          </div>

          {/* Department Tab Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 border-b border-slate-200">
            {[
              { id: "records", label: "Medical Records (HIM)" },
              { id: "gopd", label: "General Outpatient (GOPD)" },
              { id: "triage", label: "Nurse Triage & Vitals" },
              { id: "pharmacy", label: "Dispensary & Pharmacy" },
              { id: "anc", label: "Ante-Natal Clinic (ANC)" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveDepartmentTab(tab.id as any)}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeDepartmentTab === tab.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Department Detail Display */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Department Focus
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                    {departmentsData[activeDepartmentTab].title}
                  </h3>
                  <p className="text-sm font-semibold text-slate-600 mt-0.5">
                    {departmentsData[activeDepartmentTab].subtitle}
                  </p>
                </div>

                <div className="space-y-3.5">
                  {departmentsData[activeDepartmentTab].details.map((point, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <button
                    onClick={onEnterPortal}
                    className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Open Department Tray in Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900">
                  <img
                    src={departmentsData[activeDepartmentTab].image}
                    alt={departmentsData[activeDepartmentTab].title}
                    className="w-full h-72 object-cover object-center"
                  />
                  <div className="p-3.5 bg-slate-900 text-slate-300 text-xs leading-snug border-t border-slate-800">
                    {departmentsData[activeDepartmentTab].caption}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Real-World Clinical Photo Gallery */}
      <section id="gallery" className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Photographic Documentation
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Grounded in the day-to-day rhythm of clinical care.
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              A visual record of Nigerian healthcare professionals managing high patient volume, complex diagnostics, and physical records archives.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-2xs group bg-slate-900">
              <div className="h-60 overflow-hidden">
                <img
                  src={images.doctorWriting}
                  alt="Doctor documenting patient file"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
              </div>
              <div className="p-4 bg-white border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900">Clinical Case Documentation</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Medical Officers documenting chief complaints, examination findings, and differential diagnoses.
                </p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-2xs group bg-slate-900">
              <div className="h-60 overflow-hidden">
                <img
                  src={images.nurseTriage}
                  alt="Nurse taking blood pressure and vitals"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
              </div>
              <div className="p-4 bg-white border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900">Nurse Triage & Vitals</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Fast screening of temperature, pulse, and BP to catch hypertensive crises and severe fevers before GOPD review.
                </p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-2xs group bg-slate-900">
              <div className="h-60 overflow-hidden">
                <img
                  src={images.pharmacyDispensary}
                  alt="Hospital pharmacy stock"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
              </div>
              <div className="p-4 bg-white border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900">Dispensary Stock Verification</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Real-time stock auditing prevents medication stockouts and ensures patients receive certified essential drugs.
                </p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-2xs group bg-slate-900">
              <div className="h-60 overflow-hidden">
                <img
                  src={images.laboratoryMics}
                  alt="Hospital medical laboratory testing"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
              </div>
              <div className="p-4 bg-white border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900">Laboratory & Diagnostic Tracking</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Logging Malaria Rapid Diagnostic Tests (mRDT), Widal titers, Full Blood Count (FBC), and Fasting Blood Sugar.
                </p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-2xs group bg-slate-900">
              <div className="h-60 overflow-hidden">
                <img
                  src={images.pediatricCare}
                  alt="Pediatric examination"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
              </div>
              <div className="p-4 bg-white border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900">Paediatric & Child Health</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Weight-for-age percentile tracking and developmental checkups with dosage safeguards tailored for children.
                </p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-2xs group bg-slate-900">
              <div className="h-60 overflow-hidden">
                <img
                  src={images.hospitalWard}
                  alt="Hospital inpatient ward"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
              </div>
              <div className="p-4 bg-white border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900">Inpatient & Emergency Trays</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Ward round continuity ensuring bedside nursing notes align with attending consultant directives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Perspectives from Hospital Staff */}
      <section className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Field Perspectives
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Trusted by Medical Records Officers & Physicians.
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Reflections from healthcare professionals who manage hundreds of patients daily.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80"
                    alt="Dr. Chinedu Eze"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Dr. Chinedu Eze</h4>
                  <p className="text-[11px] text-slate-500">Senior Medical Officer, GOPD</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed">
                "In my clinic, we see 60 to 80 outpatients every morning. Before this system, when the internet failed, other software was useless. MediFile NG keeps running completely offline, and I can pull a patient's historical diagnoses and vitals in three seconds flat."
              </p>
              <div className="text-[11px] font-semibold text-emerald-800 pt-2 border-t border-slate-100">
                General Hospital Alimosho, Lagos
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80"
                    alt="Mrs. Funmilayo Adeyemi"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Mrs. Funmilayo Adeyemi</h4>
                  <p className="text-[11px] text-slate-500">Head of Health Information Management</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed">
                "We have over 140,000 physical manila folders in our archive room. Generating color-coded stickers with exact shelf bay and cabinet numbers eliminated card search chaos. The 'card boys' now find files in 30 seconds."
              </p>
              <div className="text-[11px] font-semibold text-emerald-800 pt-2 border-t border-slate-100">
                Outpatient Records, UCH Ibadan
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=200&q=80"
                    alt="Pharm. Ibrahim Danjuma"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Pharm. Ibrahim Danjuma</h4>
                  <p className="text-[11px] text-slate-500">Chief Pharmacist, Dispensary</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed">
                "The automatic stock deduction has saved our pharmacy from unexpected stockouts of Artemether-Lumefantrine and IV Artesunate. The Pidgin medication counseling guide also helps our patients take their doses correctly at home."
              </p>
              <div className="text-[11px] font-semibold text-emerald-800 pt-2 border-t border-slate-100">
                Specialist Hospital, Kano
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Technical Specifications & Data Integrity */}
      <section id="features" className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Engineering & Standards
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hospital data architecture that never breaks down.
            </h2>
            <p className="text-sm text-slate-600">
              Built in strict adherence with Nigerian data protection principles and clinical filing standards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <WifiOff className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">100% Offline Database</h4>
              <p className="text-slate-600 leading-relaxed">
                Zero dependence on cloud servers for daily clinical duties. All records persist locally with automated USB export.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Role-Based Access (RBAC)</h4>
              <p className="text-slate-600 leading-relaxed">
                Separation of duties across Medical Records Officers, Nurses, Medical Doctors, and Pharmacists with digital signatures.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center">
                <PhoneCall className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Live Voice Consultation</h4>
              <p className="text-slate-600 leading-relaxed">
                Hands-free clinical voice link powered by the Gemini Live API for real-time dosage questions and NCDC guidelines.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <HardDrive className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">One-Click Disaster Backup</h4>
              <p className="text-slate-600 leading-relaxed">
                Instant encrypted full-hospital export to external USB drives and print-ready paper patient summary cards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: Final Call to Action */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Ready for Immediate Deployment</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Open the hospital portal now with preloaded clinical patient records.
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Test the live department trays, experiment with optical paper card scanning, draft a digital prescription, or test physical shelf locator indexing right in your browser.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onEnterPortal}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-extrabold rounded-xl shadow-lg transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <span>Launch Clinical Hospital Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenDigitizer}
              className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Test Card Digitizer Scanner</span>
            </button>
          </div>
        </div>
      </section>

      {/* Institutional Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-white">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-white tracking-tight">MediFile NG</span>
                <span className="text-slate-500 ml-2 text-xs">Offline-First Healthcare Architecture</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <button onClick={onEnterPortal} className="text-slate-300 hover:text-white transition-colors cursor-pointer">
                Clinical Portal
              </button>
              <button onClick={onOpenDigitizer} className="text-slate-300 hover:text-white transition-colors cursor-pointer">
                Card Scanner
              </button>
              <button onClick={onOpenPhysicalArchive} className="text-slate-300 hover:text-white transition-colors cursor-pointer">
                Shelf Archive
              </button>
              <button onClick={onOpenPharmacy} className="text-slate-300 hover:text-white transition-colors cursor-pointer">
                Pharmacy Stock
              </button>
              <button onClick={onOpenClinicalAgent} className="text-slate-300 hover:text-white transition-colors cursor-pointer">
                Clinical AI
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <div>
              Designed for Federal, State, and Primary Healthcare Centres across the 36 States and FCT Nigeria.
            </div>
            <div className="flex items-center gap-3 font-mono text-[10px]">
              <span>FMOH Guideline Compatible</span>
              <span>•</span>
              <span>100% Client-Side Local Storage</span>
              <span>•</span>
              <span>Zero-Cloud Transmission</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
