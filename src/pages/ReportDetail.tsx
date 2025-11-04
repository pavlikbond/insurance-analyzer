import { useParams, Link } from "react-router-dom";
import { useReport } from "@/hooks/useReport";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ReportView } from "@/components/report/ReportView";
import { HumanReviewUpsell } from "@/components/billing/HumanReviewUpsell";

export function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: report, isLoading } = useReport(id!);

  if (isLoading) {
    return <div className="text-center py-8">Loading report...</div>;
  }

  if (!report) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">Report not found</p>
        <Link to="/reports">
          <Button variant="outline">Back to Reports</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/reports">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {new Date(report.previousPolicy.coverageStart).toLocaleDateString()} →{" "}
              {new Date(report.newPolicy.coverageStart).toLocaleDateString()}
            </h1>
            <p className="text-muted-foreground mt-1">Coverage period report</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{report.summary}</p>
        </CardContent>
      </Card>

      {report.changesDetected && (
        <div className="grid gap-4 md:grid-cols-2">
          {report.changesDetected?.premiumChanges && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Premium Changes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Previous</span>
                    <span className="font-medium">${report.changesDetected.premiumChanges.old.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">New</span>
                    <span className="font-medium">${report.changesDetected.premiumChanges.new.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-medium">Change</span>
                    <Badge
                      variant={
                        report.changesDetected.premiumChanges.change > 0
                          ? "destructive"
                          : report.changesDetected.premiumChanges.change < 0
                          ? "default"
                          : "secondary"
                      }
                      className="gap-1"
                    >
                      {report.changesDetected.premiumChanges.change > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : report.changesDetected.premiumChanges.change < 0 ? (
                        <TrendingDown className="h-3 w-3" />
                      ) : (
                        <Minus className="h-3 w-3" />
                      )}
                      {Math.abs(report.changesDetected.premiumChanges.change)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {report.changesDetected?.deductibleChanges && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Deductible Changes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Previous</span>
                    <span className="font-medium">
                      ${report.changesDetected.deductibleChanges.old.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">New</span>
                    <span className="font-medium">
                      ${report.changesDetected.deductibleChanges.new.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-medium">Change</span>
                    <Badge
                      variant={
                        report.changesDetected.deductibleChanges.change > 0
                          ? "destructive"
                          : report.changesDetected.deductibleChanges.change < 0
                          ? "default"
                          : "secondary"
                      }
                      className="gap-1"
                    >
                      {report.changesDetected.deductibleChanges.change > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : report.changesDetected.deductibleChanges.change < 0 ? (
                        <TrendingDown className="h-3 w-3" />
                      ) : (
                        <Minus className="h-3 w-3" />
                      )}
                      {Math.abs(report.changesDetected.deductibleChanges.change)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {report.changesDetected?.coverageChanges && report.changesDetected.coverageChanges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Coverage Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              {report.changesDetected.coverageChanges.map((change, index) => (
                <li key={index} className="text-sm">
                  {change}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {report.changesDetected?.termChanges && report.changesDetected.termChanges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Term Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              {report.changesDetected.termChanges.map((change, index) => (
                <li key={index} className="text-sm">
                  {change}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {report.comparisonResult && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Report</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportView report={report} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Request Human Review</CardTitle>
          <CardDescription>Get a professional human review of this report for additional insights</CardDescription>
        </CardHeader>
        <CardContent>
          <HumanReviewUpsell policyId={report.newPolicy.id} comparisonId={report.id} />
        </CardContent>
      </Card>
    </div>
  );
}
