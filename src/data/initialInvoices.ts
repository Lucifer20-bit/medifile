import { BillingInvoice, BillItem } from "../types";

export interface TariffItem {
  id: string;
  category: "consultation" | "laboratory" | "medication" | "procedure" | "registration" | "bed_admission";
  name: string;
  code: string;
  department: string;
  defaultPriceNaira: number;
  nhiaCovered: boolean;
}

export const STANDARD_HOSPITAL_TARIFFS: TariffItem[] = [
  // Consultations
  { id: "tar-c1", category: "consultation", name: "GOPD General Outpatient Consultation", code: "CON-GOPD", department: "General Outpatient (GOPD)", defaultPriceNaira: 2500, nhiaCovered: true },
  { id: "tar-c2", category: "consultation", name: "Specialist / Consultant Physician Review", code: "CON-SPEC", department: "Specialist Clinics", defaultPriceNaira: 5000, nhiaCovered: true },
  { id: "tar-c3", category: "consultation", name: "Pediatric Emergency / CHER Consultation", code: "CON-PED", department: "Pediatric Clinic", defaultPriceNaira: 3000, nhiaCovered: true },
  { id: "tar-c4", category: "consultation", name: "Antenatal Care (ANC) Clinic Review", code: "CON-ANC", department: "Antenatal & Maternity (ANC)", defaultPriceNaira: 3000, nhiaCovered: true },
  { id: "tar-c5", category: "consultation", name: "Emergency Casualty / Resuscitation Fee", code: "CON-EMG", department: "Accident & Emergency", defaultPriceNaira: 4500, nhiaCovered: true },

  // Laboratory Investigations
  { id: "tar-l1", category: "laboratory", name: "Malaria Parasite (MP) by Giemsa Microscopy", code: "LAB-MP", department: "Hematology Lab", defaultPriceNaira: 1500, nhiaCovered: true },
  { id: "tar-l2", category: "laboratory", name: "Packed Cell Volume (PCV / Hematocrit)", code: "LAB-PCV", department: "Hematology Lab", defaultPriceNaira: 1200, nhiaCovered: true },
  { id: "tar-l3", category: "laboratory", name: "Serum Electrolytes, Urea & Creatinine (E/U/Cr)", code: "LAB-EUCR", department: "Chemical Pathology", defaultPriceNaira: 4500, nhiaCovered: true },
  { id: "tar-l4", category: "laboratory", name: "Widal Agglutination Reaction (Typhoid Test)", code: "LAB-WIDAL", department: "Microbiology Lab", defaultPriceNaira: 2200, nhiaCovered: false },
  { id: "tar-l5", category: "laboratory", name: "Fasting Blood Sugar (FBS / Glucose)", code: "LAB-FBS", department: "Chemical Pathology", defaultPriceNaira: 1000, nhiaCovered: true },
  { id: "tar-l6", category: "laboratory", name: "Urinalysis (10-Parameter Dipstick)", code: "LAB-URN", department: "Chemical Pathology", defaultPriceNaira: 1200, nhiaCovered: true },
  { id: "tar-l7", category: "laboratory", name: "Full Blood Count & Platelets (FBC)", code: "LAB-FBC", department: "Hematology Lab", defaultPriceNaira: 3000, nhiaCovered: true },
  { id: "tar-l8", category: "laboratory", name: "Hemoglobin Electrophoresis (Genotype)", code: "LAB-GENO", department: "Hematology Lab", defaultPriceNaira: 3500, nhiaCovered: true },
  { id: "tar-l9", category: "laboratory", name: "Blood Group & Rhesus Factor", code: "LAB-BGRH", department: "Blood Bank", defaultPriceNaira: 1500, nhiaCovered: true },

  // Common Medications
  { id: "tar-m1", category: "medication", name: "Artemether-Lumefantrine 80/480mg (Coartem) x 6 tabs", code: "DRUG-ACT", department: "Pharmacy", defaultPriceNaira: 2800, nhiaCovered: true },
  { id: "tar-m2", category: "medication", name: "Paracetamol 500mg tablets (Blister of 10)", code: "DRUG-PCM", department: "Pharmacy", defaultPriceNaira: 500, nhiaCovered: true },
  { id: "tar-m3", category: "medication", name: "Amlodipine 10mg tablets (Pack of 30)", code: "DRUG-AMLO", department: "Pharmacy", defaultPriceNaira: 2200, nhiaCovered: true },
  { id: "tar-m4", category: "medication", name: "Lisinopril 5mg tablets (Pack of 30)", code: "DRUG-LISI", department: "Pharmacy", defaultPriceNaira: 1800, nhiaCovered: true },
  { id: "tar-m5", category: "medication", name: "IV Paracetamol 1000mg / 100ml Infusion", code: "DRUG-IVPCM", department: "Pharmacy", defaultPriceNaira: 1800, nhiaCovered: true },
  { id: "tar-m6", category: "medication", name: "IV 5% Dextrose Saline 500ml", code: "DRUG-DRIP", department: "Pharmacy", defaultPriceNaira: 1500, nhiaCovered: true },
  { id: "tar-m7", category: "medication", name: "Sulphadoxine-Pyrimethamine (Fansidar IPTp) x 3 tabs", code: "DRUG-SP", department: "Pharmacy", defaultPriceNaira: 1200, nhiaCovered: true },
  { id: "tar-m8", category: "medication", name: "Pregnacare Plus Prenatal Micronutrients (30 Days)", code: "DRUG-PREG", department: "Pharmacy", defaultPriceNaira: 6500, nhiaCovered: false },
  { id: "tar-m9", category: "medication", name: "Ciprofloxacin 500mg tablets (Pack of 10)", code: "DRUG-CIPRO", department: "Pharmacy", defaultPriceNaira: 1800, nhiaCovered: true },

  // Nursing & Hospital Procedures
  { id: "tar-p1", category: "registration", name: "New Patient Manila File & Registration Card", code: "REG-FILE", department: "Records & HIM", defaultPriceNaira: 1500, nhiaCovered: true },
  { id: "tar-p2", category: "procedure", name: "IV Cannulation & Infusion Set Insertion", code: "PROC-CAN", department: "Nursing / Triage", defaultPriceNaira: 1200, nhiaCovered: true },
  { id: "tar-p3", category: "procedure", name: "Wound Cleansing & Surgical Dressing", code: "PROC-DRS", department: "Nursing / SOPD", defaultPriceNaira: 2500, nhiaCovered: true },
  { id: "tar-p4", category: "procedure", name: "Blood Transfusion Administration Fee", code: "PROC-TRANS", department: "Nursing / Hematology", defaultPriceNaira: 4000, nhiaCovered: true },
  { id: "tar-p5", category: "bed_admission", name: "Casualty Short-Stay Bed Fee (Per 12 Hours)", code: "ADM-BED", department: "Wards", defaultPriceNaira: 3500, nhiaCovered: true }
];

