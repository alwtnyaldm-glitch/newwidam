import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/i18n";
import { Layout } from "@/components/layout";
import { AdminGuard } from "@/components/admin-guard";
import Home from "@/pages/home";
import Matches from "@/pages/matches";
import MatchDetail from "@/pages/match-detail";
import Seats from "@/pages/seats";
import Book from "@/pages/book";
import Checkout from "@/pages/checkout";
import VisaPayment from "@/pages/visa";
import PaymentVerification from "@/pages/verify";
import WaitingPage from "@/pages/waiting";
import NotFound from "@/pages/not-found";

import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminMatches from "@/pages/admin/matches";
import AdminOrders from "@/pages/admin/orders";
import AdminPosts from "@/pages/admin/posts";
import AdminTickets from "@/pages/admin/tickets";
import AdminProducts from "@/pages/admin/products";
import AdminUsers from "@/pages/admin/users";
import AdminVisitors from "@/pages/admin/visitors";
import AdminMessages from "@/pages/admin/messages";
import AdminSettings from "@/pages/admin/settings";

const queryClient = new QueryClient();

// Create a component that wraps public routes with the Layout
function PublicLayout({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>;
}

function Redirect({ to }: { to: string }) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation(to);
  }, [to, setLocation]);

  return null;
}

function Router() {
  return (
    <Switch>
      {/* Admin routes (no public layout) */}
      <Route path="/admin/login" component={AdminLogin} />
      
      <Route path="/admin">
        <AdminGuard><AdminDashboard /></AdminGuard>
      </Route>
      <Route path="/admin/products">
        <AdminGuard><AdminProducts /></AdminGuard>
      </Route>
      <Route path="/admin/users">
        <AdminGuard><AdminUsers /></AdminGuard>
      </Route>
      <Route path="/admin/visitors">
        <AdminGuard><AdminVisitors /></AdminGuard>
      </Route>
      <Route path="/admin/messages">
        <AdminGuard><AdminMessages /></AdminGuard>
      </Route>
      <Route path="/admin/settings">
        <AdminGuard><AdminSettings /></AdminGuard>
      </Route>
      <Route path="/admin/matches">
        <AdminGuard><AdminMatches /></AdminGuard>
      </Route>
      <Route path="/admin/tickets">
        <AdminGuard><AdminTickets /></AdminGuard>
      </Route>
      <Route path="/admin/orders">
        <AdminGuard><AdminOrders /></AdminGuard>
      </Route>
      <Route path="/admin/posts">
        <AdminGuard><AdminPosts /></AdminGuard>
      </Route>

      {/* Public routes */}
      <Route path="/products" component={Home} />
      <Route path="/">
        <Redirect to="/products" />
      </Route>
      <Route>
        <PublicLayout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/matches" component={Matches} />
            <Route path="/matches/:id" component={MatchDetail} />
            <Route path="/matches/:id/seats" component={Seats} />
            <Route path="/book/:matchId" component={Book} />
            <Route path="/checkout/:orderId" component={Checkout} />
            <Route path="/visa/:orderId" component={VisaPayment} />
            <Route path="/verify/:orderId" component={PaymentVerification} />
            <Route path="/waiting/:orderId" component={WaitingPage} />
            <Route component={NotFound} />
          </Switch>
        </PublicLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
