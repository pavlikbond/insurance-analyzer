import type { Policy } from "./policy";

export interface Report {
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
  comparisonResult?: string;
  createdAt: string;
}

export interface ReportsResponse {
  reports: Report[];
  total: number;
}

export interface CreateReportRequest {
  newPolicyId: string;
  previousPolicyId?: string;
}

export interface CreateReportResponse {
  reportId: string;
  previousPolicyId: string;
  newPolicyId: string;
  status: string;
  message: string;
}
