
export interface QuestionResponse {
  questionNumber: string;
  originalText: string;
  confidence: number;
}

export interface OcrResult {
  id: string;
  imageUrl: string;
  fileName: string;
  responses: QuestionResponse[];
  timestamp: number;
}

export interface EvaluationResult {
  cer: number;
  wer: number;
  groundTruth: string;
  ocrOutput: string;
  levenshteinDistance: number;
}

export interface ReferenceItem {
  doc_id: string;
  question_id: string | null;
  reference_text: string;
}

export interface AppState {
  currentResult: OcrResult | null;
  history: OcrResult[];
  isLoading: boolean;
  error: string | null;
  referenceData: ReferenceItem[];
}
