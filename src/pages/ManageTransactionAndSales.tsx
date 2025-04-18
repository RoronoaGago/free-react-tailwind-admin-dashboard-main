import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import Button from "../components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TransactionsTable from "@/components/tables/BasicTables/TransactionAndSalesTable";
import { Bounce, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { formatCurrency } from "@/lib/helpers";

// Service types and pricing
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

type TransactionFormData = {
  customer: {
    firstName: string;
    lastName: string;
    address: string;
    contactNumber: string;
  };
  serviceType: string;
  regularClothesWeight: number;
  jeansWeight: number;
  linensWeight: number;
  comforterWeight: number;
  notes?: string;
};

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

const ManageTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isSummaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TransactionFormData>({
    customer: {
      firstName: "",
      lastName: "",
      address: "",
      contactNumber: "",
    },
    serviceType: "",
    regularClothesWeight: 0,
    jeansWeight: 0,
    linensWeight: 0,
    comforterWeight: 0,
  });
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/transactions/"
        );
        setTransactions(response.data);
      } catch (err) {
        toast.error("Failed to fetch transactions", {
          position: "top-center",
          autoClose: 5000,
          style: { fontFamily: "Outfit, sans-serif" },
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
      } finally {
      }
    };

    fetchTransactions();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const inputElement = e.target as HTMLInputElement; // Type assertion for input-specific properties

    // Handle nested customer fields
    if (name.startsWith("customer.")) {
      const fieldName = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        customer: {
          ...prev.customer,
          [fieldName]: value,
        },
      }));
    }
    // Handle decimal number inputs
    else if (type === "number" && inputElement.step === "0.01") {
      // Allow empty string or valid decimal numbers
      if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [name]: value, // Store as string to preserve decimal places
        }));
      }
    }
    // Handle Weight fields (existing logic)
    else if (name.includes("Weight")) {
      setFormData((prev) => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
    }
    // Default case for other inputs
    else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleServiceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      serviceType: e.target.value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.customer.firstName.trim()) {
      toast.error("Please fill in first name");
      return false;
    }
    if (!formData.customer.lastName.trim()) {
      toast.error("Please fill in last name");
      return false;
    }
    if (!formData.customer.address.trim()) {
      toast.error("Please fill in address");
      return false;
    }
    if (!formData.customer.contactNumber.trim()) {
      toast.error("Please fill in contact number");
      return false;
    }
    if (!/^\d+$/.test(formData.customer.contactNumber)) {
      toast.error("Contact number must contain only digits");
      return false;
    }
    if (!formData.serviceType) {
      toast.error("Please select service type");
      return false;
    }
    if (
      formData.regularClothesWeight <= 0 &&
      formData.jeansWeight <= 0 &&
      formData.linensWeight <= 0 &&
      formData.comforterWeight <= 0
    ) {
      toast.error("Please enter weight for at least one item");
      return false;
    }
    return true;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setSummaryDialogOpen(true);
    }
  };

  const handleBack = () => {
    setSummaryDialogOpen(false);
  };

  const calculateItemTotal = (weight: number, price: number): number => {
    return weight * price;
  };

  const calculateSubtotal = (): number => {
    return (
      calculateItemTotal(
        formData.regularClothesWeight,
        pricing.regularClothes
      ) +
      calculateItemTotal(formData.jeansWeight, pricing.jeans) +
      calculateItemTotal(formData.linensWeight, pricing.linens) +
      calculateItemTotal(formData.comforterWeight, pricing.comforter)
    );
  };

  const calculateAdditionalFee = (): number => {
    const service = serviceTypes.find((s) => s.value === formData.serviceType);
    return service?.additionalFee || 0;
  };

  const calculateGrandTotal = (): number => {
    return calculateSubtotal() + calculateAdditionalFee();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/transactions/",
        {
          customer: {
            first_name: formData.customer.firstName,
            last_name: formData.customer.lastName,
            address: formData.customer.address,
            contact_number: formData.customer.contactNumber,
          },
          service_type: formData.serviceType,
          regular_clothes_weight: formData.regularClothesWeight,
          jeans_weight: formData.jeansWeight,
          linens_weight: formData.linensWeight,
          comforter_weight: formData.comforterWeight,
          subtotal: calculateSubtotal(),
          additional_fee: calculateAdditionalFee(),
          grand_total: calculateGrandTotal(),
        }
      );
      setTransactions((prev) => [...prev, response.data]);
      toast.success("Transaction created successfully!");
      // Reset form
      setFormData({
        customer: {
          firstName: "",
          lastName: "",
          address: "",
          contactNumber: "",
        },
        serviceType: "",
        regularClothesWeight: 0,
        jeansWeight: 0,
        linensWeight: 0,
        comforterWeight: 0,
      });
      setSummaryDialogOpen(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Error creating transaction"
      );
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.customer.firstName.trim() &&
      formData.customer.lastName.trim() &&
      formData.customer.address.trim() &&
      formData.customer.contactNumber.trim() &&
      /^\d+$/.test(formData.customer.contactNumber) &&
      formData.serviceType &&
      (formData.regularClothesWeight > 0 ||
        formData.jeansWeight > 0 ||
        formData.linensWeight > 0 ||
        formData.comforterWeight > 0)
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageBreadcrumb pageTitle="Manage Transactions" />

      <div className="flex justify-end mb-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow">
              Add New Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full min-w-3xl rounded-lg bg-white dark:bg-gray-800 p-8 shadow-xl">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-3xl font-bold text-gray-800 dark:text-white">
                Create New Transaction
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleNext} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Customer Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer.firstName" className="text-base">
                        First Name *
                      </Label>
                      <Input
                        type="text"
                        id="customer.firstName"
                        name="customer.firstName"
                        placeholder="John"
                        value={formData.customer.firstName}
                        onChange={handleInputChange}
                        className="w-full p-3.5 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customer.lastName" className="text-base">
                        Last Name *
                      </Label>
                      <Input
                        type="text"
                        id="customer.lastName"
                        name="customer.lastName"
                        placeholder="Doe"
                        value={formData.customer.lastName}
                        onChange={handleInputChange}
                        className="w-full p-3.5 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer.address" className="text-base">
                      Address *
                    </Label>
                    <Input
                      type="text"
                      id="customer.address"
                      name="customer.address"
                      placeholder="Customer's address"
                      value={formData.customer.address}
                      onChange={handleInputChange}
                      className="w-full p-3.5 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="customer.contactNumber"
                      className="text-base"
                    >
                      Contact Number *
                    </Label>
                    <Input
                      type="tel"
                      id="customer.contactNumber"
                      name="customer.contactNumber"
                      placeholder="e.g. 09123456789"
                      value={formData.customer.contactNumber}
                      onChange={handleInputChange}
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
                      value={formData.serviceType}
                      onChange={handleServiceTypeChange}
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
                        value={
                          formData.regularClothesWeight === 0
                            ? ""
                            : formData.regularClothesWeight
                        }
                        onChange={handleInputChange}
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
                        step={0.1}
                        min="0"
                        value={
                          formData.jeansWeight === 0 ? "" : formData.jeansWeight
                        }
                        onChange={handleInputChange}
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
                        step={0.1}
                        min="0"
                        value={
                          formData.linensWeight === 0
                            ? ""
                            : formData.linensWeight
                        }
                        onChange={handleInputChange}
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
                        step={0.1}
                        min="0"
                        value={
                          formData.comforterWeight === 0
                            ? ""
                            : formData.comforterWeight
                        }
                        onChange={handleInputChange}
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
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Dialog */}
      <Dialog open={isSummaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
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
                      {formData.customer.firstName} {formData.customer.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                      Contact Number:
                    </p>
                    <p className="font-medium">
                      {formData.customer.contactNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                      Address:
                    </p>
                    <p className="font-medium">{formData.customer.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                      Service Type:
                    </p>
                    <p className="font-medium">
                      {
                        serviceTypes.find(
                          (s) => s.value === formData.serviceType
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
                  {formData.regularClothesWeight > 0 && (
                    <div className="flex justify-between">
                      <span>
                        Regular Clothes ({formData.regularClothesWeight} kg)
                      </span>
                      <span>
                        {formatCurrency(
                          calculateItemTotal(
                            formData.regularClothesWeight,
                            pricing.regularClothes
                          )
                        )}
                      </span>
                    </div>
                  )}
                  {formData.jeansWeight > 0 && (
                    <div className="flex justify-between">
                      <span>Jeans ({formData.jeansWeight} kg)</span>
                      <span>
                        {formatCurrency(
                          calculateItemTotal(
                            formData.jeansWeight,
                            pricing.jeans
                          )
                        )}
                      </span>
                    </div>
                  )}
                  {formData.linensWeight > 0 && (
                    <div className="flex justify-between">
                      <span>Linens/Beddings ({formData.linensWeight} kg)</span>
                      <span>
                        {formatCurrency(
                          calculateItemTotal(
                            formData.linensWeight,
                            pricing.linens
                          )
                        )}
                      </span>
                    </div>
                  )}
                  {formData.comforterWeight > 0 && (
                    <div className="flex justify-between">
                      <span>Comforter ({formData.comforterWeight} kg)</span>
                      <span>
                        {formatCurrency(
                          calculateItemTotal(
                            formData.comforterWeight,
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

              {/* Notes Field */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-white">
                  Additional Notes
                </h3>
                <textarea
                  className="w-full p-2 border rounded-lg"
                  rows={3}
                  placeholder="Any special instructions..."
                  value={formData.notes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6 gap-3">
            <Button onClick={handleBack} variant="outline">
              Back
            </Button>
            <Button
              onClick={handleSubmit}
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

      {/* Transactions Table */}
      <div className="mt-8">
        <TransactionsTable
          transactions={transactions}
          setTransactions={setTransactions}
        />
      </div>

      <ToastContainer position="top-center" autoClose={5000} />
    </div>
  );
};

export default ManageTransactions;
