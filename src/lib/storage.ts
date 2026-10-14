import { Patient, AuditLogEntry, PharmacyItem, Prescription, ConsultationNote, Appointment, BillingInvoice, BillItem, PaymentStatus, PaymentMethod } from "../types";
import { INITIAL_PATIENTS, INITIAL_AUDIT_LOGS } from "../data/nigeriaLocations";
import { INITIAL_PHARMACY_INVENTORY } from "../data/pharmacyInventory";
import { INITIAL_APPOINTMENTS } from "../data/initialAppointments";
import { INITIAL_INVOICES } from "../data/initialInvoices";

const STORAGE_KEYS = {
  PATIENTS: "medifile_ng_patients_v1",
  AUDIT_LOGS: "medifile_ng_audit_logs_v1",
  HOSPITAL_CONFIG: "medifile_ng_hospital_config_v1",
  OFFLINE_MODE: "medifile_ng_offline_mode_v1",
  ACTIVE_STAFF: "medifile_ng_active_staff_v1",
  PHARMACY_INVENTORY: "medifile_ng_pharmacy_inventory_v1",
  APPOINTMENTS: "medifile_ng_appointments_v1",
  INVOICES: "medifile_ng_billing_invoices_v1"
};

export interface HospitalConfig {
  hospitalName: string;
  facilityType: "General Hospital" | "Federal Medical Centre" | "Teaching Hospital" | "Comprehensive Health Centre" | "Private Specialist Clinic";
  state: string;
  lga: string;
  filePrefix: string;
  currentStation: string;
  enableNINValidation: boolean;
  enablePhysicalArchiveTracker: boolean;
}

export const DEFAULT_HOSPITAL_CONFIG: HospitalConfig = {
  hospitalName: "Federal Medical Centre / General Hospital, Nigeria",
  facilityType: "General Hospital",
  state: "Lagos",
  lga: "Ikeja",
  filePrefix: "GH/IKJ/2026/",
  currentStation: "Records & HIM",
  enableNINValidation: true,
  enablePhysicalArchiveTracker: true
};

export interface ActiveStaff {
  name: string;
  role: "Medical Records Officer" | "Staff Nurse" | "Medical Doctor" | "Lab Scientist" | "Pharmacist" | "Hospital Admin";
  stationId: string;
}

export const DEFAULT_STAFF: ActiveStaff = {
  name: "Mrs. Amina Danjuma (HIM Lead)",
  role: "Medical Records Officer",
  stationId: "records"
};

// Listeners for data reactivity
type Listener = () => void;
const listeners: Set<Listener> = new Set();

export function subscribeToStore(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function subscribePatients(fn: (patients: Patient[]) => void): () => void {
  const listener = () => {
    fn(getPatients());
  };
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners() {
  listeners.forEach((l) => {
    try {
      l();
    } catch (e) {
      console.error("Store notification error", e);
    }
  });
}

export function getPatients(): Patient[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
      return INITIAL_PATIENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load patients", e);
    return INITIAL_PATIENTS;
  }
}

export function savePatients(patients: Patient[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    notifyListeners();
  } catch (e) {
    console.error("Failed to save patients", e);
  }
}

export function getPatientById(id: string): Patient | undefined {
  return getPatients().find((p) => p.id === id);
}

export function getPatientByFileNumber(fileNo: string): Patient | undefined {
  const clean = fileNo.trim().toLowerCase();
  return getPatients().find((p) => 
    p.fileNumber.toLowerCase() === clean || 
    p.legacyPaperFileNumber?.toLowerCase() === clean ||
    p.barcodeNumber === clean ||
    p.nin === clean
  );
}

export function upsertPatient(patient: Patient, staffAction?: { action: AuditLogEntry["action"]; details: string }): void {
  const current = getPatients();
  const index = current.findIndex((p) => p.id === patient.id);
  const now = new Date().toISOString();
  
  const updatedPatient: Patient = {
    ...patient,
    updatedAt: now,
  };

  let updatedList: Patient[];
  if (index >= 0) {
    updatedList = [...current];
    updatedList[index] = updatedPatient;
  } else {
    updatedList = [updatedPatient, ...current];
  }

  savePatients(updatedList);

  if (staffAction) {
    const staff = getActiveStaff();
    addAuditLog({
      id: "log-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      timestamp: now,
      staffName: staff.name,
      staffRole: staff.role,
      action: staffAction.action,
      details: staffAction.details,
      patientId: patient.id,
      patientName: `${patient.lastName}, ${patient.firstName}`,
      fileNumber: patient.fileNumber
    });
  }
}

export function deletePatient(id: string): void {
  const current = getPatients();
  const filtered = current.filter((p) => p.id !== id);
  savePatients(filtered);
}

export function getAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
      return INITIAL_AUDIT_LOGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load audit logs", e);
    return INITIAL_AUDIT_LOGS;
  }
}

