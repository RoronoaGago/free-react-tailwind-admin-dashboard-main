import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";

import { today, getLocalTimeZone } from "@internationalized/date";
import { DateRangePicker } from "@/components/common/DateRangePicker";
import { DatePicker } from "@/components/common/DatePicker";
import GeneralMetrics from "@/components/dashboard/GeneralMetrics";
import CustomerFrequencyStatistics from "@/components/customer-frequency-report/CustomerFrequencyStatistics";
import CustomerFrequencyStatisticsForTheLast30Days from "@/components/dashboard/CustomerFrequencyStatisticsForTheLast30days";
import CustomerFrequencyStatisticsForTheMonth from "@/components/dashboard/CustomerFrequencyStatisticsForTheLast30days";

export default function Home() {
  return (
    <>
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-12">
          <GeneralMetrics />
        </div>
        <div className="col-span-12">
          <CustomerFrequencyStatisticsForTheMonth />

        </div>

        {/* <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div> */}
      </div>
    </>
  );
}
