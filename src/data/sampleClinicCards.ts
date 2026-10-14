export interface SampleClinicCard {
  id: string;
  title: string;
  hospitalName: string;
  hospitalType: string;
  folderAppearance: string;
  simulatedText: string;
  mockExtracted: {
    fullName: string;
    fileNumber: string;
    gender: "Male" | "Female";
    age: string;
    dateOfBirth?: string;
    phone: string;
    residentialAddress: string;
    stateOfOrigin: string;
    lga: string;
    nin?: string;
    nhisNumber?: string;
    bloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
    genotype: "AA" | "AS" | "SS" | "AC" | "SC";
    nextOfKin: {
      name: string;
      relationship: "Spouse" | "Parent" | "Child" | "Sibling" | "Relative" | "Friend" | "Other";
      phone: string;
    };
    physicalArchive: {
      roomNumber: string;
      cabinet: string;
      shelfOrDrawer: string;
      folderColor: string;
    };
    vitals: {
      bp: string;
      temperature: string;
      pulse: string;
      weight: string;
      spo2: string;
    };
    allergies: string[];
    chronicConditions: string[];
    primaryDiagnosis: string;
    clinicalSummary: string;
    suggestedNextDepartment: string;
  };
}

export const SAMPLE_CLINIC_CARDS: SampleClinicCard[] = [
  {
    id: "card-luth",
    title: "Old Manila Folder (LUTH / Lagos General Hospital)",
    hospitalName: "Lagos University Teaching Hospital (LUTH) Idi-Araba",
    hospitalType: "Tertiary Teaching Hospital",
    folderAppearance: "Aged brown manila folder with purple stamped header, blue ink handwriting, and paper tape binding",
    simulatedText: `
LAGOS UNIVERSITY TEACHING HOSPITAL
MEDICAL RECORDS DIVISION - GENERAL OUTPATIENT
FILE NO: LUTH/2019/55410 | OLD CARD: G-4912
PATIENT NAME: Danladi, Yakubu Abubakar
SEX: MALE | AGE: 46 YRS | DOB: 14/09/1979
OCCUPATION: Long-Distance Transporter (NURTW)
STATE OF ORIGIN: Kaduna | LGA: Zaria
RESIDENTIAL ADDRESS: 18 Mile 12 Market Road, Ketu, Kosofe LGA, Lagos
PHONE: 08028194411 | ALT: 08139201948
NIN: 59102948192 | NHIS/NHIA: NHIA/KAD/8819/20
BLOOD GROUP: B+ | GENOTYPE: AS
ALLERGIES: Severe reaction to Sulphonamides (Septrim), Aspirin
NEXT OF KIN: Hajiya Zainab Danladi (Wife) - 08037192019

PHYSICAL ARCHIVE LOCATION:
Records Hall B - Metal Cabinet 12 - Shelf 4 - Manila Brown

TRIAGE VITALS (08:30 AM):
BP: 155/100 mmHg | TEMP: 37.2°C | PULSE: 88 bpm | WT: 91 kg | SPO2: 97%

CLINICAL NOTES:
Patient complains of burning epigastric discomfort after spicy meals x 3 weeks, accompanied by palpitations and dizziness after long driving trips. Known hypertensive, default on meds for 3 months.
Imp: 1. Hypertensive Urgency / Poor compliance
2. Peptic Ulcer Disease (Suspected Duodenal Ulcer)
Plan: Re-initiate Amlodipine 10mg + Telmisartan 40mg. Omeprazole 40mg od before breakfast. Routine H. pylori stool antigen test.
`,
    mockExtracted: {
      fullName: "Yakubu Abubakar Danladi",
      fileNumber: "LUTH/2019/55410",
      gender: "Male",
      age: "46",
      dateOfBirth: "1979-09-14",
      phone: "08028194411",
      residentialAddress: "18 Mile 12 Market Road, Ketu, Kosofe LGA, Lagos",
      stateOfOrigin: "Kaduna",
      lga: "Zaria",
      nin: "59102948192",
      nhisNumber: "NHIA/KAD/8819/20",
      bloodGroup: "B+",
      genotype: "AS",
      nextOfKin: {
        name: "Hajiya Zainab Danladi",
        relationship: "Spouse",
        phone: "08037192019"
      },
      physicalArchive: {
        roomNumber: "Records Hall B",
        cabinet: "Metal Cabinet 12",
        shelfOrDrawer: "Shelf 4, Manila Brown",
        folderColor: "Brown Manila"
      },
      vitals: {
        bp: "155/100",
        temperature: "37.2",
        pulse: "88",
        weight: "91",
        spo2: "97"
      },
      allergies: ["Sulphonamides (Septrim)", "Aspirin"],
      chronicConditions: ["Hypertension", "Peptic Ulcer Disease"],
      primaryDiagnosis: "Hypertensive Urgency with Suspected Peptic Ulcer Disease",
      clinicalSummary: "Burning epigastric pain x 3 weeks, palpitations, dizziness. Defaulted on hypertensive medication for 3 months.",
      suggestedNextDepartment: "doctor"
    }
  },
  {
    id: "card-fmc",
    title: "Federal Medical Centre (FMC) Outpatient Pink Intake Slip",
    hospitalName: "Federal Medical Centre (FMC) Abuja",
    hospitalType: "Federal Medical Centre",
    folderAppearance: "Pink card paper with red ink physician stamps and handwritten vitals margin",
    simulatedText: `
FEDERAL MEDICAL CENTRE, JABI - ABUJA
CHILDREN OUTPATIENT CLINIC (CHOP)
HOSPITAL NUMBER: FMC/ABJ/2024/9140
NAME: Kalu, Nkechi Chimamanda
SEX: FEMALE | AGE: 3 YRS (DOB: 12/03/2023)
MOTHER: Mrs. Grace Kalu - 08061928471
FATHER: Mr. Obinna Kalu (NOK) - 08034928104
HOME: Flat 4, Phase 2, Kubwa Resettlement, Bwari LGA, FCT
STATE OF ORIGIN: Abia | LGA: Umuahia North
NIN: Pending Registration | NHIS NO: 9102481-H
BLOOD GP: O+ | GENOTYPE: AA
ALLERGIES: None Known (NKDA)
CABINET: Children Ward Registry - Shelf 1, Pink Manila #490

VITALS:
Temp: 39.1°C (Hyperpyrexia) | Pulse: 132 bpm | Wt: 14.2 kg | SPO2: 96%

PRESENTATION:
Sudden onset high grade continuous fever x 3 days, vomiting all oral intake x 2 episodes this morning, refusal of food, lethargy. No neck stiffness, no convulsions.
Imp: Acute Severe Plasmodium falciparum Malaria with Dehydration.
Plan: STAT IM/IV Artesunate 2.4mg/kg. Cold water tepid sponging. Urgent MP Giemsa stain and Full Blood Count.
`,
    mockExtracted: {
      fullName: "Nkechi Chimamanda Kalu",
      fileNumber: "FMC/ABJ/2024/9140",
      gender: "Female",
      age: "3",
      dateOfBirth: "2023-03-12",
      phone: "08061928471",
      residentialAddress: "Flat 4, Phase 2, Kubwa Resettlement, Bwari LGA, FCT",
      stateOfOrigin: "Abia",
      lga: "Umuahia North",
      nhisNumber: "9102481-H",
      bloodGroup: "O+",
      genotype: "AA",
      nextOfKin: {
        name: "Mr. Obinna Kalu",
        relationship: "Parent",
        phone: "08034928104"
      },
      physicalArchive: {
        roomNumber: "Children Ward Registry",
        cabinet: "Cabinet A",
        shelfOrDrawer: "Shelf 1, Pink Manila #490",
        folderColor: "Pink Manila"
      },
      vitals: {
        bp: "90/60",
        temperature: "39.1",
        pulse: "132",
        weight: "14.2",
        spo2: "96"
      },
      allergies: ["None Known (NKDA)"],
      chronicConditions: [],
      primaryDiagnosis: "Acute Severe Plasmodium falciparum Malaria with Dehydration",
      clinicalSummary: "High fever 39.1°C, recurrent vomiting, poor intake. Immediate artesunate and tepid sponging initiated.",
      suggestedNextDepartment: "triage"
    }
  },
  {
    id: "card-state-hospital",
    title: "State General Hospital Yellow Antenatal Folder",
    hospitalName: "General Hospital Gbagada, Lagos",
    hospitalType: "State General Hospital",
    folderAppearance: "Yellow thick manila card folder with red warning stamp for previous C-Section",
    simulatedText: `
LAGOS STATE HEALTH SERVICE COMMISSION
GENERAL HOSPITAL GBAGADA - MATERNITY UNIT
FILE NO: GHG/MAT/2024/0231 | STAMP: PREV 1 C/S
PATIENT: Fatimah Ayomide Bello
AGE: 29 YRS | GENDER: FEMALE
PARITY: G2 P1 +0 (1 alive, previous emergency CS for fetal distress 2021)
ADDRESS: 14 Diya Street, Ifako-Gbagada, Kosofe LGA, Lagos
STATE OF ORIGIN: Ogun | LGA: Abeokuta South
PHONE: 08083920194
NIN: 81920491823 | NHIS: LASHMA/2024/99148
BLOOD GROUP: A- (Rh Negative - WARNING: Needs Anti-D Prophylaxis!)
GENOTYPE: AS
ALLERGIES: Augmentin (Skin rash)
NEXT OF KIN: Kabir Bello (Husband) - 08029182301
PHYSICAL ARCHIVE:
Room 3 Maternity Records - Metal Rack 2, Row 3 (Yellow Box 5)

VITALS:
BP: 128/84 mmHg | TEMP: 36.5°C | PULSE: 76 bpm | WT: 73 kg | SPO2: 99%
SFH: 32 cm (32 wks GA) | FHR: 140 bpm, regular.
Imp: Gravida 2 Para 1 (+0) at 32 weeks with 1 Previous Lower Segment Caesarean Section (LSCS) + Rhesus Negative Mother.
Plan: Routine iron & folate. Plan for Repeat Elective C/S at 38 weeks. Ensure Anti-D immunoglobulin available.
`,
    mockExtracted: {
      fullName: "Fatimah Ayomide Bello",
      fileNumber: "GHG/MAT/2024/0231",
      gender: "Female",
      age: "29",
      phone: "08083920194",
      residentialAddress: "14 Diya Street, Ifako-Gbagada, Kosofe LGA, Lagos",
      stateOfOrigin: "Ogun",
      lga: "Abeokuta South",
      nin: "81920491823",
      nhisNumber: "LASHMA/2024/99148",
      bloodGroup: "A-",
      genotype: "AS",
      nextOfKin: {
        name: "Kabir Bello",
        relationship: "Spouse",
        phone: "08029182301"
      },
      physicalArchive: {
        roomNumber: "Room 3 Maternity Records",
        cabinet: "Metal Rack 2",
        shelfOrDrawer: "Row 3, Yellow Box 5",
        folderColor: "Yellow Manila"
      },
      vitals: {
        bp: "128/84",
        temperature: "36.5",
        pulse: "76",
        weight: "73",
        spo2: "99"
      },
      allergies: ["Augmentin (Skin rash)"],
      chronicConditions: ["1 Previous C/S", "Rhesus D Negative Pregnancy"],
      primaryDiagnosis: "Intrauterine Pregnancy at 32 weeks GA + 1 Previous C/S + Rhesus Negative",
      clinicalSummary: "Previous emergency C/S in 2021. Rhesus D negative mother. Anti-D prophylaxis required. Elective repeat C/S planned.",
      suggestedNextDepartment: "doctor"
    }
  }
];
