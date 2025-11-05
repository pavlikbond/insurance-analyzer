import { useParams, Link } from "react-router-dom";
import { useReport } from "@/hooks/useReport";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Download } from "lucide-react";
import { ReportView } from "@/components/report/ReportView";
import { HumanReviewUpsell } from "@/components/billing/HumanReviewUpsell";
import { exportMarkdownToPDF } from "@/lib/pdf-export";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: report, isLoading } = useReport(id!);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPDF = async () => {
    if (!report?.analysisResult) {
      toast.error("No analysis content available to download");
      return;
    }

    setIsExporting(true);
    try {
      const filename = `${report.policy.originalFileName.replace(/\.[^/.]+$/, "")}_analysis.pdf`;
      await exportMarkdownToPDF(report.analysisResult, filename);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

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
      {/* Back button above header on mobile */}
      <div className="md:hidden">
        <Link to="/reports" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Back button for desktop */}
          <Link to="/reports" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden md:flex")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-3xl font-bold">{report.policy.originalFileName}</h1>
            </div>
            <p className="text-muted-foreground mt-1">
              Coverage: {new Date(report.policy.coverageStart).toLocaleDateString()}
              {report.policy.coverageEnd && ` - ${new Date(report.policy.coverageEnd).toLocaleDateString()}`}
            </p>
          </div>
        </div>
      </div>

      {/* Download button below header */}
      {report.analysisResult && (
        <div>
          <Button onClick={handleDownloadPDF} disabled={isExporting} variant="outline" className="w-full md:w-auto">
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Generating PDF..." : "Download PDF"}
          </Button>
        </div>
      )}

      {report.analysisResult && (
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Analysis Report</CardTitle>
            <CardDescription>Comprehensive AI-generated analysis of your insurance policy</CardDescription>
          </CardHeader>
          <CardContent>
            <ReportView report={report} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Request Human Review</CardTitle>
          <CardDescription>Get a professional human review of this analysis for additional insights</CardDescription>
        </CardHeader>
        <CardContent>
          <HumanReviewUpsell policyId={report.policy.id} analysisId={report.id} />
        </CardContent>
      </Card>
    </div>
  );
}
