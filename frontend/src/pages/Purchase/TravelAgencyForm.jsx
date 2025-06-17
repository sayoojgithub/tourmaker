import React, { useState, useEffect } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";
import "./Popup.css";

// Custom styles for react-select (optional)
const customStyles = {
  menuList: (provided) => ({
    ...provided,
    maxHeight: 120, // Max height of 120px to show approximately 3 options
    overflowY: "auto", // Enable vertical scrolling
  }),
};

const TravelAgencyForm = ({ travelAgencyId, onNext }) => {
  const initialFormData = {
    destinationId: "",
    destinationName: "",
    travelsName: "",
    ownerName: "",
    address: "",
    email: "",
    contactNumber: "",
    whatsappNumber: "",
  };
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [destinations, setDestinations] = useState([]);

  const [loadingDestinations, setLoadingDestinations] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState("");

  useEffect(() => {
    if (travelAgencyId) {
      const fetchTravelAgency = async () => {
        try {
          const response = await fetch(
            `${BASE_URL}/purchaser/travelAgency/${travelAgencyId}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch accommodation details");
          }
          const data = await response.json();
          setFormData(data);
        } catch (error) {
          console.error("Failed to fetch travelAgency details:", error);
          toast.error("Failed to fetch travelAgency details");
        }
      };

      fetchTravelAgency();
    } else {
      // Reset form data if no accommodationId is provided
      setFormData(initialFormData);
    }
  }, [travelAgencyId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error on change
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleDestinationChange = (selectedOption) => {
    setErrors({ ...errors, destinationName: "" });
    setFormData({
      ...formData,
      destinationId: selectedOption._id, // Store selected destination's _id
      destinationName: selectedOption.value, // Store selected destination's name
    });
  };

  const handleDestinationFocus = async () => {
    setLoadingDestinations(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`${BASE_URL}/purchaser/getDestinationsName?companyId=${storedUser.companyId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch destinations");
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
      toast.error("Failed to fetch destinations");
    }
    setLoadingDestinations(false);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.destinationName)
      newErrors.destinationName = "Destination is required.";
    if (!formData.travelsName)
      newErrors.travelsName = "Travels Name is required.";

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid.";
    }

    if (!formData.contactNumber) {
      newErrors.contactNumber = "Contact Number is required."; // Mandatory without digit restriction
    }

    

    setErrors(newErrors);

    // Return true if no errors
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    // Retrieve purchaserId from localStorage
    const purchaserId = JSON.parse(localStorage.getItem("user"))?._id;

    // Add purchaserId to formData if not present
    const dataToSubmit = { ...formData };
    if (!travelAgencyId) {
      dataToSubmit.purchaserId = purchaserId;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/purchaser/${
          travelAgencyId
            ? `updateTravelAgency/${travelAgencyId}`
            : "createTravelAgency"
        }`,
        {
          method: travelAgencyId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSubmit),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save accommodation");
      }

      // Toast success message based on operation
      if (travelAgencyId) {
        toast.success("TravelAgency updated successfully");
        onNext();
      } else {
        const createdTravels = await response.json();
        setPopupContent(createdTravels.data.travelAgencyId);
        setShowPopup(true);
        toast.success("TravelAgency created successfully");
      }

      // Reset form data after successful submission
      setFormData(initialFormData);

      // Optionally, you can call onNext or perform other actions here
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="w-full  p-4 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-2xl mt-1">
    {/* Main Form */}
    <div
        className="overflow-y-auto" // Enable vertical scrolling
        style={{ maxHeight: "420px",
        scrollbarWidth: "none", // For Firefox
        msOverflowStyle: "none", // For IE/Edge
        }} // Set max height to 170px
      >
    <form
      onSubmit={handleSubmit}
      className="p-4 space-y-4 bg-white/20 shadow-md rounded-lg"
    >
      <div className="flex justify-center mb-4">
  <div className="inline-block bg-white px-3 py-1 rounded-md shadow">
    <h2 className="text-xl font-bold text-red-600 text-center">
      {travelAgencyId ? "Edit Agency" : "Create Agency"}
    </h2>
  </div>
</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Destination Select */}
        <div>
          <Select
            name="destinationName"
            value={destinations.find(
              (option) => option.value === formData.destinationName
            )}
            onChange={handleDestinationChange}
            onFocus={handleDestinationFocus}
            options={destinations}
            isLoading={loadingDestinations}
            placeholder={
              travelAgencyId && formData.destinationName
                ? formData.destinationName
                : "Select a Destination"
            }
            classNamePrefix="react-select"
            styles={customStyles}
            isDisabled={!!travelAgencyId}
          />
          {errors.destinationName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.destinationName}
            </p>
          )}
        </div>

        {/* Travels Name */}
        <div>
          <input
            type="text"
            name="travelsName"
            value={formData.travelsName}
            onChange={handleChange}
            placeholder="Travels Name"
            className={`w-full p-2 border ${
              errors.travelsName ? "border-red-500" : "border-gray-300"
            } rounded-md`}
            disabled={!!travelAgencyId}
          />
          {errors.travelsName && (
            <p className="text-red-500 text-sm mt-1">{errors.travelsName}</p>
          )}
        </div>

        {/* Owner Name */}
        <div>
          <input
            type="text"
            name="ownerName"
            value={formData.ownerName}
            onChange={handleChange}
            placeholder="Owner Name"
            className={`w-full p-2 border ${
              errors.ownerOrDriverName ? "border-red-500" : "border-gray-300"
            } rounded-md`}
          />
          {errors.ownerOrDriverName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.ownerOrDriverName}
            </p>
          )}
          {/* Conditionally render the placeholder below if there is a value */}
          {formData.ownerName && (
            <p className="text-gray-500 text-sm mt-1">Owner Name</p>
          )}
        </div>

        {/* Email */}
        <div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className={`w-full p-2 border ${
              errors.email ? "border-red-500" : "border-gray-300"
            } rounded-md`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
          {/* Conditionally render the placeholder below if there is a value */}
          {formData.email && (
            <p className="text-gray-500 text-sm mt-1">Email</p>
          )}
        </div>

        {/* Contact Number */}
        <div>
          <input
            type="text"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            placeholder="Contact Number"
            className={`w-full p-2 border ${
              errors.contactNumber ? "border-red-500" : "border-gray-300"
            } rounded-md`}
          />
          {errors.contactNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>
          )}
          {/* Conditionally render the placeholder below if there is a value */}
          {formData.contactNumber && (
            <p className="text-gray-500 text-sm mt-1">Contact Number</p>
          )}
        </div>

        {/* WhatsApp Number */}
        <div>
          <input
            type="text"
            name="whatsappNumber"
            value={formData.whatsappNumber}
            onChange={handleChange}
            placeholder="WhatsApp Number"
            className={`w-full p-2 border ${
              errors.whatsappNumber ? "border-red-500" : "border-gray-300"
            } rounded-md`}
          />
          {errors.whatsappNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.whatsappNumber}</p>
          )}
          {/* Conditionally render the placeholder below if there is a value */}
          {formData.whatsappNumber && (
            <p className="text-gray-500 text-sm mt-1">WhatsApp Number</p>
          )}
        </div>

        {/* Address */}
        <div className="sm:col-span-2">
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
            className={`w-full p-2 border ${
              errors.address ? "border-red-500" : "border-gray-300"
            } rounded-md`}
            rows="1"
          ></textarea>
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address}</p>
          )}
          {/* Conditionally render the placeholder below if there is a value */}
          {formData.address && (
            <p className="text-gray-500 text-sm mt-1">Address</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        {travelAgencyId ? "Update Travel Agency" : "Create Travel Agency"}
      </button>

      {/* Switch Button (Optional) */}
      <div className="flex justify-center mt-4">
        <button
          type="button"
          onClick={onNext}
          className="w-full py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Switch
        </button>
      </div>

      {/* Popup */}
      <div>
        {/* Popup */}
        {showPopup && (
          <div className="popup-overlay">
            <div className="popup-content">
              <p>Please note down the travels ID:</p>
              <p className="accommodation-id">{popupContent}</p>
              <button className="close-button" onClick={handleClosePopup}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
    </div>
    </div>
  );
};

export default TravelAgencyForm;
