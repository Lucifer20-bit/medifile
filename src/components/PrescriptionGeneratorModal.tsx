import React, { useState, useEffect } from "react";
import { 
  X, 
  Pill, 
  Printer, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  ShieldAlert, 
  UserCheck, 
  Download, 
  QrCode, 
  Sparkles,
  FileText
} from "lucide-react";
import { Patient, Prescription, PharmacyItem } from "../types";
import { 
  getPharmacyInventory, 
  addPrescriptionToPatient, 
  getActiveStaff, 
  getHospitalConfig 
} from "../lib/storage";
import { COMMON_MEDICATIONS } from "../data/nigeriaLocations";
import { generateQRDataUrl } from "../lib/qrHelper";

interface PrescriptionGeneratorModalProps {
  patient: Patient;
  onClose: () => void;
  onPrescriptionCreated?: () => void;
}

export const PrescriptionGeneratorModal: React.FC<PrescriptionGeneratorModalProps> = ({
  patient,
  onClose,
  onPrescriptionCreated
}) => {
  const staff = getActiveStaff();
  const config = getHospitalConfig();
  const inventory = getPharmacyInventory();

  // Prescriptions being drafted
  const [draftList, setDraftList] = useState<Omit<Prescription, "id" | "prescribedAt" | "dispensed">[]>([
    {
      drugName: "Artemether-Lumefantrine 80/480mg (Coartem)",
      dosage: "1 tablet",
      frequency: "Twice Daily (BD)",
      duration: "3 days",
      route: "Oral",
      quantity: 6,
      pidginInstructions: "Take 1 sweet morning, 1 night after food for 3 days",
      prescribedBy: staff.name,
      doctorSignature: `SIG-${staff.name.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      diagnosisLinked: patient.consultations[0]?.provisionalDiagnosis || "Malaria",
      linkedInventoryItemId: inventory.find((i) => i.drugName.toLowerCase().includes("artemether"))?.id
    }
  ]);

  // Current item form
  const [drugName, setDrugName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("Twice Daily (BD)");
  const [duration, setDuration] = useState("5 days");
  const [route, setRoute] = useState("Oral");
  const [quantity, setQuantity] = useState<number>(10);
  const [pidginInstructions, setPidginInstructions] = useState("");
  const [doctorFolio, setDoctorFolio] = useState("MDCN/R/58291");
  const [doctorName, setDoctorName] = useState(staff.name || "Dr. Oladipo Johnson (Consultant)");
  const [doctorSignature, setDoctorSignature] = useState(`SIG-${Date.now().toString().slice(-6)}`);
  
  // UI view state: "form" or "preview_print"
  const [viewMode, setViewMode] = useState<"form" | "preview_print">("form");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    // Generate QR verification data for the prescription slip
    const qrPayload = JSON.stringify({
      type: "MEDIFILE_RX",
      fileNumber: patient.fileNumber,
      patientName: `${patient.lastName}, ${patient.firstName}`,
      prescribedBy: doctorName,
      date: new Date().toISOString().split("T")[0],
      itemsCount: draftList.length
    });
    generateQRDataUrl(qrPayload).then(setQrCodeUrl);
  }, [patient, doctorName, draftList]);

  // Autocomplete helper when typing medication
  const handleSelectPredefined = (med: typeof COMMON_MEDICATIONS[0]) => {
    setDrugName(med.name);
    setDosage(med.dose);
    setPidginInstructions(med.pidgin || "");
    // Check if in pharmacy inventory
    const matched = inventory.find((i) => 
      i.drugName.toLowerCase().includes(med.name.slice(0, 8).toLowerCase()) ||
      med.name.toLowerCase().includes(i.genericName.toLowerCase())
    );
    if (matched) {
      setQuantity(matched.dosageForm === "Tablet" ? 10 : 1);
    }
  };

  const handleSelectInventoryItem = (item: PharmacyItem) => {
    setDrugName(item.drugName);
    setDosage(item.strength);
    setRoute(item.dosageForm === "Injection" ? "IV / IM" : item.dosageForm === "Inhaler" ? "Inhalation" : "Oral");
    setQuantity(item.dosageForm === "Tablet" ? 10 : 1);
  };

  const handleAddDrugToDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drugName.trim()) return;

    const matched = inventory.find((i) => 
      i.drugName.toLowerCase() === drugName.toLowerCase() ||
      drugName.toLowerCase().includes(i.genericName.toLowerCase())
    );

    const newDrug: Omit<Prescription, "id" | "prescribedAt" | "dispensed"> = {
      drugName,
      dosage: dosage || "As directed",
      frequency,
      duration,
      route,
      quantity,
      pidginInstructions,
      prescribedBy: doctorName,
      doctorSignature: `${doctorSignature} [${doctorFolio}]`,
      diagnosisLinked: patient.consultations[0]?.provisionalDiagnosis || "General Care",
      linkedInventoryItemId: matched?.id
    };

    setDraftList([...draftList, newDrug]);
    // Reset inputs
    setDrugName("");
    setDosage("");
    setPidginInstructions("");
    setStatusMessage(`Added ${drugName} to prescription slip.`);
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleRemoveDraft = (index: number) => {
    setDraftList(draftList.filter((_, i) => i !== index));
  };

  const handleSaveAndCommit = () => {
    if (draftList.length === 0) {
      alert("Please add at least one medication to the prescription.");
      return;
    }

    const now = new Date().toISOString();
    draftList.forEach((draft, idx) => {
      const fullPrescription: Prescription = {
        ...draft,
        id: `rx-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
        prescribedAt: now,
        dispensed: false
      };
      addPrescriptionToPatient(patient.id, fullPrescription);
    });

    setViewMode("preview_print");
    if (onPrescriptionCreated) onPrescriptionCreated();
  };

  const handlePrint = () => {
    window.print();
  };

  const isSickleCell = patient.genotype === "SS";

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden print:max-h-none print:shadow-none print:border-none print:w-full">
        {/* Top Header - Hidden when printing */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Generate Digital Prescription (Rx)
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
            <div className="bg-slate-800 p-1 rounded-lg flex text-xs">
              <button
                onClick={() => setViewMode("form")}
                className={`px-3 py-1 rounded font-semibold cursor-pointer transition-colors ${
                  viewMode === "form" ? "bg-emerald-700 text-white" : "text-slate-300 hover:text-white"
                }`}
              >
                1. Prescribe
              </button>
              <button
                onClick={() => setViewMode("preview_print")}
                className={`px-3 py-1 rounded font-semibold cursor-pointer transition-colors ${
                  viewMode === "preview_print" ? "bg-emerald-700 text-white" : "text-slate-300 hover:text-white"
                }`}
              >
                2. Official Slip / PDF
              </button>
            </div>

            {viewMode === "preview_print" && (
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Mode 1: Formulation Form */}
        {viewMode === "form" ? (
          <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs">
            {/* Clinical Alert Banners */}
            <div className="flex flex-wrap gap-2">
              {isSickleCell && (
                <div className="w-full p-2.5 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 flex items-center gap-2 font-medium">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    <strong>Sickle Cell Alert (Genotype SS):</strong> Ensure adequate hydration, avoid severe dehydration, consider routine Folic Acid 5mg.
                  </span>
                </div>
              )}
              {patient.allergies && patient.allergies.length > 0 && (
                <div className="w-full p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 flex items-center gap-2 font-medium">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Documented Drug Allergies:</strong> {patient.allergies.join(", ")}. Do NOT prescribe cross-reacting compounds.
                  </span>
                </div>
              )}
            </div>

            {/* Status Message */}
            {statusMessage && (
              <div className="p-2.5 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Quick Inventory / Predefined Autocomplete Chips */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
                Quick Select from Hospital Pharmacy Stock:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {inventory.slice(0, 8).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectInventoryItem(item)}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-300 rounded-md text-[11px] text-slate-800 transition-colors cursor-pointer flex items-center gap-1 font-medium"
                  >
                    <span>{item.drugName}</span>
                    <span className="text-[10px] text-emerald-700 font-mono font-bold">
                      ({item.stockQuantity} in stock)
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Add Medication Form */}
            <form onSubmit={handleAddDrugToDraft} className="border border-slate-200 rounded-xl p-4 bg-white space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  Add Medication to Prescription Regimen
                </h3>
                <span className="text-[11px] text-slate-500">
                  Linked Diagnosis: <strong className="text-slate-800">{patient.consultations[0]?.provisionalDiagnosis || "General Outpatient (GOPD)"}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">
                    Medication Name & Strength <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Artemether-Lumefantrine 80/480mg, Amoxiclav 625mg..."
                    value={drugName}
                    onChange={(e) => setDrugName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Dosage / Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 tab, 500mg, 10ml"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-medium bg-white"
                  >
                    <option value="Once Daily (OD)">Once Daily (OD)</option>
                    <option value="Twice Daily (BD)">Twice Daily (BD)</option>
                    <option value="8-hourly (TDS)">8-hourly / 3 times daily (TDS)</option>
                    <option value="6-hourly (QDS)">6-hourly / 4 times daily (QDS)</option>
                    <option value="At Bedtime (Nocte)">At Bedtime (Nocte)</option>
                    <option value="When Necessary (PRN)">When Necessary (PRN)</option>
                    <option value="Stat Dose (Immediately)">Stat Dose (Immediately)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-medium bg-white"
                  >
                    <option value="3 days">3 days</option>
                    <option value="5 days">5 days</option>
                    <option value="7 days">7 days</option>
                    <option value="10 days">10 days</option>
                    <option value="14 days">14 days</option>
                    <option value="1 month">1 month (Refill)</option>
                    <option value="Continuous / Routine">Continuous / Routine</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Total Quantity to Dispense</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nigerian Pidgin / Local Counseling Instructions (For Patient Comprehension)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Take 1 sweet morning, 1 night after you don chop food well well for 3 days"
                  value={pidginInstructions}
                  onChange={(e) => setPidginInstructions(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Medication to Prescription</span>
                </button>
              </div>
            </form>

            {/* Current Draft List */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Prescription Regimen ({draftList.length} items)
                </h4>
                <span className="text-[11px] text-slate-500">Doctor Sign-Off: {doctorName}</span>
              </div>

              {draftList.length === 0 ? (
                <p className="text-slate-500 text-center py-4 italic">
                  No medications added to this prescription yet. Add one above.
                </p>
              ) : (
                <div className="space-y-2">
                  {draftList.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white p-3 rounded-lg border border-slate-200 flex items-start justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{item.drugName}</span>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.2 rounded font-mono">
                            Qty: {item.quantity}
                          </span>
                          <span className="text-[11px] text-slate-500 font-semibold">
                            {item.route} • {item.frequency} for {item.duration}
                          </span>
                        </div>
                        {item.pidginInstructions && (
                          <p className="text-[11px] text-emerald-800 font-medium italic">
                            Pidgin Guide: "{item.pidginInstructions}"
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveDraft(index)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Remove drug"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Doctor Official Stamp & Sign-off Fields */}
              <div className="border-t border-slate-200 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Prescribing Doctor</label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">MDCN Folio / License No</label>
                  <input
                    type="text"
                    value={doctorFolio}
                    onChange={(e) => setDoctorFolio(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleSaveAndCommit}
                  disabled={draftList.length === 0}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-2 shadow-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Authorize & Generate Official Slip</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* View Mode 2: Official Prescription Slip & PDF Preview */
          <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-100 print:bg-white print:p-0">
            <div className="w-full max-w-2xl bg-white border-2 border-slate-900 rounded-2xl p-6 sm:p-8 shadow-xl print:shadow-none print:border-2 text-slate-900 space-y-5 relative">
              {/* Hospital Watermark & Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4 relative">
                <div className="text-xs font-bold tracking-widest text-emerald-700 uppercase">
                  FEDERAL REPUBLIC OF NIGERIA
                </div>
                <h1 className="text-xl font-black uppercase tracking-wide text-slate-900">
                  {config.hospitalName}
                </h1>
                <p className="text-xs font-semibold text-slate-600">
                  DEPARTMENT OF CLINICAL SERVICES & PHARMACY PRACTICE
                </p>
                <div className="text-[10px] text-slate-500 font-mono mt-1">
                  OFFICIAL DIGITAL PRESCRIPTION & MEDICATION ORDER
                </div>
              </div>

              {/* Patient Demographics Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border border-slate-300 rounded-xl p-3 bg-slate-50/60">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">File Number</span>
                  <span className="font-black font-mono text-sm text-slate-900">{patient.fileNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Patient Name</span>
                  <span className="font-bold text-slate-900">{patient.lastName}, {patient.firstName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Age / Sex</span>
                  <span className="font-semibold text-slate-800">{patient.ageYears} yrs • {patient.gender}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Blood & Genotype</span>
                  <span className={`font-black ${isSickleCell ? "text-rose-700" : "text-slate-900"}`}>
                    {patient.bloodGroup} • {patient.genotype} {isSickleCell && "(SS ALERT)"}
                  </span>
                </div>
              </div>

              {/* Drug Allergy Warning Bar */}
              {patient.allergies && patient.allergies.length > 0 && (
                <div className="bg-rose-50 border-2 border-rose-500 p-2 rounded-lg text-xs text-rose-900 font-bold flex items-center justify-between">
                  <span>ALLERGY WARNING: {patient.allergies.join(", ")}</span>
                  <span className="text-[10px] uppercase font-black bg-rose-600 text-white px-2 py-0.5 rounded">
                    Contraindicated
                  </span>
                </div>
              )}

              {/* Classical Rx Heading */}
              <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-1">
                <span className="text-3xl font-serif font-black text-slate-900 italic">℞</span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Prescription Orders & Dispensing Instructions
                </span>
              </div>

              {/* Medication Table */}
              <div className="space-y-3">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-500 text-[10px] uppercase tracking-wider">
                      <th className="py-1.5 font-bold">#</th>
                      <th className="py-1.5 font-bold">Medication Name & Strength</th>
                      <th className="py-1.5 font-bold">Regimen / Frequency</th>
                      <th className="py-1.5 font-bold">Duration</th>
                      <th className="py-1.5 font-bold text-right">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {draftList.map((med, idx) => (
                      <tr key={idx} className="align-top">
                        <td className="py-2.5 font-bold font-mono text-slate-500">{idx + 1}.</td>
                        <td className="py-2.5">
                          <span className="font-bold text-slate-900 block">{med.drugName}</span>
                          <span className="text-[11px] text-slate-600 font-medium">Route: {med.route}</span>
                          {med.pidginInstructions && (
                            <span className="text-[10px] text-emerald-800 italic block mt-0.5 font-medium">
                              Pidgin: "{med.pidginInstructions}"
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 font-semibold text-slate-800">{med.dosage} • {med.frequency}</td>
                        <td className="py-2.5 text-slate-700 font-medium">{med.duration}</td>
                        <td className="py-2.5 text-right font-bold font-mono text-slate-900">{med.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Verification & Doctor Stamp Box */}
              <div className="border-t-2 border-slate-900 pt-4 flex items-end justify-between gap-4">
                {/* QR Code */}
                <div className="flex items-center gap-3">
                  {qrCodeUrl && (
                    <img
                      src={qrCodeUrl}
                      alt="Prescription Verification QR"
                      className="w-20 h-20 border border-slate-900 rounded p-1"
                    />
                  )}
                  <div className="text-[9px] text-slate-500 space-y-0.5">
                    <p className="font-mono font-bold text-slate-800">MEDIFILE-RX-AUTHENTICATED</p>
                    <p>Scannable by Pharmacy Dispensary</p>
                    <p>Issued: {new Date().toLocaleDateString("en-NG", { dateStyle: "long" })}</p>
                  </div>
                </div>

                {/* Doctor Signature Stamp */}
                <div className="border-2 border-slate-900 rounded-xl p-3 text-center w-56 bg-slate-50/80 space-y-1">
                  <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                    Authorized Prescriber Stamp
                  </div>
                  <div className="font-serif italic text-sm font-black text-emerald-900">
                    {doctorName}
                  </div>
                  <div className="text-[10px] font-mono font-bold text-slate-700">
                    {doctorFolio}
                  </div>
                  <div className="text-[8px] font-mono text-slate-400">
                    {doctorSignature}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
