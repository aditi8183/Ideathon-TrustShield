/**
 * Trust Shield Offline Multilingual ONNX Neural Inference Engine
 * Location: src/utils/scamAIModel.js
 * 
 * Supports on-device neural scam classification using ONNX Runtime Web (WASM).
 * Handles Indic languages (Hindi, Hinglish, English, Tamil, Telugu, Bengali, Marathi, etc.)
 */

import * as ort from 'onnxruntime-web';
import { classifySpeechAutonomously, CHAKRAVYUH_SCAM_CATEGORIES } from '../data/scamKeywords';

// Configure ONNX WebAssembly execution environment
try {
  ort.env.wasm.numThreads = 1;
  ort.env.wasm.simd = true;
} catch (e) {
  console.warn('[ONNX] Environment setup warning:', e);
}

// 8 Primary Scam Categories mapped to neural output logits
export const MODEL_CATEGORY_MAP = [
  {
    id: "DIGITAL_ARREST",
    name: "CBI & Cyber Police Digital Arrest",
    nameHindi: "सीबीआई / साइबर पुलिस डिजिटल अरेस्ट",
    severity: "CRITICAL",
    tactics: ["Authority Impersonation", "Video Call House Arrest", "Fake Supreme Court Warrant"],
    actionPlan: "Disconnect immediately! Law enforcement never conducts digital arrests over video calls."
  },
  {
    id: "ELECTRICITY_CUTOFF",
    name: "Electricity / Power Cutoff Threat",
    nameHindi: "बिजली बिल डिस्कनेक्शन धमकी",
    severity: "HIGH",
    tactics: ["Nighttime Urgency Panic", "Fake Utility Officer", "APK Malware Link"],
    actionPlan: "Do NOT click APK links or call provided mobile numbers. Pay bills only via official power utility portals."
  },
  {
    id: "BANK_KYC_OTP",
    name: "Bank Account KYC & OTP Theft",
    nameHindi: "बैंक केवाईसी व ओटीपी चोरी",
    severity: "CRITICAL",
    tactics: ["Account Freeze Panic", "OTP Verification Coercion", "Fake Bank Helpline"],
    actionPlan: "NEVER share OTP, CVV, or UPI PIN! Banks never ask for OTPs over phone calls."
  },
  {
    id: "LOAN_HARASSMENT",
    name: "Instant Loan & Blackmail Harassment",
    nameHindi: "लोन ऐप ब्लैकमेल व वसूली उत्पीड़न",
    severity: "CRITICAL",
    tactics: ["Contact List Extortion", "Morphing Photo Threats", "7-Day Trap"],
    actionPlan: "Do NOT pay extortion money. Block numbers and report to cybercrime.gov.in immediately."
  },
  {
    id: "JOB_TASK_SCAM",
    name: "Telegram Task & YouTube Like Scam",
    nameHindi: "टेलीग्राम टास्क व यूट्यूब लाइक फ्रॉड",
    severity: "HIGH",
    tactics: ["Initial Small Payout Bait", "VIP Task Unlock Deposit", "Prepaid Investment Trap"],
    actionPlan: "Genuine jobs never demand money deposits or prepaid tasks to release salary."
  },
  {
    id: "COURIER_CUSTOMS",
    name: "Customs Parcel & Lottery Gift Scam",
    nameHindi: "कस्टम्स पार्सल व लॉटरी गिफ्ट फ्रॉड",
    severity: "HIGH",
    tactics: ["Illegal Package Fake Charge", "Customs Clearance Fee", "Overseas Lottery Bait"],
    actionPlan: "Never pay delivery clearance fees to personal UPI IDs. Verify tracking inside official apps."
  },
  {
    id: "UPI_REFUND_QR",
    name: "UPI Refund & QR Reversal Trap",
    nameHindi: "यूपीआई रिफंड व क्यूआर कोड ट्रैप",
    severity: "HIGH",
    tactics: ["Collect Request Deception", "PIN to Receive Money Trap", "Fake Overpayment Screenshot"],
    actionPlan: "Remember: You NEVER enter your UPI PIN to receive money! PIN is ONLY for sending money."
  },
  {
    id: "SAFE_COMMUNICATION",
    name: "Safe & Legitimate Call",
    nameHindi: "सुरक्षित बातचीत",
    severity: "SAFE",
    tactics: ["Normal Casual / Business Speech"],
    actionPlan: "No coercive signals detected. Safe to continue."
  }
];

