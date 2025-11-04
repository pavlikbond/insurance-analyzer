import { Link } from "react-router-dom";
import { useReports } from "@/hooks/useReport";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

export function Reports() {
  const { data: reportsData, isLoading } = useReports();

  const reports = reportsData?.reports || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground mt-2">Compare policies year-over-year to see what changed</p>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading reports...</div>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No reports yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Upload policies and they will be automatically compared with previous year's policies
            </p>
            <Link to="/policies">
              <Button>View Policies</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {new Date(report.previousPolicy.coverageStart).toLocaleDateString()} →{" "}
                      {new Date(report.newPolicy.coverageStart).toLocaleDateString()}
                    </CardTitle>
                    <CardDescription>
                      Report between {report.previousPolicy.originalFileName} and {report.newPolicy.originalFileName}
                    </CardDescription>
                  </div>
                  <Link to={`/reports/${report.id}`}>
                    <Button variant="outline">View Details</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">{report.summary}</p>
                  {report.changesDetected && (
                    <div className="flex gap-2 pt-2">
                      {report.changesDetected.premiumChanges && (
                        <Badge variant="secondary">
                          Premium: {report.changesDetected.premiumChanges.change > 0 ? "+" : ""}
                          {report.changesDetected.premiumChanges.change}%
                        </Badge>
                      )}
                      {report.changesDetected.deductibleChanges && (
                        <Badge variant="secondary">
                          Deductible: {report.changesDetected.deductibleChanges.change > 0 ? "+" : ""}
                          {report.changesDetected.deductibleChanges.change}%
                        </Badge>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground pt-2">
                    Created: {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
