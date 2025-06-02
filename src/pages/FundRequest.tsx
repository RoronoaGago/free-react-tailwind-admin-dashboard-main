import { useState, useEffect } from "react";
import { toast, ToastContainer, Bounce } from "react-toastify";
import axios from "axios";
import {
  PlusIcon,
  TrashIcon,
  UploadIcon,
  CalendarIcon,
  SearchIcon,
  XIcon,
  SaveIcon,
  PaperclipIcon,
} from "lucide-react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import Button from "../components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router";

// Types
type ExpenseAccount = {
  code: string;
  parentCode: string;
  name: string;
  fullName: string;
};

type ExpenseItem = {
  id: string;
  accountCode: string;
  accountName: string;
  amount: string;
  description: string;
  dateRange: {
    start?: string;
    end?: string;
  };
  files: File[];
};

type FundRequest = {
  id?: string;
  status: "draft" | "submitted" | "approved" | "rejected" | "liquidated";
  items: ExpenseItem[];
  createdAt?: string;
  updatedAt?: string;
};

// Mock data for expense accounts (in a real app, this would come from an API)
const EXPENSE_ACCOUNTS: ExpenseAccount[] = [
  {
    code: "5020101000",
    parentCode: "50201010",
    name: "Traveling Expenses - Local",
    fullName: "5020101000 - Traveling Expenses - Local",
  },
  {
    code: "5020102000",
    parentCode: "50201020",
    name: "Traveling Expenses - Foreign",
    fullName: "5020102000 - Traveling Expenses - Foreign",
  },
  {
    code: "5020201000",
    parentCode: "50202010",
    name: "Training Expenses",
    fullName: "5020201000 - Training Expenses",
  },
  // ... add all other accounts from your list
];

const FundRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hasActiveRequest, setHasActiveRequest] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [isCheckingRequests, setIsCheckingRequests] = useState(true);
  const [request, setRequest] = useState<FundRequest>({
    status: "draft",
    items: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<ExpenseItem>>({
    accountCode: "",
    amount: "",
    description: "",
    dateRange: { start: "", end: "" },
    files: [],
  });
  // Check for active requests on component mount
  useEffect(() => {
    const checkActiveRequests = async () => {
      setIsCheckingRequests(true);
      try {
        // In a real app, this would be an API call
        // const response = await axios.get(`/api/users/${user.id}/requests`);
        // const activeReq = response.data.find(req => req.status !== "liquidated");

        // Mock implementation
        const mockRequests: FundRequest[] = [
          /* Your mock requests data */
        ];

        const activeReq = mockRequests.find(
          (req) => req.status !== "liquidated" && req.status !== "rejected"
        );

        if (activeReq) {
          setHasActiveRequest(true);
          setActiveRequestId(activeReq.id || null);
          if (window.location.pathname === "/fund-requests/new") {
            navigate(`/fund-requests/${activeReq.id}`);
            toast.info("You're being redirected to your active request", {
              position: "top-center",
              transition: Bounce,
            });
          }
        }
      } catch (error) {
        toast.error("Failed to check existing requests", {
          position: "top-center",
          transition: Bounce,
        });
      } finally {
        setIsCheckingRequests(false);
      }
    };

    checkActiveRequests();
  }, [navigate]);

  // Filter accounts based on search term
  const filteredAccounts = EXPENSE_ACCOUNTS.filter((account) =>
    account.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format amount with commas and 2 decimal places
  const formatAmount = (value: string) => {
    if (!value) return "";
    const num = parseFloat(value.replace(/,/g, ""));
    if (isNaN(num)) return "";
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Handle adding a new expense item
  const addExpenseItem = () => {
    if (
      !currentItem.accountCode ||
      !currentItem.amount ||
      parseFloat(currentItem.amount.replace(/,/g, "")) <= 0
    ) {
      toast.error("Please select an account and enter a valid amount", {
        position: "top-center",
        transition: Bounce,
      });
      return;
    }

    // Check for duplicate account
    if (
      request.items.some((item) => item.accountCode === currentItem.accountCode)
    ) {
      toast.error("This account has already been added to the request", {
        position: "top-center",
        transition: Bounce,
      });
      return;
    }

    const newItem: ExpenseItem = {
      id: Date.now().toString(),
      accountCode: currentItem.accountCode || "",
      accountName:
        EXPENSE_ACCOUNTS.find((a) => a.code === currentItem.accountCode)
          ?.fullName || "",
      amount: formatAmount(currentItem.amount || "0"),
      description: currentItem.description || "",
      dateRange: {
        start: currentItem.dateRange?.start || "",
        end: currentItem.dateRange?.end || "",
      },
      files: currentItem.files || [],
    };

    setRequest((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    // Reset current item
    setCurrentItem({
      accountCode: "",
      amount: "",
      description: "",
      dateRange: { start: "", end: "" },
      files: [],
    });
    setSearchTerm("");
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setCurrentItem((prev) => ({
        ...prev,
        files: [...(prev.files || []), ...files],
      }));
    }
  };

  // Remove a file from current item
  const removeFile = (index: number) => {
    setCurrentItem((prev) => {
      const newFiles = [...(prev.files || [])];
      newFiles.splice(index, 1);
      return { ...prev, files: newFiles };
    });
  };

  // Remove an expense item
  const removeExpenseItem = (id: string) => {
    setRequest((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  // Submit the fund request
  const submitRequest = async (status: "draft" | "submitted") => {
    setIsSubmitting(true);

    try {
      // In a real app, you would send this to your backend
      //   const payload = {
      //     ...request,
      //     status,
      //     userId: user?.id,
      //   };

      // Mock API call
      //   console.log("Submitting:", payload);

      toast.success(
        `Request ${
          status === "draft" ? "saved as draft" : "submitted"
        } successfully!`,
        {
          position: "top-center",
          transition: Bounce,
        }
      );

      if (status === "submitted") {
        // Reset form after submission
        setRequest({
          status: "submitted",
          items: [],
        });
      } else {
        // Just update status for draft
        setRequest((prev) => ({
          ...prev,
          status: "draft",
        }));
      }
    } catch (error) {
      toast.error(
        `Failed to ${status === "draft" ? "save draft" : "submit request"}`,
        {
          position: "top-center",
          transition: Bounce,
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total amount
  const totalAmount = request.items.reduce((sum, item) => {
    return sum + parseFloat(item.amount.replace(/,/g, ""));
  }, 0);

  return (
    <div className="container mx-auto px-4 py-6">
      <PageBreadcrumb pageTitle="Fund Request" />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Create Fund Request</h1>

        {/* Current Request Status */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-semibold">Status:</span>
              <span
                className={`ml-2 px-3 py-1 rounded-full text-sm ${
                  request.status === "draft"
                    ? "bg-yellow-100 text-yellow-800"
                    : request.status === "submitted"
                    ? "bg-blue-100 text-blue-800"
                    : request.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {request.status.toUpperCase()}
              </span>
            </div>
            {request.items.length > 0 && (
              <div className="text-lg font-semibold">
                Total Amount: ₱
                {totalAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            )}
          </div>
        </div>

        {/* Expense Item Form */}
        <div className="mb-8 p-6 border border-gray-200 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Add Expense Item</h2>

          {/* Account Selection */}
          <div className="mb-4">
            <Label htmlFor="account" className="block mb-2 font-medium">
              Expense Account *
            </Label>
            <div className="relative">
              <div className="flex">
                <Input
                  type="text"
                  placeholder="Search expense accounts..."
                  className="flex-1 rounded-r-none"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowAccountDropdown(true);
                  }}
                  onFocus={() => setShowAccountDropdown(true)}
                />
                <button
                  className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md"
                  onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                >
                  <SearchIcon className="h-5 w-5" />
                </button>
              </div>

              {showAccountDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-auto">
                  {filteredAccounts.length > 0 ? (
                    filteredAccounts.map((account) => (
                      <div
                        key={account.code}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setCurrentItem((prev) => ({
                            ...prev,
                            accountCode: account.code,
                          }));
                          setShowAccountDropdown(false);
                        }}
                      >
                        <div className="font-medium">{account.fullName}</div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500">
                      No accounts found
                    </div>
                  )}
                </div>
              )}
            </div>
            {currentItem.accountCode && (
              <div className="mt-2 text-sm text-green-600">
                Selected:{" "}
                {
                  EXPENSE_ACCOUNTS.find(
                    (a) => a.code === currentItem.accountCode
                  )?.fullName
                }
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="mb-4">
            <Label htmlFor="amount" className="block mb-2 font-medium">
              Amount *
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                ₱
              </span>
              <Input
                type="text"
                placeholder="0.00"
                className="pl-8"
                value={currentItem.amount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.]/g, "");
                  if (value === "" || /^\d*\.?\d*$/.test(value)) {
                    setCurrentItem((prev) => ({
                      ...prev,
                      amount: value,
                    }));
                  }
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <Label htmlFor="description" className="block mb-2 font-medium">
              Description/Justification
            </Label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Enter description or justification for this expense..."
              value={currentItem.description}
              onChange={(e) =>
                setCurrentItem((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="startDate" className="block mb-2 font-medium">
                Start Date
              </Label>
              <div className="relative">
                <Input
                  type="date"
                  id="startDate"
                  value={currentItem.dateRange?.start}
                  onChange={(e) =>
                    setCurrentItem((prev) => ({
                      ...prev,
                      dateRange: {
                        ...prev.dateRange,
                        start: e.target.value,
                      },
                    }))
                  }
                />
                <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div>
              <Label htmlFor="endDate" className="block mb-2 font-medium">
                End Date
              </Label>
              <div className="relative">
                <Input
                  type="date"
                  id="endDate"
                  value={currentItem.dateRange?.end}
                  onChange={(e) =>
                    setCurrentItem((prev) => ({
                      ...prev,
                      dateRange: {
                        ...prev.dateRange,
                        end: e.target.value,
                      },
                    }))
                  }
                  min={currentItem.dateRange?.start}
                />
                <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <Label className="block mb-2 font-medium">
              Supporting Documents
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
              <label className="flex flex-col items-center justify-center cursor-pointer">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadIcon className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, DOCX, JPG, PNG (MAX. 5MB each)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            {currentItem.files && currentItem.files.length > 0 && (
              <div className="mt-3 space-y-2">
                {currentItem.files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center">
                      <PaperclipIcon className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm truncate max-w-xs">
                        {file.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={addExpenseItem}
            className="w-full"
            disabled={!currentItem.accountCode || !currentItem.amount}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Expense Item
          </Button>
        </div>

        {/* Expense Items Table */}
        {request.items.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Expense Items</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Range
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Files
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {request.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium">{item.accountName}</div>
                        {item.description && (
                          <div className="text-sm text-gray-500 mt-1">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        ₱{item.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.dateRange.start && item.dateRange.end
                          ? `${new Date(
                              item.dateRange.start
                            ).toLocaleDateString()} - ${new Date(
                              item.dateRange.end
                            ).toLocaleDateString()}`
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.files.length > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.files.length} file(s)
                          </span>
                        ) : (
                          "None"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => removeExpenseItem(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td
                      className="px-6 py-3 text-right font-medium"
                      colSpan={4}
                    >
                      Total
                    </td>
                    <td className="px-6 py-3 font-medium">
                      ₱
                      {totalAmount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => submitRequest("draft")}
            disabled={request.items.length === 0 || isSubmitting}
          >
            <SaveIcon className="h-5 w-5 mr-2" />
            {isSubmitting ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => submitRequest("submitted")}
            disabled={request.items.length === 0 || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </div>

      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </div>
  );
};

export default FundRequest;
