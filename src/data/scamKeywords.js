// Comprehensive 15-Category Indian Cyber Crime & Multi-Lingual Intent Dataset
// Location: src/data/scamKeywords.js

export const CHAKRAVYUH_SCAM_CATEGORIES = [
  {
    id: "POLICE_CBI_DIGITAL_ARREST",
    name: "CBI & Cyber Police Digital Arrest Scam",
    nameHindi: "सीबीआई / पुलिस डिजिटल अरेस्ट धोखाधड़ी",
    icon: "ShieldAlert",
    severity: "CRITICAL",
    baseRiskScore: 99,
    tactics: ["Authority Impersonation", "Isolation Threat", "Fake Video Room House Arrest"],
    intentPatterns: [
      "cbi", "arrest", "digital arrest", "police", "cyber crime", "crime branch", "narcotics", "narcotics bureau",
      "warrant", "court order", "supreme court", "money laundering", "don't disconnect", "stay on call",
      "stay on video", "virtual arrest", "illegal parcel", "under arrest", "police station",
      "डिजिटल अरेस्ट", "पुलिस", "सीबीआई", "वारंट", "मनी लॉन्ड्रिंग", "फोन मत काटना", "वीडियो कॉल पर रहो", "गिरफ्तारी",
      "ডিজিটাল অ্যারেস্ট সিবিআই", "டிஜிட்டல் கைது காவல் துறை", "డిజిటల్ అరెస్ట్ సీబీఐ", "डिजिटल अरेस्ट पोलिस"
    ],
    description: "Fraudster impersonating CBI or Police enforcing a fake virtual house arrest via call/video call, extorting money into a fake RBI safety vault.",
    actionPlan: "Disconnect immediately! Real police or CBI officers NEVER conduct digital arrests over video calls or demand money transfers."
  },
  {
    id: "OTP_HARVESTING",
    name: "OTP & Security Credential Theft Scam",
    nameHindi: "ओटीपी / पासवर्ड चोरी धोखाधड़ी",
    icon: "Landmark",
    severity: "CRITICAL",
    baseRiskScore: 99,
    tactics: ["Credential Harvesting", "Fake Verification Code Coercion", "Social Engineering"],
    intentPatterns: [
      "otp", "one time password", "share otp", "tell me otp", "read otp", "code sent to your phone",
      "6 digit code", "read out code", "pin number", "cvv", "bank otp", "login code", "verification pin",
      "otp for account", "send code", "enter otp", "tell otp", "security code",
      "ओटीपी", "पिन बताओ", "कोड बोलो", "वेरिफिकेशन कोड", "अकाउंट का ओटीपी", "ओटीपी दें",
      "ओटीपी शेयर करें", "ओटीपी आया है", "पासवर्ड बताओ",
      "ওটিপি বলুন", "ஓடிபி சொல்லுங்கள்", "ఓటీపీ చెప్పండి", "ओटीपी सांगा"
    ],
    description: "Scammer tricks victim into revealing their 6-digit OTP, PIN, or CVV over call to hijack accounts or authorize fraudulent transfers.",
    actionPlan: "NEVER share your OTP, UPI PIN, or CVV with anyone! Banks and official agents will NEVER ask for your OTP over phone call."
  },
  {
    id: "UPI_PAYMENT_SCAM",
    name: "UPI Refund & QR Code Reversal Scam",
    nameHindi: "यूपीआई रिफंड व क्यूआर कोड धोखाधड़ी",
    icon: "Zap",
    severity: "HIGH",
    baseRiskScore: 92,
    tactics: ["Money Collection Trap", "Fake Overpayment Bait", "PIN to Receive Fraud"],
    intentPatterns: [
      "upi refund", "scan qr code", "qr code", "enter upi pin", "gpay refund", "phonepe refund",
      "paytm cashback", "overpayment refund", "click link to receive", "upi pin dalo",
      "क्यूआर कोड स्कैन करो", "पिन डालो पैसे आएंगे", "यूपीआई रिफंड", "कैशबैक मिला है",
      "টাকা পেতে পিন দিন", "பணம் பெற பின் உள்ளிடவும்", "డబ్బులు రావడానికి పిన్ ఎంటర్ చేయండి",
      "पैसे मिळवण्यासाठी पिन टाका", "પૈસા મેળવવા માટે પીન નાખો", "ಹಣ ಪಡೆಯಲು ಪಿನ್ ಹಾಕಿ"
    ],
    description: "Scammer tricks victim into entering their UPI PIN or scanning a QR code under false promise of receiving money or a refund.",
    actionPlan: "Remember: YOU NEVER NEED TO ENTER YOUR UPI PIN OR SCAN A QR CODE TO RECEIVE MONEY! UPI PIN is ONLY entered to send money."
  },
  {
    id: "BANK_IMPERSONATION",
    name: "Bank Manager & Account Block Scam",
    nameHindi: "बैंक अधिकारी / खाता सील धोखाधड़ी",
    icon: "Landmark",
    severity: "CRITICAL",
    baseRiskScore: 96,
    tactics: ["Authority Impersonation", "Account Lockout Threat", "Urgency Pressure"],
    intentPatterns: [
      "sbi", "icici", "hdfc", "bank manager", "account blocked", "block account",
      "verify bank details", "card suspended", "atm card expire", "bank officer",
      "बैंक मैनेजर", "अकाउंट ब्लॉक", "एसबीआई", "बैंक पासबुक",
      "ব্যাঙ্ক থেকে বলছি", "வங்கி மேலாளர்", "బ్యాంక్ మేనేజర్", "बँकेतून बोलत आहे"
    ],
    description: "Fraudster impersonates bank officials claiming your bank account or ATM card is suspended unless you verify details immediately.",
    actionPlan: "Hang up immediately! Real bank officials never call demanding card numbers, PINs, or urgent phone verification."
  },
  {
    id: "KYC_SCAM",
    name: "KYC & PAN Card Expiry Update Scam",
    nameHindi: "केवाईसी / पैन कार्ड अपडेट धोखाधड़ी",
    icon: "Landmark",
    severity: "CRITICAL",
    baseRiskScore: 95,
    tactics: ["Regulatory Impersonation", "Suspension Pressure", "Phishing Link Injection"],
    intentPatterns: [
      "kyc", "update kyc", "kyc expire", "pan card", "aadhaar kyc", "kyc link", "download apk",
      "bank kyc", "pan link",
      "केवाईसी", "केवाईसी अपडेट", "पैन कार्ड", "केवाईसी लिंक",
      "কেওয়াইসি", "கேஒய்சி", "కేవైసీ", "केवायसी"
    ],
    description: "Fake SMS/call warning that your bank or wallet KYC has expired and your funds will be frozen unless updated via a fake link or app.",
    actionPlan: "Never click external links or download APK files for KYC. Update KYC only inside official banking apps or physical branches."
  },
  {
    id: "AADHAAR_GOVT_IMPERSONATION",
    name: "TRAI & Telecom SIM Deactivation Scam",
    nameHindi: "टीआरएआई / सिम बंद होने का डर",
    icon: "PhoneCall",
    severity: "HIGH",
    baseRiskScore: 88,
    tactics: ["Government Impersonation", "Urgency Pressure", "Service Disconnection Threat"],
    intentPatterns: [
      "trai", "sim card", "deactivation", "sim block", "telecom department", "disconnected",
      "illegal broadcasting", "aadhaar sim", "press 9", "dot officer",
      "टीआरएआई", "सिम बंद", "2 घंटे में सिम ब्लॉक", "9 दबाएं", "दूरसंचार विभाग",
      "ট্রাই నోটিশ", "டிராய் எச்சரிக்கை", "ట్రాయ్ అలర్ట్"
    ],
    description: "Fake automated IVR or caller claiming TRAI or Department of Telecom will disconnect all your SIM numbers within 2 hours due to illegal activity.",
    actionPlan: "TRAI and Telecom Department do not issue automated disconnection calls to individuals. Ignore and disconnect."
  },
  {
    id: "ELECTRICITY_BILL",
    name: "Electricity Power Disconnection Scam",
    nameHindi: "बिजली कनेक्शन कटने की धमकी",
    icon: "Zap",
    severity: "HIGH",
    baseRiskScore: 86,
    tactics: ["Utility Impersonation", "Late Night Deadline", "Quick Payment Pressure"],
    intentPatterns: [
      "electricity bill", "power disconnect", "light bill", "power cut", "discom",
      "electricity officer", "electricity department", "update meter", "unpaid bill",
      "बिजली बिल", "पावर कट", "लाइट कट", "बिजली अधिकारी", "मीटर ब्लॉक",
      "বিদ্যুৎ বিল", "மின்சார கட்டணம்", "కరెంట్ బిల్లు"
    ],
    description: "Urgent SMS/call threatening home power disconnection tonight unless you pay an alleged unpaid electricity bill via a personal UPI link or number.",
    actionPlan: "Pay bills only through official DISCOM portals or trusted banking apps, never to personal phone numbers."
  },
  {
    id: "COURIER_DELIVERY",
    name: "Shopping Parcel & Delivery Fee Scam",
    nameHindi: "ई-कॉमर्स पार्सल / डिलीवरी शुल्क धोखाधड़ी",
    icon: "Package",
    severity: "HIGH",
    baseRiskScore: 89,
    tactics: ["Delivery Fee Extortion", "Fake Pending Order Trap", "Courier Impersonation"],
    intentPatterns: [
      "parcel", "courier", "flipkart", "amazon", "meesho", "fedex", "dhl", "shiprocket",
      "delhivery", "blue dart", "delivery fee", "pay 499", "cash on delivery", "address verification",
      "parcel pending", "customs duty",
      "पार्सल", "अमेज़न", "फ्लिपकार्ट", "मीशो", "डिलीवरी चार्ज", "पार्सल अटका", "कस्टम ड्यूटी",
      "পার্সেল", "பார்சல்", "పార్శిల్"
    ],
    description: "Fraudster impersonating Flipkart, Amazon, Meesho, or FedEx demanding Rs 499/delivery clearance fee to release a pending order.",
    actionPlan: "Do NOT pay delivery fees over personal UPI links. Track and verify your order status strictly inside official shopping apps."
  },
  {
    id: "JOB_RECRUITMENT",
    name: "Telegram Task & YouTube Like Job Scam",
    nameHindi: "टेलीग्राम पार्ट-टाइम जॉब व लाइक टास्क घोटाला",
    icon: "TrendingUp",
    severity: "HIGH",
    baseRiskScore: 91,
    tactics: ["Initial Small Payout Bait", "VIP Task Unlock Deposit", "Guaranteed High Yield"],
    intentPatterns: [
      "part time job", "youtube like", "google review", "guaranteed return", "prepaid task",
      "vip task", "earn daily", "work from home", "telegram job", "hotel rating", "deposit task",
      "पार्ट टाइम जॉब", "यूट्यूब लाइक", "गूगल रिव्यू", "डेली कमाई", "प्रीपेड टास्क", "वीआईपी टास्क",
      "পার্ট টাইম কাজ", "பகுதி நேர வேலை", "పార్ట్ టైమ్ జాబ్"
    ],
    description: "Promises easy money for rating videos/hotels, luring victims with small initial payouts before coercing large deposits for 'VIP task unlocks'.",
    actionPlan: "Stop communication! Genuine employers never ask candidates to pay money or deposit funds to receive salary."
  },
  {
    id: "INVESTMENT_STOCK",
    name: "Crypto & Stock Market Investment Scam",
    nameHindi: "शेयर बाज़ार व क्रिप्टो निवेश घोटाला",
    icon: "TrendingUp",
    severity: "HIGH",
    baseRiskScore: 93,
    tactics: ["Unrealistic Return Promise", "Fake Trading Portal", "Institutional Account Bait"],
    intentPatterns: [
      "stock tips", "crypto investment", "upper circuit", "trading account", "forex",
      "whatsapp stock group", "sebi registered", "double money",
      "शेयर मार्केट", "क्रिप्टो", "स्टॉक टिप्स", "पैसा डबल",
      "শেয়ার বাজার", "பங்கு சந்தை", "స్టాక్ మార్కెట్"
    ],
    description: "Lures victims into fake stock or crypto trading portals promising guaranteed high returns, then blocks withdrawal of funds.",
    actionPlan: "Invest only through SEBI-registered brokers. Never transfer money to personal bank accounts for stock tips."
  },
  {
    id: "LOAN_EXTORTION",
    name: "Illegal Loan App & Morphing Extortion Scam",
    nameHindi: "अवैध लोन ऐप व फोटो ब्लैकमेल घोटाला",
    icon: "AlertOctagon",
    severity: "CRITICAL",
    baseRiskScore: 97,
    tactics: ["Contact List Scraping", "Photo Morphing Threat", "Aggressive Extortion"],
    intentPatterns: [
      "loan app", "instant loan", "7 day loan", "loan overdue", "repay loan", "morphed photo",
      "contact list", "extortion call", "photo leak", "threaten family",
      "लोन ऐप", "तुरंत लोन", "फोटो वायरल", "कांटैक्ट लिस्ट", "ब्लैकमेल",
      "লোন অ্যাপ", "கடன்பயன்பாடு", "లోన్ యాప్"
    ],
    description: "Unregistered instant loan apps accessing victim contacts and threatening to send morphed photos unless extortion amounts are paid.",
    actionPlan: "Report illegal loan apps to National Cyber Crime Portal (1930) and police. Do NOT pay extortion money."
  },
  {
    id: "LOTTERY_PRIZE",
    name: "KBC & Lucky Draw Advance Fee Scam",
    nameHindi: "केबीसी व लॉटरी टैक्स अग्रिम घोटाला",
    icon: "Gift",
    severity: "HIGH",
    baseRiskScore: 87,
    tactics: ["Advance Fee Fraud", "Lottery Win Bait", "Urgent Tax Demand"],
    intentPatterns: [
      "lottery", "kbc", "won 25 lakh", "lucky draw", "pay 2% tax", "kaun banega crorepati",
      "lottery fee", "deposit tax", "whatsapp lucky draw",
      "लॉटरी", "केबीसी", "25 लाख", "टैक्स जमा करो", "इनाम",
      "লটারি", "லாட்டரி", "లాటరీ"
    ],
    description: "Claiming you won a Rs 25 Lakh lottery in KBC or Lucky Draw, demanding upfront 2% GST tax via UPI to release funds.",
    actionPlan: "Real lotteries never demand upfront tax payments via personal UPI. Ignore and report."
  },
  {
    id: "TECH_SUPPORT",
    name: "Remote AnyDesk Screen Control Scam",
    nameHindi: "रिमोट ऐप (AnyDesk) स्क्रीन कंट्रोल घोटाला",
    icon: "ShieldAlert",
    severity: "CRITICAL",
    baseRiskScore: 95,
    tactics: ["Remote Screen Control", "Virus Threat Bait", "Full Device Takeover"],
    intentPatterns: [
      "anydesk", "teamviewer", "rustdesk", "microsoft tech support", "computer virus",
      "remote access", "share 9 digit code", "screen share",
      "एनीडेस्क", "टीमव्यूअर", "वायरस", "स्क्रीन शेयर",
      "অ্যানিডেস্ক", "எனீடெஸ்க்", "యాన్నీడెస్క్"
    ],
    description: "Fraudster tricks victim into downloading remote control apps (AnyDesk/TeamViewer) to gain full access to bank apps and OTPs.",
    actionPlan: "NEVER download AnyDesk, TeamViewer, or share 9-digit remote control codes with callers!"
  },
  {
    id: "CUSTOMER_CARE",
    name: "Fake Google Customer Care Helpline Scam",
    nameHindi: "नकली कस्टमर केयर हेल्पलाइन धोखाधड़ी",
    icon: "PhoneCall",
    severity: "HIGH",
    baseRiskScore: 89,
    tactics: ["Search Engine Impersonation", "Refund Verification Trap", "Credential Harvesting"],
    intentPatterns: [
      "customer care", "helpline number", "google search helpline", "refund executive",
      "swiggy customer care", "zomato customer care", "bank helpline", "refund officer",
      "कस्टमर केयर", "हेल्पलाइन", "रिफंड अधिकारी",
      "কাস্টমার কেয়ার", "வாடிக்கையாளர் சேவை", "కస్టమర్ కేర్"
    ],
    description: "Fraudster posting fake helpline numbers on Google Maps/Search, posing as customer care to extract banking details during refund requests.",
    actionPlan: "Always find customer care numbers strictly inside official mobile apps or verified official domain websites."
  },
  {
    id: "MATRIMONIAL_ROMANCE",
    name: "Matrimonial & Foreign Gift Customs Trap",
    nameHindi: "मैट्रिमोनियल व विदेशी उपहार कस्टम्स धोखाधड़ी",
    icon: "Gift",
    severity: "HIGH",
    baseRiskScore: 89,
    tactics: ["Romance Impersonation", "Foreign Gift Clearance Bait", "Customs Extortion"],
    intentPatterns: [
      "matrimonial", "nri groom", "foreign gift", "delhi airport customs", "jewellery box",
      "uk gift parcel", "dollars stuck", "shaadi.com", "customs clearance",
      "मैट्रिमोनियल", "विदेशी गिफ्ट", "एयरपोर्ट कस्टम्स", "शादी का प्रस्ताव",
      "ম্যাট্রিমোনিয়াল", "திருமண பரிசு", "మ్యాట్రిమోనియల్"
    ],
    description: "Fake foreign profile on matrimonial apps sending expensive gift boxes, followed by fake airport customs officer demanding clearance money.",
    actionPlan: "Never send money for customs clearance of gifts from online acquaintances. It is a 100% scam."
  }
];

