export type DepartmentType = 
  | "records" 
  | "triage" 
  | "doctor" 
  | "laboratory" 
  | "pharmacy" 
  | "billing";

export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
export type Genotype = "AA" | "AS" | "SS" | "AC" | "SC";
export type ManilaFolderColor = "Brown Manila" | "Blue General" | "Pink Antenatal" | "Yellow Pediatric" | "Green Staff";

export type PatientStatus = 
  | "waiting" 
  | "in_consultation" 
  | "awaiting_lab" 
  | "awaiting_pharmacy" 
  | "admitted" 
  | "discharged";

export interface PhysicalArchiveLocation {
  roomNumber: string; // e.g. "Archive Room 1"
  cabinet: string; // e.g. "Cabinet C"
  shelfOrDrawer: string; // e.g. "Row 3, Drawer 2"
  boxNumber?: string; // e.g. "Box 14"
  folderColor: string; // e.g. "Brown Manila", "Blue General", "Pink Antenatal", "Yellow Pediatric"
  physicalStatus: "in_shelf" | "checked_out" | "misplaced_flagged" | "in_transit";
  checkedOutTo?: string; // e.g. "Dr. Babatunde (GOPD Room 4)"
  checkedOutAt?: string;
}

export interface VitalsRecord {
  id: string;
  recordedAt: string;
  recordedBy: string; // e.g. "Nurse Ngozi Okeke"
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  temperature: number; // Celsius
  pulse: number; // bpm
  weight: number; // kg
  height?: number; // cm
  respiratoryRate?: number;
  bloodSugar?: number; // mg/dL
  spo2?: number; // %
  nurseNotes?: string;
}

export interface LabTest {
  id: string;
  testName: string; // e.g. "Malaria Parasite (MP)", "Widal Agglutination", "PCV / Hb", "Urinalysis", "Genotype"
  requestedBy: string;
  requestedAt: string;
  status: "pending" | "sample_collected" | "processing" | "completed";
  results?: string;
  normalRange?: string;
  labTechnician?: string;
  completedAt?: string;
}

export interface Prescription {
  id: string;
  drugName: string; // e.g. "Artemether-Lumefantrine (Coartem) 80/480mg"
  dosage: string; // e.g. "1 tab twice daily for 3 days"
  frequency?: string; // e.g. "Twice Daily (BD)", "8-hourly (TDS)", "Once Daily (OD)"
  duration: string; // e.g. "3 days", "7 days", "1 month"
  route?: string; // e.g. "Oral", "IV", "IM", "Topical"
  quantity?: number; // Total number of units to dispense
  pidginInstructions?: string; // e.g. "Take 1 sweet morning, 1 night after food for 3 days"
  prescribedBy: string; // Doctor name & title
  doctorSignature?: string; // Digital signature / timestamp hash
  prescribedAt: string;
  diagnosisLinked?: string;
  dispensed: boolean;
  dispensedAt?: string;
  dispensedBy?: string;
  linkedInventoryItemId?: string;
  dispenseNotes?: string;
}

export interface ConsultationNote {
  id: string;
  date: string;
  doctorName: string; // e.g. "Dr. Emeka Adeyemi, FWACS"
  department: string; // e.g. "General Outpatient (GOPD)"
  chiefComplaint: string;
  historyOfPresentingIllness: string;
  reviewOfSystems?: string;
  examinationFindings: string;
  provisionalDiagnosis: string;
  icdCode?: string;
  plan: string;
  freeTextObservations?: string;
  doctorSignature?: string;
  folioNumber?: string;
}

export interface PharmacyItem {
  id: string;
  drugName: string; // e.g. "Artemether-Lumefantrine 80/480mg (Coartem)"
  genericName: string; // e.g. "Artemether + Lumefantrine"
  category: "Antimalarial" | "Antibiotic" | "Analgesic / NSAID" | "Antihypertensive" | "Antidiabetic" | "Antihistamine" | "Vitamins / Supplements" | "IV Fluids & Injectables" | "Other";
  dosageForm: "Tablet" | "Capsule" | "Suspension / Syrup" | "Injection" | "Ointment / Cream" | "Eye / Ear Drops" | "Inhaler";
  strength: string; // e.g. "80/480mg", "500mg"
  stockQuantity: number;
  unit: string; // "tablets", "bottles", "vials", "blister packs"
  reorderThreshold: number; // Alerts when stockQuantity <= reorderThreshold
  batchNumber: string; // e.g. "EMZ-2025-081"
  expiryDate: string; // e.g. "2027-06-30"
  unitPriceNaira: number; // in Naira (₦)
  supplier: string; // e.g. "Emzor", "Fidson", "Swiss Pharma"
  lastRestockedAt: string;
  notes?: string;
}