export const INITIAL_INVOICES: BillingInvoice[] = [
  // 1. Paid Invoice for Babatunde Adeleke
  {
    id: "inv-2026-001",
    invoiceNumber: "MF-INV-2026-0181",
    receiptNumber: "RCP-2026-0819",
    patientId: "pat-1001",
    patientName: "Adeleke, Babatunde",
    patientFileNumber: "UCH/2021/04812",
    patientPhone: "08033291048",
    nhisNumber: "NHIS/LA/2019/8821",
    hmoProvider: "Hygeia HMO",
    items: [
      {
        id: "item-101",
        category: "consultation",
        description: "Specialist Consultant Physician Follow-up (GOPD Room 4)",
        quantity: 1,
        unitPriceNaira: 4000,
        totalPriceNaira: 4000,
        department: "General Outpatient (GOPD)",
        code: "CON-SPEC"
      },
      {
        id: "item-102",
        category: "laboratory",
        description: "Serum Electrolytes, Urea & Creatinine (E/U/Cr)",
        quantity: 1,
        unitPriceNaira: 4500,
        totalPriceNaira: 4500,
        department: "Chemical Pathology",
        code: "LAB-EUCR"
      },
      {
        id: "item-103",
        category: "medication",
        description: "Amlodipine 10mg tablets (Pack of 30 days)",
        quantity: 1,
        unitPriceNaira: 2200,
        totalPriceNaira: 2200,
        department: "Pharmacy",
        code: "DRUG-AMLO"
      },
      {
        id: "item-104",
        category: "medication",
        description: "Lisinopril 5mg tablets (Pack of 30 days)",
        quantity: 1,
        unitPriceNaira: 1800,
        totalPriceNaira: 1800,
        department: "Pharmacy",
        code: "DRUG-LISI"
      }
    ],
    subtotalNaira: 12500,
    discountOrWaiverNaira: 0,
    totalAmountNaira: 12500,
    amountPaidNaira: 12500,
    balanceDueNaira: 0,
    status: "paid",
    paymentMethod: "POS / Debit Card",
    transactionReference: "STANBIC-POS-RRN-99201948",
    cashierName: "Mr. Kunle Balogun (Cashier 1)",
    cashierShift: "Morning Shift",
    createdAt: "2026-09-15T09:50:00Z",
    paidAt: "2026-09-15T09:55:00Z",
    notes: "Cleared at Main Cash Office. Dispense stamp issued for Pharmacy collection."
  },

  // 2. Full Waiver for Amina Suleiman (Sickle Cell Pediatric Emergency)
  {
    id: "inv-2026-002",
    invoiceNumber: "MF-INV-2026-0182",
    receiptNumber: "WVR-2026-0044",
    patientId: "pat-1002",
    patientName: "Suleiman, Amina",
    patientFileNumber: "FMC/ABJ/2023/1109",
    patientPhone: "08149201948",
    items: [
      {
        id: "item-201",
        category: "consultation",
        description: "Emergency Pediatric Resuscitation & Triage (CHER)",
        quantity: 1,
        unitPriceNaira: 3500,
        totalPriceNaira: 3500,
        department: "Children Emergency Ward (CHER)",
        code: "CON-PED"
      },
      {
        id: "item-202",
        category: "laboratory",
        description: "Urgent Packed Cell Volume (PCV / Hematocrit)",
        quantity: 1,
        unitPriceNaira: 1200,
        totalPriceNaira: 1200,
        department: "Hematology Lab",
        code: "LAB-PCV"
      },
      {
        id: "item-203",
        category: "laboratory",
        description: "Malaria Parasite (MP) Giemsa Staining",
        quantity: 1,
        unitPriceNaira: 1500,
        totalPriceNaira: 1500,
        department: "Hematology Lab",
        code: "LAB-MP"
      },
      {
        id: "item-204",
        category: "medication",
        description: "IV Paracetamol 300mg Infusion Stat",
        quantity: 1,
        unitPriceNaira: 1800,
        totalPriceNaira: 1800,
        department: "Pharmacy",
        code: "DRUG-IVPCM"
      },
      {
        id: "item-205",
        category: "procedure",
        description: "Pediatric Butterfly Cannulation & Infusion Set",
        quantity: 1,
        unitPriceNaira: 1200,
        totalPriceNaira: 1200,
        department: "Nursing / Triage",
        code: "PROC-CAN"
      }
    ],
    subtotalNaira: 9200,
    discountOrWaiverNaira: 9200,
    waiverReason: "Sickle Cell Warrior Emergency Resuscitation & Indigent Health Protection Protocol",
    waiverApprovedBy: "Dr. Babatunde Adeyemi (Chief Medical Director / CMD)",
    totalAmountNaira: 0,
    amountPaidNaira: 0,
    balanceDueNaira: 0,
    status: "waiver",
    paymentMethod: "Hospital Indigent Waiver",
    transactionReference: "CMD-WAIVER-AUTH-2026/09/SS-04",
    cashierName: "Mrs. Amina Danjuma (HIM / Cash Lead)",
    cashierShift: "Morning Shift",
    createdAt: "2026-09-15T09:10:00Z",
    paidAt: "2026-09-15T09:12:00Z",
    notes: "100% Emergency medical waiver authorized by CMD under the Federal Sickle Cell Care Subsidy Directive. All medications and stat labs expedited immediately."
  },

  // 3. Pending Invoice for Chioma Okonkwo (ANC Routine Care & Labs)
  {
    id: "inv-2026-003",
    invoiceNumber: "MF-INV-2026-0183",
    patientId: "pat-1003",
    patientName: "Okonkwo, Chioma Blessing",
    patientFileNumber: "GH/IKJ/2024/0089",
    patientPhone: "08067182934",
    nhisNumber: "NHIA/LAG/0912/81",
    hmoProvider: "Reliance Health HMO",
    items: [
      {
        id: "item-301",
        category: "consultation",
        description: "Antenatal Clinic (ANC) 3rd Trimester Booking Review",
        quantity: 1,
        unitPriceNaira: 3000,
        totalPriceNaira: 3000,
        department: "Antenatal & Maternity (ANC)",
        code: "CON-ANC"
      },
      {
        id: "item-302",
        category: "laboratory",
        description: "Packed Cell Volume (PCV / Hematocrit)",
        quantity: 1,
        unitPriceNaira: 1200,
        totalPriceNaira: 1200,
        department: "Hematology Lab",
        code: "LAB-PCV"
      },
      {
        id: "item-303",
        category: "medication",
        description: "Sulphadoxine-Pyrimethamine (Fansidar IPTp) x 3 tabs",
        quantity: 1,
        unitPriceNaira: 1200,
        totalPriceNaira: 1200,
        department: "Pharmacy",
        code: "DRUG-SP"
      },
      {
        id: "item-304",
        category: "medication",
        description: "Pregnacare Plus Prenatal Micronutrients (30 Days Pack)",
        quantity: 1,
        unitPriceNaira: 6500,
        totalPriceNaira: 6500,
        department: "Pharmacy",
        code: "DRUG-PREG"
      }
    ],
    subtotalNaira: 11900,
    discountOrWaiverNaira: 0,
    totalAmountNaira: 11900,
    amountPaidNaira: 0,
    balanceDueNaira: 11900,
    status: "pending",
    cashierName: "Mr. Kunle Balogun (Cashier 1)",
    cashierShift: "Morning Shift",
    createdAt: "2026-09-15T10:35:00Z",
    notes: "Awaiting patient payment clearance at Cash Office before Pharmacy dispenses Pregnacare."
  }
];
