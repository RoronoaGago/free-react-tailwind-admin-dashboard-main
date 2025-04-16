import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { Loading } from "./common/Loading";
import { Search } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { formatCurrency } from "@/lib/helpers";

export default function TransactionLookup() {
  const [transactionId, setTransactionId] = useState("");
  const [transactionData, setTransactionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Add this to be extra sure

    setLoading(true);
    console.log("looknig for transaction");
    toast.success("yippie");
    console.log("Form submission prevented?", e.defaultPrevented); // Should log true
    const toastId = toast.loading("Looking up your transaction...", {
      position: "top-center",
      autoClose: false,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
      progress: undefined,
      theme: "light",
    });

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/customer/transactions/${transactionId}/`
      );

      if (!response.data) {
        toast.update(toastId, {
          render: "No transaction found with that ID",
          type: "warning",
          isLoading: false,
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setTransactionData(null);
        return;
      }

      setTransactionData(response.data);
      toast.update(toastId, {
        render: "Transaction details loaded successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err: unknown) {
      let errorMessage = "An unexpected error occurred";
      let isNotFound = false;

      // Type guard for AxiosError
      if (axios.isAxiosError(err)) {
        isNotFound = err.response?.status === 404;
        errorMessage = isNotFound
          ? "No transaction found with that ID"
          : err.response?.data?.error || "Failed to fetch transaction details";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setTransactionData(null);

      toast.update(toastId, {
        render: errorMessage,
        type: isNotFound ? "warning" : "error",
        isLoading: false,
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen">
      {/* Left Side - Lookup Form */}
      <div className="flex items-center justify-center w-full lg:w-1/2 p-4 sm:p-8">
        <div className="w-full max-w-md mx-auto">
          {/* Logo Container */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 p-1 bg-white rounded-full shadow-lg dark:bg-gray-800">
              <img
                src="./images/logo/bubble-magic-logo.svg"
                alt="Company Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Track Your Laundry
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Enter your transaction ID to view laundry details
            </p>
          </div>

          <form onSubmit={handleLookup} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Transaction ID
                <span className="ml-1 text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter transaction ID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            <button
              className="w-full px-4 py-3 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:bg-brand-500 dark:hover:bg-brand-600 transition-colors duration-300"
              type="submit"
              disabled={loading}
            >
              {loading ? "Searching..." : "Find My Order"}
            </button>
          </form>

          {/* Transaction Details Display */}
          {transactionData && (
            <div className="mt-8 p-6 border border-gray-200 rounded-lg dark:border-gray-700 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Transaction #{transactionData.id}
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </h3>
                  <p className="mt-1 text-lg font-semibold text-brand-600 dark:text-brand-400">
                    {transactionData.status}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Service Type
                  </h3>
                  <p className="mt-1 text-gray-800 dark:text-gray-200">
                    {transactionData.service_type}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total
                  </h3>
                  <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">
                    {formatCurrency(transactionData.grand_total)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Created
                    </h3>
                    <p className="mt-1 text-gray-800 dark:text-gray-200">
                      {new Date(
                        transactionData.created_at
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Completed
                    </h3>
                    <p className="mt-1 text-gray-800 dark:text-gray-200">
                      {transactionData.completed_at
                        ? new Date(
                            transactionData.completed_at
                          ).toLocaleDateString()
                        : "In Progress"}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Customer
                  </h3>
                  <p className="mt-1 text-gray-800 dark:text-gray-200">
                    {transactionData.customer.first_name}{" "}
                    {transactionData.customer.last_name}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {transactionData.customer.contact_number}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Need help?{" "}
              <button
                onClick={() => navigate("/contact")}
                className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300"
              >
                Contact support
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-200 dark:bg-gray-800">
        <img
          src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Laundry service"
          className="object-cover w-full h-full"
        />
      </div>
      <ToastContainer />
    </div>
  );
}
