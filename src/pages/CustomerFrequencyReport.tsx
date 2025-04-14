import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Label from "@/components/form/Label";
import Button from "../components/ui/button/Button";
import React, { useState } from "react";
import CustomerFequencyTable from "@/components/customer-frequency-report/CustomerFrequencyTable";
import CustomerFrequencyStatistics from "@/components/customer-frequency-report/CustomerFrequencyStatistics";
import { DateRangePicker } from "@/components/common/DateRangePicker";
import { getLocalTimeZone, today } from "@internationalized/date";
// import { DateRangePicker } from "@heroui/date-picker";
const CustomerFrequencyReport = () => {
  return (
    <div>
   
      <PageBreadcrumb pageTitle="Customer Frequency Report" />
      <div className="flex w-full justify-between mt-8 mb-8 items-center">
        <div className="flex items-center gap-2">
       <DateRangePicker
               label="Date Range"
               
             />
        </div>
        <Button size="md" variant="primary">
          Generate PDF
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <CustomerFrequencyStatistics />
        </div>
        <div className="col-span-12">
          <ComponentCard title="Top Customers By Frequency">
            <CustomerFequencyTable />
          </ComponentCard>
        </div>
      </div>
    </div>
  );
};

export default CustomerFrequencyReport;
