import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppShell from "./components/shell/AppShell";
import AuthProvider from "./components/AuthProvider";
import { useAuth } from "./lib/auth";
import LoginPage from "./pages/LoginPage";
import Index from "./pages/Index";
import NewReportPage from "./pages/NewReportPage";
import EditReportPage from "./pages/EditReportPage";
import ReportsListPage from "./pages/ReportsListPage";
import ReportViewPage from "./pages/ReportViewPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  // Keep screens cached for a moment so going back is instant.
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1, staleTime: 30_000 } },
});

/** Everything sits behind the PIN screen. */
const AppRoutes = () => {
  const { session } = useAuth();
  if (!session) return <LoginPage />;
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/new/:type" element={<NewReportPage />} />
        <Route path="/reports" element={<ReportsListPage />} />
        <Route path="/reports/:id" element={<ReportViewPage />} />
        <Route path="/reports/:id/edit" element={<EditReportPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner position="top-center" richColors />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
