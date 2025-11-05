import type { Analysis } from "@/types/policy";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HumanReviewUpsell } from "@/components/billing/HumanReviewUpsell";
import { MarkdownContent } from "@/components/MarkdownContent";

interface AnalysisDisplayProps {
  analysis: Analysis;
  policyId: string;
}

export function AnalysisDisplay({ analysis, policyId }: AnalysisDisplayProps) {
  return (
    <div className="space-y-6">
      {analysis.analysisResult && (
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Analysis Report</CardTitle>
            <CardDescription>Comprehensive AI-generated analysis of your insurance policy</CardDescription>
          </CardHeader>
          <CardContent>
            <MarkdownContent content={analysis.analysisResult} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Request Human Review</CardTitle>
          <CardDescription>Get a professional human review of this analysis for additional insights</CardDescription>
        </CardHeader>
        <CardContent>
          <HumanReviewUpsell policyId={policyId} analysisId={analysis.id} />
        </CardContent>
      </Card>
    </div>
  );
}
