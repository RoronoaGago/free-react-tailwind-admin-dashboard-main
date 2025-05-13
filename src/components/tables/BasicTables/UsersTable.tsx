import { useEffect, useState, useMemo, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Loading } from "@/components/common/Loading";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Bounce, ToastContainer, toast } from "react-toastify";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { cn } from "@/lib/utils";
import {
  EyeIcon,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Search,
  Loader2,
} from "lucide-react";
import { EyeCloseIcon, CalenderIcon } from "@/icons";
import { User } from "@/lib/types";
import Button from "@/components/ui/button/Button";
import axios from "axios";
import Badge from "@/components/ui/badge/Badge";
import { useAuth } from "@/context/AuthContext";
// Import useAuth hook

type SortDirection = "asc" | "desc" | null;
type SortableField = keyof Pick<
  User,
  | "id"
  | "first_name"
  | "last_name"
  | "username"
  | "email"
  | "phone_number"
  | "password"
>;

interface UsersTableProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<any[]>>;
}

interface FormErrors {
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
  phone_number?: string;
}

// Validation functions
const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password: string) => {
  const re = /^.{8,}$/;
  return re.test(password);
};

const validatePhoneNumber = (phone: string) => {
  const re = /^[+\d][\d\s]*$/;
  return re.test(phone);
};