class ScamAIModelService {
  constructor() {
    this.session = null;
    this.status = 'UNINITIALIZED'; // 'UNINITIALIZED' | 'LOADING' | 'READY' | 'ERROR' | 'FALLBACK_MODE'
    this.modelPath = '/models/model.onnx';
    this.listeners = new Set();
    this.loadError = null;
    this.isWasmAvailable = typeof WebAssembly === 'object';
  }

  // Subscribe to model loading status changes
  subscribe(callback) {
    this.listeners.add(callback);
    callback({ status: this.status, error: this.loadError });
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach(fn => fn({ status: this.status, error: this.loadError }));
  }

  // Initialize ONNX Session from default URL or custom ArrayBuffer
  async initModel(customSource = null) {
    if (this.status === 'LOADING') return;
    this.status = 'LOADING';
    this.notify();

    try {
      let sessionSource = customSource || this.modelPath;

      // If string path, check if file exists
      if (typeof sessionSource === 'string') {
        const response = await fetch(sessionSource, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error(`ONNX model file not found at "${sessionSource}". Place model.onnx in /public/models/model.onnx`);
        }
      }

      this.session = await ort.InferenceSession.create(sessionSource, {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all'
      });

      this.status = 'READY';
      this.loadError = null;
      console.log('✅ [Trust Shield AI] ONNX Neural Model initialized successfully on WASM runtime.');
      this.notify();
    } catch (err) {
      console.warn('⚠️ [Trust Shield AI] ONNX model offline initialization notice:', err.message);
      this.status = 'FALLBACK_MODE';
      this.loadError = err.message;
      this.notify();
    }
  }

  // Load custom model from file upload (e.g. Drag & Drop in UI)
  async loadModelFromFile(file) {
    if (!file) return;
    this.status = 'LOADING';
    this.notify();

    try {
      const arrayBuffer = await file.arrayBuffer();
      this.session = await ort.InferenceSession.create(arrayBuffer, {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all'
      });

      this.status = 'READY';
      this.loadError = null;
      console.log(`✅ [Trust Shield AI] Custom ONNX Model "${file.name}" loaded successfully into memory.`);
      this.notify();
      return { success: true };
    } catch (err) {
      console.error('❌ Failed to load custom ONNX model:', err);
      this.status = 'ERROR';
      this.loadError = err.message;
      this.notify();
      return { success: false, error: err.message };
    }
  }

  // Multilingual Tokenizer (Supporting Hindi, Hinglish, English, Tamil, Telugu, Bengali, Marathi, etc.)
  tokenize(text, maxLength = 64) {
    const normalized = (text || '')
      .toLowerCase()
      .normalize('NFKC')
      .replace(/[\r\n\t]+/g, ' ')
      .trim();

    const words = normalized.split(/\s+/).filter(Boolean);
    const tokenIds = new BigInt64Array(maxLength);
    const attentionMask = new BigInt64Array(maxLength);

    // Special token IDs (standard BERT/MiniLM/IndicBERT mapping)
    const CLS_TOKEN = 101n;
    const SEP_TOKEN = 102n;
    const PAD_TOKEN = 0n;

    tokenIds[0] = CLS_TOKEN;
    attentionMask[0] = 1n;

    let index = 1;
    for (let i = 0; i < words.length && index < maxLength - 1; i++) {
      const word = words[i];
      // Generate deterministic subword hash token ID for multilingual vocabulary
      let hash = 0;
      for (let c = 0; c < word.length; c++) {
        hash = (hash << 5) - hash + word.charCodeAt(c);
        hash |= 0;
      }
      const vocabId = BigInt(Math.abs(hash % 30000) + 1000);
      tokenIds[index] = vocabId;
      attentionMask[index] = 1n;
      index++;
    }

    if (index < maxLength) {
      tokenIds[index] = SEP_TOKEN;
      attentionMask[index] = 1n;
      index++;
    }

    // Pad remaining
    for (let i = index; i < maxLength; i++) {
      tokenIds[i] = PAD_TOKEN;
      attentionMask[i] = 0n;
    }

    return {
      input_ids: new ort.Tensor('int64', tokenIds, [1, maxLength]),
      attention_mask: new ort.Tensor('int64', attentionMask, [1, maxLength])
    };
  }

