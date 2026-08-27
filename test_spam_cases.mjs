import { classifySpeechAutonomously, CHAKRAVYUH_SCAM_CATEGORIES } from './src/data/scamKeywords.js';

const tests = [
  "Dear customer, your credit card reward points worth 9850 will expire today. Click link to redeem.",
  "Your parcel is held at customs. Pay 499 duty fee.",
  "Congratulation you have won lucky draw 25 lakh in KBC call 9876543210 to claim prize.",
  "E-Challan notice: Traffic fine of 1000 rs pending on your vehicle DL-01. Pay now to avoid court.",
  "Income tax refund of rs 15000 approved for your PAN card. Update bank details.",
  "Get instant personal loan of 5 lakh with 0 interest no cibil required apply now.",
  "Airtel 5G free recharge for 3 months offer activate now on this link",
  "Dear SBI user, your net banking account is blocked due to unverified PAN. Update now",
  "Share the OTP sent to your mobile number",
  "Download AnyDesk application and give 9 digit code to resolve your issue",
  "Dear electricity consumer your power will be disconnected at 9:30 PM",
  "Hello bro what are you doing let us go for dinner tonight"
];

console.log("Running comprehensive spam/threat classification tests:\n");
tests.forEach((t, i) => {
  const res = classifySpeechAutonomously(t);
  console.log(`[${i+1}] "${t}"`);
  console.log(`    Detected: ${res.detected} | Type: ${res.category?.name || "NONE"} | Conf: ${res.confidence}% | Signals: ${JSON.stringify(res.signals)}\n`);
});