// Enron-Corpus Inspired Negative Context Filter (Legitimate Business / Personal Statements)
const LEGITIMATE_NEGATIVE_PATTERNS = [
  "i paid my electricity bill", "electricity bill paid on gpay", "transferred payment to supplier",
  "invoice sent to accounts", "bought shoes on flipkart", "order delivered safely",
  "my account balance is fine", "salary credited", "meeting scheduled for tomorrow",
  "please send the invoice", "thanks for the payment", "received parcel from amazon",
  "बिजली का बिल भर दिया", "सामान मिल गया है", "पेमेंट ट्रांसफर कर दिया", "बिल जमा हो गया"
];

// Typo & Transliteration Normalization Dictionary (including OCR & Speech STT typos like cbl -> cbi)
const TYPO_MAP = {
  "cbl": "cbi", "cbi": "cbi", "pkease": "please", "pls": "please", "plz": "please",
  "recieve": "receive", "recive": "receive", "flikpart": "flipkart", "flipkartt": "flipkart",
  "amazn": "amazon", "opt": "otp", "atp": "otp", "acc": "account", "acount": "account",
  "acct": "account", "prcel": "parcel", "custom": "customs", "kycc": "kyc", "anydesk": "anydesk"
};

// Multilingual Script & Language Detection Sub-System
export function detectLanguageAndTranslate(rawText) {
  if (!rawText) {
    return {
      language: "English",
      original_text: "",
      english_translation: ""
    };
  }

  const text = rawText.trim();

  // Unicode Script Matching
  const isDevanagari = /[\u0900-\u097F]/.test(text);
  const isBengali = /[\u0980-\u09FF]/.test(text);
  const isTamil = /[\u0B80-\u0BFF]/.test(text);
  const isTelugu = /[\u0C00-\u0C7F]/.test(text);
  const isMarathi = isDevanagari && (text.includes("आहे") || text.includes("करा") || text.includes("सांगा"));
  const isGujarati = /[\u0A80-\u0AFF]/.test(text);
  const isKannada = /[\u0C80-\u0CFF]/.test(text);

  let language = "English";

  if (isBengali) language = "Bengali";
  else if (isTamil) language = "Tamil";
  else if (isTelugu) language = "Telugu";
  else if (isMarathi) language = "Marathi";
  else if (isGujarati) language = "Gujarati";
  else if (isKannada) language = "Kannada";
  else if (isDevanagari) language = "Hindi (Native Devanagari)";
  else {
    const hinglishWords = ["aapka", "batao", "karo", "gaya", "hai", "paise", "bhej", "raha", "bol", "hoon", "de", "dijiye", "lelo", "milega", "aayega"];
    const lower = text.toLowerCase();
    const hasHinglish = hinglishWords.some(hw => lower.includes(hw));
    if (hasHinglish) {
      language = "Hinglish (Hindi / English)";
    }
  }

  // IndicTrans2 & IndicXlit Normalized English Translation Simulation
  let english_translation = text;
  const lowerText = text.toLowerCase();

  if (lowerText.includes("kyc expire") || lowerText.includes("kyc expired")) {
    english_translation = "Sir, your bank KYC has expired. Please tell me the OTP immediately to prevent account blockage.";
  } else if (lowerText.includes("cbi") || lowerText.includes("cbl") || lowerText.includes("digital arrest") || lowerText.includes("police")) {
    english_translation = "This is Officer from Cyber Crime Police & CBI. You are under digital arrest for money laundering.";
  } else if (lowerText.includes("electricity") || lowerText.includes("power cut") || lowerText.includes("बिजली")) {
    english_translation = "Your home electricity bill is unpaid. Power connection will be disconnected tonight at 9:30 PM.";
  } else if (lowerText.includes("flipkart") || lowerText.includes("parcel") || lowerText.includes("courier")) {
    english_translation = "Your shopping parcel has been detained. Please pay Rs 499 clearance duty fee immediately.";
  } else if (lowerText.includes("otp") || lowerText.includes("code")) {
    english_translation = "Share your 6-digit bank verification OTP code immediately to complete verification.";
  }

  return {
    language,
    original_text: text,
    english_translation
  };
}

