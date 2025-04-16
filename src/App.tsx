import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import ManageUsers from "./pages/ManageUsers";
import ManageExpenses from "./pages/ManageTransactionAndSales";
import { ReactNode } from "react";
import { useAuth } from "./context/AuthContext";
import SignInForm from "./components/auth/SignInForm";
import SalesReport from "./pages/SalesReport";
import CustomerFrequencyReport from "./pages/CustomerFrequencyReport";
import ManageTransactions from "./pages/ManageTransactionAndSales";
import ManageServideStatus from "./pages/ManageServiceStatus";
import TransactionLookup from "./components/TransactionLookup";

const PrivateRoute = ({ element }: { element: ReactNode }) => {
  const { user } = useAuth();
  return user ? element : <Navigate to="/" />;
};
export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route path="/transaction-lookup" element={<TransactionLookup />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<PrivateRoute element={<Home />} />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route
              path="/users"
              element={<PrivateRoute element={<ManageUsers />} />}
            />
            <Route
              path="/transactions"
              element={<PrivateRoute element={<ManageTransactions />} />}
            />
            <Route
              path="/status"
              element={<PrivateRoute element={<ManageServideStatus />} />}
            />
            <Route path="/calendar" element={<Calendar />} />

            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Generate Report */}
            <Route path="/generate-report/sales" element={<SalesReport />} />
            <Route
              path="/generate-report/customer-frequency"
              element={<CustomerFrequencyReport />}
            />
            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
