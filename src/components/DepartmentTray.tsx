import React, { useState, useEffect } from "react";
import { 
  Users, 
  Stethoscope, 
  Activity, 
  FlaskConical, 
  Pill, 
  CreditCard, 
  Archive, 
  ArrowRight, 
  Clock, 
  AlertCircle, 
  Flame, 
  CheckCircle2, 
  Printer, 
  MapPin,
  FileText,
  Filter,
  Plus,
  Calendar,
  CalendarCheck2
} from "lucide-react";
import { Patient, DepartmentType, BillingInvoice } from "../types";
import { AppLanguage, TRANSLATIONS } from "../lib/i18n";
import { upsertPatient, getInvoices, subscribeInvoices } from "../lib/storage";
import { DoctorTodaySchedule } from "./DoctorTodaySchedule";
import { BillingDepartmentDesk } from "./BillingDepartmentDesk";

interface DepartmentTrayProps {
  patients: Patient[];
  activeDepartment: DepartmentType | "all";
  onSelectDepartment: (dept: DepartmentType | "all") => void;
  onSelectPatient: (patient: Patient) => void;
  onOpenPrintSticker: (patient: Patient) => void;
  onOpenPhysicalArchive: (patient?: Patient) => void;
  onOpenRegistration: () => void;
  onOpenAppointmentsScheduler?: () => void;
  onBookFollowUp?: (patient: Patient) => void;
  currentLanguage: AppLanguage;
}

