import { classifySpeechAutonomously, CHAKRAVYUH_SCAM_CATEGORIES } from './src/data/scamKeywords.js';

console.log("=================================================");
console.log("🛡️ TRUSTSHIELD VOICE & SPAM DETECTION VERIFICATION");
console.log("=================================================\n");

const testScenarios = [
  {
    name: "CBI Digital Arrest (English)",
    input: "This is Officer Vijay Verma from Mumbai Police Cyber Cell. You are under digital arrest for illegal narcotics parcel.",
    expectScam: true,
    minConfidence: 85
  },
  {
    name: "Bank KYC & OTP Harvesting (Hindi / Hinglish)",
    input: "Sir aapka SBI bank account freeze ho gaya hai. KYC update karne ke liye phone pe aaya 6 digit OTP share karein turant.",
    expectScam: true,
    minConfidence: 90
  },
  {
    name: "Electricity Disconnection Threat (Urgent Coercion)",
    input: "Dear consumer, electricity power connection will be disconnected tonight at 9:30 PM due to unpaid bill. Pay immediately.",
    expectScam: true,
    minConfidence: 85
  },
  {
    name: "Telegram Job Task Scam (Financial Bait)",
    input: "Earn Rs 5000 daily by liking YouTube videos and rating hotels on Telegram. Deposit Rs 1000 to claim prize.",
    expectScam: true,
    minConfidence: 85
  },
  {
    name: "Legitimate Conversation (Clean Negative)",
    input: "Hello, please send the quarterly project report before our 3:00 PM team meeting tomorrow.",
    expectScam: false
  }
];

let allPassed = true;

testScenarios.forEach((sc, idx) => {
  const result = classifySpeechAutonomously(sc.input);
  const isDetected = result.detected && result.scam_label;
  const passed = isDetected === sc.expectScam;

  console.log(`[Test ${idx + 1}] ${sc.name}`);
  console.log(`  Input: "${sc.input}"`);
  console.log(`  Expected Scam: ${sc.expectScam} | Actual Detected: ${isDetected}`);
  if (isDetected) {
    console.log(`  Category: ${result.category?.name || result.scam_type}`);
    console.log(`  Risk Level: ${result.risk_level} | Confidence: ${result.confidence}%`);
    console.log(`  Threat Signals:`, JSON.stringify(result.signals));
  }
  console.log(`  Status: ${passed ? '✅ PASSED' : '❌ FAILED'}\n`);

  if (!passed) allPassed = false;
});

console.log(`Total Categories in ChakraVyuh DB: ${CHAKRAVYUH_SCAM_CATEGORIES.length}`);
console.log(`Overall Verification: ${allPassed ? '🎉 ALL TESTS PASSED SUCCESSFULLY!' : '⚠️ SOME TESTS FAILED'}`);
