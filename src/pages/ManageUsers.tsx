import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Bounce, ToastContainer, toast } from "react-toastify";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UsersTable from "../components/tables/BasicTables/UsersTable";
import Button from "../components/ui/button/Button";
import { CalenderIcon, EyeCloseIcon, PlusIcon } from "../icons";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { EyeIcon, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { UserFormData } from "@/lib/types";
import axios from "axios";

const ManageUsers = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState<UserFormData>({
    first_name: "",
    last_name: "",
    username: "",
    password: "",
    date_of_birth: "",
    email: "",
    phone_number: "",
  });

  //  fields
  const Fields = ["first_name", "last_name", "username", "password", "email"];

  // Check if all  fields are filled
  const isFormValid = Fields.every(
    (field) => formData[field as keyof UserFormData]?.trim() !== ""
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/users/");
        setUsers(response.data);
      } catch (error) {
        toast.error("Failed to fetch users", {
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
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error("Please fill in all  fields!", {
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
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/users/", {
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
        password: formData.password,
        email: formData.email,
        date_of_birth: formData.date_of_birth,
        phone_number: formData.phone_number,
      });

      setUsers((prevUsers) => [...prevUsers, response.data]);

      toast.success("User Added Successfully!", {
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

      setFormData({
        first_name: "",
        last_name: "",
        username: "",
        password: "",
        date_of_birth: "",
        email: "",
        phone_number: "",
      });
      setIsDialogOpen(false);
    } catch (error) {
      let errorMessage = "Failed to add user. Please try again.";

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
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageBreadcrumb pageTitle="Manage Users" />
      <div className="space-y-6">
        <div className="flex justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="md"
                variant="primary"
                startIcon={<PlusIcon className="size-6" />}
              >
                Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md dark:bg-gray-900">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Add New User
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  Fill in the user details below
                </DialogDescription>
              </DialogHeader>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      type="text"
                      id="first_name"
                      name="first_name"
                      placeholder="John"
                      value={formData.first_name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      type="text"
                      id="last_name"
                      name="last_name"
                      placeholder="Doe"
                      value={formData.last_name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="johndoe123"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeIcon className="size-5" />
                      ) : (
                        <EyeCloseIcon className="size-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Birthdate</Label>
                  <div className="relative">
                    <Input
                      type="date"
                      id="date_of_birth"
                      name="date_of_birth"
                      className="[&::-webkit-calendar-picker-indicator]:opacity-0"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      max={new Date().toISOString().split("T")[0]}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <CalenderIcon className="size-5" />
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone_number}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
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
                        Adding...
                      </span>
                    ) : (
                      "Add User"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <UsersTable users={users} setUsers={setUsers} />
      </div>
      <ToastContainer />
    </div>
  );
};

export default ManageUsers;
