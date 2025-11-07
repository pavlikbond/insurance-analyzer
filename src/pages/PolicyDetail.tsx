import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { usePolicy } from "@/hooks/usePolicies";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useCreateAnalysis } from "@/hooks/useReport";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, ArrowLeft, FileText, Sparkles, Loader2 } from "lucide-react";
import { AnalysisDisplay } from "@/components/analysis/AnalysisDisplay";
import { exportMarkdownToPDF } from "@/lib/pdf-export";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function PolicyDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: policy, isLoading, refetch: refetchPolicy } = usePolicy(id!);
  const { data: analysis, isLoading: isAnalysisLoading, refetch: refetchAnalysis } = useAnalysis(id!);
  const createAnalysis = useCreateAnalysis();
  const [activeTab, setActiveTab] = useState("analysis");
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPolicy = async () => {
    if (!policy?.s3Url) {
      toast.error("Download URL not available");
      return;
    }
    window.open(policy.s3Url, "_blank");
  };

  const handleDownloadAnalysisPDF = async () => {
    if (!analysis?.analysisResult) {
      toast.error("No analysis content available to download");
      return;
    }

    setIsExporting(true);
    try {
      const filename = `${policy?.originalFileName.replace(/\.[^/.]+$/, "")}_analysis.pdf`;
      await exportMarkdownToPDF(analysis.analysisResult, filename);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateAnalysis = async () => {
    if (!policy?.id) {
      toast.error("Policy ID not available");
      return;
    }

    try {
      await createAnalysis.mutateAsync({ policyId: policy.id });
      toast.success("Analysis generation started! This may take a few moments.");

      // The queries will be invalidated automatically by the mutation
      // Refetch to update the UI immediately
      refetchPolicy();
      refetchAnalysis();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate analysis");
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading policy...</div>;
  }

  if (!policy) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">Policy not found</p>
        <Link to="/policies" className={cn(buttonVariants({ variant: "outline" }))}>
          Back to Policies
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button above header on mobile */}
      <div className="md:hidden">
        <Link to="/policies" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Back button for desktop */}
          <Link to="/policies" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden md:flex")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{policy.originalFileName}</h1>
              <Button
                onClick={handleDownloadPolicy}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="Download Policy PDF"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-muted-foreground mt-1">Policy details and analysis</p>
          </div>
        </div>
      </div>

      {/* Mobile: Combined card */}
      <Card className="md:hidden">
        <CardHeader>
          <CardTitle className="text-lg">Policy Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Status</p>
              <StatusChip status={policy.status} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Coverage Period</p>
              <p className="text-lg font-bold">
                {new Date(policy.coverageStart).toLocaleDateString()}
                {policy.coverageEnd && ` - ${new Date(policy.coverageEnd).toLocaleDateString()}`}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Uploaded</p>
              <p className="text-sm">{new Date(policy.uploadedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Desktop: Separate cards */}
      <div className="hidden gap-4 md:grid md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusChip status={policy.status} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Coverage Period</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">
              {new Date(policy.coverageStart).toLocaleDateString()}
              {policy.coverageEnd && ` - ${new Date(policy.coverageEnd).toLocaleDateString()}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Uploaded</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{new Date(policy.uploadedAt).toLocaleDateString()}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          {activeTab === "analysis" && analysis && (
            <Button onClick={handleDownloadAnalysisPDF} disabled={isExporting} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? "Generating PDF..." : "Download PDF"}
            </Button>
          )}
        </div>

        <TabsContent value="analysis" className="space-y-4">
          {isAnalysisLoading ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Loader2 className="mx-auto h-12 w-12 mb-4 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading analysis...</p>
              </CardContent>
            </Card>
          ) : analysis ? (
            <AnalysisDisplay analysis={analysis} policyId={policy.id} />
          ) : policy.status === "processing" ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Loader2 className="mx-auto h-12 w-12 mb-4 animate-spin text-primary" />
                <p className="text-muted-foreground">Analysis is being generated...</p>
                <p className="text-sm text-muted-foreground mt-2">This may take a few moments</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Analysis Available</CardTitle>
                <CardDescription>
                  Generate an AI-powered analysis of your insurance policy to get detailed insights
                </CardDescription>
              </CardHeader>
              <CardContent className="py-8 text-center space-y-4">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <p className="text-muted-foreground">Analysis will include:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 text-left max-w-md mx-auto">
                    <li>• Executive summary of your policy</li>
                    <li>• Key terms and conditions</li>
                    <li>• Coverage details and exclusions</li>
                    <li>• Premium information</li>
                    <li>• Potential issues and recommendations</li>
                  </ul>
                </div>
                <Button onClick={handleGenerateAnalysis} disabled={createAnalysis.isPending} className="mt-4" size="lg">
                  {createAnalysis.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Analysis...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Analysis
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Policy Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">File Name</p>
                <p>{policy.originalFileName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">File Size</p>
                <p>{(policy.fileSize / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              {policy.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="whitespace-pre-wrap">{policy.description}</p>
                </div>
              )}
              {policy.processedAt && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Processed At</p>
                  <p>{new Date(policy.processedAt).toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
