import React, { useEffect, useState, useMemo } from "react";
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
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import Label from "@/components/form/Label";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

interface Transaction {
  id: number;
  customer: {
    id: number;
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

const serviceTypes = [
  { value: "standard", label: "Standard (6-8 hours)", additionalFee: 0 },
  { value: "express", label: "Express (2 hours)", additionalFee: 50 },
];

const pricing = {
  regularClothes: 35,
  jeans: 45,
  linens: 50,
  comforter: 40,
};
interface TransactionsTableProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<any[]>>;
}
export default function TransactionsTable({
  transactions,
  setTransactions,
}: TransactionsTableProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [transactionToView, setTransactionToView] =
    useState<Transaction | null>(null);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Transaction;
    direction: "ascending" | "descending";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/transactions/"
        );
        setTransactions(response.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);
  const handleViewTransaction = (transaction: Transaction) => {
    setTransactionToView(transaction);
    setIsViewDialogOpen(true);
  };
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (searchTerm) {
      filtered = filtered.filter(
        (transaction) =>
          `${transaction.customer.first_name} ${transaction.customer.last_name}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.id.toString().includes(searchTerm) ||
          transaction.customer.contact_number.includes(searchTerm)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.status === statusFilter
      );
    }

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        if (sortConfig.key === "customer") {
          const aValue = `${a.customer.first_name} ${a.customer.last_name}`;
          const bValue = `${b.customer.first_name} ${b.customer.last_name}`;
          if (aValue < bValue)
            return sortConfig.direction === "ascending" ? -1 : 1;
          if (aValue > bValue)
            return sortConfig.direction === "ascending" ? 1 : -1;
          return 0;
        }

        const aValue = a[sortConfig.key] ?? "";
        const bValue = b[sortConfig.key] ?? "";
        if (aValue < bValue)
          return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue)
          return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [transactions, searchTerm, statusFilter, sortConfig]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  const requestSort = (key: keyof Transaction) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  const handleBack = () => {
    setIsSummaryDialogOpen(false);
  };

  const handleDeleteClick = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTransaction) return;
    setIsSubmitting(true);

    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/api/transactions/${selectedTransaction.customer.id}/`,
        {
          customer: {
            first_name: selectedTransaction.customer.first_name,
            last_name: selectedTransaction.customer.last_name,
            address: selectedTransaction.customer.address,
            contact_number: selectedTransaction.customer.contact_number,
          },
          service_type: selectedTransaction.service_type,
          regular_clothes_weight: selectedTransaction.regular_clothes_weight,
          jeans_weight: selectedTransaction.jeans_weight,
          linens_weight: selectedTransaction.linens_weight,
          comforter_weight: selectedTransaction.comforter_weight,
          subtotal: calculateSubtotal(),
          additional_fee: calculateAdditionalFee(),
          grand_total: calculateGrandTotal(),
        }
      );
      setIsSummaryDialogOpen(false);
      toast.success("Transaction updated successfully!");

      const transactionsResponse = await axios.get(
        "http://127.0.0.1:8000/api/transactions/"
      );
      setTransactions(transactionsResponse.data);
      setIsEditDialogOpen(false);
    } catch (error) {
      toast.error("Failed to update transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;

    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/transactions/${transactionToDelete.id}/`
      );
      toast.success("Transaction deleted successfully!");

      const response = await axios.get(
        "http://127.0.0.1:8000/api/transactions/"
      );
      setTransactions(response.data);
    } catch (error) {
      toast.error("Failed to delete transaction");
    } finally {
      setIsDeleteDialogOpen(false);
      setTransactionToDelete(null);
    }
  };

  const calculateItemTotal = (weight: number, price: number): number => {
    return weight * price;
  };

  const calculateSubtotal = (): number => {
    if (!selectedTransaction) return 0;
    return (
      calculateItemTotal(
        selectedTransaction.regular_clothes_weight,
        pricing.regularClothes
      ) +
      calculateItemTotal(selectedTransaction.jeans_weight, pricing.jeans) +
      calculateItemTotal(selectedTransaction.linens_weight, pricing.linens) +
      calculateItemTotal(
        selectedTransaction.comforter_weight,
        pricing.comforter
      )
    );
  };
  const validateForm = (): boolean => {
    if (!selectedTransaction?.customer.first_name.trim()) {
      toast.error("Please fill in first name");
      return false;
    }
    if (!selectedTransaction?.customer.last_name.trim()) {
      toast.error("Please fill in last name");
      return false;
    }
    if (!selectedTransaction?.customer.address.trim()) {
      toast.error("Please fill in address");
      return false;
    }
    if (!selectedTransaction.customer.contact_number.trim()) {
      toast.error("Please fill in contact number");
      return false;
    }
    // if (!/^\d+$/.test(selectedTransaction?.customer.contact_number)) {
    //   toast.error("Contact number must contain only digits");
    //   return false;
    // }
    if (!selectedTransaction.service_type) {
      toast.error("Please select service type");
      return false;
    }
    if (
      selectedTransaction.regular_clothes_weight <= 0 &&
      selectedTransaction.jeans_weight <= 0 &&
      selectedTransaction.linens_weight <= 0 &&
      selectedTransaction.comforter_weight <= 0
    ) {
      toast.error("Please enter weight for at least one item");
      return false;
    }
    return true;
  };
  const calculateAdditionalFee = (): number => {
    if (!selectedTransaction) return 0;
    const service = serviceTypes.find(
      (s) => s.value === selectedTransaction.service_type
    );
    return service?.additionalFee || 0;
  };

  const calculateGrandTotal = (): number => {
    return calculateSubtotal() + calculateAdditionalFee();
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(value);
  };
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSummaryDialogOpen(true);
    }
  };
  const isFormValid = () => {
    return (
      selectedTransaction?.customer.first_name.trim() &&
      selectedTransaction?.customer.last_name.trim() &&
      selectedTransaction?.customer.address.trim() &&
      selectedTransaction?.customer.contact_number.trim() &&
      /^\+?\d[\d\s]*$/.test(selectedTransaction?.customer.contact_number) &&
      selectedTransaction?.service_type &&
      (selectedTransaction?.regular_clothes_weight > 0 ||
        selectedTransaction?.jeans_weight > 0 ||
        selectedTransaction?.linens_weight > 0 ||
        selectedTransaction?.comforter_weight > 0)
    );
  };

  if (loading) return <Loading />;
  if (error)
    return <div className="p-4 text-red-500">Error: {error.message}</div>;

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
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
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
                  <TableRow
                    key={transaction.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => handleViewTransaction(transaction)}
                  >
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
                          {transaction.customer.first_name}{" "}
                          {transaction.customer.last_name}
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
                      {formatCurrency(transaction.grand_total)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={
                          transaction.status === "completed"
                            ? "success"
                            : transaction.status === "ready_for_pickup"
                            ? "primary"
                            : transaction.status === "in_progress"
                            ? "info"
                            : transaction.status === "cancelled"
                            ? "error"
                            : "warning"
                        }
                      >
                        {transaction.status_display}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400 space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent event bubbling
                          handleEditTransaction(transaction);
                        }}
                        className="px-4 py-2 bg-blue-light-500 text-white dark:text-white rounded-md hover:bg-blue-light-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(transaction);
                        }}
                        className="px-4 py-2 bg-error-500 text-white dark:text-white rounded-md hover:bg-error-600 transition-colors"
                      >
                        Delete
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="py-8 text-center text-gray-500"
                    colSpan={11}
                  >
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
          {currentItems.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}{" "}
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

      {/* Edit Transaction Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-full min-w-3xl rounded-lg bg-white dark:bg-gray-800 p-8 shadow-xl">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-bold text-gray-800 dark:text-white">
              Edit Transaction
            </DialogTitle>
          </DialogHeader>

          {selectedTransaction && (
            <form onSubmit={handleNext} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Customer Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-base">
                        First Name *
                      </Label>
                      <Input
                        type="text"
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        value={selectedTransaction.customer.first_name}
                        onChange={(e) =>
                          setSelectedTransaction({
                            ...selectedTransaction,
                            customer: {
                              ...selectedTransaction.customer,
                              first_name: e.target.value,
                            },
                          })
                        }
                        className="w-full p-3.5 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-base">
                        Last Name *
                      </Label>
                      <Input
                        type="text"
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        value={selectedTransaction.customer.last_name}
                        onChange={(e) =>
                          setSelectedTransaction({
                            ...selectedTransaction,
                            customer: {
                              ...selectedTransaction.customer,
                              last_name: e.target.value,
                            },
                          })
                        }
                        className="w-full p-3.5 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-base">
                      Address *
                    </Label>
                    <Input
                      type="text"
                      id="address"
                      name="address"
                      placeholder="Customer's address"
                      value={selectedTransaction.customer.address}
                      onChange={(e) =>
                        setSelectedTransaction({
                          ...selectedTransaction,
                          customer: {
                            ...selectedTransaction.customer,
                            address: e.target.value,
                          },
                        })
                      }
                      className="w-full p-3.5 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactNumber" className="text-base">
                      Contact Number *
                    </Label>
                    <Input
                      type="tel"
                      id="contactNumber"
                      name="contactNumber"
                      placeholder="e.g. 09123456789"
                      disabled={true}
                      value={selectedTransaction.customer.contact_number}
                      onChange={(e) =>
                        setSelectedTransaction({
                          ...selectedTransaction,
                          customer: {
                            ...selectedTransaction.customer,
                            contact_number: e.target.value,
                          },
                        })
                      }
                      className="w-full p-3.5 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                    />
                  </div>
                </div>

                {/* Laundry Details */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                    Laundry Details
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="serviceType" className="text-base">
                      Service Type *
                    </Label>
                    <select
                      id="serviceType"
                      name="serviceType"
                      value={selectedTransaction.service_type}
                      onChange={(e) =>
                        setSelectedTransaction({
                          ...selectedTransaction,
                          service_type: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 text-sm border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 bg-transparent"
                    >
                      <option value="" className="text-gray-400">
                        Select service type
                      </option>
                      {serviceTypes.map((service) => (
                        <option
                          key={service.value}
                          value={service.value}
                          className="text-gray-400"
                        >
                          {service.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Regular Clothes */}
                    <div>
                      <Label
                        htmlFor="regularClothesWeight"
                        className="text-base whitespace-nowrap"
                      >
                        Regular Clothes (kg)
                      </Label>
                      <Input
                        type="number"
                        id="regularClothesWeight"
                        name="regularClothesWeight"
                        step={0.01}
                        min="0"
                        value={selectedTransaction.regular_clothes_weight}
                        onChange={(e) =>
                          setSelectedTransaction({
                            ...selectedTransaction,
                            regular_clothes_weight:
                              parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full p-3.5 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                      />
                    </div>

                    {/* Jeans */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="jeansWeight"
                        className="text-base whitespace-nowrap"
                      >
                        Jeans (kg)
                      </Label>
                      <Input
                        type="number"
                        id="jeansWeight"
                        name="jeansWeight"
                        step={0.01}
                        min="0"
                        value={selectedTransaction.jeans_weight}
                        onChange={(e) =>
                          setSelectedTransaction({
                            ...selectedTransaction,
                            jeans_weight: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full p-3.5 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                      />
                    </div>

                    {/* Linens/Beddings */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="linensWeight"
                        className="text-base whitespace-nowrap"
                      >
                        Linens/Beddings (kg)
                      </Label>
                      <Input
                        type="number"
                        id="linensWeight"
                        name="linensWeight"
                        step={0.01}
                        min="0"
                        value={selectedTransaction.linens_weight}
                        onChange={(e) =>
                          setSelectedTransaction({
                            ...selectedTransaction,
                            linens_weight: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full p-3.5 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                      />
                    </div>

                    {/* Comforter */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="comforterWeight"
                        className="text-base whitespace-nowrap"
                      >
                        Comforter (kg)
                      </Label>
                      <Input
                        type="number"
                        id="comforterWeight"
                        name="comforterWeight"
                        step={0.01}
                        min="0"
                        value={selectedTransaction.comforter_weight}
                        onChange={(e) =>
                          setSelectedTransaction({
                            ...selectedTransaction,
                            comforter_weight: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full p-3.5 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-8">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-md text-lg disabled:bg-gray-400"
                  disabled={!isFormValid()}
                >
                  Review Transaction
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Summary Dialog */}
      <Dialog open={isSummaryDialogOpen} onOpenChange={setIsSummaryDialogOpen}>
        <DialogContent className="w-full min-w-4xl rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-white">
              Transaction Summary
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Customer Details */}
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-white">
                  Customer Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                      Full Name:
                    </p>
                    <p className="font-medium">
                      {selectedTransaction?.customer.first_name}{" "}
                      {selectedTransaction?.customer.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                      Contact Number:
                    </p>
                    <p className="font-medium">
                      {selectedTransaction?.customer.contact_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                      Address:
                    </p>
                    <p className="font-medium">
                      {selectedTransaction?.customer.address}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                      Service Type:
                    </p>
                    <p className="font-medium">
                      {
                        serviceTypes.find(
                          (s) => s.value === selectedTransaction?.service_type
                        )?.label
                      }
                      {calculateAdditionalFee() > 0 && (
                        <span className="text-blue-600 dark:text-blue-400 ml-2">
                          (+{formatCurrency(calculateAdditionalFee())})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-white">
                  Order Summary
                </h3>
                <div className="space-y-4">
                  {selectedTransaction &&
                    selectedTransaction.regular_clothes_weight > 0 && (
                      <div className="flex justify-between">
                        <span>
                          Regular Clothes (
                          {selectedTransaction.regular_clothes_weight} kg)
                        </span>
                        <span>
                          {formatCurrency(
                            calculateItemTotal(
                              selectedTransaction.regular_clothes_weight,
                              pricing.regularClothes
                            )
                          )}
                        </span>
                      </div>
                    )}
                  {selectedTransaction &&
                    selectedTransaction.jeans_weight > 0 && (
                      <div className="flex justify-between">
                        <span>
                          Jeans ({selectedTransaction.jeans_weight} kg)
                        </span>
                        <span>
                          {formatCurrency(
                            calculateItemTotal(
                              selectedTransaction.jeans_weight,
                              pricing.jeans
                            )
                          )}
                        </span>
                      </div>
                    )}
                  {selectedTransaction &&
                    selectedTransaction.linens_weight > 0 && (
                      <div className="flex justify-between">
                        <span>
                          Beddings/Linens ({selectedTransaction.linens_weight}{" "}
                          kg)
                        </span>
                        <span>
                          {formatCurrency(
                            calculateItemTotal(
                              selectedTransaction.linens_weight,
                              pricing.linens
                            )
                          )}
                        </span>
                      </div>
                    )}
                  {selectedTransaction &&
                    selectedTransaction.comforter_weight > 0 && (
                      <div className="flex justify-between">
                        <span>
                          Comforter ({selectedTransaction.comforter_weight} kg)
                        </span>
                        <span>
                          {formatCurrency(
                            calculateItemTotal(
                              selectedTransaction.comforter_weight,
                              pricing.comforter
                            )
                          )}
                        </span>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Right Column - Pricing Breakdown */}
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-white">
                  Pricing Breakdown
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  {calculateAdditionalFee() > 0 && (
                    <div className="flex justify-between">
                      <span>Service Fee:</span>
                      <span>{formatCurrency(calculateAdditionalFee())}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                    <div className="flex justify-between font-bold">
                      <span>Grand Total:</span>
                      <span className="text-blue-600 dark:text-blue-400 text-lg">
                        {formatCurrency(calculateGrandTotal())}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6 gap-3">
            <Button onClick={handleBack} variant="outline">
              Back
            </Button>
            <Button
              onClick={() =>
                handleSubmit({
                  preventDefault: () => {},
                } as React.FormEvent<HTMLFormElement>)
              }
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow disabled:bg-gray-400"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Confirm Transaction"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* View Transaction Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="w-full min-w-4xl rounded-lg bg-white dark:bg-gray-800 p-8 shadow-xl">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-bold text-gray-800 dark:text-white">
              Transaction Details
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Detailed information about the transaction
            </DialogDescription>
          </DialogHeader>

          {transactionToView && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Customer Details */}
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-white">
                      Customer Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-300">
                          Full Name:
                        </p>
                        <p className="font-medium">
                          {transactionToView.customer.first_name}{" "}
                          {transactionToView.customer.last_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-300">
                          Contact Number:
                        </p>
                        <p className="font-medium">
                          {transactionToView.customer.contact_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-300">
                          Address:
                        </p>
                        <p className="font-medium">
                          {transactionToView.customer.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-white">
                      Transaction Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-300">
                          Transaction ID:
                        </p>
                        <p className="font-medium">#{transactionToView.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-300">
                          Service Type:
                        </p>
                        <p className="font-medium">
                          {transactionToView.service_type_display}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <p className="text-sm text-gray-500 dark:text-gray-300">
                          Status:
                        </p>
                        <p className="font-medium">
                          <Badge
                            size="sm"
                            color={
                              transactionToView.status === "completed"
                                ? "success"
                                : transactionToView.status ===
                                  "ready_for_pickup"
                                ? "primary"
                                : transactionToView.status === "in_progress"
                                ? "info"
                                : transactionToView.status === "cancelled"
                                ? "error"
                                : "warning"
                            }
                          >
                            {transactionToView.status_display}
                          </Badge>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-300">
                          Date Created:
                        </p>
                        <p className="font-medium">
                          {new Date(
                            transactionToView.created_at
                          ).toLocaleString()}
                        </p>
                      </div>
                      {transactionToView.completed_at && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-300">
                            Date Completed:
                          </p>
                          <p className="font-medium">
                            {new Date(
                              transactionToView.completed_at
                            ).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Laundry Details */}
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-white">
                      Laundry Items
                    </h3>
                    <div className="space-y-4">
                      {transactionToView.regular_clothes_weight > 0 && (
                        <div className="flex justify-between">
                          <span>
                            Regular Clothes (
                            {transactionToView.regular_clothes_weight} kg)
                          </span>
                          <span>
                            {formatCurrency(
                              calculateItemTotal(
                                transactionToView.regular_clothes_weight,
                                pricing.regularClothes
                              )
                            )}
                          </span>
                        </div>
                      )}
                      {transactionToView.jeans_weight > 0 && (
                        <div className="flex justify-between">
                          <span>
                            Jeans ({transactionToView.jeans_weight} kg)
                          </span>
                          <span>
                            {formatCurrency(
                              calculateItemTotal(
                                transactionToView.jeans_weight,
                                pricing.jeans
                              )
                            )}
                          </span>
                        </div>
                      )}
                      {transactionToView.linens_weight > 0 && (
                        <div className="flex justify-between">
                          <span>
                            Beddings/Linens ({transactionToView.linens_weight}{" "}
                            kg)
                          </span>
                          <span>
                            {formatCurrency(
                              calculateItemTotal(
                                transactionToView.linens_weight,
                                pricing.linens
                              )
                            )}
                          </span>
                        </div>
                      )}
                      {transactionToView.comforter_weight > 0 && (
                        <div className="flex justify-between">
                          <span>
                            Comforter ({transactionToView.comforter_weight} kg)
                          </span>
                          <span>
                            {formatCurrency(
                              calculateItemTotal(
                                transactionToView.comforter_weight,
                                pricing.comforter
                              )
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-white">
                      Pricing Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>
                          {formatCurrency(transactionToView.subtotal)}
                        </span>
                      </div>
                      {transactionToView.additional_fee > 0 && (
                        <div className="flex justify-between">
                          <span>Additional Fee:</span>
                          <span>
                            {formatCurrency(transactionToView.additional_fee)}
                          </span>
                        </div>
                      )}
                      <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                        <div className="flex justify-between font-bold">
                          <span>Grand Total:</span>
                          <span className="text-blue-600 dark:text-blue-400 text-lg">
                            {formatCurrency(transactionToView.grand_total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-white">
              Delete Transaction
            </DialogTitle>
          </DialogHeader>

          {transactionToDelete && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete transaction #
                {transactionToDelete.id} for customer{" "}
                <strong>
                  {transactionToDelete.customer.first_name}{" "}
                  {transactionToDelete.customer.last_name}
                </strong>
                ? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="error"
                  onClick={handleDeleteConfirm}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ToastContainer />
    </div>
  );
}
