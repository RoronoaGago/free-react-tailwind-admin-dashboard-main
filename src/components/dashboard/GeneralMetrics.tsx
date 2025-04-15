import { formatCurrency } from "@/lib/helpers";
import { ReceiptIcon, SalesIcon } from "../../icons";
import { useEffect, useState } from "react";

export default function GeneralMetrics() {
  const [metrics, setMetrics] = useState({
    total_sales: 0,
    total_transactions: 0,
    ongoing_services: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/api/dashboard/metrics/"
        );
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return <div>Loading metrics...</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-3 md:gap-6">
      {/* Total Sales */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <SalesIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Sales
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              ₱{formatCurrency(metrics.total_sales)}
            </h4>
          </div>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            This Month
          </span>
        </div>
      </div>

      {/* Total Transactions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <ReceiptIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Transactions
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {metrics.total_transactions.toLocaleString()}
            </h4>
          </div>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            This Month
          </span>
        </div>
      </div>

      {/* Ongoing Services */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <SalesIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Ongoing Services
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {metrics.ongoing_services}
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
}
