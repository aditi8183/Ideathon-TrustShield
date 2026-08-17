// Wide-Range Autonomous Chakravyuh Speech Intent & Scam Classification Dataset

export const CHAKRAVYUH_SCAM_CATEGORIES = [
  {
    id: "OTP_HARVESTING",
    name: "OTP & Banking Credential Theft Scam",
    nameHindi: "ओटीपी / पासवर्ड चोरी धोखाधड़ी",
    icon: "Landmark",
    severity: "CRITICAL",
    baseRiskScore: 99,
    tactics: ["Credential Harvesting", "Fake Verification Pressure", "Social Engineering"],
    intentPatterns: [
      // English & Spoken Variations
      "otp", "one time password", "verification code", "share otp", "tell me otp", "read otp",
      "code sent to your phone", "6 digit code", "six digit code", "read out code", "pin number",
      "cvv", "bank otp", "login code", "whatsapp code", "anydesk code", "verification pin",
      "otp for account", "account otp", "send code", "enter otp", "tell otp", "give otp",
      "security code", "transaction code", "card pin", "upi pin", "bank code",
      // Hindi / Hinglish Spoken Variations
      "ओटीपी", "पिन बताओ", "कोड बोलो", "वेरिफिकेशन कोड", "अकाउंट का ओटीपी", "ओटीपी दें",
      "ओटीपी शेयर करें", "ओटीपी आया है", "मैसेज वाला कोड", "पासवर्ड बताओ"
    ],
    description: "Fraudster tricking victim into revealing sensitive 6-digit OTP, UPI PIN, or bank credentials over phone call to hijack bank accounts or authorize fraudulent transfers.",
    actionPlan: "NEVER share your OTP, UPI PIN, or SMS codes with anyone! Banks and official delivery agents will NEVER ask for your OTP over phone call."
  },
  {
    id: "COURIER_CUSTOMS",
    name: "Shopping Parcel & Courier Delivery Scam",
    nameHindi: "पार्सल / ई-कॉमर्स डिलीवरी धोखाधड़ी",
    icon: "Package",
    severity: "HIGH",
    baseRiskScore: 90,
    tactics: ["Delivery Fee Extortion", "Fake Order Pending Trap", "Courier Impersonation"],
    intentPatterns: [
      // Shopping & Delivery Brands
      "flipkart", "amazon", "meesho", "myntra", "ajio", "zepto", "blinkit", "instamart",
      "zomato", "swiggy", "fedex", "dhl", "shiprocket", "delhivery", "blue dart", "shadowfax",
      "ecom express", "dtdc", "indiapost", "speed post", "courier",
      // Delivery & Payment Action Phrases
      "parcel", "package", "delivery fee", "pay to receive", "receive your parcel",
      "please pay", "pay to get parcel", "cash on delivery", "cod charge", "delivery charge",
      "address verification fee", "delivery agent", "parcel pending", "order stuck",
      "delivery officer", "clearance fee", "detained", "customs duty", "illegal contraband",
      "drugs", "passports", "mdma", "customs clearance", "parcel hold", "pay 499", "pay 99",
      // Hindi / Hinglish Speech Variants
      "कस्टम्स", "पार्सल", "कूरियर", "पैकेट", "फ्लिपकार्ट", "अमेज़न", "मीशो", "डिलीवरी चार्ज",
      "डिलीवरी बॉय", "पैसे पे करो", "पार्सल प्राप्त करें", "सामान अटका है", "कस्टम ड्यूटी"
    ],
    description: "Fraudster impersonating Flipkart, Amazon, FedEx or delivery agent demanding Rs 499/clearance fees to deliver a pending parcel or alleging illegal contraband.",
    actionPlan: "Do NOT pay any delivery or clearance fee over UPI. Verify your order status strictly inside official shopping apps."
  },
  {
    id: "DIGITAL_ARREST",
    name: "CBI & Cyber Police Digital Arrest Scam",
    nameHindi: "डिजिटल अरेस्ट धोखाधड़ी",
    icon: "ShieldAlert",
    severity: "CRITICAL",
    baseRiskScore: 98,
    tactics: ["Authority Impersonation", "Isolation Threat", "Fake Video Room Arrest"],
    intentPatterns: [
      // English Speech Variants
      "digital arrest", "cbi", "police", "cyber crime", "crime branch", "narcotics bureau",
      "warrant", "court order", "supreme court", "money laundering", "don't disconnect",
      "stay on call", "stay on video", "virtual arrest", "illegal package in your name",
      "police department", "cyber cell officer", "under arrest", "police station", "investigation officer",
      "legal action", "arrest warrant", "extortion", "rbi safety vault",
      // Hindi / Hinglish Speech Variants
      "डिजिटल अरेस्ट", "पुलिस", "सीबीआई", "वारंट", "मनी लॉन्ड्रिंग", "फोन मत काटना",
      "वीडियो कॉल पर रहो", "गिरफ्तारी", "जेल", "पुलिस स्टेशन", "क्राइम ब्रांच", "नारकोटिक्स",
      "कानूनी कार्रवाई", "अरेस्ट ऑर्डर", "गिरफ्तार"
    ],
    description: "Fraudster impersonating law enforcement (CBI / Cyber Police) enforcing a fake virtual house arrest via voice/video call and demanding immediate fund transfer to a fake safety vault.",
    actionPlan: "Disconnect call immediately! Real police or CBI officers NEVER conduct arrests over voice/video calls or demand money transfers."
  },
  {
    id: "ELECTRICITY_BILL",
    name: "Electricity Power Disconnection Scam",
    nameHindi: "बिजली कनेक्शन कटने की धमकी",
    icon: "Zap",
    severity: "HIGH",
    baseRiskScore: 85,
    tactics: ["Late Night Deadline", "Utility Impersonation", "Quick Payment Pressure"],
    intentPatterns: [
      // English Speech Variants
      "electricity bill", "power disconnect", "light bill", "power cut", "tonight 9:30",
      "unpaid bill", "electricity officer", "discom", "meter update", "electricity department",
      "pay bill immediately", "power disconnection", "update meter", "previous month bill",
      // Hindi / Hinglish Speech Variants
      "बिजली बिल", "पावर कट", "लाइट कट जाएगी", "बिजली अधिकारी", "बिल बकाया",
      "आज रात", "मीटर कट", "बिजली विभाग", "तुरंत बिल भरें"
    ],
    description: "Urgent warning that your home power will be disconnected tonight unless you pay an alleged unpaid electricity bill via a personal phone number or link.",
    actionPlan: "Pay bills only on official state DISCOM portals or banking apps, never to personal UPI numbers."
  },
  {
    id: "TRAI_TELECOM",
    name: "TRAI / SIM Deactivation Scam",
    nameHindi: "टीआरएआई / सिम बंद होने का डर",
    icon: "PhoneCall",
    severity: "HIGH",
    baseRiskScore: 82,
    tactics: ["URGENCY Pressure", "Automated IVR Traps", "Service Disconnection"],
    intentPatterns: [
      // English Speech Variants
      "trai", "sim card", "deactivation", "sim block", "telecom department", "disconnected within 2 hours",
      "harassment sms", "press 9", "unauthorized activity", "illegal broadcast", "aadhaar sim block",
      "telecom regulatory", "press 9 to connect", "sim deactivated",
      // Hindi / Hinglish Speech Variants
      "टीआरएआई", "सिम बंद", "दूरसंचार", "2 घंटे में बंद", "9 दबाएं", "मैसेज बंद",
      "सिम ब्लॉक", "वेरीफाई करें"
    ],
    description: "Fake telecom warning stating your SIM card will be blocked within 2 hours due to illegal activity unless money or verification details are provided.",
    actionPlan: "TRAI does not disconnect individual mobile SIMs via automated calls. Hang up and ignore."
  },
  {
    id: "INVESTMENT_TASK",
    name: "Telegram / YouTube Like Job Scam",
    nameHindi: "टेलीग्राम / पार्ट-टाइम जॉब घोटाला",
    icon: "TrendingUp",
    severity: "HIGH",
    baseRiskScore: 90,
    tactics: ["Initial Small Payout Bait", "VIP Task Deposit Trap", "Guaranteed Returns"],
    intentPatterns: [
      // English Speech Variants
      "part time job", "youtube like", "google review", "guaranteed return", "300% return",
      "prepaid task", "vip task", "crypto trading", "daily payout", "telegram group",
      "work from home", "rate hotels", "deposit task", "like videos", "earn daily",
      // Hindi / Hinglish Speech Variants
      "पार्ट टाइम जॉब", "यूट्यूब लाइक", "गूगल रिव्यू", "गारंटीड रिटर्न", "टास्क",
      "क्रिप्टो", "रोजाना कमाई", "घर बैठे कमाई"
    ],
    description: "Promises easy money for rating videos/hotels, baiting victims with small initial payouts before forcing large deposits for 'VIP task unlocks'.",
    actionPlan: "Stop communication immediately. Real employers never demand payment to release your salary."
  },
  {
    id: "BANKING_KYC",
    name: "Bank KYC & Account Freeze Scam",
    nameHindi: "बैंक केवाईसी / खाता सील घोटाला",
    icon: "Landmark",
    severity: "CRITICAL",
    baseRiskScore: 95,
    tactics: ["Credential Harvesting", "Remote Screen Share", "Fear of Account Loss"],
    intentPatterns: [
      // English Speech Variants
      "account frozen", "pan card expired", "update kyc", "anydesk", "teamviewer",
      "share otp", "enter upi pin", "bank manager", "netbanking blocked", "verify kyc",
      "download apk", "card blocked", "bank officer calling", "account blocked",
      // Hindi / Hinglish Speech Variants
      "खाता फ्रीज", "केवाईसी", "पैन कार्ड अमान्य", "ओटीपी बताओ", "पिन डालें",
      "बैंक मैनेजर", "एप्लीकेशन डाउनलोड करो", "अकाउंट ब्लॉक"
    ],
    description: "Impersonator claiming your bank account or PAN card is expired, coercing you to share OTPs, enter UPI PINs, or download screen-sharing apps.",
    actionPlan: "Never share OTP or enter UPI PIN to receive money. Contact your bank branch directly."
  },
  {
    id: "LOTTERY_KBC",
    name: "KBC / Lottery Tax Upfront Scam",
    nameHindi: "केबीसी / लॉटरी टैक्स धोखाधड़ी",
    icon: "Gift",
    severity: "HIGH",
    baseRiskScore: 85,
    tactics: ["Advance Fee Fraud", "Lottery Win Bait", "Urgent Tax Demand"],
    intentPatterns: [
      // English Speech Variants
      "lottery win", "kbc lottery", "won 25 lakh", "pay 2% tax", "claim prize",
      "lottery tax", "winner lucky draw", "upfront fee", "kaun banega crorepati",
      "gst tax deposit", "claim money",
      // Hindi / Hinglish Speech Variants
      "लॉटरी जीती", "केबीसी लॉटरी", "25 लाख जीते", "2 टका टैक्स", "प्राइज मनी",
      "इनाम का पैसा", "लॉटरी का टैक्स"
    ],
    description: "SMS or call claiming you won Rs 25 Lakh in KBC/Lottery, requiring upfront 2% GST tax payment via UPI to claim prize.",
    actionPlan: "Legitimate lotteries never ask for upfront taxes via personal UPI. Ignore and report."
  }
];

