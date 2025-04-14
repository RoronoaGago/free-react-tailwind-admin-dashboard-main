import { useEffect, useState, useMemo } from "react";
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
} from "lucide-react";
import { EyeCloseIcon } from "@/icons";
import { User } from "@/lib/types";
import Button from "@/components/ui/button/Button";
import axios from "axios";
import Badge from "@/components/ui/badge/Badge";

type SortDirection = "asc" | "desc" | null;
type SortableField = keyof Pick<
  User,
  "id" | "first_name" | "last_name" | "username" | "email" | "phone_number"
>;
interface UsersTableProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function UsersTable({ users, setUsers }: UsersTableProps) {
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/users/");
        setUsers(response.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = [...users];

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
  }, [users, searchTerm, sortConfig]);

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
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  // Handle delete user
  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/api/users/${selectedUser.id}/`,
        selectedUser
      );
      toast.success("User updated successfully!");

      // Refresh the user list
      const usersResponse = await axios.get("http://127.0.0.1:8000/api/users/");
      setUsers(usersResponse.data);
    } catch (error) {
      toast.error("Failed to update user");
    } finally {
      setIsDialogOpen(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/users/${userToDelete.id}/`);
      toast.success("User deleted successfully!");

      // Refresh the user list
      const usersResponse = await axios.get("http://127.0.0.1:8000/api/users/");
      setUsers(usersResponse.data);
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  // Loading and error states
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

                {/* Repeat pattern for other sortable columns */}
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
                  <TableRow key={user.id}>
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
                        onClick={() => handleEditUser(user)}
                        className="px-4 py-2 bg-blue-light-500 text-white dark:text-white rounded-md hover:bg-blue-light-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
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
        <DialogContent className="max-w-md dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Edit User
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={selectedUser.first_name}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        first_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={selectedUser.last_name}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        last_name: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  type="text"
                  id="username"
                  name="username"
                  value={selectedUser.username}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      username: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={selectedUser.email}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={selectedUser.phone_number || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      phone_number: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setSelectedUser(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Delete User
            </DialogTitle>
          </DialogHeader>

          {userToDelete && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete user{" "}
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