export function addAuditLog(entry: AuditLogEntry): void {
  try {
    const current = getAuditLogs();
    const updated = [entry, ...current].slice(0, 200); // keep recent 200 entries
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
    notifyListeners();
  } catch (e) {
    console.error("Failed to add audit log", e);
  }
}

export function getHospitalConfig(): HospitalConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HOSPITAL_CONFIG);
    if (!raw) return DEFAULT_HOSPITAL_CONFIG;
    return { ...DEFAULT_HOSPITAL_CONFIG, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_HOSPITAL_CONFIG;
  }
}

export function saveHospitalConfig(cfg: HospitalConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HOSPITAL_CONFIG, JSON.stringify(cfg));
    notifyListeners();
  } catch (e) {
    console.error("Failed to save config", e);
  }
}

export function getActiveStaff(): ActiveStaff {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_STAFF);
    if (!raw) return DEFAULT_STAFF;
    return { ...DEFAULT_STAFF, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_STAFF;
  }
}

export function saveActiveStaff(staff: ActiveStaff): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_STAFF, JSON.stringify(staff));
    notifyListeners();
  } catch (e) {
    console.error("Failed to save staff", e);
  }
}

export function getSimulatedNepaMode(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.OFFLINE_MODE) === "true";
  } catch (e) {
    return false;
  }
}

export function setSimulatedNepaMode(isOffline: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, isOffline ? "true" : "false");
    notifyListeners();
  } catch (e) {
    console.error("Failed to set offline mode", e);
  }
}

// Full offline backup exporter
export function exportHospitalDatabase(): string {
  const data = {
    exportedAt: new Date().toISOString(),
    version: "1.0",
    hospitalConfig: getHospitalConfig(),
    patients: getPatients(),
    auditLogs: getAuditLogs(),
    pharmacyInventory: getPharmacyInventory(),
    appointments: getAppointments(),
    checksum: "MEDIFILE-NG-VERIFIED"
  };
  return JSON.stringify(data, null, 2);
}

// Restore from backup JSON
export function importHospitalDatabase(jsonContent: string): { success: boolean; count?: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonContent);
    if (!parsed.patients || !Array.isArray(parsed.patients)) {
      return { success: false, error: "Invalid backup file: 'patients' array missing." };
    }
    savePatients(parsed.patients);
    if (parsed.auditLogs && Array.isArray(parsed.auditLogs)) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(parsed.auditLogs));
    }
    if (parsed.hospitalConfig) {
      saveHospitalConfig(parsed.hospitalConfig);
    }
    if (parsed.pharmacyInventory && Array.isArray(parsed.pharmacyInventory)) {
      savePharmacyInventory(parsed.pharmacyInventory);
    }
    if (parsed.appointments && Array.isArray(parsed.appointments)) {
      saveAppointments(parsed.appointments);
    }
    notifyListeners();
    return { success: true, count: parsed.patients.length };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to parse backup JSON" };
  }
}

// Reset store to initial demo state
export function resetToDemoData(): void {
  savePatients(INITIAL_PATIENTS);
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
  saveHospitalConfig(DEFAULT_HOSPITAL_CONFIG);
  savePharmacyInventory(INITIAL_PHARMACY_INVENTORY);
  saveAppointments(INITIAL_APPOINTMENTS);
  notifyListeners();
}

export const exportDatabaseBackupJson = exportHospitalDatabase;
export function importDatabaseBackupJson(json: string): boolean {
  const res = importHospitalDatabase(json);
  return res.success;
}
export const resetToInitialSeed = resetToDemoData;

// --- PHARMACY INVENTORY MANAGEMENT ---

export function getPharmacyInventory(): PharmacyItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PHARMACY_INVENTORY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PHARMACY_INVENTORY, JSON.stringify(INITIAL_PHARMACY_INVENTORY));
      return INITIAL_PHARMACY_INVENTORY;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load pharmacy inventory", e);
    return INITIAL_PHARMACY_INVENTORY;
  }
}

export function savePharmacyInventory(items: PharmacyItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PHARMACY_INVENTORY, JSON.stringify(items));
    notifyListeners();
  } catch (e) {
    console.error("Failed to save pharmacy inventory", e);
  }
}

