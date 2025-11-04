import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUploadPolicy } from "@/hooks/usePolicies";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Upload as UploadIcon, FileText, X } from "lucide-react";
import { toast } from "sonner";

const uploadSchema = z.object({
  file: z.instanceof(File, { message: "Please select a PDF file" }),
  coverageStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD"),
  coverageEnd: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD")
    .optional(),
  description: z.string().optional(),
});

type UploadForm = z.infer<typeof uploadSchema>;

export function Upload() {
  const navigate = useNavigate();
  const uploadPolicy = useUploadPolicy();
  const [dragActive, setDragActive] = useState(false);

  const form = useForm<UploadForm>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      coverageStart: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
      coverageEnd: undefined,
      description: undefined,
    },
  });

  const fileValue = form.watch("file");
  const coverageStart = form.watch("coverageStart");
  const prevStartDateRef = useRef<string | undefined>(coverageStart);

  // Auto-calculate coverage end date when start date changes
  useEffect(() => {
    if (coverageStart) {
      const startDate = new Date(coverageStart);
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
      endDate.setDate(endDate.getDate() - 1); // Subtract 1 day to make it 364 days
      const calculatedEndDate = endDate.toISOString().split("T")[0];

      const currentEndDate = form.getValues("coverageEnd");
      const prevStartDate = prevStartDateRef.current;

      // If start date changed, check if we should update the end date
      if (prevStartDate && prevStartDate !== coverageStart) {
        // Calculate what the end date should have been from the previous start date
        const prevStart = new Date(prevStartDate);
        const prevEnd = new Date(prevStart);
        prevEnd.setFullYear(prevEnd.getFullYear() + 1);
        prevEnd.setDate(prevEnd.getDate() - 1); // Subtract 1 day to make it 364 days
        const prevEndStr = prevEnd.toISOString().split("T")[0];

        // If current end date matches the previous auto-calculated value, update it
        // Otherwise, it was manually set by the user, so leave it alone
        if (currentEndDate === prevEndStr) {
          form.setValue("coverageEnd", calculatedEndDate);
        }
      } else if (!currentEndDate) {
        // If end date is not set, set it to the calculated value
        form.setValue("coverageEnd", calculatedEndDate);
      }

      // Update the ref to track the current start date for the next change
      prevStartDateRef.current = coverageStart;
    }
  }, [coverageStart, form]);

  const onSubmit = async (data: UploadForm) => {
    try {
      await uploadPolicy.mutateAsync({
        file: data.file,
        coverageStart: data.coverageStart,
        coverageEnd: data.coverageEnd,
        description: data.description,
      });
      toast.success('Policy uploaded successfully! Select policies and click "Get Report" to analyze.');
      navigate("/policies");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload policy");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" && file.size <= 10 * 1024 * 1024) {
        form.setValue("file", file);
      } else if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
      } else {
        toast.error("Please upload a PDF file");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-5xl font-bold">Upload Policy</h1>
        <p className="text-muted-foreground mt-2">
          Upload your insurance policy PDF. Policies are uploaded but not automatically analyzed. Select policies and
          click "Get Report" to analyze them.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Policy Upload</CardTitle>
          <CardDescription>Upload a PDF file and specify the coverage dates</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="file"
                render={() => (
                  <FormItem>
                    <FormLabel>PDF File</FormLabel>
                    <FormControl>
                      <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        {fileValue ? (
                          <div className="space-y-2">
                            <FileText className="mx-auto h-12 w-12 text-primary" />
                            <p className="font-medium">{fileValue.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(fileValue.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                form.setValue("file", undefined as unknown as File);
                                form.resetField("file");
                              }}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <UploadIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                            <div>
                              <label htmlFor="file-upload" className="cursor-pointer text-primary hover:underline">
                                Click to upload
                              </label>
                              <span className="text-muted-foreground"> or drag and drop</span>
                            </div>
                            <p className="text-sm text-muted-foreground">PDF files only, max 10MB</p>
                            <input
                              id="file-upload"
                              type="file"
                              accept=".pdf"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  const file = e.target.files[0];
                                  if (file.type === "application/pdf" && file.size <= 10 * 1024 * 1024) {
                                    form.setValue("file", file);
                                  } else if (file.size > 10 * 1024 * 1024) {
                                    toast.error("File size must be less than 10MB");
                                  } else {
                                    toast.error("Please upload a PDF file");
                                  }
                                }
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coverageStart"
                render={({ field }) => {
                  // Calculate max date: 1 year from today
                  const maxDate = new Date();
                  maxDate.setFullYear(maxDate.getFullYear() + 1);

                  return (
                    <FormItem>
                      <FormLabel>Coverage Start Date *</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select start date"
                          maxDate={maxDate}
                        />
                      </FormControl>
                      <FormDescription>The date when coverage begins (required)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="coverageEnd"
                render={({ field }) => {
                  // Only restrict to not be before start date
                  const minDate = coverageStart ? new Date(coverageStart + "T00:00:00") : undefined;

                  return (
                    <FormItem>
                      <FormLabel>Coverage End Date (Optional)</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select end date"
                          minDate={minDate}
                        />
                      </FormControl>
                      <FormDescription>
                        The date when coverage ends (optional, defaults to 364 days from start date)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter a description for this policy (optional)"
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormDescription>Optional description or notes about this policy</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={uploadPolicy.isPending}>
                {uploadPolicy.isPending ? "Uploading..." : "Upload Policy"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
