import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import RequireAuth from "./components/RequireAuth";
import SignIn from "./pages/AuthPages/SignIn";
import Dashboard from "./pages/Dashboard/Home";
import ManageUsers from "./pages/ManageUsers";
import UserProfiles from "./pages/UserProfiles";
import AppLayout from "./layout/AppLayout";
import ManageTransactions from "./pages/ManageTransactionAndSales";
import ManageServideStatus from "./pages/ManageServiceStatus";
import SalesReport from "./pages/SalesReport";
import CustomerFrequencyReport from "./pages/CustomerFrequencyReport";
import Home from "./pages/Dashboard/Home";
import TransactionLookup from "./components/TransactionLookup";
import FundRequest from "./pages/FundRequest";
import RequestsList from "./pages/RequestList";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<SignIn />} />
          <Route
            path="/transaction-lookup/:transactionId?"
            element={<TransactionLookup />}
          />
          {/* <Route path="/add-user" element={<ManageUsers />} /> */}
          <Route
            element={
              <AppLayout>
                <RequireAuth />
              </AppLayout>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/users" element={<ManageUsers />} />
            <Route
              path="/fund-request/create-fund-request"
              element={<FundRequest />}
            />
            <Route
              path="/fund-request/request-list"
              element={<RequestsList />}
            />
            <Route path="/liquidation" element={<ManageUsers />} />
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/transactions" element={<ManageTransactions />} />
            <Route path="/status" element={<ManageServideStatus />} />
            <Route path="/generate-report/sales" element={<SalesReport />} />
            <Route
              path="/generate-report/customer-frequency"
              element={<CustomerFrequencyReport />}
            />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
