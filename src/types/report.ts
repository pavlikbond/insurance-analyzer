import type { Policy } from "./policy";

// Analysis-based Report (single policy analysis)
export interface Report {
  id: string;
  contractId: string;
  policy: Policy;
  aiModel: string;
  aiTokensUsed: number;
  analysisResult: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportsResponse {
  analyses: Report[];
  total: number;
}

export interface CreateAnalysisRequest {
  policyId: string;
}

export interface CreateAnalysisResponse {
  success: boolean;
  analysis: {
    id: string;
    contractId: string;
    aiModel: string;
    aiTokensUsed: number;
    createdAt: string;
  };
}

// Legacy comparison-based report (for future use)
export interface ComparisonReport {
  id: string;
  previousPolicy: Policy;
  newPolicy: Policy;
  summary: string;
  changesDetected?: {
    premiumChanges?: { old: number; new: number; change: number };
    deductibleChanges?: { old: number; new: number; change: number };
    coverageChanges?: string[];
    termChanges?: string[];
  };
  reportResult?: string;
  createdAt: string;
}