export function upsertPharmacyItem(item: PharmacyItem): void {
  const current = getPharmacyInventory();
  const index = current.findIndex((i) => i.id === item.id);
  let updated: PharmacyItem[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = item;
  } else {
    updated = [item, ...current];
  }
  savePharmacyInventory(updated);

  const staff = getActiveStaff();
  addAuditLog({
    id: "log-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    staffName: staff.name,
    staffRole: staff.role,
    action: "RESTOCKED_INVENTORY",
    details: `Updated pharmacy stock for ${item.drugName} (Quantity: ${item.stockQuantity} ${item.unit})`,
    patientId: "pharmacy",
    patientName: "Pharmacy Dispensary",
    fileNumber: "PHARM-INV"
  });
}

export function restockPharmacyItem(
  itemId: string, 
  quantityToAdd: number, 
  batchNumber?: string, 
  expiryDate?: string
): void {
  const current = getPharmacyInventory();
  const index = current.findIndex((i) => i.id === itemId);
  if (index === -1) return;

  const item = current[index];
  const updatedItem: PharmacyItem = {
    ...item,
    stockQuantity: item.stockQuantity + quantityToAdd,
    lastRestockedAt: new Date().toISOString(),
    batchNumber: batchNumber || item.batchNumber,
    expiryDate: expiryDate || item.expiryDate
  };

  const updatedList = [...current];
  updatedList[index] = updatedItem;
  savePharmacyInventory(updatedList);

  const staff = getActiveStaff();
  addAuditLog({
    id: "log-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    staffName: staff.name,
    staffRole: staff.role,
    action: "RESTOCKED_INVENTORY",
    details: `Restocked ${quantityToAdd} ${item.unit} of ${item.drugName}. New total: ${updatedItem.stockQuantity}. Batch: ${updatedItem.batchNumber}`,
    patientId: "pharmacy",
    patientName: "Pharmacy Stock",
    fileNumber: "PHARM-RESTOCK"
  });
}

export function getLowStockAlerts(): PharmacyItem[] {
  return getPharmacyInventory().filter((item) => item.stockQuantity <= item.reorderThreshold);
}

// --- PATIENT PRESCRIPTION & CLINICAL NOTE GENERATION ---

export function addPrescriptionToPatient(patientId: string, prescription: Prescription): void {
  const patient = getPatientById(patientId);
  if (!patient) return;

  const updatedPatient: Patient = {
    ...patient,
    prescriptions: [prescription, ...patient.prescriptions],
    updatedAt: new Date().toISOString()
  };

  upsertPatient(updatedPatient, {
    action: "CREATED_PRESCRIPTION",
    details: `Prescribed ${prescription.drugName} (${prescription.dosage}, ${prescription.duration}) by ${prescription.prescribedBy}`
  });
}

export function dispensePatientPrescription(
  patientId: string, 
  prescriptionId: string,
  autoDeductInventory: boolean = true
): { success: boolean; message: string; remainingStock?: number } {
  const patient = getPatientById(patientId);
  if (!patient) return { success: false, message: "Patient not found." };

  const rxIndex = patient.prescriptions.findIndex((p) => p.id === prescriptionId);
  if (rxIndex === -1) return { success: false, message: "Prescription not found." };

  const rx = patient.prescriptions[rxIndex];
  if (rx.dispensed) {
    return { success: false, message: "This prescription has already been dispensed." };
  }

  const staff = getActiveStaff();
  const now = new Date().toISOString();
  let remainingStock: number | undefined;

  // Auto-deduct from pharmacy inventory
  if (autoDeductInventory) {
    const inventory = getPharmacyInventory();
    // Try matching by linked ID or drug name substring
    const itemIndex = inventory.findIndex((item) => 
      item.id === rx.linkedInventoryItemId || 
      rx.drugName.toLowerCase().includes(item.genericName.toLowerCase()) ||
      rx.drugName.toLowerCase().includes(item.drugName.toLowerCase()) ||
      item.drugName.toLowerCase().includes(rx.drugName.toLowerCase())
    );

    if (itemIndex >= 0) {
      const item = inventory[itemIndex];
      const deductAmount = rx.quantity && rx.quantity > 0 ? rx.quantity : 1;
      
      const newStock = Math.max(0, item.stockQuantity - deductAmount);
      remainingStock = newStock;

      const updatedInventory = [...inventory];
      updatedInventory[itemIndex] = {
        ...item,
        stockQuantity: newStock
      };
      savePharmacyInventory(updatedInventory);
    }
  }

  const updatedPrescriptions = [...patient.prescriptions];
  updatedPrescriptions[rxIndex] = {
    ...rx,
    dispensed: true,
    dispensedAt: now,
    dispensedBy: staff.name
  };

  const updatedPatient: Patient = {
    ...patient,
    prescriptions: updatedPrescriptions,
    updatedAt: now
  };

  upsertPatient(updatedPatient, {
    action: "DISPENSED_PRESCRIPTION",
    details: `Dispensed medication: ${rx.drugName} to patient by ${staff.name} (${staff.role})`
  });

  return { 
    success: true, 
    message: `Successfully dispensed ${rx.drugName}. Inventory updated.`,
    remainingStock 
  };
}

