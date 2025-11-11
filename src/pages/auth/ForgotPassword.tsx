import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Check for error query param from reset password redirect
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "invalid_token" || errorParam === "missing_token") {
      setError("The password reset link is invalid or has expired. Please request a new one.");
    }
  }, [searchParams]);

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });


  const onSubmit = async (data: ForgotPasswordForm) => {
    setError(null);
    setIsLoading(true);
    setIsSuccess(false);

    try {
      const { error: forgetPasswordError } = await authClient.forgetPassword({
        email: data.email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (forgetPasswordError) {
        setError(forgetPasswordError.message || "Failed to send password reset email");
        setIsLoading(false);
      } else {
        // Always show success to prevent email enumeration
        setIsSuccess(true);
        setIsLoading(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send password reset email";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="-mx-4 -my-8 flex items-center justify-center px-6" style={{ height: "calc(100vh - 4rem)" }}>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Forgot Password</CardTitle>
          <CardDescription>Enter your email address and we'll send you a password reset link</CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  If an account exists with this email, you'll receive a password reset link shortly. Please check your
                  email and follow the instructions.
                </AlertDescription>
              </Alert>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Didn't receive an email? Check your spam folder or try again.</p>
                <Button variant="outline" onClick={() => setIsSuccess(false)} className="w-full">
                  Send Another Email
                </Button>
                <Link to="/signin" className="block text-sm text-primary hover:underline">
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </Form>
          )}

          {!isSuccess && (
            <div className="mt-4 text-center text-sm">
              <Link to="/signin" className="text-primary hover:underline">
                Back to Sign In
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