// Multi-Signal Multi-Dimensional Threat Indicator Extraction Engine
export function classifySpeechAutonomously(rawTranscript) {
  if (!rawTranscript || rawTranscript.trim().length < 1) {
    return { detected: false };
  }

  const langInfo = detectLanguageAndTranslate(rawTranscript);

  // Clean text and split tokens
  let cleanText = rawTranscript.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ");

  // Apply Typo Correction
  Object.keys(TYPO_MAP).forEach(typo => {
    const regex = new RegExp(`\\b${typo}\\b`, 'gi');
    cleanText = cleanText.replace(regex, TYPO_MAP[typo]);
  });

  // Extract individual word tokens
  const tokens = cleanText.split(/\s+/).filter(Boolean);

  // Enron-Corpus Inspired Negative Check (Filter Legitimate Context Statements)
  const isLegitimateNegative = LEGITIMATE_NEGATIVE_PATTERNS.some(pat => cleanText.includes(pat));
  if (isLegitimateNegative && !cleanText.includes("otp") && !cleanText.includes("digital arrest") && !cleanText.includes("cbi")) {
    return {
      detected: false,
      scam_label: false,
      risk_level: "LOW",
      confidence: 5,
      original_text: langInfo.original_text,
      language: langInfo.language,
      english_translation: langInfo.english_translation,
      signals: {
        urgency: false,
        threat: false,
        impersonation: false,
        payment_request: false,
        credential_request: false,
        screen_share: false
      },
      explanation: "Legitimate statement detected. Zero threat signals or coercive scam indicators found."
    };
  }

  // Extract Granular Multi-Factor Risk Indicators
  const signals = {
    urgency: /(today|immediately|2 hours|tonight|9:30|right now|abhi|turant|2 घंटे|आज रात)/i.test(cleanText),
    threat: /(blocked|arrest|police|cbi|jail|cut|disconnect|leak|viral|court|warrant|फ्रीज|अरेस्ट|ब्लॉक|कटावे)/i.test(cleanText),
    impersonation: /(sbi|icici|hdfc|cbi|police|flipkart|amazon|trai|fedex|manager|officer|discom|बैंक|पुलिस|सीबीआई|कस्टम्स)/i.test(cleanText),
    payment_request: /(pay|fee|deposit|tax|upi|transfer|clearance|499|99|2%|पैसे|पेमेंट|चार्ज|रिफंड)/i.test(cleanText),
    credential_request: /(otp|pin|cvv|code|password| verification|ओटीपी|पिन|कोड)/i.test(cleanText),
    screen_share: /(anydesk|teamviewer|rustdesk|apk|remote| app|एनीडेस्क)/i.test(cleanText)
  };

  let bestMatch = null;
  let maxMatchCount = 0;
  let matchedPatterns = [];

  CHAKRAVYUH_SCAM_CATEGORIES.forEach((category) => {
    const hits = category.intentPatterns.filter(pattern => {
      const pLower = pattern.toLowerCase();

      // Substring match
      if (cleanText.includes(pLower)) return true;

      // Word token match
      if (tokens.includes(pLower)) return true;

      // Multi-word phrase match
      const wordsInPattern = pLower.split(' ');
      return wordsInPattern.every(w => tokens.includes(w) || cleanText.includes(w));
    });

    if (hits.length > 0 && hits.length > maxMatchCount) {
      maxMatchCount = hits.length;
      bestMatch = category;
      matchedPatterns = hits;
    }
  });

  if (bestMatch) {
    let signalCount = Object.values(signals).filter(Boolean).length;
    let baseScore = bestMatch.baseRiskScore;
    let confidence = Math.min(99, Math.round(72 + matchedPatterns.length * 10 + signalCount * 5));

    let risk_level = "HIGH";
    if (baseScore >= 95 || signalCount >= 3 || signals.threat || signals.credential_request) {
      risk_level = "CRITICAL";
    } else if (baseScore >= 85 || signalCount >= 1) {
      risk_level = "HIGH";
    } else {
      risk_level = "MEDIUM";
    }

    return {
      detected: true,
      scam_label: true,
      scam_type: bestMatch.name,
      risk_level,
      confidence,
      original_text: langInfo.original_text,
      language: langInfo.language,
      english_translation: langInfo.english_translation,
      signals,
      matchedPatterns: [...new Set(matchedPatterns)],
      category: bestMatch,
      explanation: `Detected ${risk_level} threat level (${confidence}% Match) in ${langInfo.language}. Flags: ${Object.keys(signals).filter(k => signals[k]).join(', ').toUpperCase() || 'SUSPICIOUS_PATTERN'}.`
    };
  }

  return {
    detected: false,
    scam_label: false,
    risk_level: "LOW",
    confidence: 10,
    original_text: langInfo.original_text,
    language: langInfo.language,
    english_translation: langInfo.english_translation,
    signals,
    explanation: "Speech text parsed cleanly. No suspicious scam patterns or threat signals detected."
  };
}
