// Wide-Range Autonomous Chakravyuh Speech Intent & Scam Classification Dataset

export const CHAKRAVYUH_SCAM_CATEGORIES = [
  {
    id: "DIGITAL_ARREST",
    name: "Digital Arrest Scam",
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
    id: "COURIER_CUSTOMS",
    name: "Customs / Courier Drug Seizure Scam",
    nameHindi: "कस्टम्स / पार्सल जब्ती घोटाला",
    icon: "Package",
    severity: "HIGH",
    baseRiskScore: 88,
    tactics: ["Contraband Allegation", "Customs Tax Extortion", "Impersonation"],
    intentPatterns: [
      // English Speech Variants
      "fedex", "dhl", "customs", "parcel", "package", "courier", "detained", "seized",
      "illegal contraband", "drugs", "passports", "mdma", "customs fee", "clearance duty",
      "mumbai customs", "taiwan parcel", "customs clearance", "illegal items", "narcotics parcel",
      "clearance charge", "pay tax to release", "customs officer",
      // Hindi / Hinglish Speech Variants
      "कस्टम्स", "पार्सल", "कूरियर", "पैकेट", "अवैध सामान", "ड्रग्स", "नशीली दवाएं",
      "कस्टम ड्यूटी", "पैसे भेजो", "पार्सल पकड़ा गया", "कस्टम अधिकारी", "जब्त"
    ],
    description: "Scammer claiming an international parcel containing contraband/drugs sent in your name is seized by Customs, demanding immediate clearance fees.",
    actionPlan: "Do not pay any clearance fee over UPI. Verify tracking only on official courier websites."
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

// Autonomous Speech Scenario Classifier function (Wide-Range Natural Speech Matching)
export function classifySpeechAutonomously(transcript) {
  if (!transcript || transcript.trim().length < 3) {
    return { detected: false };
  }

  // Normalize speech text
  const cleanText = transcript.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ");
  
  let bestMatch = null;
  let maxMatchCount = 0;
  let matchedPatterns = [];

  CHAKRAVYUH_SCAM_CATEGORIES.forEach((category) => {
    const hits = category.intentPatterns.filter(pattern => {
      const pLower = pattern.toLowerCase();
      // Match full phrase or individual key words
      return cleanText.includes(pLower) || pLower.split(' ').every(w => w.length > 2 && cleanText.includes(w));
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
    const confidencePercentage = Math.min(99, Math.round(60 + matchedPatterns.length * 12));
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
