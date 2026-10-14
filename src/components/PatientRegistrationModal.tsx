import React, { useState } from "react";
import { 
  X, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  ShieldCheck, 
  Building, 
  Archive,
  Flame,
  FileText
} from "lucide-react";
import { NIGERIAN_STATES, NIGERIA_HMOS, COMMON_ALLERGIES, COMMON_CHRONIC_CONDITIONS } from "../data/nigeriaLocations";
import { Patient, BloodGroup, Genotype, ManilaFolderColor } from "../types";
import { getHospitalConfig, upsertPatient } from "../lib/storage";

interface PatientRegistrationModalProps {
  onClose: () => void;
  onPatientCreated: (patient: Patient) => void;
}

export const PatientRegistrationModal: React.FC<PatientRegistrationModalProps> = ({
  onClose,
  onPatientCreated
}) => {
  const config = getHospitalConfig();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const currentYear = new Date().getFullYear();

  // Form State
  const [fileNumber, setFileNumber] = useState(`${config.filePrefix}/${currentYear}/${randomSuffix}`);
  const [legacyFileNumber, setLegacyFileNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Female");
  const [dateOfBirth, setDateOfBirth] = useState("1994-05-12");
  const [ageYears, setAgeYears] = useState(30);
  const [phone, setPhone] = useState("080");
  const [residentialAddress, setResidentialAddress] = useState("");
  const [selectedState, setSelectedState] = useState(NIGERIAN_STATES[24].name); // Lagos default
  const [selectedLga, setSelectedLga] = useState(NIGERIAN_STATES[24].lgas[0]);
  const [nin, setNin] = useState("");
  const [nhisNumber, setNhisNumber] = useState("");
  const [hmoProvider, setHmoProvider] = useState("Self-Pay (Fee for Service)");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("O+");
  const [genotype, setGenotype] = useState<Genotype>("AA");
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [nextOfKinName, setNextOfKinName] = useState("");
  const [nextOfKinRel, setNextOfKinRel] = useState<any>("Spouse");
  const [nextOfKinPhone, setNextOfKinPhone] = useState("");

  // Physical Manila Shelf Location State
  const [roomNumber, setRoomNumber] = useState("Main Records Archive Room A");
  const [cabinet, setCabinet] = useState("Cabinet 4");
  const [shelfOrDrawer, setShelfOrDrawer] = useState("Row 2, Box 14");
  const [folderColor, setFolderColor] = useState<ManilaFolderColor>("Brown Manila");

  // Initial Vitals
  const [addVitalsNow, setAddVitalsNow] = useState(false);
  const [bpSys, setBpSys] = useState(120);
  const [bpDia, setBpDia] = useState(80);
  const [temp, setTemp] = useState(36.8);
  const [pulse, setPulse] = useState(76);

  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    const found = NIGERIAN_STATES.find((s) => s.name === stateName);
    if (found && found.lgas.length > 0) {
      setSelectedLga(found.lgas[0]);
    }
  };

  const handleDobChange = (dob: string) => {
    setDateOfBirth(dob);
    const birthYear = new Date(dob).getFullYear();
    const calculatedAge = currentYear - birthYear;
    if (calculatedAge >= 0 && calculatedAge <= 120) {
      setAgeYears(calculatedAge);
    }
  };

  const toggleAllergy = (allergy: string) => {
    if (selectedAllergies.includes(allergy)) {
      setSelectedAllergies(selectedAllergies.filter((a) => a !== allergy));
    } else {
      setSelectedAllergies([...selectedAllergies, allergy]);
    }
  };

  const toggleCondition = (cond: string) => {
    if (selectedConditions.includes(cond)) {
      setSelectedConditions(selectedConditions.filter((c) => c !== cond));
    } else {
      setSelectedConditions([...selectedConditions, cond]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      alert("Please provide patient's First and Last Name.");
      return;
    }

    const now = new Date().toISOString();
    const barcodeNumber = String(Date.now()).slice(-11);

    const newPatient: Patient = {
      id: "pat-" + Date.now(),
      fileNumber: fileNumber.trim(),
      barcodeNumber,
      legacyPaperFileNumber: legacyFileNumber.trim() || undefined,
      nin: nin.trim() || undefined,
      nhisNumber: nhisNumber.trim() || undefined,
      hmoProvider: hmoProvider.includes("Self-Pay") ? undefined : hmoProvider,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      middleName: middleName.trim() || undefined,
      gender,
      dateOfBirth,
      ageYears: Number(ageYears) || 30,
      phone: phone.trim(),
      residentialAddress: residentialAddress.trim() || "Local Community",
      stateOfOrigin: selectedState,
      lga: selectedLga,
      stateOfResidence: selectedState,
      preferredLanguage: "en",
      bloodGroup,
      genotype,
      allergies: selectedAllergies,
      chronicConditions: selectedConditions,
      nextOfKin: {
        name: nextOfKinName.trim() || "Family Contact",
        relationship: nextOfKinRel,
        phone: nextOfKinPhone.trim() || phone.trim()
      },
      physicalArchive: {
        roomNumber,
        cabinet,
        shelfOrDrawer,
        folderColor,
        physicalStatus: "in_shelf"
      },
      hasPhysicalPaperFolder: true,
      currentDepartment: "triage",
      patientStatus: "waiting",
      priority: genotype === "SS" ? "urgent" : "normal",
      vitalsHistory: addVitalsNow ? [
        {
          id: "vit-" + Date.now(),
          recordedAt: now,
          recordedBy: "Intake Triage Desk",
          bloodPressureSystolic: Number(bpSys),
          bloodPressureDiastolic: Number(bpDia),
          temperature: Number(temp),
          pulse: Number(pulse),
          weight: 65,
          spo2: 98,
          nurseNotes: "Initial vitals at time of intake registration."
        }
      ] : [],
      consultations: [],
      labOrders: [],
      prescriptions: [],
      createdAt: now,
      updatedAt: now,
      lastVisitedAt: now
    };

    upsertPatient(newPatient, {
      action: "REGISTERED_PATIENT",
      details: `Registered new patient folder ${newPatient.fileNumber} for ${newPatient.lastName}, ${newPatient.firstName}`
    });

    onPatientCreated(newPatient);
    onClose();
  };

  const currentLgas = NIGERIAN_STATES.find((s) => s.name === selectedState)?.lgas || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                New Patient Intake & Manila Folder Registry
              </h2>
              <p className="text-xs text-slate-400">
                Generate hospital file number, index physical cabinet coordinates, and assign triage queue
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* Section 1: File Identity & Paper Ledger Bridge */}
          <div className="bg-amber-50/70 border border-amber-300 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <Archive className="w-4 h-4 text-amber-700" />
              <span>Hospital File Identity & Legacy Paper Card Indexing</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Hospital File Number (New / Auto-Assigned)
                </label>
                <input
                  type="text"
                  value={fileNumber}
                  onChange={(e) => setFileNumber(e.target.value)}
                  className="w-full p-2 bg-white border border-amber-300 rounded-lg font-mono font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Old Stamped Manila Card Number (If Migrating Paper)
                </label>
                <input
                  type="text"
                  value={legacyFileNumber}
                  onChange={(e) => setLegacyFileNumber(e.target.value)}
                  placeholder="e.g. FMC-OLD-1984"
                  className="w-full p-2 bg-white border border-amber-300 rounded-lg font-mono text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Patient Bio Data */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1">
              Patient Biodata & Demographics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Surname / Last Name *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Danjuma"
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">First Name *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Fatima"
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Middle Name</label>
                <input
                  type="text"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="e.g. Kemi"
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => handleDobChange(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Age (Years)</label>
                <input
                  type="number"
                  value={ageYears}
                  onChange={(e) => setAgeYears(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Phone Number (Nigerian)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08031234567"
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">State of Origin</label>
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                >
                  {NIGERIAN_STATES.map((st) => (
                    <option key={st.name} value={st.name}>{st.name} State</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Local Govt Area (LGA)</label>
                <select
                  value={selectedLga}
                  onChange={(e) => setSelectedLga(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                >
                  {currentLgas.map((lga) => (
                    <option key={lga} value={lga}>{lga}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Residential Street Address</label>
              <input
                type="text"
                value={residentialAddress}
                onChange={(e) => setResidentialAddress(e.target.value)}
                placeholder="Street address, landmark, town..."
                className="w-full p-2 border border-slate-300 rounded-lg font-medium"
              />
            </div>
          </div>

          {/* Section 3: NIN & Insurance */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              National Identity & Health Insurance (NHIA)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  National ID (NIN) - 11 Digits
                </label>
                <input
                  type="text"
                  maxLength={11}
                  value={nin}
                  onChange={(e) => setNin(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 54910294819"
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  NHIS / NHIA Enrollee ID
                </label>
                <input
                  type="text"
                  value={nhisNumber}
                  onChange={(e) => setNhisNumber(e.target.value)}
                  placeholder="e.g. NHIA/LA/2024/9912"
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Payment Scheme / HMO
                </label>
                <select
                  value={hmoProvider}
                  onChange={(e) => setHmoProvider(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                >
                  <option value="Self-Pay (Fee for Service)">Self-Pay (Fee for Service / Cash)</option>
                  {NIGERIA_HMOS.map((hmo) => (
                    <option key={hmo} value={hmo}>{hmo}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Clinical Attributes & Blood Safety */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1">
              Clinical Attributes & Blood Safety
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Genotype *</label>
                <select
                  value={genotype}
                  onChange={(e) => setGenotype(e.target.value as Genotype)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-bold text-slate-900"
                >
                  <option value="AA">AA (Normal Adult Hemoglobin)</option>
                  <option value="AS">AS (Sickle Cell Trait Carrier)</option>
                  <option value="SS">SS (Sickle Cell Disease / Warrior)</option>
                  <option value="AC">AC (Hemoglobin C Trait)</option>
                  <option value="SC">SC (Hemoglobin SC Disease)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">ABO Blood Group *</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-bold text-slate-900"
                >
                  <option value="O+">O Rh(D) Positive (Universal Donor)</option>
                  <option value="O-">O Rh(D) Negative</option>
                  <option value="A+">A Rh(D) Positive</option>
                  <option value="A-">A Rh(D) Negative</option>
                  <option value="B+">B Rh(D) Positive</option>
                  <option value="B-">B Rh(D) Negative</option>
                  <option value="AB+">AB Rh(D) Positive</option>
                  <option value="AB-">AB Rh(D) Negative</option>
                </select>
              </div>
            </div>

            {genotype === "SS" && (
              <div className="bg-rose-50 border border-rose-300 rounded-xl p-3 text-rose-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold">Sickle Cell Disease Flagged:</span> System will automatically mark this folder as <strong>Urgent Triage</strong> and set hydration alert for all clinic visits.
                </div>
              </div>
            )}

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Known Drug Allergies</label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_ALLERGIES.map((alg) => {
                  const isChecked = selectedAllergies.includes(alg);
                  return (
                    <button
                      type="button"
                      key={alg}
                      onClick={() => toggleAllergy(alg)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                        isChecked
                          ? "bg-rose-600 text-white font-bold"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {alg}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 5: Physical Manila Shelf Assignment */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Archive className="w-4 h-4 text-emerald-600" />
              Physical Manila Folder Shelf Storage Index
            </h3>
            <p className="text-[11px] text-slate-500">
              Where will this physical folder or paper cards be filed in the records archive room?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Archive Room</label>
                <select
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium"
                >
                  <option value="Main Records Archive Room A">Main Records Hall A</option>
                  <option value="Archive Hall B (Chronic & Geriatric)">Archive Hall B</option>
                  <option value="Antenatal Clinic (ANC) Registry">Antenatal Registry</option>
                  <option value="Pediatric Archive Room 3">Pediatric Registry</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Cabinet Number</label>
                <input
                  type="text"
                  value={cabinet}
                  onChange={(e) => setCabinet(e.target.value)}
                  placeholder="Cabinet 4"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Shelf / Row Rack</label>
                <input
                  type="text"
                  value={shelfOrDrawer}
                  onChange={(e) => setShelfOrDrawer(e.target.value)}
                  placeholder="Row 2, Box 14"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Folder Color</label>
                <select
                  value={folderColor}
                  onChange={(e) => setFolderColor(e.target.value as ManilaFolderColor)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium"
                >
                  <option value="Brown Manila">Brown Manila (Standard)</option>
                  <option value="Blue General">Blue General</option>
                  <option value="Pink Antenatal">Pink Antenatal (Maternity)</option>
                  <option value="Yellow Pediatric">Yellow Pediatric (Child)</option>
                  <option value="Green Staff">Green Staff / NHIS</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 6: Next of Kin */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1">
              Next of Kin / Emergency Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Next of Kin Full Name</label>
                <input
                  type="text"
                  value={nextOfKinName}
                  onChange={(e) => setNextOfKinName(e.target.value)}
                  placeholder="e.g. Chinedu Danjuma"
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Relationship</label>
                <select
                  value={nextOfKinRel}
                  onChange={(e) => setNextOfKinRel(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent / Guardian</option>
                  <option value="Sibling">Brother / Sister</option>
                  <option value="Child">Son / Daughter</option>
                  <option value="Other">Other Relative</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Emergency Phone</label>
                <input
                  type="tel"
                  value={nextOfKinPhone}
                  onChange={(e) => setNextOfKinPhone(e.target.value)}
                  placeholder="08098765432"
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md flex items-center gap-2 text-xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Create Patient Folder & Print Label</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