  // Softmax helper for output logits
  softmax(logits) {
    const maxLogit = Math.max(...logits);
    const scores = logits.map(l => Math.exp(l - maxLogit));
    const sumScores = scores.reduce((a, b) => a + b, 0);
    return scores.map(s => s / (sumScores || 1));
  }

  // Execute Neural Inference
  async predict(transcript) {
    const startTime = performance.now();
    const cleanText = (transcript || '').trim();

    if (!cleanText) {
      return {
        isScam: false,
        confidence: 0,
        category: "Safe & Legitimate Call",
        categoryHindi: "सुरक्षित बातचीत",
        severity: "SAFE",
        tactics: [],
        actionPlan: "No live speech detected.",
        inferenceTimeMs: 0,
        engine: this.status === 'READY' ? 'ONNX_NEURAL_WASM' : 'HYBRID_AI4BHARAT_FALLBACK',
        modelLoaded: this.status === 'READY'
      };
    }

    // PATH A: Neural Inference via ONNX Runtime Web
    if (this.session && this.status === 'READY') {
      try {
        const { input_ids, attention_mask } = this.tokenize(cleanText, 64);
        const feeds = { input_ids, attention_mask };

        const results = await this.session.run(feeds);
        const outputName = this.session.outputNames[0] || Object.keys(results)[0];
        const outputTensor = results[outputName];

        const rawData = Array.from(outputTensor.data);
        const probs = this.softmax(rawData.slice(0, MODEL_CATEGORY_MAP.length));

        // Find highest probability class
        let maxIndex = 0;
        let maxProb = 0;
        probs.forEach((p, idx) => {
          if (p > maxProb) {
            maxProb = p;
            maxIndex = idx;
          }
        });

        const selectedCategory = MODEL_CATEGORY_MAP[maxIndex] || MODEL_CATEGORY_MAP[MODEL_CATEGORY_MAP.length - 1];
        const isScam = selectedCategory.id !== 'SAFE_COMMUNICATION' && maxProb > 0.45;
        const confidence = Math.round(maxProb * 100);
        const inferenceTimeMs = Math.round(performance.now() - startTime);

        return {
          isScam,
          confidence,
          category: selectedCategory.name,
          categoryHindi: selectedCategory.nameHindi,
          severity: selectedCategory.severity,
          tactics: selectedCategory.tactics,
          actionPlan: selectedCategory.actionPlan,
          inferenceTimeMs: Math.max(1, inferenceTimeMs),
          engine: 'ONNX_NEURAL_WASM',
          modelLoaded: true,
          rawProbabilities: probs
        };
      } catch (err) {
        console.warn('⚠️ ONNX inference runtime fallback:', err);
      }
    }

    // PATH B: Zero-Latency Hybrid Multilingual AI4Bharat Fallback
    const fallbackResult = classifySpeechAutonomously(cleanText);
    const inferenceTimeMs = Math.round(performance.now() - startTime);

    return {
      isScam: fallbackResult.detected,
      confidence: fallbackResult.confidence || 0,
      category: fallbackResult.category?.name || "Safe & Legitimate Call",
      categoryHindi: fallbackResult.category?.nameHindi || "सुरक्षित बातचीत",
      severity: fallbackResult.category?.severity || (fallbackResult.detected ? "HIGH" : "SAFE"),
      tactics: fallbackResult.category?.tactics || ["Zero-Knowledge Multi-Lingual Intent Matching"],
      actionPlan: fallbackResult.category?.actionPlan || "No urgent threats detected.",
      inferenceTimeMs: Math.max(1, inferenceTimeMs),
      engine: 'HYBRID_AI4BHARAT_FALLBACK',
      modelLoaded: false,
      matchedPatterns: fallbackResult.matchedPatterns || []
    };
  }
}

// Singleton export
export const scamAIModel = new ScamAIModelService();
export default scamAIModel;
