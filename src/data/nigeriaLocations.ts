import { Patient, AuditLogEntry } from "../types";

export const NIGERIAN_STATES_WITH_LGAS: Record<string, string[]> = {
  "Lagos": ["Ikeja", "Alimosho", "Surulere", "Eti-Osa", "Kosofe", "Oshodi-Isolo", "Ikorodu", "Agege", "Mushin", "Lagos Island"],
  "FCT - Abuja": ["Abuja Municipal (AMAC)", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Abaji"],
  "Kano": ["Kano Municipal", "Dala", "Fagge", "Nassarawa", "Gwale", "Tarauni", "Kumbotso", "Ungogo"],
  "Oyo": ["Ibadan North", "Ibadan South-West", "Ibadan North-East", "Ogbomoso North", "Oyo East", "Ibarapa Central"],
  "Rivers": ["Port Harcourt", "Obio-Akpor", "Eleme", "Ikwerre", "Oyigbo", "Bonny", "Okrika"],
  "Enugu": ["Enugu North", "Enugu South", "Enugu East", "Nsukka", "Udi", "Oji River"],
  "Kaduna": ["Kaduna North", "Kaduna South", "Chikun", "Zaria", "Sabon Gari", "Jema'a"],
  "Anambra": ["Awka South", "Awka North", "Onitsha North", "Onitsha South", "Nnewi North", "Idemili North"],
  "Edo": ["Oredo (Benin City)", "Ikpoba Okha", "Egor", "Esan Central", "Ovia North-East"],
  "Delta": ["Warri South", "Oshimili South (Asaba)", "Uvwie", "Sapele", "Ughelli North"],
  "Ogun": ["Abeokuta South", "Abeokuta North", "Ado-Odo/Ota", "Ijebu Ode", "Sagamu"],
  "Akwa Ibom": ["Uyo", "Ikot Ekpene", "Eket", "Oron", "Abak"],
  "Cross River": ["Calabar Municipal", "Calabar South", "Ikom", "Ogoja", "Akamkpa"],
  "Benue": ["Makurdi", "Gboko", "Otukpo", "Katsina-Ala"],
  "Plateau": ["Jos North", "Jos South", "Jos East", "Barkin Ladi", "Pankshin"],
  "Kwara": ["Ilorin South", "Ilorin West", "Ilorin East", "Offa"],
  "Imo": ["Owerri Municipal", "Owerri North", "Owerri West", "Orlu", "Okigwe"],
  "Abia": ["Aba North", "Aba South", "Umuahia North", "Umuahia South", "Osisioma"],
  "Borno": ["Maiduguri", "Jere", "Biu", "Bama"],
  "Sokoto": ["Sokoto North", "Sokoto South", "Wamakko", "Dange Shuni"],
  "Ondo": ["Akure South", "Akure North", "Ondo West", "Owo"],
  "Osun": ["Osogbo", "Ilesa East", "Ife Central", "Ede South"]
};

export const COMMON_DIAGNOSES = [
  "Plasmodium falciparum Malaria (Uncomplicated)",
  "Severe Malaria with Hyperpyrexia",
  "Enteric Fever (Typhoid Fever)",
  "Essential Systemic Hypertension (Stage II)",
  "Type 2 Diabetes Mellitus with Peripheral Neuropathy",
  "Sickle Cell Anemia (Hb SS) Vaso-Occlusive Bone Pain Crisis",
  "Peptic Ulcer Disease (H. pylori associated)",
  "Acute Bronchopneumonia",
  "Urinary Tract Infection (UTI / E. coli)",
  "Gastroenteritis with Mild Dehydration",
  "Pelvic Inflammatory Disease (PID)",
  "Pregnancy Induced Hypertension (PIH / Pre-eclampsia)"
];

export const COMMON_LAB_TESTS = [
  { name: "Malaria Parasite (MP) by Giemsa Microscopy", range: "No parasites seen / Nil" },
  { name: "Widal Agglutination Reaction (TO & TH)", range: "Titre < 1:80 (Normal)" },
  { name: "Packed Cell Volume (PCV / Hematocrit)", range: "36% - 48% (Adults)" },
  { name: "Full Blood Count & Platelet Index", range: "WBC: 4,000 - 11,000 /mm³" },
  { name: "Hemoglobin Electrophoresis (Genotype)", range: "AA (Normal)" },
  { name: "Fasting Blood Sugar (FBS)", range: "70 - 100 mg/dL" },
  { name: "Random Blood Sugar (RBS)", range: "79 - 140 mg/dL" },
  { name: "Urinalysis (10-Parameter Dipstick)", range: "Protein: Neg, Sugar: Neg, Nitrite: Neg" },
  { name: "Retroviral Screening (RVS 1&2)", range: "Non-Reactive" },
  { name: "Hepatitis B Surface Antigen (HBsAg)", range: "Negative" }
];

export const COMMON_MEDICATIONS = [
  { name: "Artemether-Lumefantrine 80/480mg (Coartem / Lonart)", dose: "1 tablet twice daily for 3 days after food", pidgin: "Take 1 sweet morning, 1 night after food for 3 days" },
  { name: "Paracetamol 500mg tablets", dose: "2 tablets 8-hourly when having pain/fever", pidgin: "Take 2 tablets morning, 2 afternoon, 2 night if body dey hot or pain" },
  { name: "Ciprofloxacin 500mg tablets", dose: "1 tablet 12-hourly for 7 days with plenty of water", pidgin: "Drink 1 tablet every 12 hours for 7 days, make you drink plenty water" },
  { name: "Amlodipine 5mg (BP Medication)", dose: "1 tablet daily in the morning", pidgin: "Drink 1 tablet every morning make your BP no go up" },
  { name: "Metformin 500mg (Diabetes Care)", dose: "1 tablet twice daily with meals", pidgin: "Drink 1 tablet with your food morning and night" },
  { name: "Omeprazole 20mg capsules", dose: "1 capsule daily 30 minutes before breakfast", pidgin: "Take 1 capsule 30 minutes before you chop in the morning" },
  { name: "Folic Acid 5mg + Vitamin B-Complex", dose: "1 tablet daily for blood building", pidgin: "Drink 1 tablet everyday make your blood strong" },
  { name: "Oral Rehydration Salts (ORS)", dose: "Dissolve 1 sachet in 1 liter of clean water, sip frequently", pidgin: "Mix 1 sachet with 1 big water bottle, dey drink am small small" }
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: "pat-1001",
    fileNumber: "UCH/2021/04812",
    barcodeNumber: "84920194812",
    legacyPaperFileNumber: "UCH-REC-8924",
    nin: "48291059281",
    nhisNumber: "NHIS/LA/2019/8821",
    hmoProvider: "Hygeia HMO",
    firstName: "Babatunde",
    lastName: "Adeleke",
    middleName: "Olusegun",
    gender: "Male",
    dateOfBirth: "1968-04-12",
    ageYears: 58,
    phone: "08033291048",
    residentialAddress: "14 Ogunlana Drive, Surulere, Lagos State",
    stateOfOrigin: "Oyo",
    lga: "Ibadan North",
    stateOfResidence: "Lagos",
    occupation: "Retired Civil Servant",
    religion: "Christianity",
    preferredLanguage: "yo",
    bloodGroup: "O+",
    genotype: "AA",
    allergies: ["Penicillin", "Sulfa Drugs"],
    chronicConditions: ["Hypertension", "Early Stage Osteoarthritis"],
    nextOfKin: {
      name: "Mrs. Folashade Adeleke",
      relationship: "Spouse",
      phone: "08023145920",
      address: "14 Ogunlana Drive, Surulere, Lagos"
    },
    physicalArchive: {
      roomNumber: "Archive Wing A (Old Records)",
      cabinet: "Cabinet 4",
      shelfOrDrawer: "Row 3, Drawer 2",
      boxNumber: "Box A-19",
      folderColor: "Brown Manila (Heavy)",
      physicalStatus: "in_shelf"
    },
    hasPhysicalPaperFolder: true,
    digitizedFromPaperDate: "2024-01-15",
    currentDepartment: "doctor",
    patientStatus: "in_consultation",
    priority: "normal",
    queueNumber: "GOPD-04",
    vitalsHistory: [
      {
        id: "vit-01",
        recordedAt: "2026-09-15T09:15:00Z",
        recordedBy: "Nurse Chidinma Eze",
        bloodPressureSystolic: 148,
        bloodPressureDiastolic: 94,
        temperature: 36.8,
        pulse: 78,
        weight: 84.5,
        height: 176,
        bloodSugar: 104,
        spo2: 98,
        nurseNotes: "Patient reports slight morning headache and stiffness in right knee. BP slightly elevated above target."
      }
    ],
    consultations: [
      {
        id: "con-01",
        date: "2026-09-15T09:40:00Z",
        doctorName: "Dr. Oladipo Johnson (Consultant Physician)",
        department: "General Outpatient (GOPD)",
        chiefComplaint: "Occasional throbbing occipital headache x 1 week, knee ache.",
        historyOfPresentingIllness: "Known hypertensive for 8 years on Amlodipine 5mg. Missed medications for 4 days last week during inter-state travel to Ibadan. Denies chest pain, shortness of breath, or blurred vision.",
        examinationFindings: "Conscious, not pale, anicteric, no pedal edema. Chest: vesicular breath sounds. CVS: S1 S2 present, no murmurs. BP: 148/94 mmHg. Right knee: mild crepitus, no effusion.",
        provisionalDiagnosis: "Uncontrolled Essential Hypertension secondary to poor drug compliance; Mild Osteoarthritis (Right Knee)",
        plan: "1. Upgrade Amlodipine to 10mg daily.\n2. Add Lisinopril 5mg daily.\n3. Request Serum Electrolytes, Urea, Creatinine and Lipid Profile.\n4. Paracetamol 1g as needed for knee pain. Advise low salt diet and regular clinic follow-up."
      }
    ],
    labOrders: [
      {
        id: "lab-01",
        testName: "Serum Electrolytes, Urea & Creatinine (E/U/Cr)",
        requestedBy: "Dr. Oladipo Johnson",
        requestedAt: "2026-09-15T09:45:00Z",
        status: "sample_collected",
        labTechnician: "MLS Ibrahim Danjuma"
      }
    ],
    prescriptions: [
      {
        id: "rx-01",
        drugName: "Amlodipine 10mg tablets",
        dosage: "1 tab daily in the morning",
        pidginInstructions: "Drink 1 tablet every morning after breakfast make your BP calm down",
        duration: "30 days",
        prescribedBy: "Dr. Oladipo Johnson",
        prescribedAt: "2026-09-15T09:46:00Z",
        dispensed: false
      },
      {
        id: "rx-02",
        drugName: "Lisinopril 5mg tablets",
        dosage: "1 tab daily in the morning",
        pidginInstructions: "Drink 1 tablet morning time together with the other one",
        duration: "30 days",
        prescribedBy: "Dr. Oladipo Johnson",
        prescribedAt: "2026-09-15T09:46:00Z",
        dispensed: false
      }
    ],
    createdAt: "2021-03-10T08:00:00Z",
    updatedAt: "2026-09-15T09:46:00Z",
    lastVisitedAt: "2026-09-15T09:15:00Z"
  },
  {
    id: "pat-1002",
    fileNumber: "FMC/ABJ/2023/1109",
    barcodeNumber: "91028301923",
    legacyPaperFileNumber: "FMC-PED-402",
    nin: "71029481920",
    firstName: "Amina",
    lastName: "Suleiman",
    gender: "Female",
    dateOfBirth: "2018-11-20",
    ageYears: 7,
    phone: "08149201948",
    residentialAddress: "Plot 84 Garki 2, Abuja Municipal Area Council (AMAC), FCT",
    stateOfOrigin: "Kano",
    lga: "Nassarawa",
    stateOfResidence: "FCT - Abuja",
    occupation: "Primary School Pupil",
    religion: "Islam",
    preferredLanguage: "ha",
    bloodGroup: "B+",
    genotype: "SS", // Sickle Cell Disease
    allergies: ["None known"],
    chronicConditions: ["Sickle Cell Anemia (Hb SS)"],
    nextOfKin: {
      name: "Alhaji Suleiman Garba",
      relationship: "Parent",
      phone: "08037192840",
      address: "Plot 84 Garki 2, AMAC, Abuja"
    },
    physicalArchive: {
      roomNumber: "Pediatric Archive Room 2",
      cabinet: "Yellow Steel Cabinet B",
      shelfOrDrawer: "Row 1 (Top Priority)",
      folderColor: "Yellow Pediatric Manila",
      physicalStatus: "checked_out",
      checkedOutTo: "Dr. Hadiza Bello (Children Emergency Ward)",
      checkedOutAt: "2026-09-15T08:30:00Z"
    },
    hasPhysicalPaperFolder: true,
    digitizedFromPaperDate: "2023-05-12",
    currentDepartment: "triage",
    patientStatus: "waiting",
    priority: "urgent",
    queueNumber: "CH-EMG-01",
    vitalsHistory: [
      {
        id: "vit-02",
        recordedAt: "2026-09-15T08:40:00Z",
        recordedBy: "Nurse Hauwa Mohammed",
        bloodPressureSystolic: 105,
        bloodPressureDiastolic: 65,
        temperature: 38.6, // High fever
        pulse: 118, // Tachycardia
        weight: 21.0,
        height: 118,
        spo2: 94,
        nurseNotes: "Child in severe distress, crying with right thigh and lower back bone pain. Mother says fever started yesterday night."
      }
    ],
    consultations: [
      {
        id: "con-02",
        date: "2026-09-15T08:55:00Z",
        doctorName: "Dr. Hadiza Bello (Pediatric Registrar)",
        department: "Children Emergency Ward (CHER)",
        chiefComplaint: "High grade fever, severe limb bone pain x 2 days.",
        historyOfPresentingIllness: "7-year-old known Hb SS warrior presenting with sudden severe bone pain in both legs and back precipitated by recent cold rainy weather. Associated with fever, chills, poor appetite.",
        examinationFindings: "Warm to touch (38.6°C), pale (Conjunctival pallor ++), mildly icteric (sclera tinted yellow). Tender over bilateral tibial shafts and lower lumbar spine. Chest clear. Abdomen: mild splenomegaly tip not felt, soft, non-tender.",
        provisionalDiagnosis: "Vaso-occlusive Bone Pain Crisis precipitated by suspected Acute Malaria infection in a known Sickle Cell Anemia patient",
        plan: "1. Immediate IV hydration with 5% Dextrose Saline.\n2. Urgent PCV, Malaria Parasite (MP), Blood Culture.\n3. Analgesia: IV Paracetamol + IV Pentazocine under monitoring.\n4. Artemether injection or oral ACT once tolerating oral intake."
      }
    ],
    labOrders: [
      {
        id: "lab-02",
        testName: "Malaria Parasite (MP) by Giemsa Microscopy",
        requestedBy: "Dr. Hadiza Bello",
        requestedAt: "2026-09-15T09:00:00Z",
        status: "processing",
        labTechnician: "MLS Yakubu Musa"
      },
      {
        id: "lab-03",
        testName: "Packed Cell Volume (PCV / Hematocrit)",
        requestedBy: "Dr. Hadiza Bello",
        requestedAt: "2026-09-15T09:00:00Z",
        status: "processing",
        labTechnician: "MLS Yakubu Musa"
      }
    ],
    prescriptions: [
      {
        id: "rx-03",
        drugName: "IV Paracetamol 300mg Infusion",
        dosage: "Stat IV infusion over 15 mins",
        pidginInstructions: "Nurse go put this medicine for drip make the fever and body pain go down fast fast",
        duration: "Stat",
        prescribedBy: "Dr. Hadiza Bello",
        prescribedAt: "2026-09-15T09:05:00Z",
        dispensed: true,
        dispensedAt: "2026-09-15T09:12:00Z",
        dispensedBy: "Pharm. Fatima"
      }
    ],
    createdAt: "2023-05-12T10:00:00Z",
    updatedAt: "2026-09-15T09:12:00Z",
    lastVisitedAt: "2026-09-15T08:30:00Z"
  },
  {
    id: "pat-1003",
    fileNumber: "GH/IKJ/2024/0089",
    barcodeNumber: "84910284918",
    nin: "90182471928",
    nhisNumber: "NHIA/LAG/0912/81",
    hmoProvider: "Reliance Health HMO",
    firstName: "Chioma",
    lastName: "Okonkwo",
    middleName: "Blessing",
    gender: "Female",
    dateOfBirth: "1994-08-19",
    ageYears: 32,
    phone: "08067182934",
    residentialAddress: "22 Oba Akran Avenue, Ikeja, Lagos",
    stateOfOrigin: "Enugu",
    lga: "Nsukka",
    stateOfResidence: "Lagos",
    occupation: "Accountant",
    religion: "Christianity",
    preferredLanguage: "ig",
    bloodGroup: "A+",
    genotype: "AS",
    allergies: ["Metronidazole (Flagyl)"],
    chronicConditions: [],
    nextOfKin: {
      name: "Engr. Chukwudi Okonkwo",
      relationship: "Spouse",
      phone: "08039201948",
      address: "22 Oba Akran Avenue, Ikeja, Lagos"
    },
    physicalArchive: {
      roomNumber: "Maternity & Antenatal Registry",
      cabinet: "Cabinet ANC-1",
      shelfOrDrawer: "Shelf 2, Section C",
      folderColor: "Pink Antenatal Manila",
      physicalStatus: "in_shelf"
    },
    hasPhysicalPaperFolder: true,
    digitizedFromPaperDate: "2024-02-10",
    currentDepartment: "pharmacy",
    patientStatus: "awaiting_pharmacy",
    priority: "normal",
    queueNumber: "ANC-12",
    vitalsHistory: [
      {
        id: "vit-03",
        recordedAt: "2026-09-15T10:00:00Z",
        recordedBy: "Nurse Titilayo Adele",
        bloodPressureSystolic: 110,
        bloodPressureDiastolic: 72,
        temperature: 36.6,
        pulse: 74,
        weight: 68.0,
        height: 165,
        bloodSugar: 88,
        spo2: 99,
        nurseNotes: "Antenatal clinic routine visit (28 weeks GA). Fundal height corresponds to gestational age. Fetal heart rate regular at 142 bpm."
      }
    ],
    consultations: [
      {
        id: "con-03",
        date: "2026-09-15T10:20:00Z",
        doctorName: "Dr. Kemi Balogun (Obstetrician)",
        department: "Antenatal Clinic (ANC)",
        chiefComplaint: "Routine 3rd trimester antenatal booking review.",
        historyOfPresentingIllness: "Gravida 2 Para 1 (+0 alive). Uneventful pregnancy. Good fetal kicks felt daily. No bleeding per vaginam, no headache or epigastric pain.",
        examinationFindings: "Healthy looking gravid woman. BP 110/72 mmHg. Symphysiofundal height: 28cm. Longitudinal lie, cephalic presentation. FHR: 142 bpm, strong.",
        provisionalDiagnosis: "Normal intrauterine pregnancy at 28 weeks gestation",
        plan: "1. Routine ANC prophylaxis: Ferrous Sulphate + Folic Acid + Calcium supplements.\n2. Prescribe Sulphadoxine-Pyrimethamine (Fansidar) for Intermittent Preventive Treatment in pregnancy (IPTp 2nd dose).\n3. Rebook ANC in 2 weeks."
      }
    ],
    labOrders: [
      {
        id: "lab-04",
        testName: "Packed Cell Volume (PCV / Hematocrit)",
        requestedBy: "Dr. Kemi Balogun",
        requestedAt: "2026-09-15T10:25:00Z",
        status: "completed",
        results: "34%",
        normalRange: "33% - 40% (Acceptable in Pregnancy)",
        labTechnician: "MLS Chiamaka",
        completedAt: "2026-09-15T10:45:00Z"
      }
    ],
    prescriptions: [
      {
        id: "rx-04",
        drugName: "Sulphadoxine-Pyrimethamine 500/25mg (Fansidar IPTp)",
        dosage: "3 tablets stat under observation with food",
        pidginInstructions: "Chop food well first, then drink the 3 tablets once make malaria no catch baby",
        duration: "Stat dose",
        prescribedBy: "Dr. Kemi Balogun",
        prescribedAt: "2026-09-15T10:30:00Z",
        dispensed: false
      },
      {
        id: "rx-05",
        drugName: "Pregnacare Plus (Omega-3 & Prenatal Micronutrients)",
        dosage: "1 capsule & 1 tablet daily with main meal",
        pidginInstructions: "Drink 1 capsule and 1 tablet everyday after you chop heavy food for baby healthy growth",
        duration: "30 days",
        prescribedBy: "Dr. Kemi Balogun",
        prescribedAt: "2026-09-15T10:30:00Z",
        dispensed: false
      }
    ],
    createdAt: "2024-02-10T09:00:00Z",
    updatedAt: "2026-09-15T10:45:00Z",
    lastVisitedAt: "2026-09-15T10:00:00Z"
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "log-1",
    timestamp: "2026-09-15T08:30:00Z",
    staffName: "HIM Officer Aliyu",
    staffRole: "Medical Records Officer",
    action: "CHECKED_OUT_PHYSICAL",
    details: "Checked out physical Manila Folder UCH/2021/04812 from Cabinet 4, Row 3 to GOPD Consulting Room 4.",
    patientId: "pat-1001",
    patientName: "Babatunde Adeleke",
    fileNumber: "UCH/2021/04812"
  },
  {
    id: "log-2",
    timestamp: "2026-09-15T08:40:00Z",
    staffName: "Nurse Hauwa Mohammed",
    staffRole: "Emergency Triage Nurse",
    action: "RECORDED_VITALS",
    details: "Recorded triage vitals: Temp 38.6°C, Pulse 118 bpm, SPO2 94%. Flagged priority as URGENT (Hb SS in crisis).",
    patientId: "pat-1002",
    patientName: "Amina Suleiman",
    fileNumber: "FMC/ABJ/2023/1109"
  },
  {
    id: "log-3",
    timestamp: "2026-09-15T09:40:00Z",
    staffName: "Dr. Oladipo Johnson",
    staffRole: "Consultant Physician",
    action: "ADDED_NOTE",
    details: "Added clinical notes and ordered E/U/Cr & Lipid profile. Adjusted hypertensive regimen.",
    patientId: "pat-1001",
    patientName: "Babatunde Adeleke",
    fileNumber: "UCH/2021/04812"
  },
  {
    id: "log-4",
    timestamp: "2026-09-15T09:46:00Z",
    staffName: "Dr. Oladipo Johnson",
    staffRole: "Consultant Physician",
    action: "ROUTED_PATIENT",
    details: "Routed digital file from GOPD Doctor Tray to Pharmacy for medication dispensing.",
    patientId: "pat-1001",
    patientName: "Babatunde Adeleke",
    fileNumber: "UCH/2021/04812"
  }
];

