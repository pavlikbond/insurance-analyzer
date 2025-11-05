import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Brain,
  BarChart3,
  Shield,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

export function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>AI-Powered Insurance Analysis</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Understand Your Insurance Policies
              <span className="text-primary"> Instantly</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              Upload your insurance policies and get AI-powered analysis in minutes. Identify coverage gaps, hidden
              clauses, and potential issues before they become problems.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Analyze Your Policy
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/signin">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Already have an account? Sign In
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Start analyzing in minutes</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need to Analyze Insurance Policies
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Powerful AI technology combined with human expertise to help you understand your insurance coverage
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI-Powered Analysis</CardTitle>
                <CardDescription>
                  Advanced AI analyzes your policies to extract key terms, coverage details, and identify potential
                  issues
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Year-over-Year Reports</CardTitle>
                <CardDescription>
                  Automatically compare your current policy with previous years to spot changes in coverage, premiums,
                  and terms
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Coverage Gap Detection</CardTitle>
                <CardDescription>
                  Identify missed coverage areas, hidden clauses, and potential gaps that could leave you unprotected
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Easy Upload</CardTitle>
                <CardDescription>
                  Simply upload your insurance policies. Our system handles the rest, extracting and analyzing all the
                  important information
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Change Detection</CardTitle>
                <CardDescription>
                  Get notified of changes in premiums, deductibles, coverage limits, and terms between policy renewals
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Human Review Available</CardTitle>
                <CardDescription>
                  Optional professional review by licensed insurance experts for additional peace of mind
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/50 py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">Save Time and Money</h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Reading through insurance policies can take hours. Our AI-powered analysis delivers comprehensive
                insights in minutes, helping you make informed decisions about your coverage.
              </p>
              <ul className="space-y-4">
                {[
                  "Identify coverage gaps before you need them",
                  "Spot hidden clauses that could limit your coverage",
                  "Compare policies year-over-year automatically",
                  "Get professional human review when needed",
                ].map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute -inset-4 rounded-lg bg-primary/20 blur-2xl" />
                <Card className="relative">
                  <CardHeader>
                    <CardTitle>Example Analysis</CardTitle>
                    <CardDescription>See what our AI detects</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Deductible</p>
                      <p className="text-2xl font-bold">$1,000</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Coverage Limit</p>
                      <p className="text-2xl font-bold">$500,000</p>
                    </div>
                    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                      <p className="text-sm font-medium text-destructive">⚠️ Coverage Gap Detected</p>
                      <p className="text-xs text-muted-foreground">Roofing and siding coverage may be limited</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Simple, Transparent Pricing</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Choose the plan that works for you. Both plans include unlimited policy uploads and AI analysis.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>AI Analyzer</CardTitle>
                <CardDescription>Perfect for individuals</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {[
                    "Unlimited policy uploads",
                    "AI-powered analysis",
                    "Year-over-year reports",
                    "Coverage gap detection",
                    "Email notifications",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/signup">
                  <Button className="w-full" variant="outline">
                    Analyze Your Policy
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>AI Analyzer Plus</CardTitle>
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Popular
                  </span>
                </div>
                <CardDescription>Everything in AI Analyzer + Human Review</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$49</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {[
                    "Everything in AI Analyzer",
                    "Human review access included",
                    "Priority support",
                    "Professional insurance expert insights",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/signup">
                  <Button className="w-full">
                    Analyze Your Policy
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-24 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Zap className="mx-auto mb-6 h-12 w-12" />
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Ready to Get Started?</h2>
            <p className="mb-8 text-lg text-primary-foreground/90">
              Upload your first policy and see how easy it is to understand your insurance coverage
            </p>
            <Link to="/signup">
              <Button size="lg" variant="secondary">
                Analyze Your Policy
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