export interface NextOfKin {
  name: string;
  relationship: "Spouse" | "Parent" | "Child" | "Sibling" | "Relative" | "Friend" | "Other";
  phone: string;
  address?: string;
}

export interface Patient {
  id: string;
  fileNumber: string; // e.g. "UCH/2024/0914" or "GH/IKJ/1049"
  barcodeNumber: string; // e.g. "90214829104"
  legacyPaperFileNumber?: string; // Number stamped on old physical folder
  nin?: string; // 11 digit National Identification Number
  nhisNumber?: string; // NHIA National Health Insurance Scheme ID
  hmoProvider?: string; // e.g. "Hygeia", "Reliance HMO", "Metrohealth", "AXA Mansard"
  
  // Demographics
  firstName: string;
  lastName: string;
  middleName?: string;
  gender: "Male" | "Female" | "Other";
  dateOfBirth: string;
  ageYears: number;
  phone: string;
  alternatePhone?: string;
  residentialAddress: string;
  stateOfOrigin: string;
  lga: string;
  stateOfResidence: string;
  occupation?: string;
  religion?: "Christianity" | "Islam" | "Traditional" | "Other";
  preferredLanguage: "en" | "pcm" | "ha" | "yo" | "ig";

  // Clinical Identifiers
  bloodGroup: BloodGroup;
  genotype: Genotype;
  allergies: string[];
  chronicConditions: string[];

  // Next of Kin
  nextOfKin: NextOfKin;

  // Physical Paper Archive Bridge
  physicalArchive: PhysicalArchiveLocation;
  hasPhysicalPaperFolder: boolean;
  digitizedFromPaperDate?: string;

  // Active Visit & Routing
  currentDepartment: DepartmentType;
  patientStatus: PatientStatus;
  priority: "normal" | "urgent" | "emergency";
  queueNumber?: string; // e.g. "REC-014", "GOPD-03"

  // Medical History
  vitalsHistory: VitalsRecord[];
  consultations: ConsultationNote[];
  labOrders: LabTest[];
  prescriptions: Prescription[];

  // Audit
  createdAt: string;
  updatedAt: string;
  lastVisitedAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  staffName: string;
  staffRole: string;
  action: "CREATED_FILE" | "REGISTERED_PATIENT" | "DIGITIZED_PAPER" | "CHECKED_OUT_PHYSICAL" | "RETURNED_PHYSICAL" | "RECORDED_VITALS" | "ADDED_NOTE" | "ORDERED_LAB" | "DISPENSED_DRUGS" | "ROUTED_PATIENT" | "CREATED_PRESCRIPTION" | "DISPENSED_PRESCRIPTION" | "RESTOCKED_INVENTORY" | "BOOKED_APPOINTMENT" | "UPDATED_APPOINTMENT" | "CANCELLED_APPOINTMENT" | "CHECKED_IN_APPOINTMENT" | "CREATED_INVOICE" | "COLLECTED_PAYMENT" | "APPLIED_WAIVER" | "CANCELLED_INVOICE";
  details: string;
  patientId: string;
  patientName: string;
  fileNumber: string;
}

// -------------------------------------------------------------
// Billing & Invoicing System (Consultation, Labs, Medications)
// -------------------------------------------------------------

export type PaymentStatus = "paid" | "pending" | "waiver" | "partially_paid";

export type BillItemCategory = 
  | "consultation" 
  | "laboratory" 
  | "medication" 
  | "procedure" 
  | "registration" 
  | "bed_admission";

export type PaymentMethod = 
  | "Cash (NGN)" 
  | "POS / Debit Card" 
  | "Bank Transfer / USSD" 
  | "NHIA / HMO Scheme" 
  | "Hospital Indigent Waiver" 
  | "Other";

export interface BillItem {
  id: string;
  category: BillItemCategory;
  description: string;
  quantity: number;
  unitPriceNaira: number;
  totalPriceNaira: number;
  department?: string;
  code?: string;
  linkedLabTestId?: string;
  linkedPrescriptionId?: string;
}

