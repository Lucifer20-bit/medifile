import React, { useState, useEffect, useRef } from "react";
import { 
  Building2, 
  Search, 
  Wifi, 
  WifiOff, 
  Globe, 
  FileText, 
  QrCode, 
  Camera, 
  Archive, 
  UserPlus, 
  HardDrive,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  UserCheck,
  Package,
  Layers,
  Calendar
} from "lucide-react";
import { AppLanguage, TRANSLATIONS } from "../lib/i18n";
import { 
  getHospitalConfig, 
  saveHospitalConfig, 
  getSimulatedNepaMode, 
  setSimulatedNepaMode, 
  getActiveStaff, 
  saveActiveStaff,
  getPatients,
  getLowStockAlerts
} from "../lib/storage";
import { Patient } from "../types";

interface HeaderProps {
  currentLanguage: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  onOpenDigitizer: () => void;
  onOpenRegistration: () => void;
  onOpenPhysicalArchive: () => void;
  onOpenScanner: () => void;
  onOpenBackup: () => void;
  onSelectPatient: (patient: Patient) => void;
  onOpenLanguageGuide: () => void;
  onOpenPharmacy?: () => void;
  onOpenClinicalAgent?: () => void;
  onNavigateToLanding?: () => void;
  onOpenAppointments?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  onOpenDigitizer,
  onOpenRegistration,
  onOpenPhysicalArchive,
  onOpenScanner,
  onOpenBackup,
  onSelectPatient,
  onOpenLanguageGuide,
  onOpenPharmacy,
  onOpenClinicalAgent,
  onNavigateToLanding,
  onOpenAppointments
}) => {
  const [config, setConfig] = useState(getHospitalConfig());
  const [staff, setStaff] = useState(getActiveStaff());
  const [isNepaMode, setIsNepaMode] = useState(getSimulatedNepaMode());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const lowStockCount = getLowStockAlerts().length;

  const t = TRANSLATIONS[currentLanguage];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }
    const clean = q.toLowerCase().trim();
    const all = getPatients();
    const matched = all.filter((p) => {
      return (
        p.fileNumber.toLowerCase().includes(clean) ||
        p.lastName.toLowerCase().includes(clean) ||
        p.firstName.toLowerCase().includes(clean) ||
        (p.nin && p.nin.includes(clean)) ||
        p.phone.includes(clean) ||
        (p.legacyPaperFileNumber && p.legacyPaperFileNumber.toLowerCase().includes(clean)) ||
        p.barcodeNumber.includes(clean)
      );
    });
    setSearchResults(matched.slice(0, 8));
    setIsSearchOpen(true);
  };

  const toggleNepaMode = () => {
    const next = !isNepaMode;
    setIsNepaMode(next);
    setSimulatedNepaMode(next);
  };

  const handleStaffChange = (newRole: typeof staff.role, name: string) => {
    const updated = { ...staff, role: newRole, name };
    setStaff(updated);
    saveActiveStaff(updated);
    setIsStaffDropdownOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Notification / Nigerian Context Banner */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-white tracking-wide">MediFile NG</span>
            <span className="text-slate-400 hidden sm:inline">| Nigerian Hospital Filing System & Archive Bridge</span>
          </div>
          <span className="hidden md:inline-block bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] font-mono">
            {config.filePrefix}***
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Simulated NEPA Outage / Offline Indicator */}
          <button
            onClick={toggleNepaMode}
            id="nepa-mode-toggle"
            title="Click to simulate NEPA power cut / offline resilience mode"
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium transition-all text-[11px] ${
              isNepaMode
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
            }`}
          >
            {isNepaMode ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span>NEPA Outage Mode (Local Storage Safe)</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>Hospital Network (Online)</span>
              </>
            )}
          </button>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-slate-800 rounded px-1.5 py-0.5">
            <Globe className="w-3 h-3 text-slate-400" />
            <select
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value as AppLanguage)}
              className="bg-transparent text-white text-[11px] focus:outline-hidden font-medium cursor-pointer"
              id="language-select"
            >
              <option value="en" className="bg-slate-900 text-white">English</option>
              <option value="pcm" className="bg-slate-900 text-white">Pidgin (Naija)</option>
              <option value="ha" className="bg-slate-900 text-white">Hausa</option>
              <option value="yo" className="bg-slate-900 text-white">Yorùbá</option>
              <option value="ig" className="bg-slate-900 text-white">Igbo</option>
            </select>
          </div>

          <button
            onClick={onOpenLanguageGuide}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-medium cursor-pointer"
            id="open-pidgin-helper"
          >
            Cultural Phrases
          </button>

          {onNavigateToLanding && (
            <button
              onClick={onNavigateToLanding}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-0.5 rounded transition-colors cursor-pointer border border-slate-700"
              title="Return to public landing page and project overview"
            >
              <Layers className="w-3 h-3 text-emerald-400" />
              <span>Landing Page</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Hospital Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-xs">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                {config.hospitalName}
              </h1>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold px-2 py-0.2 rounded">
                NG-HIM Certified
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Medical Records & Physical Manila Folder Management
            </p>
          </div>
        </div>

        {/* Global Patient Fast Search */}
        <div className="relative flex-1 max-w-md" ref={searchRef}>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchQuery.trim() && setIsSearchOpen(true)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-24 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all placeholder:text-slate-400 font-medium"
              id="global-patient-search"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                onClick={onOpenScanner}
                title="Scan QR or Barcode"
                className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                id="search-scan-qr-btn"
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-200 rounded border border-slate-300">
                /
              </kbd>
            </div>
          </div>

          {/* Search Dropdown Results */}
          {isSearchOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  <div className="px-3 py-2 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex justify-between">
                    <span>Found {searchResults.length} matching patients</span>
                    <span>Click to open digital folder</span>
                  </div>
                  {searchResults.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectPatient(p);
                        setIsSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="w-full px-3 py-2.5 text-left hover:bg-emerald-50/70 transition-colors flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 group-hover:text-emerald-800 text-xs">
                            {p.lastName}, {p.firstName} {p.middleName || ""}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold">
                            {p.fileNumber}
                          </span>
                          {p.genotype === "SS" && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[10px]">
                              Hb SS
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                          <span>{p.gender}, {p.ageYears} yrs</span>
                          <span>•</span>
                          <span>{p.phone}</span>
                          {p.nin && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-[10px]">NIN: {p.nin}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] font-medium text-slate-500">
                          {p.physicalArchive.cabinet}
                        </div>
                        <span className="text-[10px] text-emerald-700 font-semibold">
                          {p.currentDepartment.toUpperCase()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500">
                  <p className="text-xs font-medium">No patient found matching "{searchQuery}"</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Try searching by full phone number, National ID (NIN), or old Manila card number.
                  </p>
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      onOpenRegistration();
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Open New Folder for this Patient
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Controls & Active Staff Indicator */}
        <div className="flex items-center flex-wrap gap-2">
          {/* AI Digitizer Button */}
          <button
            onClick={onOpenDigitizer}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-2xs transition-all cursor-pointer"
            id="btn-ai-digitizer"
            title="Digitize physical paper clinic cards or handwritten doctor notes using AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden lg:inline">{t.digitizePaperCard}</span>
            <span className="lg:hidden">AI Digitizer</span>
          </button>

          {/* Real-time Google Search Clinical AI Assistant */}
          {onOpenClinicalAgent && (
            <button
              onClick={onOpenClinicalAgent}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-lg shadow-2xs transition-all cursor-pointer"
              id="btn-clinical-search-agent"
              title="Clinical AI with live Google Search grounding and voice consultation"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden lg:inline">Clinical AI & Search</span>
              <span className="lg:hidden">AI Search</span>
            </button>
          )}

          {/* Pharmacy Stock & Inventory */}
          {onOpenPharmacy && (
            <button
              onClick={onOpenPharmacy}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-all cursor-pointer relative"
              id="btn-pharmacy-inventory"
              title="Hospital Pharmacy Inventory & Stock Management"
            >
              <Package className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Pharmacy Stock</span>
              {lowStockCount > 0 && (
                <span className="bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                  {lowStockCount}
                </span>
              )}
            </button>
          )}

          {/* Clinic Appointments & Bookings */}
          {onOpenAppointments && (
            <button
              onClick={onOpenAppointments}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-all cursor-pointer"
              id="btn-header-appointments"
              title="Schedule outpatient appointments & doctor clinics"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Appointments</span>
            </button>
          )}

          {/* New Patient Registration */}
          <button
            onClick={onOpenRegistration}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-all cursor-pointer"
            id="btn-new-patient"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.registerNewPatient}</span>
            <span className="sm:hidden">New</span>
          </button>

          {/* Physical Manila Folder Archive Shelf Locator */}
          <button
            onClick={onOpenPhysicalArchive}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-all cursor-pointer"
            id="btn-shelf-locator"
            title="Locate physical paper folder on shelves and cabinets"
          >
            <Archive className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden md:inline">Shelf Locator</span>
          </button>

          {/* Scanner */}
          <button
            onClick={onOpenScanner}
            className="p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-all cursor-pointer"
            id="btn-scan-qr"
            title="Scan QR Code or Barcode"
          >
            <QrCode className="w-4 h-4 text-slate-700" />
          </button>

          {/* Backup / Export */}
          <button
            onClick={onOpenBackup}
            className="p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-all cursor-pointer"
            id="btn-backup-manager"
            title="Local Hospital Offline Database Backup (Flash Drive Safe)"
          >
            <HardDrive className="w-4 h-4 text-slate-700" />
          </button>

          {/* Active Staff Duty Pill */}
          <div className="relative">
            <button
              onClick={() => setIsStaffDropdownOpen(!isStaffDropdownOpen)}
              className="flex items-center gap-1.5 pl-2.5 pr-2 py-1.5 text-[11px] font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all cursor-pointer"
              id="staff-profile-btn"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <div className="text-left hidden xl:block">
                <p className="font-semibold text-slate-900 leading-none">{staff.name}</p>
                <p className="text-[10px] text-slate-500 leading-none mt-0.5">{staff.role}</p>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isStaffDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50 text-xs">
                <p className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Active Duty Role
                </p>
                <button
                  onClick={() => handleStaffChange("Medical Records Officer", "Amina Danjuma (HIM Lead)")}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 flex flex-col"
                >
                  <span className="font-medium text-slate-900">Medical Records Officer</span>
                  <span className="text-[10px] text-slate-500">Records & Registration Desk</span>
                </button>
                <button
                  onClick={() => handleStaffChange("Staff Nurse", "Nurse Chidinma Eze (RN)")}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 flex flex-col"
                >
                  <span className="font-medium text-slate-900">Staff Nurse (Triage)</span>
                  <span className="text-[10px] text-slate-500">Nursing Station & Vitals</span>
                </button>
                <button
                  onClick={() => handleStaffChange("Medical Doctor", "Dr. Oladipo Johnson (Consultant)")}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 flex flex-col"
                >
                  <span className="font-medium text-slate-900">Medical Doctor (Consultant)</span>
                  <span className="text-[10px] text-slate-500">GOPD / Specialist Clinic</span>
                </button>
                <button
                  onClick={() => handleStaffChange("Lab Scientist", "MLS Ibrahim Danjuma")}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 flex flex-col"
                >
                  <span className="font-medium text-slate-900">Medical Lab Scientist</span>
                  <span className="text-[10px] text-slate-500">Pathology & Diagnostics</span>
                </button>
                <button
                  onClick={() => handleStaffChange("Pharmacist", "Pharm. Fatima Al-Hassan")}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 flex flex-col"
                >
                  <span className="font-medium text-slate-900">Pharmacist</span>
                  <span className="text-[10px] text-slate-500">Hospital Dispensary</span>
                </button>
                <button
                  onClick={() => handleStaffChange("Hospital Cashier", "Mr. Kunle Balogun (Cashier 1)")}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 flex flex-col"
                >
                  <span className="font-medium text-slate-900">Hospital Cashier / Billing</span>
                  <span className="text-[10px] text-slate-500">Cash Office & Invoicing</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
