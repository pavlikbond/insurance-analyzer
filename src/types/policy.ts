export type PolicyStatus = "uploaded" | "processing" | "analyzed" | "failed";

export interface Policy {
  id: string;
  fileName: string;
  originalFileName: string;
  coverageStart: string; // ISO 8601 date: YYYY-MM-DD
  coverageEnd?: string; // ISO 8601 date: YYYY-MM-DD (optional)
  description?: string;
  status: PolicyStatus;
  fileSize: number;
  uploadedAt: string;
  processedAt?: string;
  s3Url?: string;
  analysis?: Analysis;
}

export interface PoliciesResponse {
  policies: Policy[];
  total: number;
  limit: number;
  offset: number;
}

export interface UploadPolicyResponse {
  policy: Policy;
  message: string;
}

export interface Analysis {
  id: string;
  policyId: string;
  summary: string;
  keyTerms: {
    deductible?: { amount: number; currency: string };
    coverageLimit?: { amount: number; currency: string };
    coverageTypes?: string[];
    premium?: { monthly?: number; annual?: number; currency: string };
  };
  coverageDetails?: Record<string, unknown>;
  exclusions?: string[];
  premiums?: Record<string, unknown>;
  aiModel: string;
  createdAt: string;
  missedCoverage?: string[];
  coverageGaps?: string[];
  hiddenClauses?: string[];
  commonIssues?: string[];
  roofingSidingCoverage?: string;
}

export interface BatchAnalysisRequest {
  policyIds: string[];
}

export interface BatchAnalysisResponse {
  analyses: Array<{
    policyId: string;
    analysisId: string;
    status: string;
  }>;
  message: string;
}

