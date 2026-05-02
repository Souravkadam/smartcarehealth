import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HospitalProvider } from "@/contexts/HospitalContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { UserProvider } from "@/contexts/UserContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Route, Switch } from "wouter";

// Public Pages
import Home from "@/pages/Home";
import HospitalListing from "@/pages/HospitalListing";
import HospitalDetail from "@/pages/HospitalDetail";
import Compare from "@/pages/Compare";
import ServicesComparison from "@/pages/ServicesComparison";
import DoctorsComparison from "@/pages/DoctorsComparison";
import FacilitiesComparison from "@/pages/FacilitiesComparison";
import CostCalculator from "@/pages/CostCalculator";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";

// Admin Pages
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminHospitals from "@/pages/AdminHospitals";
import AdminDoctors from "@/pages/AdminDoctors";
import AdminServices from "@/pages/AdminServices";
import AdminUsers from "@/pages/AdminUsers";
import AdminAppointments from "@/pages/AdminAppointments";
import AdminPayments from "@/pages/AdminPayments";
import MyAppointments from "@/pages/MyAppointments";
import UserProfile from "@/pages/UserProfile";
import DoctorPortal from "@/pages/DoctorPortal";
import BillingPage from "@/pages/BillingPage";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/hospitals" component={HospitalListing} />
      <Route path="/hospital/:id" component={HospitalDetail} />
      <Route path="/compare" component={Compare} />
      <Route path="/compare/services" component={ServicesComparison} />
      <Route path="/compare/doctors" component={DoctorsComparison} />
      <Route path="/compare/facilities" component={FacilitiesComparison} />
      <Route path="/calculator" component={CostCalculator} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/my-appointments" component={MyAppointments} />
      <Route path="/profile" component={UserProfile} />
      <Route path="/doctor-portal" component={DoctorPortal} />
      <Route path="/billing" component={BillingPage} />

      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/hospitals" component={AdminHospitals} />
      <Route path="/admin/doctors" component={AdminDoctors} />
      <Route path="/admin/services" component={AdminServices} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/appointments" component={AdminAppointments} />
      <Route path="/admin/payments" component={AdminPayments} />

      {/* 404 Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <UserProvider>
        <AdminProvider>
          <HospitalProvider>
            <ThemeProvider defaultTheme="light">
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </ThemeProvider>
          </HospitalProvider>
        </AdminProvider>
      </UserProvider>
    </ErrorBoundary>
  );
}

export default App;
