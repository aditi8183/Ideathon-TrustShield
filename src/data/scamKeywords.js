// Comprehensive 20-Category Indian Cyber Crime & Multi-Lingual Intent Dataset
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
      "stay on video", "virtual arrest", "illegal parcel", "under arrest", "police station", "customs police",
      "law enforcement", "non bailable", "high court", "cyber cell", "dcp", "sp", "inspector",
      "डिजिटल अरेस्ट", "पुलिस", "सीबीआई", "वारंट", "मनी लॉन्ड्रिंग", "फोन मत काटना", "वीडियो कॉल पर रहो", "गिरफ्तारी", "गैर जमानती",
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
      "otp for account", "send code", "enter otp", "tell otp", "security code", "sms code", "verification code",
      "ओटीपी", "पिन बताओ", "कोड बोलो", "वेरिफिकेशन कोड", "अकाउंट का ओटीपी", "ओटीपी दें",
      "ओटीपी शेयर करें", "ओटीपी आया है", "पासवर्ड बताओ", "6 अंकों का कोड",
      "ওটিপি বলুন", "ஓடிபி சொல்லுங்கள்", "ఓటీపీ చెప్పండి", "ओटीपी सांगा"
    ],
    description: "Scammer tricks victim into revealing their 6-digit OTP, PIN, or CVV over call/SMS to hijack accounts or authorize fraudulent transfers.",
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
      "paytm cashback", "overpayment refund", "click link to receive", "upi pin dalo", "collect request",
      "scan to get money", "receive money in bank", "pin to accept",
      "क्यूआर कोड स्कैन करो", "पिन डालो पैसे आएंगे", "यूपीआई रिफंड", "कैशबैक मिला है", "पैसे लेने के लिए पिन",
      "টাকা পেতে পিন দিন", "பணம் பெற பின் உள்ளிடவும்", "డబ్బులు రావడానికి పిన్ ఎంటర్ చేయండి",
      "पैसे मिळवण्यासाठी पिन टाका", "પૈસા મેળવવા માટે પીન નાખો", "ಹಣ ಪಡೆಯಲು PIN ಹಾಕಿ"
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
      "sbi", "icici", "hdfc", "pnb", "axis bank", "bank manager", "account blocked", "block account",
      "verify bank details", "card suspended", "atm card expire", "bank officer", "debit card blocked",
      "account frozen", "net banking blocked", "unauthorized transaction", "update bank", "bank compliance",
      "बैंक मैनेजर", "अकाउंट ब्लॉक", "एसबीआई", "बैंक पासबुक", "खाता बंद", "एटीएम ब्लॉक",
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
      "kyc", "update kyc", "kyc expire", "kyc expired", "pan card", "aadhaar kyc", "kyc link", "download apk",
      "bank kyc", "pan link", "pan update", "unverified pan", "kyc verification pending", "complete your kyc",
      "केवाईसी", "केवाईसी अपडेट", "पैन कार्ड", "केवाईसी लिंक", "केवाईसी समाप्त", "केवाईसी पेंडिंग",
      "কেওয়াইসি", "கேஒய்சி", "కేవైసీ", "केवायसी"
    ],
    description: "Fake SMS/call warning that your bank or wallet KYC has expired and your funds will be frozen unless updated via a fake link or app.",
    actionPlan: "Never click external links or download APK files for KYC. Update KYC only inside official banking apps or physical branches."
  },
  {
    id: "ELECTRICITY_BILL",
    name: "Electricity Power Disconnection Scam",
    nameHindi: "बिजली कनेक्शन कटने की धमकी",
    icon: "Zap",
    severity: "HIGH",
    baseRiskScore: 95,
    tactics: ["Utility Impersonation", "Late Night Deadline", "Quick Payment Pressure"],
    intentPatterns: [
      "electricity bill", "power disconnect", "light bill", "power cut", "discom", "power disconnected",
      "electricity officer", "electricity department", "update meter", "unpaid bill", "power connection",
      "disconnected tonight", "cut off tonight", "at 9:30 pm", "power sub station", "electricity consumer",
      "bijli bill", "light cut", "meter disconnect",
      "बिजली बिल", "पावर कट", "लाइट कट", "बिजली अधिकारी", "मीटर ब्लॉक", "आज रात बिजली", "बिजली कनेक्शन",
      "বিদ্যুৎ বিল", "மின்சார கட்டணம்", "కరెంట్ బిల్లు"
    ],
    description: "Urgent SMS/call threatening home power disconnection tonight unless you pay an alleged unpaid electricity bill via a personal UPI link or number.",
    actionPlan: "Pay bills only through official DISCOM portals or trusted banking apps, never to personal phone numbers or AnyDesk links."
  },
  {
    id: "FREE_RECHARGE_SCHEME",
    name: "Free Recharge & Fake Government Scheme Scam",
    nameHindi: "मुफ्त रिचार्ज व फर्जी सरकारी योजना फ्रॉड",
    icon: "Gift",
    severity: "HIGH",
    baseRiskScore: 90,
    tactics: ["Free Gift Bait", "Brand Impersonation", "Phishing Link Viral Trap"],
    intentPatterns: [
      "free recharge", "3 months recharge", "free 5g", "jio free", "airtel free", "vi free",
      "pm scheme", "pm yojana", "pm modi free", "free laptop", "free solar", "free smartphone",
      "click to activate free recharge", "claim 3 months", "free recharge offer", "recharge link",
      "मुफ्त रिचार्ज", "फ्री रिचार्ज", "3 महीने का फ्री रिचार्ज", "पीएम योजना", "फ्री लैपटॉप", "फ्री सोलर",
      "ফ্রি রিচার্জ", "இலவச ரீசார்ஜ்", "ఉచిత రీఛార్జ్"
    ],
    description: "Viral WhatsApp message or SMS promising free 3-month mobile recharge or government scheme subsidies to steal credentials through phishing links.",
    actionPlan: "Telecom operators and the Government NEVER distribute free recharges or schemes via random shortlinks. Do not click."
  },
  {
    id: "REWARD_POINTS_EXPIRE",
    name: "Credit Card & Banking Reward Points Expiry Scam",
    nameHindi: "क्रेडिट कार्ड रिवॉर्ड पॉइंट्स समाप्ति धोखाधड़ी",
    icon: "Gift",
    severity: "HIGH",
    baseRiskScore: 92,
    tactics: ["Fictitious Value Bait", "Expiry Panic", "Credential Phishing Link"],
    intentPatterns: [
      "reward points", "points worth", "expire today", "redeem points", "credit card points",
      "sbi reward", "hdfc points", "points into cash", "redeem now", "reward link", "bonus points",
      "9850", "8500", "5000 points", "unclaimed points",
      "रिवॉर्ड पॉइंट्स", "पॉइंट्स एक्सपायर", "रिवॉर्ड रिडीम", "क्रेडिट कार्ड पॉइंट्स",
      "রিওয়ার্ড পয়েন্ট", "ரிவார்ட் பாயிண்ட்ஸ்", "రివార్డ్ పాయింట్లు"
    ],
    description: "Phishing SMS claiming valuable reward points are expiring today, leading to a fake banking login portal that steals card and netbanking credentials.",
    actionPlan: "Redeem credit card reward points ONLY inside official net banking or official card provider apps."
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
      "delhivery", "blue dart", "bluedart", "delivery fee", "pay 499", "pay 5", "pay 10", "cash on delivery",
      "address verification", "parcel pending", "customs duty", "package could not be delivered", "wrong address",
      "re delivery charge", "order detained",
      "पार्सल", "अमेज़न", "फ्लिपकार्ट", "मीशो", "डिलीवरी चार्ज", "पार्सल अटका", "कस्टम ड्यूटी", "गलत पता",
      "পার্সেল", "பார்சல்", "పార్శిల్"
    ],
    description: "Fraudster impersonating Flipkart, Amazon, Meesho, or FedEx demanding Rs 5-499 delivery clearance fee to release a pending order.",
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
      "typing job", "earn 2000", "earn 5000", "daily income", "part time opening", "contact hr on whatsapp",
      "पार्ट टाइम जॉब", "यूट्यूब लाइक", "गूगल रिव्यू", "डेली कमाई", "प्रीपेड टास्क", "वीआईपी टास्क", "टाइपिंग जॉब",
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
      "whatsapp stock group", "sebi registered", "double money", "100% guaranteed profit", "high return",
      "trading profit", "daily return", "guaranteed returns",
      "शेयर मार्केट", "क्रिप्टो", "स्टॉक टिप्स", "पैसा डबल", "मुनाफा गारंटी",
      "শেয়ার বাজার", "பங்கு சந்தை", "స్టాక్ మార్కెట్"
    ],
    description: "Lures victims into fake stock or crypto trading portals promising guaranteed high returns, then blocks withdrawal of funds.",
    actionPlan: "Invest only through SEBI-registered brokers. Never transfer money to personal bank accounts for stock tips."
  },
  {
    id: "VIDEO_SEXTORTION_BLACKMAIL",
    name: "Video Call Blackmail & Sextortion Threat",
    nameHindi: "वीडियो कॉल ब्लैकमेल व वसूली धमकी",
    icon: "AlertOctagon",
    severity: "CRITICAL",
    baseRiskScore: 98,
    tactics: ["Private Recording Threat", "Contact List Viral Fear", "Extortion Demand"],
    intentPatterns: [
      "private video", "recorded your video", "video will be sent", "leak video", "viral your video",
      "send to all your contacts", "video call recorded", "nude video", "compromised video",
      "sextortion", "blackmail", "pay or video viral", "recorded your screen",
      "प्राइवेट वीडियो", "वीडियो वायरल", "कांटैक्ट को भेज देंगे", "ब्लैकमेल", "वीडियो रिकॉर्ड",
      "ভিডিও ভাইরাল", "வீடியோ லீக்", "వీడియో లీక్"
    ],
    description: "Extortionists threatening to leak private or morphed video recordings to your family and friends unless money is transferred.",
    actionPlan: "Do NOT pay any ransom or extortion money! Block the caller immediately and report to 1930 / cybercrime.gov.in."
  },
  {
    id: "ECHALLAN_TRAFFIC_FINE",
    name: "Traffic Police Fake E-Challan Scam",
    nameHindi: "ट्रैफिक पुलिस फर्जी ई-चालान घोटाला",
    icon: "ShieldAlert",
    severity: "HIGH",
    baseRiskScore: 90,
    tactics: ["Fake Law Notice", "Court Summons Fear", "Malicious Payment Link"],
    intentPatterns: [
      "e-challan", "echallan", "traffic police", "traffic fine", "vehicle fine", "overspeeding",
      "pending on vehicle", "pay fine immediately", "avoid court", "court summons", "dl-", "mh-",
      "ट्रैफिक चालान", "ई-चालान", "ट्रैफिक पुलिस", "जुर्माना", "गाड़ी का चालान",
      "ট্র্যাফিক চালান", "போக்குவரத்து அபராதம்", "ట్రాఫిక్ చలాన్"
    ],
    description: "Fake traffic police SMS with a malicious APK/phishing link claiming an unpaid challan fine on your vehicle.",
    actionPlan: "Check and pay traffic e-challans ONLY on the official Government portal: echallan.parivahan.gov.in."
  },
  {
    id: "TAX_REFUND_PHISHING",
    name: "Income Tax Department Refund Phishing",
    nameHindi: "आयकर विभाग रिफंड फिशिंग घोटाला",
    icon: "Landmark",
    severity: "HIGH",
    baseRiskScore: 91,
    tactics: ["Government Refund Bait", "Tax Authority Impersonation", "Banking Data Harvesting"],
    intentPatterns: [
      "income tax", "tax refund", "it department", "refund approved", "refund pending",
      "pan refund", "submit account details", "claim refund", "refund of rs",
      "आयकर विभाग", "टैक्स रिफंड", "इनकम टैक्स रिफंड", "खाता अपडेट रिफंड",
      "আয়কর রিফান্ড", "வருமான வரி ரீஃபண்ட்", "ఇన్‌కమ్ టాక్స్ రీఫండ్"
    ],
    description: "Phishing message claiming income tax refund is approved and directing user to a fake portal to harvest netbanking passwords.",
    actionPlan: "Income Tax refunds are processed directly into pre-validated bank accounts. Verify status on incometax.gov.in."
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
      "contact list", "extortion call", "photo leak", "threaten family", "0 interest loan", "no cibil",
      "लोन ऐप", "तुरंत लोन", "फोटो वायरल", "कांटैक्ट लिस्ट", "ब्लैकमेल", "लोन चुकाओ",
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
      "lottery fee", "deposit tax", "whatsapp lucky draw", "1st prize", "won prize", "claim prize",
      "registration fee to claim", "congratulation you have won",
      "लॉटरी", "केबीसी", "25 लाख", "टैक्स जमा करो", "इनाम", "लकी ड्रा जीता",
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
      "remote access", "share 9 digit code", "screen share", "give 9 digit code", "download anydesk",
      "एनीडेस्क", "टीमव्यूअर", "वायरस", "स्क्रीन शेयर", "9 अंकों का कोड",
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
      "swiggy customer care", "zomato customer care", "bank helpline", "refund officer", "toll free",
      "कस्टमर केयर", "हेल्पलाइन", "रिफंड अधिकारी",
      "কাস্টমার কেয়ার", "வாடிக்கையாளர் சேவை", "கஸ்டமர் கேர்"
    ],
    description: "Fraudster posting fake helpline numbers on Google Maps/Search, posing as customer care to extract banking details during refund requests.",
    actionPlan: "Always find customer care numbers strictly inside official mobile apps or verified official domain websites."
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
      "trai", "sim card", "deactivation", "sim block", "telecom department",
      "illegal broadcasting", "aadhaar sim", "press 9", "dot officer", "sim will be blocked",
      "टीआरएआई", "सिम बंद", "2 घंटे में सिम ब्लॉक", "9 दबाएं", "दूरसंचार विभाग", "सिम ब्लॉक",
      "ট্রাই నోটিশ", "டிராய் எச்சரிக்கை", "ట్రాయ్ అలర్ట్"
    ],
    description: "Fake automated IVR or caller claiming TRAI or Department of Telecom will disconnect all your SIM numbers within 2 hours due to illegal activity.",
    actionPlan: "TRAI and Telecom Department do not issue automated disconnection calls to individuals. Ignore and disconnect."
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
      "ম্যাট্রিমোনিয়াল", "திருமண பரிசு", "ம్యాట్రిమోనియల్"
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
  "project report", "team meeting", "quarterly report", "how are you", "see you tomorrow",
  "are we still meeting for lunch", "find attached the meeting notes", "what are you doing let us go",
  "dinner tonight", "lunch tomorrow", "have a great day", "thank you for your email",
  "बिजली का बिल भर दिया", "सामान मिल गया है", "पेमेंट ट्रांसफर कर दिया", "बिल जमा हो गया"
];

