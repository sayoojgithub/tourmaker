import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import { toast } from "react-toastify";
import Select from 'react-select';
//import loginimage from '../assets/images/loginimage'

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: "",
    companyName: "",
  });

  const [errors, setErrors] = useState({});
  const [companyOptions, setCompanyOptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch company names from backend
    const fetchCompanyNames = async () => {
      try {
        const response = await fetch(`${BASE_URL}/auth/getCompanyNames`);
        if (response.ok) {
          const data = await response.json();
          setCompanyOptions(data.map(company => ({ label: company, value: company })));
        } else {
          throw new Error("Failed to fetch company names");
        }
      } catch (error) {
        console.error("Error fetching company names:", error.message);
        toast.error("Failed to fetch company names");
      }
    };

    fetchCompanyNames();
  }, []);

  const validate = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    if (!formData.password.trim()) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = "Phone number is invalid";
    }
    if (!formData.role.trim()) {
      errors.role = "Role is required";
    }
    if (!formData.companyName.trim()) {
      errors.companyName = "Company name is required";
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCompanyChange = (selectedOption) => {
    setFormData({ ...formData, companyName: selectedOption ? selectedOption.value : "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validate();
    setErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        const response = await fetch(`${BASE_URL}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success("OTP sent to registered email");
          navigate("/otp", { state: { email: formData.email } });
        } else {
          toast.error(`Registration failed: ${data.message}`);
        }
      } catch (error) {
        toast.error("An error occurred: " + error.message);
      }
    }
  };

  return (
    <div className="font-sans">
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="grid lg:grid-cols-2 items-center gap-6 max-w-7xl max-lg:max-w-xl w-full">
          <form className="lg:max-w-md w-full" onSubmit={handleSubmit}>
            <h3 className="text-gray-800 text-3xl font-extrabold mb-12">
              Registration
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-gray-800 text-sm mb-2 block">Name</label>
                <input
                  name="name"
                  type="text"
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-4 focus:bg-transparent outline-blue-500 transition-all rounded-lg"
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 font-bold">
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label className="text-gray-800 text-sm mb-2 block">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-4 focus:bg-transparent outline-blue-500 transition-all rounded-lg"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 font-bold">
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <label className="text-gray-800 text-sm mb-2 block">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-4 focus:bg-transparent outline-blue-500 transition-all rounded-lg"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 font-bold">
                    {errors.password}
                  </p>
                )}
              </div>
              <div>
                <label className="text-gray-800 text-sm mb-2 block">
                  Phone Number
                </label>
                <input
                  name="phoneNumber"
                  type="tel"
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-4 focus:bg-transparent outline-blue-500 transition-all rounded-lg"
                  placeholder="Enter phone number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1 font-bold">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
              <div>
                <label className="text-gray-800 text-sm mb-2 block">Role</label>
                <div className="relative">
                  <select
                    name="role"
                    className="block w-full px-3 py-2.5 text-sm text-gray-800 bg-transparent border-0 border-b-2 border-gray-200 appearance-none focus:outline-none focus:border-blue-500 rounded-lg"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="">Select a role</option>
                    <option value="sales">Sales</option>
                    <option value="front office">Front Office</option>
                    <option value="purchase">Purchase</option>
                    <option value="executive">Executive</option>
                    <option value="billing">Billing</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-800">
                    <svg
                      className="h-4 w-4 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.293 7.293a1 1 0 011.414 0L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                {errors.role && (
                  <p className="text-red-500 text-xs mt-1 font-bold">
                    {errors.role}
                  </p>
                )}
              </div>
              <div>
                <label className="text-gray-800 text-sm mb-2 block">
                  Company Name
                </label>
                <div className="relative">
                  <Select
                    name="companyName"
                    options={companyOptions}
                    className="basic-single"
                    classNamePrefix="select"
                    placeholder="Select a company"
                    isSearchable
                    value={companyOptions.find(option => option.value === formData.companyName)}
                    onChange={handleCompanyChange}
                  />
                </div>
                {errors.companyName && (
                  <p className="text-red-500 text-xs mt-1 font-bold">
                    {errors.companyName}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-12">
              <button
                type="submit"
                className="py-4 px-8 text-sm font-semibold text-white tracking-wide bg-blue-600 hover:bg-blue-700 focus:outline-none rounded-lg"
              >
                Create an account
              </button>
            </div>
            <p className="text-sm text-gray-800 mt-6">
              Already have an account?{" "}
              <a
                href="#"
                className="text-[#87ceeb] hover:underline font-semibold"
              >
                <Link to="/login">Login here</Link>
              </a>
            </p>
          </form>

          <div className="h-full max-lg:mt-12">
            <img
              src="https://readymadeui.com/login-image.webp"
              className="w-full h-full object-cover rounded-lg"
              alt="Dining Experience"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