const DEPARTMENTS: { id: DepartmentType; labelKey: keyof typeof TRANSLATIONS["en"]; icon: any; color: string }[] = [
  { id: "records", labelKey: "recordsTray", icon: Archive, color: "text-amber-600 bg-amber-50 border-amber-200" },
  { id: "triage", labelKey: "triageTray", icon: Activity, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { id: "doctor", labelKey: "doctorTray", icon: Stethoscope, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { id: "laboratory", labelKey: "labTray", icon: FlaskConical, color: "text-purple-600 bg-purple-50 border-purple-200" },
  { id: "pharmacy", labelKey: "pharmacyTray", icon: Pill, color: "text-teal-600 bg-teal-50 border-teal-200" },
  { id: "billing", labelKey: "billingTray", icon: CreditCard, color: "text-slate-600 bg-slate-50 border-slate-200" },
];

export const DepartmentTray: React.FC<DepartmentTrayProps> = ({
  patients,
  activeDepartment,
  onSelectDepartment,
  onSelectPatient,
  onOpenPrintSticker,
  onOpenPhysicalArchive,
  onOpenRegistration,
  onOpenAppointmentsScheduler,
  onBookFollowUp,
  currentLanguage
}) => {
  const t = TRANSLATIONS[currentLanguage];
  const [priorityFilter, setPriorityFilter] = useState<"all" | "emergency" | "urgent" | "normal">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [doctorSubView, setDoctorSubView] = useState<"schedule" | "queue">("schedule");
  const [invoices, setInvoices] = useState<BillingInvoice[]>(() => getInvoices());

  useEffect(() => {
    const unsub = subscribeInvoices((updated) => {
      setInvoices(updated);
    });
    return () => unsub();
  }, []);

  const filteredPatients = patients.filter((p) => {
    const matchesDept = activeDepartment === "all" || p.currentDepartment === activeDepartment;
    const matchesPriority = priorityFilter === "all" || p.priority === priorityFilter;
    const matchesSearch = !searchTerm.trim() || (
      p.fullName?.toLowerCase() ||
      `${p.lastName} ${p.firstName}`.toLowerCase()
    ).includes(searchTerm.toLowerCase()) ||
    p.fileNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.nin && p.nin.includes(searchTerm));

    return matchesDept && matchesPriority && matchesSearch;
  });

  const getDepartmentCount = (dept: DepartmentType) => {
    if (dept === "billing") {
      const pendingCount = invoices.filter((i) => i.status === "pending").length;
      const deptCount = patients.filter((p) => p.currentDepartment === dept).length;
      return Math.max(pendingCount, deptCount);
    }
    return patients.filter((p) => p.currentDepartment === dept).length;
  };

  const handleQuickRoute = (e: React.MouseEvent, patient: Patient, targetDept: DepartmentType) => {
    e.stopPropagation();
    const updated: Patient = {
      ...patient,
      currentDepartment: targetDept,
      patientStatus: targetDept === "doctor" ? "waiting" : targetDept === "pharmacy" ? "awaiting_pharmacy" : "waiting",
    };
    upsertPatient(updated, {
      action: "ROUTED_PATIENT",
      details: `Moved digital folder from ${patient.currentDepartment.toUpperCase()} to ${targetDept.toUpperCase()}`
    });
  };

  return (
    <div className="space-y-4">
      {/* Department Station Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-2xs">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => onSelectDepartment("all")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeDepartment === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
            id="tab-all-departments"
          >
            <Users className="w-3.5 h-3.5" />
            <span>All Active Folders</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeDepartment === "all" ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-700"
            }`}>
              {patients.length}
            </span>
          </button>

          {DEPARTMENTS.map((d) => {
            const count = getDepartmentCount(d.id);
            const Icon = d.icon;
            const isActive = activeDepartment === d.id;

            return (
              <button
                key={d.id}
                onClick={() => onSelectDepartment(d.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
                id={`tab-dept-${d.id}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t[d.labelKey]}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive
                    ? "bg-emerald-900 text-emerald-100"
                    : count > 0
                    ? "bg-emerald-100 text-emerald-800 font-bold"
                    : "bg-slate-100 text-slate-500"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Status Sub-bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-100/70 p-2.5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Triage Priority:
          </span>
          <button
            onClick={() => setPriorityFilter("all")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
              priorityFilter === "all" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-600 hover:bg-white/60"
            }`}
          >
            All Priority
          </button>
          <button
            onClick={() => setPriorityFilter("emergency")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
              priorityFilter === "emergency" ? "bg-rose-600 text-white font-semibold" : "text-rose-700 hover:bg-rose-50"
            }`}
          >
            <Flame className="w-3 h-3 text-rose-300" />
            Emergency
          </button>
          <button
            onClick={() => setPriorityFilter("urgent")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
              priorityFilter === "urgent" ? "bg-amber-500 text-white font-semibold" : "text-amber-700 hover:bg-amber-50"
            }`}
          >
            <AlertCircle className="w-3 h-3" />
            Urgent (e.g. Hb SS)
          </button>
          <button
            onClick={() => setPriorityFilter("normal")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
              priorityFilter === "normal" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-600 hover:bg-white/60"
            }`}
          >
            Routine
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Filter list..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-xs px-2.5 py-1 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 w-44"
          />

          {onOpenAppointmentsScheduler && (
            <button
              onClick={onOpenAppointmentsScheduler}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer shrink-0"
              title="Open Front Desk Appointments & Bookings"
              id="btn-open-appointments-tray"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bookings</span>
            </button>
          )}

          <button
            onClick={onOpenRegistration}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-2xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Intake
          </button>
        </div>
      </div>

      {/* Doctor Station Schedule vs Queue Sub-tabs */}
      {activeDepartment === "doctor" && (
        <div className="flex items-center justify-between gap-3 bg-white p-2 rounded-xl border border-emerald-200/80 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 pl-1">Doctor Station View:</span>
            <button
              onClick={() => setDoctorSubView("schedule")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                doctorSubView === "schedule"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              id="btn-doctor-schedule-view"
            >
              <CalendarCheck2 className="w-3.5 h-3.5" />
              <span>Today's Clinic Schedule</span>
            </button>
            <button
              onClick={() => setDoctorSubView("queue")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                doctorSubView === "queue"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              id="btn-doctor-queue-view"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Active Folders in Tray ({getDepartmentCount("doctor")})</span>
            </button>
          </div>

          {onOpenAppointmentsScheduler && (
            <button
              onClick={onOpenAppointmentsScheduler}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold hover:underline cursor-pointer hidden sm:flex items-center gap-1 pr-2"
            >
              <Plus className="w-3 h-3" />
              <span>Schedule Next Patient</span>
            </button>
          )}
        </div>
      )}

      {/* Render Billing Department Desk if Billing Station is active */}
      {activeDepartment === "billing" ? (
        <BillingDepartmentDesk
          patients={patients}
          onSelectPatient={onSelectPatient}
        />
      ) : activeDepartment === "doctor" && doctorSubView === "schedule" ? (
        <DoctorTodaySchedule 
          patients={patients}
          onSelectPatient={onSelectPatient}
          onBookFollowUp={onBookFollowUp}
        />
      ) : filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {filteredPatients.map((patient) => {
            const latestVitals = patient.vitalsHistory[patient.vitalsHistory.length - 1];
            const isSickleCell = patient.genotype === "SS";

            return (
              <div
                key={patient.id}
                onClick={() => onSelectPatient(patient)}
                className="bg-white rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer overflow-hidden group flex flex-col justify-between relative"
                id={`patient-card-${patient.id}`}
              >
                {/* Manila Folder Tab Top simulation */}
                <div className="bg-amber-50/80 border-b border-amber-200/80 px-3.5 py-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-white border border-amber-200 px-2 py-0.5 rounded shadow-2xs">
                      {patient.fileNumber}
                    </span>
                    {patient.legacyPaperFileNumber && (
                      <span className="text-[10px] text-amber-800 bg-amber-100/60 px-1.5 py-0.5 rounded border border-amber-200 font-medium truncate" title="Old paper folder stamped number">
                        Old: {patient.legacyPaperFileNumber}
                      </span>
                    )}
                  </div>

                  {/* Genotype & Blood Group Badge */}
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      isSickleCell 
                        ? "bg-rose-600 text-white animate-pulse shadow-xs" 
                        : "bg-slate-800 text-white"
                    }`}>
                      {patient.genotype}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-slate-200 text-slate-700">
                      {patient.bloodGroup}
                    </span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-3.5 space-y-3 flex-1">
                  {/* Patient Name & Demographics */}
                  <div>
                    <div className="flex items-baseline justify-between gap-1">
                      <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-sm">
                        {patient.lastName}, {patient.firstName} {patient.middleName || ""}
                      </h3>
                      <span className="text-xs font-medium text-slate-500 shrink-0">
                        {patient.gender.charAt(0)} • {patient.ageYears}y
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>{patient.phone}</span>
                      <span>•</span>
                      <span className="truncate">{patient.stateOfOrigin} State ({patient.lga})</span>
                    </div>
                  </div>

                  {/* Sickle Cell Warning / Allergies */}
                  {(isSickleCell || patient.allergies.length > 0) && (
                    <div className="space-y-1">
                      {isSickleCell && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Sickle Cell Warrior (Hb SS) — Watch Hydration & Fever</span>
                        </div>
                      )}
                      {patient.allergies.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                          <span className="font-semibold">Allergies:</span>
                          <span className="truncate">{patient.allergies.join(", ")}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Physical Shelf Locator Box */}
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-200 text-[11px]">
                    <div className="flex items-center justify-between font-medium text-slate-700">
                      <span className="flex items-center gap-1 text-slate-500">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        Physical Manila Shelf:
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                        patient.physicalArchive.physicalStatus === "in_shelf"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {patient.physicalArchive.physicalStatus === "in_shelf" ? "In Shelf" : "Checked Out"}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-800 mt-1 flex items-center justify-between">
                      <span className="truncate">{patient.physicalArchive.cabinet} • {patient.physicalArchive.shelfOrDrawer}</span>
                      <span className="text-[10px] text-slate-500">{patient.physicalArchive.folderColor}</span>
                    </div>
                  </div>

                  {/* Latest Vitals Snapshot */}
                  {latestVitals ? (
                    <div className="grid grid-cols-4 gap-1.5 text-center bg-slate-50/60 p-1.5 rounded-lg border border-slate-100">
                      <div>
                        <div className="text-[9px] text-slate-400 font-semibold uppercase">BP</div>
                        <div className={`text-xs font-bold ${
                          latestVitals.bloodPressureSystolic >= 140 || latestVitals.bloodPressureDiastolic >= 90
                            ? "text-rose-600"
                            : "text-slate-800"
                        }`}>
                          {latestVitals.bloodPressureSystolic}/{latestVitals.bloodPressureDiastolic}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 font-semibold uppercase">TEMP</div>
                        <div className={`text-xs font-bold ${latestVitals.temperature >= 38.0 ? "text-rose-600" : "text-slate-800"}`}>
                          {latestVitals.temperature}°C
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 font-semibold uppercase">PULSE</div>
                        <div className="text-xs font-bold text-slate-800">{latestVitals.pulse}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 font-semibold uppercase">SPO2</div>
                        <div className={`text-xs font-bold ${latestVitals.spo2 && latestVitals.spo2 < 95 ? "text-rose-600" : "text-slate-800"}`}>
                          {latestVitals.spo2 || "—"}%
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic text-center py-1">
                      No vitals recorded for this visit yet
                    </div>
                  )}

                  {/* Insurance / NHIA badge */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="truncate">
                      {patient.nhisNumber ? (
                        <span className="text-emerald-700 font-medium">NHIA: {patient.hmoProvider || "National Scheme"}</span>
                      ) : (
                        <span className="text-slate-400">Fee-For-Service (Self Pay)</span>
                      )}
                    </span>
                    <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[10px] uppercase">
                      At {patient.currentDepartment}
                    </span>
                  </div>
                </div>

                {/* Bottom Folder Routing Actions */}
                <div className="bg-slate-50 border-t border-slate-200 px-3 py-2 flex items-center justify-between gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenPrintSticker(patient);
                    }}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded text-[11px] flex items-center gap-1"
                    title="Print Manila Folder Label & Barcode"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sticker</span>
                  </button>

                  {/* Route folder quick dropdown/buttons */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">Send to:</span>
                    {patient.currentDepartment !== "triage" && (
                      <button
                        onClick={(e) => handleQuickRoute(e, patient, "triage")}
                        className="px-2 py-1 text-[10px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded transition-colors"
                        title="Route to Nursing Triage"
                      >
                        Triage
                      </button>
                    )}
                    {patient.currentDepartment !== "doctor" && (
                      <button
                        onClick={(e) => handleQuickRoute(e, patient, "doctor")}
                        className="px-2 py-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded transition-colors"
                        title="Route to Doctor's Room"
                      >
                        Doctor
                      </button>
                    )}
                    {patient.currentDepartment !== "laboratory" && (
                      <button
                        onClick={(e) => handleQuickRoute(e, patient, "laboratory")}
                        className="px-2 py-1 text-[10px] font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 rounded transition-colors"
                        title="Route to Lab"
                      >
                        Lab
                      </button>
                    )}
                    {patient.currentDepartment !== "pharmacy" && (
                      <button
                        onClick={(e) => handleQuickRoute(e, patient, "pharmacy")}
                        className="px-2 py-1 text-[10px] font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 rounded transition-colors"
                        title="Route to Pharmacy"
                      >
                        Pharm
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <Archive className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">No patient folders currently in this station</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Switch station tabs above or click below to intake a new patient or digitize an old paper folder.
          </p>
          <button
            onClick={onOpenRegistration}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Register New Intake
          </button>
        </div>
      )}
    </div>
  );
};
