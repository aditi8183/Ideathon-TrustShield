import { classifySpeechAutonomously } from './src/data/scamKeywords.js';

const moreTests = [
  "Dear user, your credit card reward points 8500 will expire today. Redeem now at https://sbi-reward-points.xyz",
  "Free 3 Months Recharge for Jio/Airtel users on the occasion of PM scheme. Click here to claim: http://free-recharge.in",
  "BlueDart: Your package #84920 could not be delivered due to wrong address. Update address & pay Rs 5 re-delivery charge: http://bluedart-delivery.info",
  "Income Tax Notice: Refund of Rs 24,500 pending. Submit account details immediately.",
  "Part time job opening: Earn 2000-5000 per day by rating hotels on Google. Contact HR on WhatsApp: 9876543210",
  "Hi, please find attached the meeting notes from yesterday's sync. Let me know if you have questions.",
  "Your electricity power will be cut off tonight at 9:30 PM by electricity officer. Call 9876543210 immediately.",
  "Congratulations! You won 1st prize in lucky draw worth Rs 10 Lakhs. Pay registration fee to claim.",
  "Traffic Police: E-challan fine of Rs 500 issued for overspeeding. Pay online before date.",
  "Your WhatsApp account will be deleted within 24 hours unless you verify phone number with code.",
  "Dear customer, KYC verification pending for your bank account. Download APK app to update.",
  "We have recorded your private video. Pay Rs 50,000 or video will be sent to all your contacts.",
  "Hey, are we still meeting for lunch at 1 PM?",
  "Urgent: You are selected for work from home typing job. Daily salary Rs 1500 directly in bank."
];

moreTests.forEach((t, i) => {
  const res = classifySpeechAutonomously(t);
  console.log(`[${i+1}] "${t.slice(0, 60)}..."`);
  console.log(`    Detected: ${res.detected} | Type: ${res.category?.name || "NONE"} | Conf: ${res.confidence}% | Signals: ${JSON.stringify(res.signals)}\n`);
});
