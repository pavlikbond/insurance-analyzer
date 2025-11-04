import type { Report } from "@/types/report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReportViewProps {
  report: Report;
}

export function ReportView({ report }: ReportViewProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              {new Date(report.previousPolicy.coverageStart).toLocaleDateString()} Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{report.previousPolicy.originalFileName}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              {new Date(report.newPolicy.coverageStart).toLocaleDateString()} Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{report.newPolicy.originalFileName}</p>
          </CardContent>
        </Card>
      </div>

      {report.comparisonResult && (
        <div className="prose prose-sm max-w-none">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{report.comparisonResult}</p>
        </div>
      )}
    </div>
  );
}
