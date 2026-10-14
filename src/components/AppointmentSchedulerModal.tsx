import React, { useState, useMemo } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  Printer, 
  Plus, 
  Search, 
  Filter, 
  ArrowRight, 
  X, 
  FileText, 
  Stethoscope, 
  Phone, 
  FolderCheck, 
  ChevronRight,
  Send,
  CalendarCheck2,
  Building,
  UserCheck,
  AlertTriangle
} from "lucide-react";
import { 
  Appointment, 
  Patient, 
  ClinicDepartment, 
  AppointmentStatus 
} from "../types";
import { 
  getAppointments, 
  upsertAppointment, 
  deleteAppointment, 
  checkInAppointment, 
  togglePhysicalFileRetrieved,
  getPatients, 
  getHospitalConfig,
  getActiveStaff
} from "../lib/storage";
import { CLINIC_DEPARTMENTS, HOSPITAL_DOCTORS } from "../data/initialAppointments";

interface AppointmentSchedulerModalProps {
  onClose: () => void;
  onSelectPatient?: (patient: Patient) => void;
  preSelectedPatient?: Patient | null;
}

const TIME_SLOTS = [
  "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", 
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM"
];

export const AppointmentSchedulerModal: React.FC<AppointmentSchedulerModalProps> = ({
  onClose,
  onSelectPatient,
  preSelectedPatient
}) => {
  const hospitalConfig = getHospitalConfig();
  const staff = getActiveStaff();
  const allPatients = getPatients();
  const [appointments, setAppointments] = useState<Appointment[]>(getAppointments());

  // Date navigation & filters
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>(todayStr);
  const [dateViewMode, setDateViewMode] = useState<"today" | "tomorrow" | "week" | "all" | "custom">("today");
  const [clinicFilter, setClinicFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Booking Form Modal / Sub-view State
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(!!preSelectedPatient);
  const [bookingPatient, setBookingPatient] = useState<Patient | null>(preSelectedPatient || null);
  const [patientSearchTerm, setPatientSearchTerm] = useState<string>(
    preSelectedPatient ? `${preSelectedPatient.lastName}, ${preSelectedPatient.firstName}` : ""
  );
  const [bookingDate, setBookingDate] = useState<string>(todayStr);
  const [bookingTime, setBookingTime] = useState<string>("09:30 AM");
  const [bookingDuration, setBookingDuration] = useState<number>(30);
  const [bookingClinic, setBookingClinic] = useState<ClinicDepartment>("General Outpatient (GOPD)");
  const [bookingDoctor, setBookingDoctor] = useState<string>("Dr. Oladipo Johnson");
  const [bookingRoom, setBookingRoom] = useState<string>("Consulting Room 4");
  const [bookingType, setBookingType] = useState<Appointment["appointmentType"]>("Routine Follow-up");
  const [bookingPriority, setBookingPriority] = useState<"normal" | "urgent" | "emergency">("normal");
  const [bookingReason, setBookingReason] = useState<string>("");
  const [bookingNotes, setBookingNotes] = useState<string>("");
  const [bookingFileRetrieved, setBookingFileRetrieved] = useState<boolean>(true);
  const [bookingSendSms, setBookingSendSms] = useState<boolean>(true);

  // Thermal Slip Print Preview State
  const [slipAppointment, setSlipAppointment] = useState<Appointment | null>(null);

  // Success Alert Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshAppointments = () => {
    setAppointments(getAppointments());
  };

  // Quick Date Navigation helper
  const handleDateModeChange = (mode: "today" | "tomorrow" | "week" | "all" | "custom") => {
    setDateViewMode(mode);
    const d = new Date();
    if (mode === "today") {
      setSelectedDateFilter(todayStr);
    } else if (mode === "tomorrow") {
      d.setDate(d.getDate() + 1);
      setSelectedDateFilter(d.toISOString().split("T")[0]);
    } else if (mode === "week" || mode === "all") {
      setSelectedDateFilter("all");
    }
  };

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      // Date filter
      if (dateViewMode === "today" && apt.date !== todayStr) return false;
      if (dateViewMode === "tomorrow") {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        const tomorrowStr = d.toISOString().split("T")[0];
        if (apt.date !== tomorrowStr) return false;
      }
      if (dateViewMode === "custom" && apt.date !== selectedDateFilter) return false;
      if (dateViewMode === "week") {
        const aptTime = new Date(apt.date).getTime();
        const start = new Date(todayStr).getTime();
        const end = start + 7 * 24 * 60 * 60 * 1000;
        if (aptTime < start || aptTime > end) return false;
      }

      // Clinic filter
      if (clinicFilter !== "all" && apt.clinic !== clinicFilter) return false;

      // Status filter
      if (statusFilter !== "all" && apt.status !== statusFilter) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = apt.patientName.toLowerCase().includes(q);
        const matchFile = apt.patientFileNumber.toLowerCase().includes(q);
        const matchPhone = apt.patientPhone.includes(q);
        const matchDoctor = apt.doctorAssigned.toLowerCase().includes(q);
        const matchReason = apt.reason.toLowerCase().includes(q);
        if (!matchName && !matchFile && !matchPhone && !matchDoctor && !matchReason) return false;
      }

      return true;
    }).sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.timeSlot.localeCompare(b.timeSlot);
    });
  }, [appointments, dateViewMode, selectedDateFilter, clinicFilter, statusFilter, searchQuery, todayStr]);

  // Summary Metrics for selected view
  const metrics = useMemo(() => {
    const list = filteredAppointments;
    return {
      total: list.length,
      checkedIn: list.filter((a) => a.status === "checked_in").length,
      inConsult: list.filter((a) => a.status === "in_consultation").length,
      completed: list.filter((a) => a.status === "completed").length,
      scheduled: list.filter((a) => a.status === "scheduled" || a.status === "confirmed").length,
      filesPulled: list.filter((a) => a.physicalFileRetrieved).length,
      sickleCell: list.filter((a) => a.patientGenotype === "SS").length
    };
  }, [filteredAppointments]);

  // Patients search for Booking Form
  const candidatePatients = useMemo(() => {
    if (!patientSearchTerm.trim()) return allPatients.slice(0, 5);
    const q = patientSearchTerm.toLowerCase();
    return allPatients.filter((p) => 
      `${p.lastName} ${p.firstName}`.toLowerCase().includes(q) ||
      p.fileNumber.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      (p.nin && p.nin.includes(q))
    ).slice(0, 6);
  }, [allPatients, patientSearchTerm]);

  // Handle Clinic Change in Booking Form to auto-set Doctor & Room
  const handleClinicChange = (clinicName: ClinicDepartment) => {
    setBookingClinic(clinicName);
    const found = CLINIC_DEPARTMENTS.find((c) => c.name === clinicName);
    if (found) {
      setBookingDoctor(found.defaultDoctor);
      setBookingRoom(found.defaultRoom);
    }
  };

  // Submit Booking Form
  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingPatient) {
      alert("Please select a patient to schedule.");
      return;
    }

    if (!bookingReason.trim()) {
      alert("Please enter the reason for the clinic visit.");
      return;
    }

    const newApt: Appointment = {
      id: "apt-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      patientId: bookingPatient.id,
      patientName: `${bookingPatient.lastName}, ${bookingPatient.firstName}`,
      patientFileNumber: bookingPatient.fileNumber,
      patientPhone: bookingPatient.phone,
      patientGender: bookingPatient.gender,
      patientAge: bookingPatient.ageYears,
      patientGenotype: bookingPatient.genotype,
      patientBloodGroup: bookingPatient.bloodGroup,
      date: bookingDate,
      timeSlot: bookingTime,
      durationMinutes: bookingDuration,
      clinic: bookingClinic,
      doctorAssigned: bookingDoctor,
      roomNumber: bookingRoom,
      appointmentType: bookingType,
      priority: bookingPriority,
      reason: bookingReason.trim(),
      notes: bookingNotes.trim() || undefined,
      physicalFileRetrieved: bookingFileRetrieved,
      physicalShelfLocation: `${bookingPatient.physicalArchive.roomNumber} • ${bookingPatient.physicalArchive.cabinet}, ${bookingPatient.physicalArchive.shelfOrDrawer}`,
      smsReminderSent: bookingSendSms,
      status: "scheduled",
      bookedBy: `${staff.name} (${staff.role})`,
      bookedAt: new Date().toISOString()
    };

    upsertAppointment(newApt, {
      action: "BOOKED_APPOINTMENT",
      details: `Scheduled ${newApt.appointmentType} with ${newApt.doctorAssigned} (${newApt.clinic}) on ${newApt.date} at ${newApt.timeSlot}`
    });

    refreshAppointments();
    setIsBookingOpen(false);
    showToast(`Appointment booked successfully for ${newApt.patientName}!`);
  };

  // Quick Check In
  const handleCheckIn = (apt: Appointment) => {
    checkInAppointment(apt.id, "doctor");
    refreshAppointments();
    showToast(`Checked in ${apt.patientName}. Folder routed to Doctor's tray.`);
  };

  // Toggle Physical Folder
  const handleToggleFolder = (apt: Appointment) => {
    togglePhysicalFileRetrieved(apt.id);
    refreshAppointments();
    showToast(
      !apt.physicalFileRetrieved 
        ? `Marked physical manila folder pulled from shelf for ${apt.patientName}`
        : `Marked physical folder returned to shelf`
    );
  };

  // Quick Status Update
  const handleUpdateStatus = (apt: Appointment, newStatus: AppointmentStatus) => {
    const updated: Appointment = {
      ...apt,
      status: newStatus,
      completedAt: newStatus === "completed" ? new Date().toISOString() : apt.completedAt
    };
    upsertAppointment(updated, {
      action: "UPDATED_APPOINTMENT",
      details: `Updated appointment status to ${newStatus.toUpperCase()} for ${apt.patientName}`
    });
    refreshAppointments();
    showToast(`Updated status to ${newStatus}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Front Desk Clinic Appointment Scheduling</h2>
                <span className="text-[10px] bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  HIM & Outpatient Desk
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Book patient clinic visits, coordinate doctor schedules & prepare physical archive folders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBookingOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              id="btn-book-appointment-header"
            >
              <Plus className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs text-emerald-800 font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Filter & Metric Ribbon */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:p-4 space-y-3 shrink-0">
          {/* Top Row: Date Toggles & Search */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Quick Date Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => handleDateModeChange("today")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${
                  dateViewMode === "today" 
                    ? "bg-slate-900 text-white shadow-xs" 
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                Today ({todayStr})
              </button>
              <button
                onClick={() => handleDateModeChange("tomorrow")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${
                  dateViewMode === "tomorrow" 
                    ? "bg-slate-900 text-white shadow-xs" 
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                Tomorrow
              </button>
              <button
                onClick={() => handleDateModeChange("week")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${
                  dateViewMode === "week" 
                    ? "bg-slate-900 text-white shadow-xs" 
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                Next 7 Days
              </button>
              <button
                onClick={() => handleDateModeChange("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${
                  dateViewMode === "all" 
                    ? "bg-slate-900 text-white shadow-xs" 
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                All Bookings
              </button>
              <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">Date:</span>
                <input
                  type="date"
                  value={dateViewMode === "custom" ? selectedDateFilter : ""}
                  onChange={(e) => {
                    setSelectedDateFilter(e.target.value);
                    setDateViewMode("custom");
                  }}
                  className="text-xs px-2 py-1 bg-white border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Search & Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search patient, file no, doctor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Clinic Dropdown */}
              <select
                value={clinicFilter}
                onChange={(e) => setClinicFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-medium text-slate-700"
              >
                <option value="all">All Specialty Clinics</option>
                {CLINIC_DEPARTMENTS.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>

              {/* Status Dropdown */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-medium text-slate-700"
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="checked_in">Checked In (Waiting)</option>
                <option value="in_consultation">In Consultation</option>
                <option value="completed">Completed</option>
                <option value="no_show">No Show</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Metrics Counters Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Scheduled</span>
              <span className="text-base font-extrabold text-slate-900">{metrics.total}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-blue-200 bg-blue-50/40">
              <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider block">Checked In / Waiting</span>
              <span className="text-base font-extrabold text-blue-800">{metrics.checkedIn}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-emerald-200 bg-emerald-50/40">
              <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">In Consultation</span>
              <span className="text-base font-extrabold text-emerald-800">{metrics.inConsult}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Concluded</span>
              <span className="text-base font-extrabold text-slate-700">{metrics.completed}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-amber-200 bg-amber-50/40">
              <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block">Physical Files Pulled</span>
              <span className="text-base font-extrabold text-amber-800">{metrics.filesPulled} <span className="text-xs font-normal text-amber-600">/ {metrics.total}</span></span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-rose-200 bg-rose-50/40">
              <span className="text-[10px] text-rose-700 font-bold uppercase tracking-wider block flex items-center gap-1">
                <Flame className="w-3 h-3 text-rose-600" /> Sickle Cell SS
              </span>
              <span className="text-base font-extrabold text-rose-700">{metrics.sickleCell}</span>
            </div>
          </div>
        </div>

        {/* Main Body: Appointments Grid & List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {filteredAppointments.length > 0 ? (
            <div className="space-y-3">
              {filteredAppointments.map((apt) => {
                const isSickleCell = apt.patientGenotype === "SS";
                const isCheckedIn = apt.status === "checked_in";
                const isInConsult = apt.status === "in_consultation";
                const isCompleted = apt.status === "completed";

                return (
                  <div
                    key={apt.id}
                    className={`bg-white rounded-xl border p-4 transition-all hover:shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                      isCheckedIn 
                        ? "border-blue-300 bg-blue-50/20 shadow-2xs" 
                        : isInConsult 
                        ? "border-emerald-400 bg-emerald-50/20" 
                        : isCompleted
                        ? "border-slate-200 bg-slate-50/60 opacity-85"
                        : "border-slate-200"
                    }`}
                    id={`apt-row-${apt.id}`}
                  >
                    {/* Left Column: Time & Patient Identity */}
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      {/* Time slot banner */}
                      <div className="text-center min-w-[76px] py-1.5 px-2 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
                        <div className="text-xs font-extrabold text-slate-900">{apt.timeSlot}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{apt.date}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">{apt.durationMinutes} mins</div>
                      </div>

                      {/* Patient details */}
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => {
                              const found = allPatients.find((p) => p.id === apt.patientId);
                              if (found && onSelectPatient) onSelectPatient(found);
                            }}
                            className="font-bold text-slate-900 hover:text-emerald-700 text-sm sm:text-base transition-colors cursor-pointer text-left"
                            title="Open digital folder"
                          >
                            {apt.patientName}
                          </button>
                          <span className="font-mono text-xs text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {apt.patientFileNumber}
                          </span>
                          <span className="text-xs text-slate-500">
                            {apt.patientGender?.charAt(0)} • {apt.patientAge}y
                          </span>
                          {/* Genotype badge */}
                          {apt.patientGenotype && (
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              isSickleCell 
                                ? "bg-rose-600 text-white animate-pulse" 
                                : "bg-slate-800 text-white"
                            }`}>
                              {apt.patientGenotype}
                            </span>
                          )}
                          {apt.patientBloodGroup && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">
                              {apt.patientBloodGroup}
                            </span>
                          )}
                        </div>

                        {/* Clinic & Assigned Doctor */}
                        <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
                          <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {apt.clinic}
                          </span>
                          <span>•</span>
                          <span className="font-medium text-slate-800 flex items-center gap-1">
                            <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                            {apt.doctorAssigned}
                          </span>
                          {apt.roomNumber && (
                            <span className="text-[11px] text-slate-500">({apt.roomNumber})</span>
                          )}
                        </div>

                        {/* Reason / Clinical Purpose */}
                        <p className="text-xs text-slate-700 font-medium mt-1">
                          <span className="text-slate-400 font-normal">Reason: </span>
                          {apt.reason}
                        </p>

                        {/* Physical Archive Folder Status & Shelf Location */}
                        <div className="flex items-center gap-2 pt-1 flex-wrap text-[11px]">
                          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border font-medium ${
                            apt.physicalFileRetrieved 
                              ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                              : "bg-amber-50 border-amber-200 text-amber-800"
                          }`}>
                            <FolderCheck className="w-3.5 h-3.5 text-current" />
                            <span>
                              {apt.physicalFileRetrieved 
                                ? "Physical File Pulled for Clinic" 
                                : "Physical File in Records Shelf"}
                            </span>
                            {apt.physicalShelfLocation && (
                              <span className="text-[10px] text-slate-500">({apt.physicalShelfLocation})</span>
                            )}
                          </div>

                          <button
                            onClick={() => handleToggleFolder(apt)}
                            className="text-[10px] font-semibold text-slate-600 hover:text-emerald-700 hover:underline cursor-pointer"
                          >
                            {apt.physicalFileRetrieved ? "Mark Returned" : "Mark File Pulled"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Status & Operational Actions */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2 shrink-0 border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100">
                      {/* Status Badge */}
                      <div>
                        {isCheckedIn && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-2xs animate-pulse">
                            <UserCheck className="w-3.5 h-3.5" /> Checked In (Waiting)
                          </span>
                        )}
                        {isInConsult && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-2xs">
                            <Stethoscope className="w-3.5 h-3.5" /> In Consultation
                          </span>
                        )}
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed
                          </span>
                        )}
                        {apt.status === "scheduled" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                            <Clock className="w-3.5 h-3.5 text-slate-500" /> Scheduled
                          </span>
                        )}
                        {apt.status === "confirmed" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Confirmed (SMS)
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {apt.status !== "checked_in" && apt.status !== "completed" && (
                          <button
                            onClick={() => handleCheckIn(apt)}
                            className="px-2.5 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-2xs transition-colors cursor-pointer"
                            title="Patient has arrived at clinic"
                          >
                            Check In
                          </button>
                        )}

                        {isCheckedIn && (
                          <button
                            onClick={() => handleUpdateStatus(apt, "in_consultation")}
                            className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-2xs transition-colors cursor-pointer"
                          >
                            Start Consult
                          </button>
                        )}

                        {isInConsult && (
                          <button
                            onClick={() => handleUpdateStatus(apt, "completed")}
                            className="px-2.5 py-1 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white rounded-lg shadow-2xs transition-colors cursor-pointer"
                          >
                            Complete
                          </button>
                        )}

                        {/* Print Thermal Slip */}
                        <button
                          onClick={() => setSlipAppointment(apt)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                          title="Print thermal appointment slip for patient"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Open file */}
                        <button
                          onClick={() => {
                            const found = allPatients.find((p) => p.id === apt.patientId);
                            if (found && onSelectPatient) onSelectPatient(found);
                          }}
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                          title="Open Patient Manila File"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-white shadow-xs flex items-center justify-center text-slate-400 mx-auto">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">No clinic appointments found for this filter</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Switch date tabs or click below to schedule an upcoming consultation or follow-up.
              </p>
              <button
                onClick={() => setIsBookingOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Book Patient Appointment
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700">{hospitalConfig.hospitalName}</span>
            <span>•</span>
            <span>Outpatient Booking & HIM Coordination</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg font-semibold cursor-pointer text-xs"
          >
            Close Scheduler
          </button>
        </div>
      </div>

      {/* BOOKING MODAL (DRAWER / OVERLAY) */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-emerald-800 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CalendarCheck2 className="w-5 h-5 text-emerald-300" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">Book Patient Clinic Appointment</h3>
                  <p className="text-[11px] text-emerald-200">Assign clinic room, doctor & prepare physical manila file</p>
                </div>
              </div>
              <button
                onClick={() => setIsBookingOpen(false)}
                className="p-1 text-emerald-200 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleBookAppointment} className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Patient Selection Section */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Patient Identity & Hospital File No:</span>
                  {bookingPatient && (
                    <button
                      type="button"
                      onClick={() => {
                        setBookingPatient(null);
                        setPatientSearchTerm("");
                      }}
                      className="text-[10px] text-rose-600 hover:underline font-semibold cursor-pointer"
                    >
                      Change Patient
                    </button>
                  )}
                </label>

                {bookingPatient ? (
                  <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {bookingPatient.lastName}, {bookingPatient.firstName} {bookingPatient.middleName || ""}
                        </span>
                        <span className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-emerald-300 font-bold text-emerald-900">
                          {bookingPatient.fileNumber}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          bookingPatient.genotype === "SS" ? "bg-rose-600 text-white animate-pulse" : "bg-slate-800 text-white"
                        }`}>
                          {bookingPatient.genotype}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        Phone: {bookingPatient.phone} • {bookingPatient.gender}, {bookingPatient.ageYears}y
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Physical Archive: {bookingPatient.physicalArchive.roomNumber} ({bookingPatient.physicalArchive.cabinet}, {bookingPatient.physicalArchive.shelfOrDrawer})
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search patient by name, file number (e.g. UCH/2021), phone or NIN..."
                        value={patientSearchTerm}
                        onChange={(e) => setPatientSearchTerm(e.target.value)}
                        className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                    </div>

                    {/* Candidate patient search results */}
                    <div className="space-y-1 max-h-36 overflow-y-auto border border-slate-200 rounded-lg p-1 bg-white">
                      {candidatePatients.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setBookingPatient(p);
                            setPatientSearchTerm(`${p.lastName}, ${p.firstName}`);
                          }}
                          className="p-2 hover:bg-emerald-50 rounded-md cursor-pointer transition-colors flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-800">{p.lastName}, {p.firstName}</span>
                            <span className="font-mono text-slate-500 text-[11px] ml-2">[{p.fileNumber}]</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <span>{p.phone}</span>
                            <span className="font-semibold text-slate-700 bg-slate-100 px-1 py-0.2 rounded">{p.genotype}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Appointment Date:</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                  {/* Quick Presets */}
                  <div className="flex items-center gap-1 mt-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setBookingDate(todayStr)}
                      className="text-emerald-700 hover:underline font-medium cursor-pointer"
                    >
                      Today
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 1);
                        setBookingDate(d.toISOString().split("T")[0]);
                      }}
                      className="text-emerald-700 hover:underline font-medium cursor-pointer"
                    >
                      Tomorrow
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 14);
                        setBookingDate(d.toISOString().split("T")[0]);
                      }}
                      className="text-emerald-700 hover:underline font-medium cursor-pointer"
                    >
                      In 2 Wks
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Time Slot:</label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Duration:</label>
                  <select
                    value={bookingDuration}
                    onChange={(e) => setBookingDuration(Number(e.target.value))}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={20}>20 Minutes</option>
                    <option value={30}>30 Minutes (Standard)</option>
                    <option value={45}>45 Minutes (Specialist)</option>
                    <option value={60}>60 Minutes (Comprehensive)</option>
                  </select>
                </div>
              </div>

              {/* Clinic & Doctor Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Clinic Department:</label>
                  <select
                    value={bookingClinic}
                    onChange={(e) => handleClinicChange(e.target.value as ClinicDepartment)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  >
                    {CLINIC_DEPARTMENTS.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Doctor / Clinician Assigned:</label>
                  <select
                    value={bookingDoctor}
                    onChange={(e) => setBookingDoctor(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  >
                    {HOSPITAL_DOCTORS.map((d) => (
                      <option key={d.name} value={d.name}>{d.name} ({d.specialty})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Appointment Type & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Visit Type:</label>
                  <select
                    value={bookingType}
                    onChange={(e) => setBookingType(e.target.value as Appointment["appointmentType"])}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Routine Follow-up">Routine Follow-up (Chronic Disease / Checkup)</option>
                    <option value="Lab Result Review">Lab Result Review</option>
                    <option value="Medication Refill">Medication Refill</option>
                    <option value="Antenatal Routine">Antenatal Routine (ANC)</option>
                    <option value="Sickle Cell Wellness Review">Sickle Cell Wellness Review</option>
                    <option value="Post-Op Check">Post-Op Wound & Suture Inspection</option>
                    <option value="Specialist Consultation">Specialist Consultation</option>
                    <option value="New Patient Intake">New Patient Intake</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Clinical Priority:</label>
                  <select
                    value={bookingPriority}
                    onChange={(e) => setBookingPriority(e.target.value as "normal" | "urgent" | "emergency")}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-medium"
                  >
                    <option value="normal">Routine / Normal</option>
                    <option value="urgent">Urgent (e.g. Hb SS / High BP)</option>
                    <option value="emergency">Emergency / Fast-Track</option>
                  </select>
                </div>
              </div>

              {/* Reason for visit */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Reason for Visit / Chief Complaint: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Blood pressure review, renew Amlodipine, right knee ache check"
                  value={bookingReason}
                  onChange={(e) => setBookingReason(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Special Instructions & Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Instructions / Preparations for Patient (Optional):
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Patient must fast for 8 hours for blood sugar test. Bring physical clinic card."
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Logistics Checkboxes (Nigerian Real-World Hospital Settings) */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <label className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bookingFileRetrieved}
                    onChange={(e) => setBookingFileRetrieved(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold">Flag Physical Manila Folder for Archive Retrieval</span>
                    <p className="text-[11px] text-slate-500">
                      Alerts HIM records boys to pull physical paper folder from shelves before clinic starts.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bookingSendSms}
                    onChange={(e) => setBookingSendSms(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold">Queue Nigerian GSM SMS Reminder (+234)</span>
                    <p className="text-[11px] text-slate-500">
                      Sends automated SMS notification to patient's telephone number with clinic date & instructions.
                    </p>
                  </div>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsBookingOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CalendarCheck2 className="w-4 h-4" />
                  Confirm & Schedule Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* THERMAL APPOINTMENT SLIP PRINT MODAL */}
      {slipAppointment && (
        <div className="fixed inset-0 z-70 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-sm p-5 space-y-4 animate-in fade-in zoom-in-95">
            {/* Slip Header */}
            <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-1">
              <div className="text-xs font-black uppercase tracking-wider text-slate-900">
                {hospitalConfig.hospitalName}
              </div>
              <div className="text-[10px] text-slate-500">
                {hospitalConfig.state} State, Nigeria • Outpatient Department
              </div>
              <div className="text-xs font-extrabold text-emerald-800 bg-emerald-50 py-0.5 px-2 rounded-full inline-block mt-1">
                PATIENT APPOINTMENT SLIP
              </div>
            </div>

            {/* Slip Details */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">SLIP REF:</span>
                <span className="font-bold text-slate-900">{slipAppointment.id.toUpperCase()}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">DATE:</span>
                <span className="font-bold text-slate-900">{slipAppointment.date}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">TIME:</span>
                <span className="font-bold text-emerald-700 text-sm">{slipAppointment.timeSlot}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">PATIENT:</span>
                <span className="font-bold text-slate-900 text-right">{slipAppointment.patientName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">FILE NO:</span>
                <span className="font-bold text-slate-900">{slipAppointment.patientFileNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">CLINIC:</span>
                <span className="font-bold text-slate-900 text-right">{slipAppointment.clinic}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">DOCTOR:</span>
                <span className="font-bold text-slate-900 text-right">{slipAppointment.doctorAssigned}</span>
              </div>
              {slipAppointment.roomNumber && (
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">ROOM:</span>
                  <span className="font-bold text-slate-900">{slipAppointment.roomNumber}</span>
                </div>
              )}
            </div>

            {/* Nigerian Pidgin & English Clinical Reminders */}
            <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-[11px] text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Clinic Day Instructions:
              </div>
              <p>• Please arrive 30 minutes before your time for nursing triage and blood pressure check.</p>
              <p className="italic text-amber-800">
                • <em>"Carry this slip and your plastic hospital card come. If na sugar test, no chop food until after test."</em>
              </p>
            </div>

            {/* Slip Action Buttons */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setSlipAppointment(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  setSlipAppointment(null);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
