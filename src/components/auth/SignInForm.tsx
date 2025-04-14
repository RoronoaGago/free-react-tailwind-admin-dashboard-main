import { useState } from "react";
import { useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { useAuth } from "@/context/AuthContext";
import { Loading } from "../common/Loading";

// Replace with your actual image path
import loginImage from "@/assets/images/login-side-image.jpg";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const { login, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(credentials);
    if (success) {
      navigate("/");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="flex flex-col lg:flex-row w-full h-full">
      {/* Left Side - Login Form */}
      <div className="flex items-center justify-center w-full lg:w-1/2 p-8">
        <div className="w-full max-w-md">
          {/* Logo Container - Added above the welcome text */}
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
              Welcome Back
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Please enter your details to sign in
            </p>
          </div>

          {error && (
            <div className="p-4 mb-6 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
                <span className="ml-1 text-red-500">*</span>
              </Label>
              <Input
                placeholder="Enter your username"
                onChange={handleChange}
                name="username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition"
                
              />
            </div>

            <div>
              <Label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
                <span className="ml-1 text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  onChange={handleChange}
                  name="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition"
                  
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeIcon className="w-5 h-5" />
                  ) : (
                    <EyeCloseIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <Label
                  htmlFor="remember-me"
                  className="block ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  Remember me
                </Label>
              </div>

              <a
                href="#"
                className="text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300"
              >
                Forgot password?
              </a>
            </div>

            <button
              className="w-full px-4 py-3 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:bg-brand-500 dark:hover:bg-brand-600 transition-colors duration-300"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <a
                href="#"
                className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-200 dark:bg-gray-800">
        <img
          src="https://ippei-janine.com/photography/wp-content/uploads/DSC04124.jpg"
          alt="Login visual"
          className="object-cover w-full h-full"
        />
      </div>
    </div>
  );
}