export function addConsultationNoteToPatient(patientId: string, note: ConsultationNote): void {
  const patient = getPatientById(patientId);
  if (!patient) return;

  const updatedPatient: Patient = {
    ...patient,
    consultations: [note, ...patient.consultations],
    updatedAt: new Date().toISOString(),
    lastVisitedAt: new Date().toISOString()
  };

  upsertPatient(updatedPatient, {
    action: "ADDED_NOTE",
    details: `Consultation note recorded by ${note.doctorName}: ${note.provisionalDiagnosis}`
  });
}

// --- APPOINTMENTS SCHEDULING MANAGEMENT ---

export function getAppointments(): Appointment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
      return INITIAL_APPOINTMENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load appointments", e);
    return INITIAL_APPOINTMENTS;
  }
}

export function saveAppointments(appointments: Appointment[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    notifyListeners();
  } catch (e) {
    console.error("Failed to save appointments", e);
  }
}

export function subscribeAppointments(fn: (appointments: Appointment[]) => void): () => void {
  const listener = () => {
    fn(getAppointments());
  };
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function upsertAppointment(
  appointment: Appointment, 
  staffAction?: { action: AuditLogEntry["action"]; details: string }
): void {
  const current = getAppointments();
  const index = current.findIndex((a) => a.id === appointment.id);
  let updated: Appointment[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = appointment;
  } else {
    updated = [appointment, ...current];
  }
  saveAppointments(updated);

  if (staffAction) {
    const staff = getActiveStaff();
    addAuditLog({
      id: "log-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      staffName: staff.name,
      staffRole: staff.role,
      action: staffAction.action,
      details: staffAction.details,
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      fileNumber: appointment.patientFileNumber
    });
  }
}

export function deleteAppointment(id: string): void {
  const current = getAppointments();
  const apt = current.find((a) => a.id === id);
  const filtered = current.filter((a) => a.id !== id);
  saveAppointments(filtered);

  if (apt) {
    const staff = getActiveStaff();
    addAuditLog({
      id: "log-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      staffName: staff.name,
      staffRole: staff.role,
      action: "CANCELLED_APPOINTMENT",
      details: `Cancelled appointment for ${apt.patientName} (${apt.clinic} on ${apt.date} at ${apt.timeSlot})`,
      patientId: apt.patientId,
      patientName: apt.patientName,
      fileNumber: apt.patientFileNumber
    });
  }
}

export function checkInAppointment(
  appointmentId: string, 
  routeToDepartment?: "doctor" | "triage"
): void {
  const current = getAppointments();
  const index = current.findIndex((a) => a.id === appointmentId);
  if (index === -1) return;

  const apt = current[index];
  const now = new Date().toISOString();
  const updatedApt: Appointment = {
    ...apt,
    status: "checked_in",
    checkedInAt: now
  };

  const updatedList = [...current];
  updatedList[index] = updatedApt;
  saveAppointments(updatedList);

  const staff = getActiveStaff();
  addAuditLog({
    id: "log-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    timestamp: now,
    staffName: staff.name,
    staffRole: staff.role,
    action: "CHECKED_IN_APPOINTMENT",
    details: `Front desk checked in ${apt.patientName} for ${apt.clinic} (${apt.doctorAssigned})`,
    patientId: apt.patientId,
    patientName: apt.patientName,
    fileNumber: apt.patientFileNumber
  });

  // Optionally route patient to the target department tray
  if (routeToDepartment && apt.patientId) {
    const patient = getPatientById(apt.patientId);
    if (patient) {
      const updatedPatient: Patient = {
        ...patient,
        currentDepartment: routeToDepartment,
        patientStatus: "waiting",
        lastVisitedAt: now
      };
      upsertPatient(updatedPatient, {
        action: "ROUTED_PATIENT",
        details: `Routed checked-in patient folder to ${routeToDepartment.toUpperCase()} for scheduled appointment`
      });
    }
  }
}

export function togglePhysicalFileRetrieved(appointmentId: string): void {
  const current = getAppointments();
  const index = current.findIndex((a) => a.id === appointmentId);
  if (index === -1) return;

  const apt = current[index];
  const nextStatus = !apt.physicalFileRetrieved;
  const updatedApt: Appointment = {
    ...apt,
    physicalFileRetrieved: nextStatus
  };

  const updatedList = [...current];
  updatedList[index] = updatedApt;
  saveAppointments(updatedList);

  const staff = getActiveStaff();
  addAuditLog({
    id: "log-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    staffName: staff.name,
    staffRole: staff.role,
    action: nextStatus ? "CHECKED_OUT_PHYSICAL" : "RETURNED_PHYSICAL",
    details: nextStatus 
      ? `HIM records pulled physical manila folder from shelf (${apt.physicalShelfLocation || 'Archive'}) for scheduled clinic`
      : `Physical manila folder returned to shelf`,
    patientId: apt.patientId,
    patientName: apt.patientName,
    fileNumber: apt.patientFileNumber
  });
}

export function getAppointmentsByPatientId(patientId: string): Appointment[] {
  return getAppointments().filter((a) => a.patientId === patientId);
}

export function getAppointmentsForDate(dateStr: string): Appointment[] {
  return getAppointments().filter((a) => a.date === dateStr);
}

export function getTodayAppointments(): Appointment[] {
  // Use today's ISO date (or 2026-09-15 as primary reference)
  const todayStr = new Date().toISOString().split("T")[0];
  const list = getAppointments();
  const todayList = list.filter((a) => a.date === todayStr);
  if (todayList.length > 0) return todayList;
  // Fallback to "2026-09-15" if current date differs
  return list.filter((a) => a.date === "2026-09-15");
}

// -------------------------------------------------------------
// Billing, Invoicing & Receipts Storage
// -------------------------------------------------------------

export function getInvoices(): BillingInvoice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
      return INITIAL_INVOICES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load invoices", e);
    return INITIAL_INVOICES;
  }
}