export default function UsersTable({ users, setUsers }: UsersTableProps) {
  const { user: currentUser } = useAuth(); // Get current logged-in user
  // Data state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Table features state
  const [sortConfig, setSortConfig] = useState<{
    key: SortableField;
    direction: SortDirection;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToView, setUserToView] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Required fields for editing
  const requiredFields = ["first_name", "last_name", "username", "email"];

  // Check if form is valid
  const isFormValid = useMemo(() => {
    if (!selectedUser) return false;

    return (
      requiredFields.every(
        (field) => selectedUser[field as keyof User]?.toString().trim() !== ""
      ) && Object.keys(formErrors).length === 0
    );
  }, [selectedUser, formErrors]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/users/");
        setUsers(response.data);
      } catch (err) {
        setError(err as Error);
        toast.error("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle form field changes with validation
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!selectedUser) return;

    const { name, value } = e.target;

    // Update user data immediately
    setSelectedUser((prev) => ({
      ...prev!,
      [name]: value,
    }));

    // Clear previous timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set new timeout for validation
    debounceTimeout.current = setTimeout(() => {
      const newErrors = { ...formErrors };

      switch (name) {
        case "email":
          if (!validateEmail(value)) {
            newErrors.email = "Please enter a valid email address";
          } else {
            delete newErrors.email;
          }
          break;
        case "password":
          if (value && !validatePassword(value)) {
            newErrors.password = "Password must be at least 8 characters";
          } else {
            delete newErrors.password;
          }
          break;
        case "phone_number":
          if (value && !validatePhoneNumber(value)) {
            newErrors.phone_number = "Please enter a valid phone number";
          } else {
            delete newErrors.phone_number;
          }
          break;
        default:
          // For required fields
          if (requiredFields.includes(name) && !value.trim()) {
            newErrors[name as keyof FormErrors] = "This field is required";
          } else {
            delete newErrors[name as keyof FormErrors];
          }
      }

      setFormErrors(newErrors);
    }, 500);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  // Handle phone number input
  const handlePhoneNumberInput = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9+]/g, "");
  };

  // Filter and sort users - EXCLUDE CURRENT USER
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter((user) => user.id !== currentUser?.user_id); // Exclude current user

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.phone_number && user.phone_number.includes(searchTerm))
      );
    }

    // Apply sorting
    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [users, searchTerm, sortConfig, currentUser?.user_id]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedUsers, currentPage, itemsPerPage]);

  // Sort handler
  const requestSort = (key: SortableField) => {
    let direction: SortDirection = "asc";
    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === "asc" ? "desc" : null;
    }
    setSortConfig(direction ? { key, direction } : null);
  };

  // Handle page changes
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle edit user
  const handleEditUser = (user: User) => {
    setSelectedUser({ ...user, password: "", confirm_password: "" });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  // Handle delete user
  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  // Handle view user
  const handleViewUser = (user: User) => {
    setUserToView(user);
    setIsViewDialogOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (!isFormValid) {
      toast.error("Please fix the errors in the form", {
        position: "top-center",
        autoClose: 2000,
        style: { fontFamily: "Outfit, sans-serif" },
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      return;
    }

    // Open confirmation dialog before submitting
    setIsConfirmDialogOpen(true);
  };

  // Handle confirmed edit
  const handleConfirmedEdit = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);

    try {
      const payload = {
        ...selectedUser,
        // Don't send password if it's empty
        password: selectedUser.password || undefined,
      };

      await axios.put(
        `http://127.0.0.1:8000/api/users/${selectedUser.id}/`,
        payload
      );

      toast.success("User updated successfully!", {
        position: "top-center",
        autoClose: 2000,
        style: { fontFamily: "Outfit, sans-serif" },
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });

      // Refresh the user list
      const usersResponse = await axios.get("http://127.0.0.1:8000/api/users/");
      setUsers(usersResponse.data);

      // Close all dialogs
      setIsDialogOpen(false);
      setIsConfirmDialogOpen(false);
    } catch (error) {
      let errorMessage = "Failed to update user. Please try again.";

      if (axios.isAxiosError(error) && error.response) {
        if (error.response.data.username) {
          errorMessage = "Username already exists.";
        } else if (error.response.data.email) {
          errorMessage = "Email already exists.";
        } else if (error.response.data.password) {
          errorMessage = "Password doesn't meet requirements.";
        }
      }

      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 2000,
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
      setIsSubmitting(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setIsSubmitting(true);

    try {
      await axios.delete(`http://127.0.0.1:8000/api/users/${userToDelete.id}/`);
      toast.success("User deleted successfully!", {
        position: "top-center",
        autoClose: 2000,
        style: { fontFamily: "Outfit, sans-serif" },
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });

      // Refresh the user list
      const usersResponse = await axios.get("http://127.0.0.1:8000/api/users/");
      setUsers(usersResponse.data);
    } catch (error) {
      toast.error("Failed to delete user", {
        position: "top-center",
        autoClose: 2000,
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
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  // Loading and error states
  if (loading) return <Loading />;
  if (error) {
    return <div className="p-4 text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-64">
          <Input
            type="text"
            placeholder="Search users..."
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
                          sortConfig.direction === "asc"
                            ? "text-primary-500 dark:text-primary-400"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      />
                      <ChevronDown
                        className={`h-3 w-3 -mt-1 transition-colors ${
                          sortConfig?.key === "id" &&
                          sortConfig.direction === "desc"
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
                    onClick={() => requestSort("first_name")}
                  >
                    Name
                    <span className="inline-flex flex-col ml-1">
                      <ChevronUp
                        className={`h-3 w-3 transition-colors ${
                          sortConfig?.key === "first_name" &&
                          sortConfig.direction === "asc"
                            ? "text-primary-500 dark:text-primary-400"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      />
                      <ChevronDown
                        className={`h-3 w-3 -mt-1 transition-colors ${
                          sortConfig?.key === "first_name" &&
                          sortConfig.direction === "desc"
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
                    onClick={() => requestSort("username")}
                  >
                    Username
                    <span className="inline-flex flex-col ml-1">
                      <ChevronUp
                        className={`h-3 w-3 transition-colors ${
                          sortConfig?.key === "username" &&
                          sortConfig.direction === "asc"
                            ? "text-primary-500 dark:text-primary-400"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      />
                      <ChevronDown
                        className={`h-3 w-3 -mt-1 transition-colors ${
                          sortConfig?.key === "username" &&
                          sortConfig.direction === "desc"
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
                    onClick={() => requestSort("email")}
                  >
                    Email
                    <span className="inline-flex flex-col ml-1">
                      <ChevronUp
                        className={`h-3 w-3 transition-colors ${
                          sortConfig?.key === "email" &&
                          sortConfig.direction === "asc"
                            ? "text-primary-500 dark:text-primary-400"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      />
                      <ChevronDown
                        className={`h-3 w-3 -mt-1 transition-colors ${
                          sortConfig?.key === "email" &&
                          sortConfig.direction === "desc"
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
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {currentItems.length > 0 ? (
                currentItems.map((user) => (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => handleViewUser(user)}
                  >
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-gray-400">
                          {user.id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-gray-400">
                          {user.first_name} {user.last_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      {user.username}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      {user.email}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      {user.phone_number}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400 space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditUser(user);
                        }}
                        className="px-4 py-2 bg-blue-light-500 text-white dark:text-white rounded-md hover:bg-blue-light-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(user);
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
                    colSpan={6}
                  >
                    No users found matching your criteria
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
          to{" "}
          {Math.min(currentPage * itemsPerPage, filteredAndSortedUsers.length)}{" "}
          of {filteredAndSortedUsers.length} entries
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

      {/* Edit User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full rounded-lg bg-white dark:bg-gray-800 p-8 shadow-xl">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-bold text-gray-800 dark:text-white">
              Edit User
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Update the user details below
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-base">
                    First Name *
                  </Label>
                  <Input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={selectedUser.first_name}
                    onChange={handleChange}
                    className={formErrors.first_name ? "border-red-500" : ""}
                  />
                  {formErrors.first_name && (
                    <p className="text-red-500 text-sm">
                      {formErrors.first_name}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-base">
                    Last Name *
                  </Label>
                  <Input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={selectedUser.last_name}
                    onChange={handleChange}
                    className={formErrors.last_name ? "border-red-500" : ""}
                  />
                  {formErrors.last_name && (
                    <p className="text-red-500 text-sm">
                      {formErrors.last_name}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-base">
                  Username *
                </Label>
                <Input
                  type="text"
                  id="username"
                  name="username"
                  value={selectedUser.username}
                  onChange={handleChange}
                  className={formErrors.username ? "border-red-500" : ""}
                />
                {formErrors.username && (
                  <p className="text-red-500 text-sm">{formErrors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">
                  Email *
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={selectedUser.email}
                  onChange={handleChange}
                  className={formErrors.email ? "border-red-500" : ""}
                />
                {formErrors.email && (
                  <p className="text-red-500 text-sm">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number" className="text-base">
                  Phone Number
                </Label>
                <Input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={selectedUser.phone_number || ""}
                  onChange={handleChange}
                  onInput={handlePhoneNumberInput}
                  className={formErrors.phone_number ? "border-red-500" : ""}
                />
                {formErrors.phone_number && (
                  <p className="text-red-500 text-sm">
                    {formErrors.phone_number}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base">
                  Password (leave blank to keep current)
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={selectedUser.password || ""}
                    onChange={handleChange}
                    className={formErrors.password ? "border-red-500" : ""}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeCloseIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-red-500 text-sm">{formErrors.password}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setSelectedUser(null);
                    setFormErrors({});
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!isFormValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin size-4" />
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="w-full rounded-lg bg-white dark:bg-gray-800 p-8 shadow-xl">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-bold text-gray-800 dark:text-white">
              Confirm Changes
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to update this user's information?
            </p>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsConfirmDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleConfirmedEdit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin size-4" />
                    Updating...
                  </span>
                ) : (
                  "Confirm Changes"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="w-full rounded-lg bg-white dark:bg-gray-800 p-8 shadow-xl">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-bold text-gray-800 dark:text-white">
              User Details
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Detailed information about the user
            </DialogDescription>
          </DialogHeader>

          {userToView && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-base font-medium">First Name</Label>
                  <p className="text-gray-800 dark:text-gray-200">
                    {userToView.first_name}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-base font-medium">Last Name</Label>
                  <p className="text-gray-800 dark:text-gray-200">
                    {userToView.last_name}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium">Username</Label>
                <p className="text-gray-800 dark:text-gray-200">
                  {userToView.username}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium">Email</Label>
                <p className="text-gray-800 dark:text-gray-200">
                  {userToView.email}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium">Phone Number</Label>
                <p className="text-gray-800 dark:text-gray-200">
                  {userToView.phone_number || "Not provided"}
                </p>
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
        <DialogContent className="w-full rounded-lg bg-white dark:bg-gray-800 p-8 shadow-xl">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-bold text-gray-800 dark:text-white">
              Delete User
            </DialogTitle>
          </DialogHeader>

          {userToDelete && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to permanently delete user{" "}
                <strong>
                  {userToDelete.first_name} {userToDelete.last_name}
                </strong>
                ? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDeleteDialogOpen(false);
                    setUserToDelete(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="error"
                  onClick={handleDeleteConfirm}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin size-4" />
                      Deleting...
                    </span>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
      />
    </div>
  );
}
