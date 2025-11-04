import { useState } from "react";
import { Link } from "react-router-dom";
import { usePolicies } from "@/hooks/usePolicies";
import { useBatchAnalysis } from "@/hooks/usePolicies";
import { useDeletePolicy } from "@/hooks/usePolicies";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Upload, Trash2, FileSearch } from "lucide-react";
import { toast } from "sonner";

export function Policies() {
  const [selectedPolicies, setSelectedPolicies] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<string | null>(null);

  const { data: policiesData, isLoading } = usePolicies();
  const batchAnalysis = useBatchAnalysis();
  const deletePolicy = useDeletePolicy();

  const policies = policiesData?.policies || [];

  const toggleSelect = (policyId: string) => {
    const newSelected = new Set(selectedPolicies);
    if (newSelected.has(policyId)) {
      newSelected.delete(policyId);
    } else {
      newSelected.add(policyId);
    }
    setSelectedPolicies(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedPolicies.size === policies.length) {
      setSelectedPolicies(new Set());
    } else {
      setSelectedPolicies(new Set(policies.map((p) => p.id)));
    }
  };

  const handleGetReport = async () => {
    if (selectedPolicies.size === 0) {
      toast.error("Please select at least one policy");
      return;
    }

    try {
      await batchAnalysis.mutateAsync({
        policyIds: Array.from(selectedPolicies),
      });
      toast.success("Analysis started for selected policies. You will be notified when complete.");
      setSelectedPolicies(new Set());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start analysis");
    }
  };

  const handleDeleteClick = (policyId: string) => {
    setPolicyToDelete(policyId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!policyToDelete) return;

    try {
      await deletePolicy.mutateAsync(policyToDelete);
      toast.success("Policy deleted successfully");
      setDeleteDialogOpen(false);
      setPolicyToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete policy");
    }
  };

  const uploadedPolicies = policies.filter((p) => p.status === "uploaded");
  const canAnalyze =
    selectedPolicies.size > 0 && Array.from(selectedPolicies).every((id) => uploadedPolicies.some((p) => p.id === id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Policies</h1>
          <p className="text-muted-foreground mt-2">Manage and analyze your insurance policies</p>
        </div>
        <Link to="/upload">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Policy
          </Button>
        </Link>
      </div>

      {selectedPolicies.size > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {selectedPolicies.size} policy{selectedPolicies.size !== 1 ? "ies" : ""} selected
                </p>
                <p className="text-sm text-muted-foreground">Click "Get Report" to analyze selected policies</p>
              </div>
              <Button onClick={handleGetReport} disabled={!canAnalyze || batchAnalysis.isPending}>
                <FileSearch className="mr-2 h-4 w-4" />
                Get Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Policies</CardTitle>
          <CardDescription>Select policies and click "Get Report" to analyze them</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading policies...</div>
          ) : policies.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No policies yet</p>
              <Link to="/upload">
                <Button>Upload Your First Policy</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedPolicies.size === policies.length && policies.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Coverage Period</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedPolicies.has(policy.id)}
                        onCheckedChange={() => toggleSelect(policy.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link to={`/policies/${policy.id}`} className="hover:underline">
                        {policy.originalFileName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {new Date(policy.coverageStart).toLocaleDateString()}
                      {policy.coverageEnd && ` - ${new Date(policy.coverageEnd).toLocaleDateString()}`}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{policy.description || "—"}</TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>{new Date(policy.uploadedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(policy.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Policy</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this policy? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deletePolicy.isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deletePolicy.isPending}>
              {deletePolicy.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
