import React, { useState } from 'react';
import { BASE_URL } from '../../config';
import { toast } from 'react-toastify';
import Select from 'react-select';

const EmployeeRegistration = () => {
  const customStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "#f3f4f6",
      borderRadius: "10px",
      boxShadow: state.isFocused ? "0 0 5px rgba(0, 120, 255, 0.5)" : "none",
      border: state.isFocused ? "2px solid #007BFF" : "1px solid #ccc",
      padding: "5px",
      height: "50px", // Keep a fixed height
      display: "flex",
      alignItems: "center",
      overflowX: "auto", // Enable horizontal scrolling
      whiteSpace: "nowrap", // Prevent wrapping of items
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#007BFF" : "white",
      color: state.isFocused ? "white" : "black",
      padding: "10px",
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "#0056b3",
        color: "white",
      },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#007BFF",
      color: "white",
      borderRadius: "5px",
      padding: "3px 5px",
      margin: "2px", // Add some margin for spacing between items
      display: "flex",
      alignItems: "center",
      whiteSpace: "nowrap", // Prevent text from wrapping in individual items
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "white",
      padding: "0 5px", // Add some horizontal padding
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "white",
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "#0056b3",
        color: "white",
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: "#aaa",
      fontSize: "0.9rem",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "#007BFF",
      "&:hover": {
        color: "#0056b3",
      },
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "#ccc",
      "&:hover": {
        color: "#007BFF",
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "white",
      borderRadius: "10px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      zIndex: 10,
      maxHeight: "100px", // Set max height for the dropdown menu
      overflowY: "auto", // Enable vertical scroll if content exceeds max height
    }),
  };



  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobileNumber: '',
    role: '',
    tourName: [],
  });
  console.log(formData)

  const [errors, setErrors] = useState({});
  const [destinations, setDestinations] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors({ ...errors, [name]: "" });
  
    // Update formData and clear tourName if role is not "executive"
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
      tourName: name === 'role' && value !== 'executive' ? [] : prevFormData.tourName,
    }));
  };
  
  const handleSelectChange = (selectedOption, name) => {
    setFormData({
      ...formData,
      [name]: selectedOption,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email format is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.mobileNumber) newErrors.mobileNumber = 'Mobile number is required';
    else if (!/^\d{10}$/.test(formData.mobileNumber)) newErrors.mobileNumber = 'Mobile number format is invalid';
    if (!formData.role) newErrors.role = 'Role is required';
    if ((formData.role === 'executive' || formData.role === 'customer care') && formData.tourName.length === 0) {
  newErrors.tourName = 'Should assign at least one destination';
}

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        const response = await fetch(`${BASE_URL}/company/employeeRegistration/${storedUser._id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();
        if (response.ok) {
          toast.success('Employee registration successful!');
          setFormData({
            name: '',
            email: '',
            password: '',
            mobileNumber:'',
            role: '',
            tourName: [],
          });
        } else {
          console.error('Registration failed:', data.message);
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  const fetchDestinations = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`${BASE_URL}/company/getDestinationsName?companyId=${storedUser._id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch destinations");
      }
      const data = await response.json();
      const options = data.map((destination) => ({
        _id: destination._id,
        value: destination.value,
        label: destination.label,
      }));
      setDestinations(options);
    } catch (error) {
      console.error("Failed to fetch destinations:", error);
      toast.error(
        error.message || "An error occurred while fetching destinations"
      );
    } finally {
    }
  };

  return (
<div className="w-full  p-4 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg mt-2">

  <form className="w-full" onSubmit={handleSubmit}>
    <div className="flex flex-wrap border shadow rounded-lg p-5 bg-white/20">
      <div className="flex items-center justify-center mb-4">
  <div className="flex items-center gap-1 bg-white/30 px-2 py-2 rounded-lg shadow">
    <h2 className="text-xl font-semibold text-red-600">Register employee here:</h2>
  </div>
</div>

      <div className="flex flex-col gap-4 w-full border-gray-400">

        {/* First Row: Name and Mobile Number */}
        <div className="flex gap-4 w-full">
          <div className="w-1/2">
            <label className="text-gray-800 text-sm mb-2 block">Name</label>
            <input
              name="name"
              className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3 focus:bg-transparent outline-blue-500 transition-all rounded-lg"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter name"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>
          <div className="w-1/2">
            <label className="text-gray-800 text-sm mb-2 block">Mobile Number</label>
            <input
              name="mobileNumber"
              className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3 focus:bg-transparent outline-blue-500 transition-all rounded-lg"
              type="text"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="Enter mobile number"
            />
            {errors.mobileNumber && <p className="text-red-500 text-sm">{errors.mobileNumber}</p>}
          </div>
        </div>

        {/* Second Row: Email and Password */}
        <div className="flex gap-4 w-full">
          <div className="w-1/2">
            <label className="text-gray-800 text-sm mb-2 block">Email</label>
            <input
              name="email"
              className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3 focus:bg-transparent outline-blue-500 transition-all rounded-lg"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>
          <div className="w-1/2">
            <label className="text-gray-800 text-sm mb-2 block">Password</label>
            <input
              name="password"
              className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3 focus:bg-transparent outline-blue-500 transition-all rounded-lg"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>
        </div>

        {/* Third Row: Role */}
        <div className="w-full">
          <label className="text-gray-800 text-sm mb-2 block">Role</label>
          <select
            name="role"
            className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3 focus:bg-transparent outline-blue-500 transition-all rounded-lg"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="">Select a role</option>
            <option value="sales">Sales</option>
            <option value="front office">Front Office</option>
            <option value="purchase">Purchase</option>
            <option value="executive">Executive</option>
            <option value="billing">Billing</option>
            <option value="booking">Booking</option>
            <option value="customer care">Customer Care</option>
          </select>
          {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
        </div>
         {/* Tour Destinations for Executives */}
         {(formData.role === 'executive' || formData.role === 'customer care') && (
              <div className="w-full mt-1">
                <label className="text-gray-800 text-sm mb-2 block">Tour Destinations</label>
                <Select
                  isMulti
                  options={destinations}
                  value={formData.tourName}
                  onChange={(selected) => { handleSelectChange(selected, "tourName"); if (errors.tourName) setErrors({ ...errors, tourName: "" }); }}
                  placeholder="Assign Tour Destinations"
                  styles={customStyles}
                  onMenuOpen={fetchDestinations}
                />
                {errors.tourName && <p className="text-red-500 text-sm">{errors.tourName}</p>}
              </div>
            )}

        {/* Submit Button */}
        <div className="flex justify-center mt-2">
          <button
            className="py-2.5 px-3 text-center bg-primaryColor text-white w-full font-bold rounded-lg"
            type="submit"
          >
            Register Employee
          </button>
        </div>

      </div>
    </div>
  </form>
</div>

  );
};

export default EmployeeRegistration;