// Typo & Transliteration Normalization Dictionary
const TYPO_MAP = {
  "cbl": "cbi", "pkease": "please", "pls": "please", "plz": "please",
  "recieve": "receive", "recive": "receive", "flikpart": "flipkart", "flipkartt": "flipkart",
  "amazn": "amazon", "opt": "otp", "atp": "otp", "acc": "account", "acount": "account",
  "acct": "account", "prcel": "parcel", "custom": "customs", "kycc": "kyc", "anydesk": "anydesk",
  "challan": "e-challan", "congratulation": "congratulations"
};

// URL and Phishing Link Detection Helper
export function extractPhishingUrls(text) {
  if (!text) return [];
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(?:xyz|top|info|club|site|vip|link|online|live|shop|apk|app|cc|icu|work)\b[^\s]*)/gi;
  const matches = text.match(urlRegex) || [];
  return [...new Set(matches)];
}

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
  const isMarathi = isDevanagari && (text.includes("आहे") || text.includes("करा") || text.includes("सांगा") || text.includes("पैसे"));
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
    const hinglishWords = ["aapka", "batao", "karo", "gaya", "hai", "paise", "bhej", "raha", "bol", "hoon", "de", "dijiye", "lelo", "milega", "aayega", "turant", "jaldi", "karein"];
    const lower = text.toLowerCase();
    const hasHinglish = hinglishWords.some(hw => lower.includes(hw));
    if (hasHinglish) {
      language = "Hinglish (Hindi / English)";
    }
  }

  return {
    language,
    original_text: text,
    english_translation: text
  };
}

