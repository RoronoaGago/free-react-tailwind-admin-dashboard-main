import { useEffect, useState, useMemo } from "react";
import { Loading } from "@/components/common/Loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface CustomerFrequencyData {
  id: number;
  first_name: string;
  last_name: string;
  contact_number: string;
  total_transactions: number;
  total_spent: number;
  average_spent: number;
  last_transaction_date: string;
}

interface CustomerFrequencyTableProps {
  data: CustomerFrequencyData[] | null;
  loading: boolean;
  sortBy?: "total_spent" | "total_transactions" | "average_spent"; // Optional sort parameter
}

export default function CustomerFrequencyTable({
  data,
  loading,
  sortBy = "total_transactions", // Default to sorting by total spent
}: CustomerFrequencyTableProps) {
  const [error, setError] = useState<Error | null>(null);

  // Sort the data by the specified field (descending order)
  const sortedData = useMemo(() => {
    if (!data) return null;

    // Create a copy of the array to avoid mutating the original
    return [...data].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [data, sortBy]);

  // Format currency function
  const formatCurrency = (value: string | number): string => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(num);
  };

  // Format date function
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) return <Loading />;
  if (error) return <div>Error fetching customers: {error.message}</div>;
  if (!sortedData || sortedData.length === 0)
    return <div>No customer data available</div>;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] custom-scrollbar">
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1102px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Ranking
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Customer Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Phone
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Total Transactions
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Total Spent
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Average Spent
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Last Transaction
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {sortedData.map((customer, idx) => (
                <TableRow key={customer.id}>
                  <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {customer.first_name} {customer.last_name}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {customer.contact_number}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {customer.total_transactions}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {formatCurrency(customer.total_spent)}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {formatCurrency(customer.average_spent)}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {formatDate(customer.last_transaction_date)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
