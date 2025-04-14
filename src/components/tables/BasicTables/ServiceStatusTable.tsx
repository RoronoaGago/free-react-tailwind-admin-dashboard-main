import { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Loading } from "@/components/common/Loading";
import Badge from "@/components/ui/badge/Badge";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

// Define the Transaction type based on your Django model
interface Transaction {
  id: number;
  customer: {
    first_name: string;
    last_name: string;
    contact_number: string;
    address: string;
  };
  service_type: string;
  service_type_display: string;
  status: string;
  status_display: string;
  regular_clothes_weight: number;
  jeans_weight: number;
  linens_weight: number;
  comforter_weight: number;
  subtotal: number;
  additional_fee: number;
  grand_total: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export default function ServiceStatusTable() {
  // Data state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Table features state
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Transaction;
    direction: "ascending" | "descending";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/transactions/');
        setTransactions(response.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (transaction) =>
          `${transaction.customer.first_name} ${transaction.customer.last_name}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.id.toString().includes(searchTerm) ||
          transaction.customer.contact_number.includes(searchTerm)
  )}

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.status === statusFilter
      );
    }

    // Apply sorting
    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        // Handle nested customer properties
        if (sortConfig.key === "customer") {
          const aValue = `${a.customer.first_name} ${a.customer.last_name}`;
          const bValue = `${b.customer.first_name} ${b.customer.last_name}`;
          if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
          return 0;
        }

        // Handle regular properties
        const aValue = a[sortConfig.key] ?? "";
        const bValue = b[sortConfig.key] ?? "";
        if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [transactions, searchTerm, statusFilter, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  // Sort handler
  const requestSort = (key: keyof Transaction) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Handle page changes
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      await axios.post(`http://127.0.0.1:8000/api/transactions/${id}/update-status/`, {
        status: newStatus
      });
      toast.success("Status updated successfully!");
      
      // Refresh the transactions list
      const response = await axios.get('http://127.0.0.1:8000/api/transactions/');
      setTransactions(response.data);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // Loading and error states
  if (loading) return <Loading />;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-64">
          <Input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setStatusFilter(e.target.value)
            }
            className="min-w-[180px] px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="ready_for_pickup">Ready for Pickup</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={itemsPerPage.toString()}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
              setItemsPerPage(Number(e.target.value))
            }
            className="min-w-[100px] px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
          >
            <option value="5">5 per page</option>
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  <div
                    className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                    onClick={() => requestSort("id")}
                  >
                    ID
                    <span className="inline-flex flex-col ml-1">
                      <ChevronUp
                        className={`h-3 w-3 transition-colors ${
                          sortConfig?.key === "id" &&
                          sortConfig.direction === "ascending"
                            ? "text-primary-500 dark:text-primary-400"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      />
                      <ChevronDown
                        className={`h-3 w-3 -mt-1 transition-colors ${
                          sortConfig?.key === "id" &&
                          sortConfig.direction === "descending"
                            ? "text-primary-500 dark:text-primary-400"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      />
                    </span>
                  </div>
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  <div
                    className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                    onClick={() => requestSort("customer")}
                  >
                    Customer Name
                    <span className="inline-flex flex-col ml-1">
                      <ChevronUp
                        className={`h-3 w-3 transition-colors ${
                          sortConfig?.key === "customer" &&
                          sortConfig.direction === "ascending"
                            ? "text-primary-500 dark:text-primary-400"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      />
                      <ChevronDown
                        className={`h-3 w-3 -mt-1 transition-colors ${
                          sortConfig?.key === "customer" &&
                          sortConfig.direction === "descending"
                            ? "text-primary-500 dark:text-primary-400"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      />
                    </span>
                  </div>
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
                  <div
                    className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                    onClick={() => requestSort("created_at")}
                  >
                    Date Created
                    <span className="inline-flex flex-col ml-1">
                      <ChevronUp
                        className={`h-3 w-3 transition-colors ${
                          sortConfig?.key === "created_at" &&
                          sortConfig.direction === "ascending"
                            ? "text-primary-500 dark:text-primary-400"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      />
                      <ChevronDown
                        className={`h-3 w-3 -mt-1 transition-colors ${
                          sortConfig?.key === "created_at" &&
                          sortConfig.direction === "descending"
                            ? "text-primary-500 dark:text-primary-400"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      />
                    </span>
                  </div>
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Regular Clothes (kg)
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Jeans (kg)
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Beddings (kg)
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Comforter (kg)
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  <div
                    className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                    onClick={() => requestSort("grand_total")}
                  >
                    Grand Total
                    <span className="inline-flex flex-col ml-1">
                      <ChevronUp
                        className={`h-3 w-3 transition-colors ${
                          sortConfig?.key === "grand_total" &&
                          sortConfig.direction === "ascending"
                            ? "text-primary-500 dark:text-primary-400"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      />
                      <ChevronDown
                        className={`h-3 w-3 -mt-1 transition-colors ${
                          sortConfig?.key === "grand_total" &&
                          sortConfig.direction === "descending"
                            ? "text-primary-500 dark:text-primary-400"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      />
                    </span>
                  </div>
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {currentItems.length > 0 ? (
                currentItems.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-gray-400">
                          #{transaction.id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-gray-400">
                          {transaction.customer.first_name} {transaction.customer.last_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      {transaction.customer.contact_number}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      {transaction.regular_clothes_weight}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      {transaction.jeans_weight}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      {transaction.linens_weight}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      {transaction.comforter_weight}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      ₱{transaction.grand_total}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    <Badge
  size="sm"
  color={
    transaction.status === "completed"
      ? "success"  // Green for completed
      : transaction.status === "ready_for_pickup"
      ? "primary"  // Blue for ready for pickup
      : transaction.status === "in_progress"
      ? "info"     // Light blue for in progress
      : transaction.status === "cancelled"
      ? "error"    // Red for cancelled
      : "warning"  // Yellow/orange for pending (default)
  }
>
  {transaction.status_display}
</Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400 space-x-2">
                      <select
                        value={transaction.status}
                        onChange={(e) => handleStatusUpdate(transaction.id, e.target.value)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="ready_for_pickup">Ready for Pickup</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="py-8 text-center text-gray-500" colSpan={11}>
                    No transactions found matching your criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing{" "}
          {currentItems.length > 0
            ? (currentPage - 1) * itemsPerPage + 1
            : 0}{" "}
          to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)}{" "}
          of {filteredTransactions.length} entries
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  variant={currentPage === pageNum ? "primary" : "outline"}
                  size="sm"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            variant="outline"
            size="sm"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
            variant="outline"
            size="sm"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}