export function saveInvoices(invoices: BillingInvoice[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    notifyListeners();
  } catch (e) {
    console.error("Failed to save invoices", e);
  }
}

export function subscribeInvoices(fn: (invoices: BillingInvoice[]) => void): () => void {
  const listener = () => {
    fn(getInvoices());
  };
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getInvoicesByPatientId(patientId: string): BillingInvoice[] {
  return getInvoices().filter((inv) => inv.patientId === patientId);
}

export function getInvoiceById(id: string): BillingInvoice | undefined {
  return getInvoices().find((inv) => inv.id === id);
}

export function generateInvoiceNumber(): string {
  const count = getInvoices().length + 1;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `MF-INV-${new Date().getFullYear()}-${count.toString().padStart(4, "0")}`;
}

export function generateReceiptNumber(): string {
  const count = getInvoices().filter((i) => i.receiptNumber).length + 1;
  return `RCP-${new Date().getFullYear()}-${count.toString().padStart(4, "0")}`;
}

export function upsertInvoice(invoice: BillingInvoice, auditDetails?: string): void {
  const current = getInvoices();
  const index = current.findIndex((i) => i.id === invoice.id);
  let updatedList: BillingInvoice[];

  if (index >= 0) {
    updatedList = [...current];
    updatedList[index] = invoice;
  } else {
    updatedList = [invoice, ...current];
  }

  saveInvoices(updatedList);

  const staff = getActiveStaff();
  addAuditLog({
    id: "log-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    staffName: staff.name,
    staffRole: staff.role,
    action: index >= 0 ? "CREATED_INVOICE" : "CREATED_INVOICE",
    details: auditDetails || `Generated hospital invoice #${invoice.invoiceNumber} for ₦${invoice.totalAmountNaira.toLocaleString()} (${invoice.status.toUpperCase()})`,
    patientId: invoice.patientId,
    patientName: invoice.patientName,
    fileNumber: invoice.patientFileNumber
  });
}

export function recordPayment(
  invoiceId: string,
  payment: {
    amountPaid: number;
    paymentMethod: PaymentMethod;
    transactionReference?: string;
    cashierName?: string;
    notes?: string;
  }
): BillingInvoice | null {
  const current = getInvoices();
  const index = current.findIndex((i) => i.id === invoiceId);
  if (index === -1) return null;

  const inv = current[index];
  const newTotalPaid = inv.amountPaidNaira + payment.amountPaid;
  const newBalance = Math.max(0, inv.totalAmountNaira - newTotalPaid);
  const isFullyPaid = newBalance <= 0;
  const receiptNum = inv.receiptNumber || generateReceiptNumber();

  const updatedInv: BillingInvoice = {
    ...inv,
    amountPaidNaira: newTotalPaid,
    balanceDueNaira: newBalance,
    status: isFullyPaid ? "paid" : "partially_paid",
    receiptNumber: receiptNum,
    paymentMethod: payment.paymentMethod,
    transactionReference: payment.transactionReference || inv.transactionReference,
    cashierName: payment.cashierName || getActiveStaff().name,
    paidAt: new Date().toISOString(),
    notes: payment.notes ? `${inv.notes || ""} | ${payment.notes}`.trim() : inv.notes
  };

  const updatedList = [...current];
  updatedList[index] = updatedInv;
  saveInvoices(updatedList);

  const staff = getActiveStaff();
  addAuditLog({
    id: "log-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    staffName: staff.name,
    staffRole: staff.role,
    action: "COLLECTED_PAYMENT",
    details: `Collected ₦${payment.amountPaid.toLocaleString()} payment via ${payment.paymentMethod} for invoice #${inv.invoiceNumber}. Receipt #${receiptNum} issued. Balance: ₦${newBalance.toLocaleString()}`,
    patientId: inv.patientId,
    patientName: inv.patientName,
    fileNumber: inv.patientFileNumber
  });

  return updatedInv;
}

export function applyWaiver(
  invoiceId: string,
  waiver: {
    waiverAmount: number;
    reason: string;
    approvedBy: string;
    cashierName?: string;
  }
): BillingInvoice | null {
  const current = getInvoices();
  const index = current.findIndex((i) => i.id === invoiceId);
  if (index === -1) return null;

  const inv = current[index];
  const effectiveWaiver = Math.min(inv.subtotalNaira, waiver.waiverAmount);
  const newPayableTotal = Math.max(0, inv.subtotalNaira - effectiveWaiver);
  const newBalance = Math.max(0, newPayableTotal - inv.amountPaidNaira);
  const isFullWaiver = effectiveWaiver >= inv.subtotalNaira;
  const receiptNum = inv.receiptNumber || `WVR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const updatedInv: BillingInvoice = {
    ...inv,
    discountOrWaiverNaira: effectiveWaiver,
    totalAmountNaira: newPayableTotal,
    balanceDueNaira: newBalance,
    waiverReason: waiver.reason,
    waiverApprovedBy: waiver.approvedBy,
    status: isFullWaiver ? "waiver" : newBalance === 0 ? "paid" : "partially_paid",
    receiptNumber: receiptNum,
    paymentMethod: "Hospital Indigent Waiver",
    cashierName: waiver.cashierName || getActiveStaff().name,
    paidAt: new Date().toISOString(),
    notes: `Waiver applied: ${waiver.reason} (Approved by: ${waiver.approvedBy})`
  };

  const updatedList = [...current];
  updatedList[index] = updatedInv;
  saveInvoices(updatedList);

  const staff = getActiveStaff();
  addAuditLog({
    id: "log-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    staffName: staff.name,
    staffRole: staff.role,
    action: "APPLIED_WAIVER",
    details: `Approved hospital fee waiver of ₦${effectiveWaiver.toLocaleString()} on invoice #${inv.invoiceNumber}. Reason: "${waiver.reason}". Authorized by: ${waiver.approvedBy}`,
    patientId: inv.patientId,
    patientName: inv.patientName,
    fileNumber: inv.patientFileNumber
  });

  return updatedInv;
}

export function deleteInvoice(invoiceId: string): void {
  const current = getInvoices();
  const target = current.find((i) => i.id === invoiceId);
  if (!target) return;

  const updatedList = current.filter((i) => i.id !== invoiceId);
  saveInvoices(updatedList);

  const staff = getActiveStaff();
  addAuditLog({
    id: "log-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    staffName: staff.name,
    staffRole: staff.role,
    action: "CANCELLED_INVOICE",
    details: `Cancelled hospital invoice #${target.invoiceNumber} for patient ${target.patientName}`,
    patientId: target.patientId,
    patientName: target.patientName,
    fileNumber: target.patientFileNumber
  });
}



