import type { Report } from "@/types/report";
import { MarkdownContent } from "@/components/MarkdownContent";

interface ReportViewProps {
  report: Report;
}

export function ReportView({ report }: ReportViewProps) {
  if (!report.analysisResult) {
    return <div className="text-sm text-muted-foreground">No detailed analysis available.</div>;
  }

  return <MarkdownContent content={report.analysisResult} />;
}
