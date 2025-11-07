import { Link } from "react-router-dom";
import { useReports } from "@/hooks/useReport";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import { Button } from "@/components/ui/button";
import { BarChart3, FileText } from "lucide-react";

export function Reports() {
  const { data: reportsData, isLoading } = useReports();

  const reports = reportsData?.reports || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground mt-2">AI-generated analysis reports for your insurance policies</p>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading reports...</div>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No reports yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Upload a policy and generate an analysis to get detailed insights about your coverage
            </p>
            <Link to="/policies">
              <Button>View Policies</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          {reports.map((report) => (
            <Card key={report.id} className="py-3">
              <div className="px-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <CardTitle className="text-base font-semibold truncate">
                        {report.policy.originalFileName}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <CardDescription className="text-xs m-0">
                        {new Date(report.policy.coverageStart).toLocaleDateString()}
                        {report.policy.coverageEnd && ` - ${new Date(report.policy.coverageEnd).toLocaleDateString()}`}
                      </CardDescription>
                      <StatusChip status={report.policy.status} className="text-xs" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Link to={`/reports/${report.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
