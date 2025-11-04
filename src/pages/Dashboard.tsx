import { Link } from "react-router-dom";
import { usePolicies } from "@/hooks/usePolicies";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, BarChart3, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Dashboard() {
  const { data: policiesData, isLoading: policiesLoading } = usePolicies();
  const { data: user } = useUser();

  const policies = policiesData?.policies || [];
  const analyzedCount = policies.filter((p) => p.status === "analyzed").length;
  const uploadedCount = policies.filter((p) => p.status === "uploaded").length;
  const processingCount = policies.filter((p) => p.status === "processing").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.name || "User"}!</h1>
        <p className="text-muted-foreground mt-2">Manage and analyze your insurance policies</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{policies.length}</div>
            <p className="text-xs text-muted-foreground">
              {analyzedCount} analyzed, {uploadedCount} ready to analyze
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analyzed</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyzedCount}</div>
            <p className="text-xs text-muted-foreground">Policies with analysis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready to Analyze</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uploadedCount}</div>
            <p className="text-xs text-muted-foreground">Pending analysis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processingCount}</div>
            <p className="text-xs text-muted-foreground">Currently processing</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with your policies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/upload">
              <Button className="w-full" variant="default">
                <Upload className="mr-2 h-4 w-4" />
                Upload New Policy
              </Button>
            </Link>
            <Link to="/policies">
              <Button className="w-full" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                View All Policies
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Policies</CardTitle>
            <CardDescription>Your latest uploaded policies</CardDescription>
          </CardHeader>
          <CardContent>
            {policiesLoading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : policies.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No policies yet. Upload your first policy to get started!
              </div>
            ) : (
              <div className="space-y-2">
                {policies.slice(0, 5).map((policy) => (
                  <Link
                    key={policy.id}
                    to={`/policies/${policy.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent"
                  >
                    <div>
                      <div className="font-medium">{policy.originalFileName}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(policy.coverageStart).toLocaleDateString()}
                        {policy.coverageEnd && ` - ${new Date(policy.coverageEnd).toLocaleDateString()}`}
                      </div>
                    </div>
                    <Badge variant={policy.status === "analyzed" ? "default" : "secondary"}>{policy.status}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
