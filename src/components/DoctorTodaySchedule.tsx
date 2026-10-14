import React, { useState, useMemo } from "react";
import { 
  Clock, 
  User, 
  Calendar as CalendarIcon, 
  Stethoscope, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  ArrowRight, 
  FileText, 
  UserCheck, 
  FolderCheck, 
  Plus, 
  Filter, 
  ChevronRight,
  ExternalLink,
  RotateCcw
} from "lucide-react";
import { Appointment, Patient, AppointmentStatus } from "../types";
import { 
  getAppointments, 
  upsertAppointment, 
  checkInAppointment, 
  getPatients, 
  getActiveStaff,
  getHospitalConfig
} from "../lib/storage";
import { HOSPITAL_DOCTORS } from "../data/initialAppointments";

interface DoctorTodayScheduleProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onBookFollowUp?: (patient: Patient) => void;
}

export const DoctorTodaySchedule: React.FC<DoctorTodayScheduleProps> = ({
  patients,
  onSelectPatient,
  onBookFollowUp
}) => {
  const staff = getActiveStaff();
  const hospitalConfig = getHospitalConfig();
  const [appointments, setAppointments] = useState<Appointment[]>(getAppointments());

  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const refreshList = () => {
    setAppointments(getAppointments());
  };

  // Filtered Appointments for the Doctor's schedule
  const scheduledList = useMemo(() => {
    return appointments.filter((apt) => {
      // Date matching
      if (apt.date !== selectedDate) return false;

      // Doctor filter
      if (selectedDoctorFilter !== "all" && !apt.doctorAssigned.toLowerCase().includes(selectedDoctorFilter.toLowerCase())) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all" && apt.status !== statusFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  }, [appointments, selectedDate, selectedDoctorFilter, statusFilter]);

  // Schedule Metrics
  const metrics = useMemo(() => {
    const list = appointments.filter((a) => a.date === selectedDate);
    return {
      total: list.length,
      waiting: list.filter((a) => a.status === "checked_in").length,
      inConsult: list.filter((a) => a.status === "in_consultation").length,
      completed: list.filter((a) => a.status === "completed").length,
      sickleCell: list.filter((a) => a.patientGenotype === "SS").length
    };
  }, [appointments, selectedDate]);

  // Start Consultation action: marks in_consultation, routes patient to doctor, and opens file
  const handleStartConsultation = (apt: Appointment) => {
    const updated: Appointment = {
      ...apt,
      status: "in_consultation"
    };
    upsertAppointment(updated, {
      action: "UPDATED_APPOINTMENT",
      details: `Doctor commenced consultation with ${apt.patientName} (${apt.clinic})`
    });
    refreshList();

    const foundPatient = patients.find((p) => p.id === apt.patientId);
    if (foundPatient) {
      onSelectPatient(foundPatient);
    }
  };

  // Mark Completed action
  const handleConcludeConsultation = (apt: Appointment) => {
    const updated: Appointment = {
      ...apt,
      status: "completed",
      completedAt: new Date().toISOString()
    };
    upsertAppointment(updated, {
      action: "UPDATED_APPOINTMENT",
      details: `Doctor concluded consultation for ${apt.patientName}`
    });
    refreshList();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      {/* Schedule Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-white">Today's Doctor Clinic Schedule</h3>
              <span className="bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Consulting Rooms & Outpatient Clinics
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Assigned outpatient appointments, waiting lobby queue & physical folder tracking
            </p>
          </div>
        </div>

        {/* Doctor & Date Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Doctor Filter */}
          <select
            value={selectedDoctorFilter}
            onChange={(e) => setSelectedDoctorFilter(e.target.value)}
            className="text-xs px-3 py-1.5 bg-slate-800/90 text-white border border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-400 font-medium cursor-pointer"
          >
            <option value="all">All Clinicians & Doctors</option>
            {HOSPITAL_DOCTORS.map((doc) => (
              <option key={doc.name} value={doc.name}>{doc.name}</option>
            ))}
          </select>

          {/* Date Picker */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-800/90 text-white border border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-400 font-medium cursor-pointer"
          />

          <button
            onClick={refreshList}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors"
            title="Refresh Schedule"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Ticker Bar */}
      <div className="bg-slate-50 border-b border-slate-200 p-3 sm:px-5 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-3 sm:gap-6 text-xs shrink-0">
          <div>
            <span className="text-slate-500 font-medium">On Schedule: </span>
            <span className="font-extrabold text-slate-900">{metrics.total} patients</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-blue-700 font-medium">Waiting in Lobby: </span>
            <span className="font-extrabold text-blue-800 bg-blue-100 px-1.5 py-0.2 rounded font-mono">
              {metrics.waiting}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-emerald-700 font-medium">In Consult: </span>
            <span className="font-extrabold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded font-mono">
              {metrics.inConsult}
            </span>
          </div>

          <div>
            <span className="text-slate-500 font-medium">Concluded: </span>
            <span className="font-extrabold text-slate-700">{metrics.completed}</span>
          </div>

          {metrics.sickleCell > 0 && (
            <div className="flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              <span>{metrics.sickleCell} Sickle Cell (Hb SS)</span>
            </div>
          )}
        </div>

        {/* Status quick tabs */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-2 py-1 text-[11px] font-bold rounded-md cursor-pointer transition-colors ${
              statusFilter === "all" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({metrics.total})
          </button>
          <button
            onClick={() => setStatusFilter("checked_in")}
            className={`px-2 py-1 text-[11px] font-bold rounded-md cursor-pointer transition-colors ${
              statusFilter === "checked_in" ? "bg-blue-600 text-white" : "text-blue-700 hover:bg-blue-50"
            }`}
          >
            Waiting ({metrics.waiting})
          </button>
        </div>
      </div>

      {/* Appointment Cards Timeline */}
      <div className="p-4 sm:p-5 space-y-3">
        {scheduledList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {scheduledList.map((apt) => {
              const matchedPatient = patients.find((p) => p.id === apt.patientId);
              const isWaiting = apt.status === "checked_in";
              const isInConsult = apt.status === "in_consultation";
              const isCompleted = apt.status === "completed";
              const isSickleCell = apt.patientGenotype === "SS";

              return (
                <div
                  key={apt.id}
                  className={`rounded-xl border p-4 transition-all flex flex-col justify-between gap-3 ${
                    isWaiting
                      ? "border-blue-400 bg-blue-50/30 shadow-xs ring-1 ring-blue-300"
                      : isInConsult
                      ? "border-emerald-400 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-300"
                      : isCompleted
                      ? "border-slate-200 bg-slate-50/70 opacity-80"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                  id={`doc-schedule-card-${apt.id}`}
                >
                  {/* Top Header: Time Slot & Arrival Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 text-white font-extrabold text-xs rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{apt.timeSlot}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {apt.appointmentType}
                      </span>
                    </div>

                    {/* Status Pill */}
                    <div>
                      {isWaiting && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-600 text-white animate-pulse">
                          <UserCheck className="w-3 h-3" /> Waiting in Lobby
                        </span>
                      )}
                      {isInConsult && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white">
                          <Stethoscope className="w-3 h-3" /> Active Consult
                        </span>
                      )}
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200 text-slate-700">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Concluded
                        </span>
                      )}
                      {apt.status === "scheduled" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          Scheduled
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Patient Info Row */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          if (matchedPatient) onSelectPatient(matchedPatient);
                        }}
                        className="font-bold text-slate-900 hover:text-emerald-700 text-sm transition-colors text-left cursor-pointer"
                        title="Open complete clinical file"
                      >
                        {apt.patientName}
                      </button>
                      <span className="font-mono text-xs text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 font-semibold">
                        {apt.patientFileNumber}
                      </span>
                      <span className="text-xs text-slate-500">
                        {apt.patientGender?.charAt(0)} • {apt.patientAge}y
                      </span>
                      {apt.patientGenotype && (
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          isSickleCell ? "bg-rose-600 text-white animate-pulse" : "bg-slate-800 text-white"
                        }`}>
                          {apt.patientGenotype}
                        </span>
                      )}
                      {apt.patientBloodGroup && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-200 text-slate-700">
                          {apt.patientBloodGroup}
                        </span>
                      )}
                    </div>

                    {/* Clinic & Room */}
                    <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {apt.clinic}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-slate-800">{apt.doctorAssigned}</span>
                      {apt.roomNumber && <span className="text-slate-500">({apt.roomNumber})</span>}
                    </div>

                    {/* Clinical Reason */}
                    <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-200 text-xs text-slate-700">
                      <span className="text-slate-400 font-medium">Chief Complaint: </span>
                      <span className="font-semibold text-slate-800">{apt.reason}</span>
                      {apt.notes && (
                        <p className="text-[11px] text-slate-500 mt-0.5 italic">
                          "{apt.notes}"
                        </p>
                      )}
                    </div>

                    {/* Physical Manila Folder Logistics Indicator */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600 pt-0.5">
                      <FolderCheck className={`w-3.5 h-3.5 ${apt.physicalFileRetrieved ? "text-emerald-600" : "text-amber-600"}`} />
                      <span>
                        {apt.physicalFileRetrieved 
                          ? "Physical folder pulled & ready" 
                          : "Physical folder in archive shelf"}
                      </span>
                      {apt.physicalShelfLocation && (
                        <span className="text-slate-400 text-[10px]">[{apt.physicalShelfLocation}]</span>
                      )}
                    </div>
                  </div>

                  {/* Doctor Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        if (matchedPatient) onSelectPatient(matchedPatient);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-emerald-700 py-1 px-2 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Open File</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {onBookFollowUp && matchedPatient && (
                        <button
                          onClick={() => onBookFollowUp(matchedPatient)}
                          className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md border border-slate-200 transition-colors cursor-pointer"
                          title="Schedule next follow-up visit"
                        >
                          + Follow-up
                        </button>
                      )}

                      {!isCompleted && !isInConsult && (
                        <button
                          onClick={() => handleStartConsultation(apt)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                        >
                          <span>Call In Patient</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {isInConsult && (
                        <button
                          onClick={() => handleConcludeConsultation(apt)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Conclude Consult</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center space-y-2">
            <CalendarIcon className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No scheduled appointments found</h4>
            <p className="text-xs text-slate-500">
              There are no clinic appointments booked for {selectedDate} matching the selected filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
