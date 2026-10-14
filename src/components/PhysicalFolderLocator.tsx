import React, { useState } from "react";
import { 
  Archive, 
  Search, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Printer, 
  UserCheck, 
  ExternalLink,
  ChevronRight,
  Folder,
  Layers,
  X
} from "lucide-react";
import { Patient } from "../types";
import { upsertPatient, getActiveStaff } from "../lib/storage";

interface PhysicalFolderLocatorProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onOpenPrintSticker: (patient: Patient) => void;
  onClose?: () => void;
  selectedPatientId?: string;
}

export const PhysicalFolderLocator: React.FC<PhysicalFolderLocatorProps> = ({
  patients,
  onSelectPatient,
  onOpenPrintSticker,
  onClose,
  selectedPatientId
}) => {
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "in_shelf" | "checked_out">("all");
  const [checkoutModalPatient, setCheckoutModalPatient] = useState<Patient | null>(null);
  const [checkoutRecipient, setCheckoutRecipient] = useState("Dr. Oladipo Johnson (GOPD Room 4)");

  // Extract unique archive rooms
  const archiveRooms = Array.from(new Set(patients.map((p) => p.physicalArchive.roomNumber).filter(Boolean)));

  const filteredPatients = patients.filter((p) => {
    const matchesRoom = selectedRoom === "all" || p.physicalArchive.roomNumber === selectedRoom;
    const matchesStatus = statusFilter === "all" || p.physicalArchive.physicalStatus === statusFilter;
    const matchesSearch = !searchFilter.trim() || 
      p.fileNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
      `${p.lastName} ${p.firstName}`.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.physicalArchive.cabinet.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.physicalArchive.shelfOrDrawer.toLowerCase().includes(searchFilter.toLowerCase());

    return matchesRoom && matchesStatus && matchesSearch;
  });

  const handleCheckOutSubmit = () => {
    if (!checkoutModalPatient) return;
    const now = new Date().toISOString();
    const updated: Patient = {
      ...checkoutModalPatient,
      physicalArchive: {
        ...checkoutModalPatient.physicalArchive,
        physicalStatus: "checked_out",
        checkedOutTo: checkoutRecipient,
        checkedOutAt: now
      }
    };
    upsertPatient(updated, {
      action: "CHECKED_OUT_PHYSICAL",
      details: `Checked out physical folder ${updated.fileNumber} from ${updated.physicalArchive.cabinet} to ${checkoutRecipient}`
    });
    setCheckoutModalPatient(null);
  };

  const handleReturnToShelf = (patient: Patient) => {
    const updated: Patient = {
      ...patient,
      physicalArchive: {
        ...patient.physicalArchive,
        physicalStatus: "in_shelf",
        checkedOutTo: undefined,
        checkedOutAt: undefined
      }
    };
    upsertPatient(updated, {
      action: "RETURNED_PHYSICAL",
      details: `Returned physical folder ${updated.fileNumber} to shelf location: ${updated.physicalArchive.cabinet}, ${updated.physicalArchive.shelfOrDrawer}`
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Physical Manila Folder Shelf & Cabinet Navigator
            </h2>
            <p className="text-xs text-slate-400">
              Locate, check out, and audit physical paper files stored in hospital archive rooms
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filter and Control Ribbon */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="bg-transparent text-slate-800 font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Archive Rooms ({archiveRooms.length})</option>
              {archiveRooms.map((room) => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                statusFilter === "all" ? "bg-slate-900 text-white font-semibold" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setStatusFilter("in_shelf")}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                statusFilter === "in_shelf" ? "bg-emerald-700 text-white font-semibold" : "text-emerald-800 hover:bg-emerald-50"
              }`}
            >
              In Shelf
            </button>
            <button
              onClick={() => setStatusFilter("checked_out")}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                statusFilter === "checked_out" ? "bg-amber-600 text-white font-semibold" : "text-amber-800 hover:bg-amber-50"
              }`}
            >
              Checked Out
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Cabinet, Shelf, File No..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full md:w-64 pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600 font-medium"
          />
        </div>
      </div>

      {/* Archive Shelf Rack Table / Grid */}
      <div className="p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">File Number & Patient</th>
                <th className="py-2.5 px-3">Archive Room</th>
                <th className="py-2.5 px-3">Cabinet & Shelf Rack</th>
                <th className="py-2.5 px-3">Folder Specs</th>
                <th className="py-2.5 px-3">Physical Status</th>
                <th className="py-2.5 px-3 text-right">Physical Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((p) => {
                const isCheckedOut = p.physicalArchive.physicalStatus === "checked_out";
                const isSelected = selectedPatientId === p.id;

                return (
                  <tr 
                    key={p.id} 
                    className={`hover:bg-emerald-50/50 transition-colors ${
                      isSelected ? "bg-emerald-50 font-medium" : ""
                    }`}
                  >
                    {/* Patient & File No */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-300">
                          📁
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{p.lastName}, {p.firstName}</span>
                            <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.2 rounded text-slate-700 border border-slate-200">
                              {p.fileNumber}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {p.gender}, {p.ageYears}y • Genotype: <span className="font-bold text-slate-800">{p.genotype}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Archive Room */}
                    <td className="py-3 px-3 font-medium text-slate-800">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{p.physicalArchive.roomNumber || "Main Records Hall"}</span>
                      </div>
                    </td>

                    {/* Cabinet & Shelf */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">
                        {p.physicalArchive.cabinet}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {p.physicalArchive.shelfOrDrawer}
                        {p.physicalArchive.boxNumber && ` • ${p.physicalArchive.boxNumber}`}
                      </div>
                    </td>

                    {/* Folder Specs */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200 inline-block">
                        {p.physicalArchive.folderColor}
                      </span>
                    </td>

                    {/* Physical Status */}
                    <td className="py-3 px-3">
                      {isCheckedOut ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-700" />
                            Checked Out
                          </span>
                          <p className="text-[10px] text-slate-600 truncate max-w-xs font-medium">
                            To: {p.physicalArchive.checkedOutTo || "Clinic Room"}
                          </p>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          In Shelf Ready
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenPrintSticker(p)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded text-[11px] border border-slate-200"
                          title="Print QR label for physical Manila folder"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {isCheckedOut ? (
                          <button
                            onClick={() => handleReturnToShelf(p)}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold shadow-2xs transition-colors cursor-pointer"
                          >
                            Return to Shelf
                          </button>
                        ) : (
                          <button
                            onClick={() => setCheckoutModalPatient(p)}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[11px] font-semibold shadow-2xs transition-colors cursor-pointer"
                          >
                            Check Out
                          </button>
                        )}

                        <button
                          onClick={() => onSelectPatient(p)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-medium"
                          title="Open full digital chart"
                        >
                          Open File
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Checkout Modal Dialog */}
      {checkoutModalPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Check Out Physical Paper Folder
                </h3>
              </div>
              <button
                onClick={() => setCheckoutModalPatient(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-xs space-y-1">
              <p className="font-bold text-slate-900">
                {checkoutModalPatient.lastName}, {checkoutModalPatient.firstName}
              </p>
              <p className="font-mono text-slate-700 font-semibold">
                File No: {checkoutModalPatient.fileNumber}
              </p>
              <p className="text-slate-600">
                Shelf Location: {checkoutModalPatient.physicalArchive.cabinet} • {checkoutModalPatient.physicalArchive.shelfOrDrawer}
              </p>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-slate-700">
                Who is taking or requesting this physical folder?
              </label>
              <select
                value={checkoutRecipient}
                onChange={(e) => setCheckoutRecipient(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Dr. Oladipo Johnson (GOPD Room 4)">Dr. Oladipo Johnson (GOPD Consulting Room 4)</option>
                <option value="Dr. Hadiza Bello (Children Emergency CHER)">Dr. Hadiza Bello (Children Emergency CHER)</option>
                <option value="Dr. Kemi Balogun (Antenatal Clinic ANC)">Dr. Kemi Balogun (Antenatal Clinic ANC)</option>
                <option value="Nurse Chidinma Eze (Triage Station)">Nurse Chidinma Eze (Triage Station)</option>
                <option value="Medical Records Archive Audit Desk">Medical Records Archive Audit Desk</option>
                <option value="NHIA / Billing Claims Officer">NHIA / Billing Claims Officer</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setCheckoutModalPatient(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckOutSubmit}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm"
              >
                Confirm Physical Check-Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
