import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { queryClient } from "@/lib/queryClient";
import { AppLayout } from "@/components/layout/AppLayout";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SignIn } from "@/pages/SignIn";
import { SignUp } from "@/pages/SignUp";
import { Home } from "@/pages/Home";
import { Dashboard } from "@/pages/Dashboard";
import { Policies } from "@/pages/Policies";
import { PolicyDetail } from "@/pages/PolicyDetail";
import { Upload } from "@/pages/Upload";
import { Reports } from "@/pages/Reports";
import { ReportDetail } from "@/pages/ReportDetail";
import { Billing } from "@/pages/Billing";
import { Settings } from "@/pages/Settings";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Home page - uses AppLayout when authenticated, LandingLayout when not */}
          <Route element={<ConditionalLayout />}>
            <Route path="/" element={<Home />} />
          </Route>

          {/* Auth pages - use AppLayout with Header */}
          <Route element={<AppLayout />}>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Route>

          {/* Protected app routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/policies/:id" element={<PolicyDetail />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/:id" element={<ReportDetail />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
