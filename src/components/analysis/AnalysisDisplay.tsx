import type { Analysis } from "@/types/policy";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { HumanReviewUpsell } from "@/components/billing/HumanReviewUpsell";

interface AnalysisDisplayProps {
  analysis: Analysis;
  policyId: string;
}

export function AnalysisDisplay({ analysis, policyId }: AnalysisDisplayProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{analysis.summary}</p>
        </CardContent>
      </Card>

      {analysis.keyTerms && (
        <Card>
          <CardHeader>
            <CardTitle>Key Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.keyTerms.deductible && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Deductible</p>
                <p className="text-lg font-semibold">
                  {analysis.keyTerms.deductible.currency} {analysis.keyTerms.deductible.amount.toLocaleString()}
                </p>
              </div>
            )}
            {analysis.keyTerms.coverageLimit && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Coverage Limit</p>
                <p className="text-lg font-semibold">
                  {analysis.keyTerms.coverageLimit.currency} {analysis.keyTerms.coverageLimit.amount.toLocaleString()}
                </p>
              </div>
            )}
            {analysis.keyTerms.coverageTypes && analysis.keyTerms.coverageTypes.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Coverage Types</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.keyTerms.coverageTypes.map((type) => (
                    <Badge key={type} variant="secondary">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {analysis.keyTerms.premium && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Premium</p>
                <p className="text-lg font-semibold">
                  {analysis.keyTerms.premium.currency}{" "}
                  {analysis.keyTerms.premium.monthly
                    ? `${analysis.keyTerms.premium.monthly.toLocaleString()}/month`
                    : analysis.keyTerms.premium.annual
                    ? `${analysis.keyTerms.premium.annual.toLocaleString()}/year`
                    : "N/A"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {analysis.exclusions && analysis.exclusions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Exclusions</CardTitle>
            <CardDescription>Items not covered by this policy</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              {analysis.exclusions.map((exclusion, index) => (
                <li key={index} className="text-sm">
                  {exclusion}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {analysis.missedCoverage && analysis.missedCoverage.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Missed Coverage Detected</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {analysis.missedCoverage.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {analysis.coverageGaps && analysis.coverageGaps.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Coverage Gaps Identified</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {analysis.coverageGaps.map((gap, index) => (
                <li key={index}>{gap}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {analysis.hiddenClauses && analysis.hiddenClauses.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Hidden Clauses Warning</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {analysis.hiddenClauses.map((clause, index) => (
                <li key={index}>{clause}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {analysis.commonIssues && analysis.commonIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Common Issues</CardTitle>
            <CardDescription>Common problems identified for this type of coverage</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              {analysis.commonIssues.map((issue, index) => (
                <li key={index} className="text-sm">
                  {issue}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {analysis.roofingSidingCoverage && (
        <Card>
          <CardHeader>
            <CardTitle>Roofing & Siding Coverage</CardTitle>
            <CardDescription>Special focus on roofing and siding coverage analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{analysis.roofingSidingCoverage}</p>
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
