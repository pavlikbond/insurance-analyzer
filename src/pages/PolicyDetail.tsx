import { useParams, Link } from "react-router-dom";
import { usePolicy } from "@/hooks/usePolicies";
import { useAnalysis } from "@/hooks/useAnalysis";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, ArrowLeft, FileText } from "lucide-react";
import { AnalysisDisplay } from "@/components/analysis/AnalysisDisplay";
import { toast } from "sonner";

export function PolicyDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: policy, isLoading } = usePolicy(id!);
  const { data: analysis } = useAnalysis(id!);

  const handleDownload = async () => {
    if (!policy?.s3Url) {
      toast.error("Download URL not available");
      return;
    }
    window.open(policy.s3Url, "_blank");
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading policy...</div>;
  }

  if (!policy) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">Policy not found</p>
        <Link to="/policies">
          <Button variant="outline">Back to Policies</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/policies">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{policy.originalFileName}</h1>
            <p className="text-muted-foreground mt-1">Policy details and analysis</p>
          </div>
        </div>
        <Button onClick={handleDownload} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={
                policy.status === "analyzed"
                  ? "default"
                  : policy.status === "processing"
                  ? "secondary"
                  : policy.status === "failed"
                  ? "destructive"
                  : "outline"
              }
            >
              {policy.status}
            </Badge>
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

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="analysis" disabled={policy.status !== "analyzed"}>
            Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Policy Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">File Name</p>
                <p>{policy.fileName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Original File Name</p>
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

        <TabsContent value="analysis" className="space-y-4">
          {analysis ? (
            <AnalysisDisplay analysis={analysis} policyId={policy.id} />
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4" />
                <p>Analysis not available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