export interface BillingInvoice {
  id: string;
  invoiceNumber: string; // e.g. "MF-INV-2026-0182"
  receiptNumber?: string; // e.g. "RCP-2026-0819"
  patientId: string;
  patientName: string;
  patientFileNumber: string;
  patientPhone?: string;
  nhisNumber?: string;
  hmoProvider?: string;
  
  items: BillItem[];
  subtotalNaira: number;
  discountOrWaiverNaira: number;
  waiverReason?: string; // e.g. "Sickle Cell Warrior Emergency Waiver", "Indigent Patient Fund", "Medical Director Approval"
  waiverApprovedBy?: string; // e.g. "Dr. Babatunde Adeyemi (CMD / Medical Director)"
  
  totalAmountNaira: number;
  amountPaidNaira: number;
  balanceDueNaira: number;
  
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  transactionReference?: string; // e.g. POS RRN or Bank Transfer session ID
  cashierName: string;
  cashierShift?: string;
  
  createdAt: string;
  paidAt?: string;
  notes?: string;
}

export type AppointmentStatus = 
  | "scheduled"       // Booked in advance
  | "confirmed"       // Confirmed via phone/SMS
  | "checked_in"      // Patient arrived at front desk
  | "in_consultation" // Doctor is currently seeing patient
  | "completed"       // Consultation finished
  | "no_show"         // Patient missed appointment
  | "rescheduled"     // Moved to new slot
  | "cancelled";      // Cancelled

export type ClinicDepartment = 
  | "General Outpatient (GOPD)"
  | "Cardiology Clinic"
  | "Antenatal & Maternity (ANC)"
  | "Pediatric Clinic"
  | "Endocrinology / Diabetes Clinic"
  | "Surgical Outpatient (SOPD)"
  | "Hematology & Sickle Cell Clinic"
  | "Ophthalmology / Eye Clinic"
  | "Dental Clinic"
  | "Physiotherapy & Rehab";

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientFileNumber: string;
  patientPhone: string;
  patientGender: "Male" | "Female" | "Other";
  patientAge: number;
  patientGenotype?: Genotype;
  patientBloodGroup?: BloodGroup;
  
  // Schedule timing
  date: string; // "YYYY-MM-DD"
  timeSlot: string; // e.g. "08:30 AM", "09:00 AM", etc.
  durationMinutes: number;

  // Clinic & Clinician
  clinic: ClinicDepartment;
  doctorAssigned: string; // e.g. "Dr. Oladipo Johnson", "Dr. Babatunde Adeyemi", "Dr. Fatima Bello", "Any Duty Doctor"
  roomNumber?: string;

  // Clinical context
  appointmentType: "Routine Follow-up" | "Lab Result Review" | "Medication Refill" | "Antenatal Routine" | "Post-Op Check" | "Specialist Consultation" | "Sickle Cell Wellness Review" | "New Patient Intake";
  priority: "normal" | "urgent" | "emergency";
  reason: string;
  notes?: string;

  // Nigerian Hospital HIM Logistics
  physicalFileRetrieved: boolean; // Has records pulled the physical brown manila folder from shelf?
  physicalShelfLocation?: string; // e.g. "Cabinet 4 • Row 3, Drawer 2"
  smsReminderSent: boolean;

  // Status tracking
  status: AppointmentStatus;
  bookedBy: string;
  bookedAt: string;
  checkedInAt?: string;
  completedAt?: string;
}

export interface DigitizedPaperResult {
  fullName: string;
  fileNumber?: string;
  gender: "Male" | "Female" | "Other";
  age?: string;
  dateOfBirth?: string;
  phone?: string;
  residentialAddress?: string;
  stateOfOrigin?: string;
  lga?: string;
  nin?: string;
  nhisNumber?: string;
  bloodGroup?: BloodGroup;
  genotype?: Genotype;
  nextOfKin?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  physicalArchive?: {
    roomNumber?: string;
    cabinet?: string;
    shelfOrDrawer?: string;
    folderColor?: string;
  };
  vitals?: {
    bp?: string;
    temperature?: string;
    pulse?: string;
    weight?: string;
    spo2?: string;
  };
  allergies?: string[];
  chronicConditions?: string[];
  primaryDiagnosis?: string;
  clinicalSummary?: string;
  transcriptionConfidence: number;
  suggestedNextDepartment?: string;
}