// Typo correction dictionary for robust real-time speech matching
const TYPO_MAP = {
  "pkease": "please",
  "pls": "please",
  "plz": "please",
  "recieve": "receive",
  "recive": "receive",
  "flikpart": "flipkart",
  "flipkartt": "flipkart",
  "amazn": "amazon",
  "opt": "otp",
  "atp": "otp",
  "acc": "account",
  "acount": "account",
  "acct": "account",
  "prcel": "parcel",
  "parcel": "parcel",
  "custom": "customs"
};

// Autonomous Speech Scenario Classifier function
export function classifySpeechAutonomously(transcript) {
  if (!transcript || transcript.trim().length < 2) {
    return { detected: false };
  }

  // Normalize transcript (lowercase, remove punctuation)
  let cleanText = transcript.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ");

  // Apply typo correction
  Object.keys(TYPO_MAP).forEach(typo => {
    const regex = new RegExp(`\\b${typo}\\b`, 'gi');
    cleanText = cleanText.replace(regex, TYPO_MAP[typo]);
  });

  let bestMatch = null;
  let maxMatchCount = 0;
  let matchedPatterns = [];

  CHAKRAVYUH_SCAM_CATEGORIES.forEach((category) => {
    const hits = category.intentPatterns.filter(pattern => {
      const pLower = pattern.toLowerCase();

      // Direct substring match
      if (cleanText.includes(pLower)) return true;

      // Word-by-word token match for key single words (e.g., "otp", "parcel", "flipkart")
      const wordsInPattern = pLower.split(' ');
      if (wordsInPattern.length === 1 && pLower.length >= 3) {
        const regex = new RegExp(`\\b${pLower}\\b`, 'i');
        return regex.test(cleanText);
      }

      // Multi-word phrase match
      return wordsInPattern.every(w => w.length > 2 && cleanText.includes(w));
    });

    if (hits.length > 0) {
      if (hits.length > maxMatchCount) {
        maxMatchCount = hits.length;
        bestMatch = category;
        matchedPatterns = hits;
      }
    }
  });

  if (bestMatch) {
    const confidencePercentage = Math.min(99, Math.round(65 + matchedPatterns.length * 10));
    return {
      detected: true,
      category: bestMatch,
      confidence: confidencePercentage,
      matchedPatterns: [...new Set(matchedPatterns)],
      riskScore: Math.min(100, bestMatch.baseRiskScore + matchedPatterns.length * 2)
    };
  }

  return { detected: false };
}
