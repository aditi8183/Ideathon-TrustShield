import scamAIModel, { MODEL_CATEGORY_MAP } from './scamAIModel.js';

export interface ScamAIInferenceResult {
  isScam: boolean;
  confidence: number;
  category: string;
  categoryHindi: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'SAFE';
  tactics: string[];
  actionPlan: string;
  inferenceTimeMs: number;
  engine: 'ONNX_NEURAL_WASM' | 'HYBRID_AI4BHARAT_FALLBACK';
  modelLoaded: boolean;
  matchedPatterns?: string[];
  rawProbabilities?: number[];
}

export { MODEL_CATEGORY_MAP };
export default scamAIModel;
