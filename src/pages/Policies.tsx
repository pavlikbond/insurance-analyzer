import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePolicies } from "@/hooks/usePolicies";
import { useDeletePolicy } from "@/hooks/usePolicies";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusChip } from "@/components/ui/status-chip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function Policies() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data: policiesData, isLoading } = usePolicies();
  const deletePolicy = useDeletePolicy();

  const policies = policiesData?.policies || [];

  const handleDeleteClick = (e: React.MouseEvent, policyId: string) => {
    e.stopPropagation();
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

  const handleRowClick = (policyId: string) => {
    navigate(`/policies/${policyId}`);
  };

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

      <Card>
        <CardHeader>
          <CardTitle>All Policies</CardTitle>
          <CardDescription>Click on a policy to view details and generate reports</CardDescription>
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
                  <TableRow
                    key={policy.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(policy.id)}
                  >
                    <TableCell className="font-medium">{policy.originalFileName}</TableCell>
                    <TableCell>
                      {new Date(policy.coverageStart).toLocaleDateString()}
                      {policy.coverageEnd && ` - ${new Date(policy.coverageEnd).toLocaleDateString()}`}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{policy.description || "—"}</TableCell>
                    <TableCell>
                      <StatusChip status={policy.status} />
                    </TableCell>
                    <TableCell>{new Date(policy.uploadedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteClick(e, policy.id)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
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
