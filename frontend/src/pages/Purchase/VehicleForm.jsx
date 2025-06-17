import React, { useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";

// Custom styles for react-select
const customStyles = {
  menuList: (provided) => ({
    ...provided,
    maxHeight: 120, // Max height of 120px
    overflowY: "auto", // Enable vertical scrolling
  }),
};

const VehicleForm = ({ onNext }) => {
  const initialFormData = {
    travelAgencyId: "",
    destinationName: "",
    travelsName: "",
    ownerName: "",
    email: "",
    contactNumber: "",
    whatsappNumber: "",
    address: "",
    vehicleName: "",
    vehicleCategory: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([
    { value: "2 Wheeler", label: "2 Wheeler" },
    { value: "4 Seater", label: "4 Seater" },
    { value: "6 Seater", label: "6 Seater" },
    { value: "7 Seater", label: "7 Seater" },
    { value: "8 Seater", label: "8 Seater" },
    { value: "9 Seater", label: "9 Seater" },
    { value: "10 Seater", label:"10 Seater"} ,
    { value: "12 Seater", label: "12 Seater" },
    { value: "13 Seater", label: "13 Seater" },
    { value: "14 Seater", label: "14 Seater" },
    { value: "15 Seater", label: "15 Seater" },
    { value: "16 Seater", label: "16 Seater" },
    { value: "17 Seater", label: "17 Seater" },
    { value: "21 Seater", label: "21 Seater" },
    { value: "23 Seater", label: "23 Seater" },
    { value: "25 Seater", label: "25 Seater" },
    { value: "27 Seater", label: "27 Seater" },
    { value: "30 Seater", label: "30 Seater" },
    { value: "35 Seater", label: "35 Seater" },
    { value: "40 Seater", label: "40 Seater" },
    { value: "44 Seater", label: "44 Seater" },
    { value: "49 Seater", label: "49 Seater" },
    { value: "55 Seater", label: "55 Seater" },
    { value: "60 Seater", label: "60 Seater" },
  ]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Handle vehicle category change
  const handleCategoryChange = (selectedOption) => {
    setFormData({ ...formData, vehicleCategory: selectedOption.value });
  };

  // Fetch TravelAgency details based on TravelID
  const handleSearch = async () => {
    if (!formData.travelAgencyId) {
      toast.error("Please enter a Travels ID before searching.");
      return; // Exit the function early
    }
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const purchaserId = user._id;

      const response = await fetch(
        `${BASE_URL}/purchaser/getTravelAgency/${formData.travelAgencyId}?purchaserId=${purchaserId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "An error occurred");
      }

      const travelAgency = await response.json();
      setFormData({
        ...formData,
        destinationName: travelAgency.destinationName,
        travelsName: travelAgency.travelsName,
        ownerName: travelAgency.ownerName,
        email: travelAgency.email,
        contactNumber: travelAgency.contactNumber,
        whatsappNumber: travelAgency.whatsappNumber,
        address: travelAgency.address,
      });
      toast.success("Travel agency details fetched successfully");
    } catch (error) {
      setFormData(initialFormData);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    

    try {
      // Get user data from localStorage
      const user = JSON.parse(localStorage.getItem("user"));
      const purchaserId = user._id;

      // Combine purchaserId with formData
      const dataToSend = {
        ...formData,
        purchaserId,
      };

      // Make the POST request to the backend to create the vehicle
      const response = await fetch(`${BASE_URL}/purchaser/createVehicle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create vehicle");
      }

      // Reset form (except autofilled details)
      setFormData(initialFormData);

      // Display success message
      toast.success("Vehicle created successfully!");
    } catch (error) {
      // Handle errors
      toast.error(error.message);
    }
  };

  return (
    <div className="w-full  p-4 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-2xl mt-1">
    {/* Main Form */}
     <div
        className="overflow-y-auto" // Enable vertical scrolling
        style={{ maxHeight: "445px",
        scrollbarWidth: "none", // For Firefox
        msOverflowStyle: "none", // For IE/Edge
        }} // Set max height to 170px
      >
    <form
      onSubmit={handleSubmit}
      className="p-2 space-y-4 bg-white/20 shadow-md rounded-lg"
    >
      <div className="flex justify-center mb-4">
  <div className="inline-block bg-white px-3 py-1 rounded-md shadow">
    <h2 className="text-xl font-bold text-red-600 text-center">
      Create Vehicle
    </h2>
  </div>
</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* TravelID */}
        <div className="col-span-2 sm:col-span-1">
          <input
            type="text"
            name="travelAgencyId"
            value={formData.travelAgencyId}
            onChange={handleChange}
            placeholder="Enter TravelsID"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="col-span-2 sm:col-span-1 flex items-center">
          <button
            type="button"
            onClick={handleSearch}
            className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Autofilled fields - not editable */}
        <div>
          <input
            type="text"
            name="destinationName"
            value={formData.destinationName}
            placeholder="Destination"
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled
          />
        </div>

        <div>
          <input
            type="text"
            name="travelsName"
            value={formData.travelsName}
            placeholder="Travels Name"
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled
          />
        </div>

        <div>
          <input
            type="text"
            name="ownerName"
            value={formData.ownerName}
            placeholder="Owner Name"
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled
          />
        </div>

        <div>
          <input
            type="email"
            name="email"
            value={formData.email}
            placeholder="Email"
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled
          />
        </div>

        <div>
          <input
            type="text"
            name="contactNumber"
            value={formData.contactNumber}
            placeholder="Contact Number"
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled
          />
        </div>

        <div>
          <input
            type="text"
            name="whatsappNumber"
            value={formData.whatsappNumber}
            placeholder="WhatsApp Number"
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled
          />
        </div>

        <div className="sm:col-span-2">
          <textarea
            name="address"
            value={formData.address}
            placeholder="Address"
            className="w-full p-2 border border-gray-300 rounded-md"
            rows="2"
            disabled
          ></textarea>
        </div>

        {/* Vehicle Category */}
        <div className="col-span-2 sm:col-span-1">
          <Select
            name="vehicleCategory"
            value={categories.find(
              (option) => option.value === formData.vehicleCategory
            )}
            onChange={handleCategoryChange}
            options={categories}
            placeholder="Select Vehicle Category"
            classNamePrefix="react-select"
            styles={customStyles}
          />
          
        </div>
        {/* Vehicle Name */}
        <div className="col-span-2 sm:col-span-1">
          <input
            type="text"
            name="vehicleName"
            value={formData.vehicleName}
            onChange={handleChange}
            placeholder="Enter Vehicle Name"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        Create Vehicle
      </button>

      {/* Switch Button */}
      <div className="flex justify-center mt-4">
        <button
          type="button"
          onClick={onNext}
          className="w-full py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Switch
        </button>
      </div>
    </form>
    </div>
    </div>
  );
};

export default VehicleForm;