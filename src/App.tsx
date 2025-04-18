import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router";
import { ReactNode } from "react";
import AuthProvider, { useAuth } from "./context/AuthContext";

import AppLayout from "./layout/AppLayout";

// Auth Pages
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";

// Dashboard
import Home from "./pages/Dashboard/Home";

// Management Pages
import ManageUsers from "./pages/ManageUsers";
import ManageTransactions from "./pages/ManageTransactionAndSales";
import ManageServideStatus from "./pages/ManageServiceStatus";

// Reports
import SalesReport from "./pages/SalesReport";
import CustomerFrequencyReport from "./pages/CustomerFrequencyReport";

// Charts

// Others
import UserProfiles from "./pages/UserProfiles";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import NotFound from "./pages/OtherPage/NotFound";
import TransactionLookup from "./components/TransactionLookup";
import Alerts from "./pages/UiElements/Alerts";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import Images from "./pages/UiElements/Images";
import Videos from "./pages/UiElements/Videos";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Badges from "./pages/UiElements/Badges";
import { ScrollToTop } from "./components/common/ScrollToTop";
const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const AuthRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/transaction-lookup" element={<TransactionLookup />} />

      {/* Auth Routes - No layout needed */}
      <Route
        element={
          <AuthRoute>
            <Outlet />
          </AuthRoute>
        }
      >
        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Route>

      {/* Protected Routes - With AppLayout */}
      <Route
        element={
          <PrivateRoute>
            <AppLayout />
            <Outlet />
          </PrivateRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="/profile" element={<UserProfiles />} />
        <Route path="/users" element={<ManageUsers />} />
        <Route path="/transactions" element={<ManageTransactions />} />
        <Route path="/status" element={<ManageServideStatus />} />
        <Route path="/blank" element={<Blank />} />
        <Route path="/form-elements" element={<FormElements />} />
        <Route path="/basic-tables" element={<BasicTables />} />
        <Route path="/generate-report/sales" element={<SalesReport />} />
        <Route
          path="/generate-report/customer-frequency"
          element={<CustomerFrequencyReport />}
        />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/avatars" element={<Avatars />} />
        <Route path="/badge" element={<Badges />} />
        <Route path="/buttons" element={<Buttons />} />
        <Route path="/images" element={<Images />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/line-chart" element={<LineChart />} />
        <Route path="/bar-chart" element={<BarChart />} />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
