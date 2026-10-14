export type AppLanguage = "en" | "pcm" | "ha" | "yo" | "ig";

export interface LanguageStrings {
  appName: string;
  tagline: string;
  searchPlaceholder: string;
  nepaModeActive: string;
  onlineGridMode: string;
  recordsTray: string;
  triageTray: string;
  doctorTray: string;
  labTray: string;
  pharmacyTray: string;
  billingTray: string;
  physicalFolderBridge: string;
  digitizePaperCard: string;
  registerNewPatient: string;
  scanQRFile: string;
  bloodGroup: string;
  genotype: string;
  sickleCellWarning: string;
  fileNumber: string;
  physicalLocation: string;
  nextOfKin: string;
  allergies: string;
  vitals: string;
  consultationNotes: string;
  prescriptions: string;
  labInvestigations: string;
  routePatientTo: string;
  printFolderSticker: string;
  emergencyLookup: string;
}

export const TRANSLATIONS: Record<AppLanguage, LanguageStrings> = {
  en: {
    appName: "MediFile NG",
    tagline: "Nigerian Hospital Digital Filing & Physical Archive Bridge",
    searchPlaceholder: "Search by File No (e.g. UCH/2021/...), NIN (11 digits), Name, or Phone...",
    nepaModeActive: "NEPA Outage Mode: Active (Offline Data Safe)",
    onlineGridMode: "Hospital Local Network / Synced",
    recordsTray: "Records & HIM",
    triageTray: "Triage & Vitals",
    doctorTray: "Doctor / GOPD",
    labTray: "Laboratory",
    pharmacyTray: "Pharmacy",
    billingTray: "Billing & NHIA",
    physicalFolderBridge: "Manila Folder Shelf Locator",
    digitizePaperCard: "AI Paper Card Digitizer",
    registerNewPatient: "New Patient Intake",
    scanQRFile: "Scan Folder Barcode / QR",
    bloodGroup: "Blood Group",
    genotype: "Genotype",
    sickleCellWarning: "Sickle Cell Warrior (Hb SS) - Fast-Track Protocol",
    fileNumber: "Hospital File Number",
    physicalLocation: "Physical Paper Archive Location",
    nextOfKin: "Next of Kin / Contact",
    allergies: "Known Drug Allergies",
    vitals: "Clinical Vitals & Triage",
    consultationNotes: "Doctor's Clinical Notes & Diagnosis",
    prescriptions: "Prescriptions & Dispensing",
    labInvestigations: "Laboratory Orders & Pathology",
    routePatientTo: "Route Patient Folder To",
    printFolderSticker: "Print Manila Folder Stickers",
    emergencyLookup: "Emergency Quick Lookup"
  },
  pcm: {
    appName: "MediFile NG",
    tagline: "System wey dey help Nigerian Hospital keep and arrange patient paper folder",
    searchPlaceholder: "Search patient with File Number, NIN, Phone or Name...",
    nepaModeActive: "NEPA Don Take Light: Safe Offline Mode Dey Work",
    onlineGridMode: "Network Dey Work / Everything Synced",
    recordsTray: "Card Room / Records",
    triageTray: "Nurse Station / Vitals",
    doctorTray: "Doctor Room",
    labTray: "Lab / Blood Test",
    pharmacyTray: "Pharmacy / Drug Store",
    billingTray: "Cashier & NHIA",
    physicalFolderBridge: "Find Brown Manila Folder for Shelf",
    digitizePaperCard: "Snap Paper Card Put for Computer",
    registerNewPatient: "Open New Patient Card",
    scanQRFile: "Scan Card QR / Barcode",
    bloodGroup: "Blood Group",
    genotype: "Genotype (Blood Type)",
    sickleCellWarning: "Sickle Cell (SS) Patient - Attend Sharp Sharp!",
    fileNumber: "Hospital File Number",
    physicalLocation: "Where the Brown Paper Folder Dey",
    nextOfKin: "Person to Call If Something Happen",
    allergies: "Medicine Wey Patient No Fit Drink",
    vitals: "Body Check (BP, Sugar, Temperature)",
    consultationNotes: "Doctor Note & Wetin Dey Worry Patient",
    prescriptions: "Medicine Wey Doctor Prescribe",
    labInvestigations: "Lab Test Results",
    routePatientTo: "Send Folder Go",
    printFolderSticker: "Print Sticker for Manila Folder",
    emergencyLookup: "Emergency Fast Search"
  },
  ha: {
    appName: "MediFile NG",
    tagline: "Tsarin Sarrafa Bayanan Asibiti da Takardun Majiyyata a Najeriya",
    searchPlaceholder: "Bincika ta Lambar Fayil, NIN, Suna ko Wayar Salula...",
    nepaModeActive: "Babu Wutar NEPA: Tsarin Offline Yana Aiki",
    onlineGridMode: "Hanyar Sadarwa Yana Aiki / An Adana",
    recordsTray: "Dakin Rajista (Records)",
    triageTray: "Dakin Ma'aikatan Jinya (Vitals)",
    doctorTray: "Dakin Likita",
    labTray: "Gwajin Jini (Lab)",
    pharmacyTray: "Shagon Magani (Pharmacy)",
    billingTray: "Biyan Kudi & NHIA",
    physicalFolderBridge: "Gano Wurin Fayil a Shelf",
    digitizePaperCard: "Dauki Hoton Katin Takarda",
    registerNewPatient: "Bude Sabon Fayil",
    scanQRFile: "Duba Lambar QR na Fayil",
    bloodGroup: "Rukunin Jini (Blood Group)",
    genotype: "Nau'in Jini (Genotype)",
    sickleCellWarning: "Mai Ciwon Sikila (Hb SS) - Kula da shi Da Sauri",
    fileNumber: "Lambar Fayil na Asibiti",
    physicalLocation: "Wurin Ajiyar Takarda a Shelf",
    nextOfKin: "Wanda Za a Tuntuba (Next of Kin)",
    allergies: "Maganin da Ba a Sha (Allergies)",
    vitals: "Aunawa (Hawar Jini, Zazzabi)",
    consultationNotes: "Bayanin Likita da Magani",
    prescriptions: "Magunguna da Aka Rubuta",
    labInvestigations: "Gwajin Dakin Gwaji",
    routePatientTo: "Aika Fayil Zuwa",
    printFolderSticker: "Buga Lambar Katin Manila",
    emergencyLookup: "Binciken Gaggawa"
  },
  yo: {
    appName: "MediFile NG",
    tagline: "Ètò Ìpamọ́ Àkọsílẹ̀ Ilé-ìwòsàn àti Àwọn Fódà Ìwé ní Nàìjíríà",
    searchPlaceholder: "Wá pẹ̀lú Nọ́mbà Fáìlì, NIN, Orúkọ tàbí Nọ́mbà Fóònù...",
    nepaModeActive: "Iná NEPA Ti Lọ: Ẹ̀rọ Ń Ṣiṣẹ́ Laisi Intanẹ́ẹ̀tì",
    onlineGridMode: "Nẹ́tíwọ́ọ̀kì Wà / Àkọsílẹ̀ Ti Bá Ara Wọn Mu",
    recordsTray: "Yàrá Àkọsílẹ̀ (Records)",
    triageTray: "Àyẹ̀wò Ìbẹ̀rẹ̀ (Triage / Vitals)",
    doctorTray: "Yàrá Dókítà",
    labTray: "Yàrá Àyẹ̀wò Ẹ̀jẹ̀ (Lab)",
    pharmacyTray: "Yàrá Òògùn (Pharmacy)",
    billingTray: "Ìsanwó àti NHIA",
    physicalFolderBridge: "Wá Ibi Tí Fódà Wà Lórí Àtẹ",
    digitizePaperCard: "Gbẹ́ Fọ́tò Káàdì Ìwé Sínú Ẹ̀rọ",
    registerNewPatient: "Ṣí Fáìlì Aláìsàn Tuntun",
    scanQRFile: "Ṣayẹwo Koodu QR / Barcode",
    bloodGroup: "Ẹ̀yà Ẹ̀jẹ̀ (Blood Group)",
    genotype: "Àbùdá Ẹ̀jẹ̀ (Genotype)",
    sickleCellWarning: "Aláìsàn Sikulu (SS) - Ẹ Tọ́jú Rẹ̀ Kíákíá!",
    fileNumber: "Nọ́mbà Fáìlì Ilé-ìwòsàn",
    physicalLocation: "Ibùdó Fódà Pípẹ́ Lórí Àtẹ",
    nextOfKin: "Ẹni Tí A Lè Pè Lójú Pàjáwìrì",
    allergies: "Òògùn Tí Kò Bá Ara Mu",
    vitals: "Àyẹ̀wò Ìwọ̀n Ara (BP, Òtútù)",
    consultationNotes: "Àkọsílẹ̀ Dókítà àti Àìsàn",
    prescriptions: "Àwọn Òògùn Tí Wọ́n Kọ",
    labInvestigations: "Àyẹ̀wò Lab",
    routePatientTo: "Gbé Fáìlì Lọ Sí",
    printFolderSticker: "Tẹ Sitika Fódà Jáde",
    emergencyLookup: "Àwárí Pàjáwìrì"
  },
  ig: {
    appName: "MediFile NG",
    tagline: "Usoro Nchekwa Faịlụ Ụlọ Ọgwụ na Idozi Akwụkwọ Manila na Naịjirịa",
    searchPlaceholder: "Chọọ site na Nọmba Faịlụ, NIN, Aha ma ọ bụ Ekwentị...",
    nepaModeActive: "NEPA Anyụọla Ọkụ: Ọ Na-arụ Ọrụ n'Intanet Ọbụla",
    onlineGridMode: "Netwọk Dị / Echekwara Ihe Niile",
    recordsTray: "Ụlọ Ndekọ (Records)",
    triageTray: "Ebe Nọsị (Vitals)",
    doctorTray: "Ụlọ Dọkịta",
    labTray: "Ụlọ Nnyocha Ọbara (Lab)",
    pharmacyTray: "Ebe Ọgwụ (Pharmacy)",
    billingTray: "Ịkwụ Ụgwọ & NHIA",
    physicalFolderBridge: "Chọta Ebe Faịlụ Dị n'Akpa Akwụkwọ",
    digitizePaperCard: "Skanuo Kaadị Akwụkwọ n'Igwe",
    registerNewPatient: "Mepee Faịlụ Ọhụrụ",
    scanQRFile: "Skaan Koodu QR nke Faịlụ",
    bloodGroup: "Ụdị Ọbara (Blood Group)",
    genotype: "Ọdịdị Mkpụrụ Ọbara (Genotype)",
    sickleCellWarning: "Onye Nwere Sickle Cell (SS) - Lekọta Ya Ozugbo!",
    fileNumber: "Nọmba Faịlụ Ụlọ Ọgwụ",
    physicalLocation: "Ebe Akwụkwọ Faịlụ Dị na Shelf",
    nextOfKin: "Onye A Ga-akpọ Maka Mberede",
    allergies: "Ọgwụ Na-adịghị Mma n'Ahụ",
    vitals: "Ọnọdụ Ahụ (BP, Okpomọkụ, Ọbara)",
    consultationNotes: "Ihe Dọkịta Dere Maka Ọrịa",
    prescriptions: "Ọgwụ E Nyere",
    labInvestigations: "Nnyocha Ụlọ Ọgwụ (Lab)",
    routePatientTo: "Ziga Faịlụ Gaa",
    printFolderSticker: "Bipụta Sitika Faịlụ Manila",
    emergencyLookup: "Ọchụchọ Mberede"
  }
};