export const NIGERIAN_STATES: { name: string; lgas: string[] }[] = Object.entries(NIGERIAN_STATES_WITH_LGAS).map(
  ([name, lgas]) => ({ name, lgas })
);

export const NIGERIA_HMOS: string[] = [
  "Hygeia HMO",
  "Reliance HMO",
  "AXA Mansard Health",
  "Leadway Health",
  "Metrohealth HMO",
  "Avon HMO",
  "Total Health Trust (THT)",
  "Redcare HMO",
  "Clearline International",
  "Lagos State Health Scheme (LASHMA / Ilera Eko)",
  "Kano State Contributory Healthcare Agency (KSCHMA)",
  "Oyo State Health Insurance Agency (OYSHIA)",
  "National Health Insurance Authority (NHIA Formal Sector)",
  "Police Health Maintenance Organization (Police HMO)",
  "Defence Health Maintenance Limited (DHML / Military)"
];

export const COMMON_ALLERGIES: string[] = [
  "Penicillin / Amoxicillin",
  "Sulfa Drugs (Septrin / Cotrimoxazole)",
  "NSAIDs / Ibuprofen / Diclofenac",
  "Aspirin",
  "Ciprofloxacin / Quinolones",
  "Paracetamol",
  "Cephalosporins",
  "Latex",
  "Iodine contrast",
  "Peanuts / Groundnuts"
];

export const COMMON_CHRONIC_CONDITIONS: string[] = [
  "Sickle Cell Disease (Hb SS)",
  "Systemic Hypertension",
  "Type 2 Diabetes Mellitus",
  "Bronchial Asthma",
  "Peptic Ulcer Disease",
  "Chronic Kidney Disease",
  "Hepatitis B Chronic Carrier",
  "Epilepsy / Seizure Disorder",
  "Glaucoma",
  "Osteoarthritis"
];

