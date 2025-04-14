import ComponentCard from "../components/common/ComponentCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import Button from "../components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { useState } from "react";
import { cn } from "@/lib/utils";
import TransactionsTable from "@/components/tables/BasicTables/TransactionAndSalesTable";
import ServiceStatusTable from "@/components/tables/BasicTables/ServiceStatusTable";
import SearchTableComponentCard from "@/components/common/SearchTableComponentCard";

// Define the type for the form data

const ManageServideStatus = () => {
  return (
    <div>
      <PageBreadcrumb pageTitle="Manage Service Status" />
      <div className="space-y-6">
        <div className="flex w-full justify-end mt-8"></div>
        
          <ServiceStatusTable />
        
      </div>
    </div>
  );
};

export default ManageServideStatus;