// Multi-Signal Multi-Dimensional Threat Indicator Extraction Engine
export function classifySpeechAutonomously(rawTranscript) {
  if (!rawTranscript || rawTranscript.trim().length < 1) {
    return {
      detected: false,
      scam_label: false,
      risk_level: "LOW",
      confidence: 0,
      signals: {},
      explanation: "No text provided for analysis."
    };
  }

  const langInfo = detectLanguageAndTranslate(rawTranscript);
  const suspiciousUrls = extractPhishingUrls(rawTranscript);

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
  const hasHardScamTrigger = cleanText.includes("otp") || cleanText.includes("digital arrest") || cleanText.includes("cbi") || cleanText.includes("warrant") || cleanText.includes("anydesk") || cleanText.includes("free recharge") || cleanText.includes("private video") || cleanText.includes("reward points");

  if (isLegitimateNegative && !hasHardScamTrigger) {
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
        screen_share: false,
        lottery_job_spam: false,
        phishing_link: false,
        fake_scheme_offer: false,
        extortion_blackmail: false
      },
      suspiciousUrls,
      explanation: "Legitimate statement detected. Zero threat signals or coercive scam indicators found."
    };
  }

  // Extract Granular Multi-Factor Risk Indicators
  const signals = {
    urgency: /(today|immediately|2 hours|tonight|9:30|right now|urgent|hurry|fast|abhi|turant|jaldi|expire today|within 24 hours|before date|2 घंटे|आज रात|तुरंत|जल्दी|समाप्त)/i.test(cleanText),
    threat: /(blocked|arrest|police|cbi|jail|cut|disconnect|disconnected|leak|viral|court|warrant|illegal|drugs|narcotics|crime|cyber|fir|penalty|fine|law|case|e-challan|challan|summons|फ्रीज|अरेस्ट|ब्लॉक|कटावे|जेल|वारंट|पुलिस|केस|जुर्माना)/i.test(cleanText),
    impersonation: /(sbi|icici|hdfc|pnb|axis|cbi|police|flipkart|amazon|meesho|trai|fedex|dhl|bluedart|courier|manager|officer|discom|telecom|customs|inspector|dcp|bank|authority|income tax|it department|traffic police|कर्मचारी|बैंक|पुलिस|सीबीआई|कस्टम्स|अधिकारी|आयकर)/i.test(cleanText),
    payment_request: /(pay\s+(rs|fee|tax|money|bill|fine|penalty|charge|\d+)|fee|deposit|tax|upi|clearance|499|99|350|500|1000|2%|penalty|fine|refund|send\s+(money|rs|funds|cash|amount|payment)|transfer\s+(rs|money|amount|funds)|re-delivery|advance fee|पैसे|पेमेंट|चार्ज|रिफंड|ट्रांसफर|जमा|शुल्क)/i.test(cleanText),
    credential_request: /(otp|pin|cvv|code|password|verification|auth|digits|secret|6 digit|tell me otp|share otp|redeem now|update bank|ओटीपी|पिन|कोड|पासवर्ड|वेरिफिकेशन)/i.test(cleanText),
    screen_share: /(anydesk|teamviewer|rustdesk|apk|remote|app|download|install|screen share|एनीडेस्क|डाउनलोड|ऐप)/i.test(cleanText),
    lottery_job_spam: /(lottery|prize|won|congratulations|lucky draw|cashback|bonus|part time|work from home|telegram|youtube like|task|daily income|profit|300%|typing job|vip task|kbc|25 lakh|1st prize|लॉटरी|इनाम|जीते|पार्ट टाइम|जॉब|कमाई)/i.test(cleanText),
    phishing_link: suspiciousUrls.length > 0 || /(click link|click here|bit\.ly|tinyurl|\.xyz|\.top|\.apk|download apk|http:\/\/|https:\/\/|link to|whatsapp group)/i.test(cleanText),
    fake_scheme_offer: /(free recharge|3 months recharge|pm scheme|pm yojana|free laptop|free solar|free 5g|0 interest loan|no cibil|मुफ्त रिचार्ज|फ्री रिचार्ज|पीएम योजना)/i.test(cleanText),
    extortion_blackmail: /(private video|recorded your video|video will be sent|leak video|viral video|all your contacts|sextortion|blackmail|morphed photo|threaten family|प्राइवेट वीडियो|वीडियो वायरल|ब्लैकमेल)/i.test(cleanText)
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
      if (wordsInPattern.length > 1) {
        return wordsInPattern.every(w => tokens.includes(w) || cleanText.includes(w));
      }
      return false;
    });

    if (hits.length > 0 && hits.length > maxMatchCount) {
      maxMatchCount = hits.length;
      bestMatch = category;
      matchedPatterns = hits;
    }
  });

  const signalCount = Object.values(signals).filter(Boolean).length;
  const isHighRiskSingleSignal = signals.extortion_blackmail || signals.fake_scheme_offer || (signals.phishing_link && (signals.credential_request || signals.impersonation || signals.payment_request || signals.urgency)) || (signals.lottery_job_spam && (signals.payment_request || signals.credential_request || signals.phishing_link));
  const isDangerousCoercion = (signalCount >= 2 && (signals.threat || signals.credential_request || signals.screen_share || signals.lottery_job_spam || signals.fake_scheme_offer || signals.extortion_blackmail || (signals.urgency && signals.payment_request))) || isHighRiskSingleSignal;

  if (bestMatch || isDangerousCoercion) {
    const activeCategory = bestMatch || {
      id: "GENERAL_CYBER_FRAUD",
      name: signals.extortion_blackmail ? "Video Call Blackmail & Sextortion Threat"
            : signals.fake_scheme_offer ? "Free Recharge & Fake Government Scheme Scam"
            : signals.credential_request ? "OTP & Security Credential Theft Scam"
            : signals.lottery_job_spam ? "Lottery / Part-Time Job Spam"
            : signals.threat ? "Authority Impersonation & Coercion Scam"
            : signals.screen_share ? "Remote APK / AnyDesk Hijack Scam"
            : signals.phishing_link ? "Malicious Phishing Link & Credential Scam"
            : "Suspicious Financial Coercion Pattern",
      severity: signalCount >= 2 || signals.extortion_blackmail || signals.threat ? "CRITICAL" : "HIGH",
      baseRiskScore: 92,
      tactics: Object.keys(signals).filter(k => signals[k]).map(k => k.replace(/_/g, ' ').toUpperCase()),
      actionPlan: "Disconnect immediately! Do not send money, do not share OTP, and do not click suspicious links."
    };

    const baseScore = activeCategory.baseRiskScore || 90;
    const confidence = Math.min(99, Math.max(85, Math.round(78 + matchedPatterns.length * 6 + signalCount * 4)));

    let risk_level = "HIGH";
    if (baseScore >= 95 || signalCount >= 3 || signals.threat || signals.credential_request || signals.extortion_blackmail) {
      risk_level = "CRITICAL";
    } else if (baseScore >= 85 || signalCount >= 1) {
      risk_level = "HIGH";
    } else {
      risk_level = "MEDIUM";
    }

    const matchedList = matchedPatterns.length > 0
      ? matchedPatterns
      : Object.keys(signals).filter(k => signals[k]).map(k => k.toUpperCase());

    return {
      detected: true,
      scam_label: true,
      scam_type: activeCategory.name,
      risk_level,
      confidence,
      original_text: langInfo.original_text,
      language: langInfo.language,
      english_translation: langInfo.english_translation,
      signals,
      suspiciousUrls,
      matchedPatterns: [...new Set(matchedList)],
      category: activeCategory,
      explanation: `Detected ${risk_level} threat level (${confidence}% Match) in ${langInfo.language}. Flags: ${Object.keys(signals).filter(k => signals[k]).join(', ').toUpperCase() || 'HIGH_RISK_COERCION'}.`
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
    suspiciousUrls,
    explanation: "Content parsed cleanly. No suspicious scam patterns or threat signals detected."
  };
}