export interface ClinicalPhrase {
  english: string;
  pidgin: string;
  hausa: string;
  yoruba: string;
  igbo: string;
  context: string;
}

export const NIGERIAN_CLINICAL_PHRASES: ClinicalPhrase[] = [
  {
    english: "How are you feeling today? What brings you to the hospital?",
    pidgin: "How body dey do you today? Wetin make you come hospital?",
    hausa: "Yaya jikin naka yau? Me ya kawo ka asibiti?",
    yoruba: "Báwo ni ara rẹ ṣe wà lónìí? Kí ló gbé ọ wá sí ilé-ìwòsàn?",
    igbo: "Kedu ka ahụ dị gị taa? Gịnị mere i ji bịa n'ụlọ ọgwụ?",
    context: "Triage / Chief Complaint"
  },
  {
    english: "Where exactly is the pain located?",
    pidgin: "Which place the pain dey pin you pass for your body?",
    hausa: "Ina ne a jikin ka ke jin zafin sosai?",
    yoruba: "Níbo gan-an ni àrùn náà ń dùn ọ́ nínú ara rẹ?",
    igbo: "Kedu ebe na-egbu gị mgbu n'ahụ gị?",
    context: "Pain Assessment"
  },
  {
    english: "How many days have you had this fever?",
    pidgin: "How many days this hot body and fever don start?",
    hausa: "Kwana nawa zazzabin nan ya fara?",
    yoruba: "Ọjọ́ mélòó ni ara gbígbóná yi ti bẹ̀rẹ̀?",
    igbo: "Ụbọchị ole ka ahụ ọkụ a malitere?",
    context: "Fever History (Malaria/Typhoid)"
  },
  {
    english: "Do you have sickle cell disease (Hb SS)?",
    pidgin: "You get sickle cell or you be SS warrior?",
    hausa: "Kuna da ciwon sikila (SS)?",
    yoruba: "Ṣé ẹ ní àrùn ẹ̀jẹ̀ sickle cell (SS)?",
    igbo: "Ì nwere ọrịa mkpụrụ ọbara sickle cell (SS)?",
    context: "Genotype / Emergency Crisis"
  },
  {
    english: "Take this medicine twice daily after meals (morning and night)",
    pidgin: "Drink this medicine two times every day after you don chop (morning and night)",
    hausa: "Ka sha maganin nan sau biyu a rana bayan ka ci abinci (safe da dare)",
    yoruba: "Ẹ máa mu òògùn yìí lẹ́ẹ̀mejì lójúmọ́ lẹ́yìn tí ẹ bá jẹun tán (àárọ̀ àti alẹ́)",
    igbo: "Ṅụọ ọgwụ a ugboro abụọ n'ụbọchị mgbe i risịrị nri (ụtụtụ na abalị)",
    context: "Pharmacy Dispensing"
  },
  {
    english: "Drink plenty of water and stay hydrated",
    pidgin: "Make you drink plenty water well well throughout the day",
    hausa: "Ka rinka shan ruwa sosai a kowace rana",
    yoruba: "Ẹ máa mu omi púpọ̀ láàárín ọjọ́",
    igbo: "Na-aṅụ mmiri nke ọma n'ụbọchị",
    context: "Hydration Advice"
  },
  {
    english: "Do you have any drug allergies that react on your skin or breathing?",
    pidgin: "Any medicine dey wey if you drink am, your body go scratch or swell up?",
    hausa: "Akwai wani magani da idan ka sha jikin ka ke yi maka kakkaba?",
    yoruba: "Ǹjẹ́ òògùn kankan wà tí o bá mu tí yóò fún ọ ní ara ríro tàbí ìbú?",
    igbo: "È nwere ọgwụ ọ bụla na-adịghị gị mma n'ahụ ma ọ bụ na-eme ka ahụ kọọ gị ọkọ?",
    context: "Allergy Safety"
  },
  {
    english: "Lie down on the examination couch so the doctor can feel your stomach",
    pidgin: "Climb the bed lie down flat make doctor touch your belly",
    hausa: "Ka kwanta a kan gadon gwaji domin likita ya duba cikin ka",
    yoruba: "Ẹ dùbúlẹ̀ sórí bẹ́ẹ̀dì àyẹ̀wò kí dọ́kítà lè fọwọ́ kàn ikùn yín",
    igbo: "Dina n'elu akwa ka dọkịta nyochaa afọ gị",
    context: "Physical Exam"
  },
  {
    english: "Please go to the laboratory for a blood and urine test",
    pidgin: "Make you carry this paper go Lab make dem test your blood and urine",
    hausa: "Don Allah je dakin binciken gwaji (Lab) domin a gwada jininka da fitsarinka",
    yoruba: "Ẹ jọ̀wọ́ ẹ lọ sí yàrá àyẹ̀wò (Lab) fún àyẹ̀wò ẹ̀jẹ̀ àti ìtọ̀",
    igbo: "Biko gaa n'ụlọ nyocha (Lab) maka nyocha ọbara na mamịrị",
    context: "Lab Referral"
  },
  {
    english: "Your file is ready. Please sit at the waiting area, the nurse will call your name",
    pidgin: "Your file don set. Go sit down for waiting chair, nurse go call your name now now",
    hausa: "Fayil ɗinku ya shirya. Don Allah zauna a wurin jira, ma'aikaciyar jinya za ta kira sunanka",
    yoruba: "Fáìlì yín ti ṣe tán. Ẹ jọ̀wọ́ ẹ jókòó sí ibi ìdúró, nọ́ọ̀sì yóò pe orúkọ yín láìpẹ́",
    igbo: "Faịlụ gị adịla njikere. Biko nọdụ n'ebe a na-eche nche, nọsị ga-akpọ aha gị n'oge na-adịghị anya",
    context: "Reception / Records"
  }
];

