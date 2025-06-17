import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Select from "react-select";
import { BASE_URL } from "../../config";
import "./Popup.css";

const AccommodationForm = ({ onNext, accommodationId }) => {
  const initialFormData = {
    destinationId: "",
    destinationName: "",
    propertyName: "",
    ownerOrManagerName: "",
    address: "",
    email: "",
    contactNumber: "",
    whatsappNumber: "",
    roomCategory: "",
    price_2bed_ap: "",
    price_2bed_cp: "",
    price_2bed_map: "",
    price_3bed_ap: "",
    price_3bed_cp: "",
    price_3bed_map: "",
    price_extrabed_ap: "",
    price_extrabed_cp: "",
    price_extrabed_map: "",
    earlyCheckInPrice: "",
    lateCheckoutPrice: "",
    freshUpPrice: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [destinations, setDestinations] = useState([]);
  const [loadingDestinations, setLoadingDestinations] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState("");

  useEffect(() => {
    if (accommodationId) {
      const fetchAccommodation = async () => {
        try {
          const response = await fetch(
            `${BASE_URL}/purchaser/accommodation/${accommodationId}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch accommodation details");
          }
          const data = await response.json();
          setFormData(data);
        } catch (error) {
          console.error("Failed to fetch accommodation details:", error);
          toast.error("Failed to fetch accommodation details");
        }
      };

      fetchAccommodation();
    } else {
      // Reset form data if no accommodationId is provided
      setFormData(initialFormData);
    }
  }, [accommodationId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Remove error message when user starts correcting the input
    setErrors({ ...errors, [name]: "" });
    setFormData({ ...formData, [name]: value });
  };

  // Handle destination change
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

  // Validation Function
  const validate = () => {
    const newErrors = {};

    // Required Fields
    if (!formData.destinationName.trim()) {
      newErrors.destinationName = "Destination is required.";
    }
    if (!formData.propertyName.trim()) {
      newErrors.propertyName = "Property Name is required.";
    }
    if (!formData.ownerOrManagerName.trim()) {
      newErrors.ownerOrManagerName = "Owner or Manager Name is required.";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required.";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email.trim())) {
      newErrors.email = "Invalid email format.";
    }
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact Number is required.";
    } else if (!/^\d{10}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = "Contact Number must be 10 digits.";
    }

    if (formData.whatsappNumber.trim()) {
      if (!/^\d{10}$/.test(formData.whatsappNumber)) {
        newErrors.whatsappNumber = "WhatsApp Number must be 10 digits.";
      }
    }

    if (!formData.roomCategory.trim()) {
      newErrors.roomCategory = "Room Category is required.";
    }

    // Price Fields - Positive Values
    const priceFields = [
      "price_2bed_ap",
      "price_2bed_cp",
      "price_2bed_map",
      "price_3bed_ap",
      "price_3bed_cp",
      "price_3bed_map",
      "price_extrabed_ap",
      "price_extrabed_cp",
      "price_extrabed_map",
      "earlyCheckInPrice",
      "lateCheckoutPrice",
      "freshUpPrice",
    ];

    priceFields.forEach((field) => {
      const value = formData[field];
      if (
        value !== null &&
        value !== "" &&
        (isNaN(value) || Number(value) <= 0)
      ) {
        newErrors[field] = "Must be a positive number.";
      }
    });

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
    if (!accommodationId) {
      dataToSubmit.purchaserId = purchaserId;
    }
    console.log(dataToSubmit,'data of accommodation ')

    try {
      const response = await fetch(
        `${BASE_URL}/purchaser/${
          accommodationId
            ? `updateAccommodation/${accommodationId}`
            : "createAccommodation"
        }`,
        {
          method: accommodationId ? "PUT" : "POST",
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
      if (accommodationId) {
        toast.success("Accommodation updated successfully");
        onNext();
      } else {
        const createdAccommodation = await response.json();
        console.log(createdAccommodation, "createdoneeeeeee");
        setPopupContent(createdAccommodation.data.accommodationId);
        setShowPopup(true);
        toast.success("Accommodation created successfully");
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

  const customStyles = {
    menuList: (provided) => ({
      ...provided,
      maxHeight: 120, // Max height of 120px to show approximately 3 options
      overflowY: "auto", // Enable vertical scrolling
    }),
  };

  return (
    <div className="w-full  p-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-2xl mt-1">
      {/* Main Form */}
      <div
        className="overflow-y-auto" // Enable vertical scrolling
        style={{ maxHeight: "460px",
        scrollbarWidth: "none", // For Firefox
        msOverflowStyle: "none", // For IE/Edge
        }} // Set max height to 170px
      >
    <form
      onSubmit={handleSubmit}
      className="p-4 space-y-4 bg-white/20 shadow-md rounded-lg"
    >
      <div className="flex justify-center mb-1 mt-1">
  <div className="inline-block bg-white px-2 py-1 rounded-md shadow">
    <h2 className="text-xl font-bold text-red-600 text-center">
      {accommodationId ? "Edit Accommodation" : "Create Accommodation"}
    </h2>
  </div>
</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
      {/* <div className="w-full"> */}
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
              accommodationId && formData.destinationName
                ? formData.destinationName
                : "Select a Destination"
            }
            classNamePrefix="react-select"
            styles={customStyles} // Apply inline styles
            isDisabled={!!accommodationId}
          />
          {errors.destinationName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.destinationName}
            </p>
          )}
        </div>

        {/* Two Fields per Row */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> */}
        <div>
          <input
            type="text"
            name="propertyName"
            value={formData.propertyName}
            onChange={handleChange}
            placeholder="Property Name"
            className={`w-full p-2 border ${
              errors.propertyName ? "border-red-500" : "border-gray-300"
            } rounded-md`}
            disabled={!!accommodationId}
          />
          {errors.propertyName && (
            <p className="text-red-500 text-sm mt-1">{errors.propertyName}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            name="ownerOrManagerName"
            value={formData.ownerOrManagerName}
            onChange={handleChange}
            placeholder="Owner or Manager Name"
            className={`w-full p-2 border ${
              errors.ownerOrManagerName ? "border-red-500" : "border-gray-300"
            } rounded-md`}
            disabled={!!accommodationId}
          />
          {errors.ownerOrManagerName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.ownerOrManagerName}
            </p>
          )}
        </div>

        <div>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
            className={`w-full p-2 border ${
              errors.address ? "border-red-500" : "border-gray-300"
            } rounded-md`}
            rows="1"
            disabled={!!accommodationId}
          ></textarea>
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address}</p>
          )}
        </div>
        <div>
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className={`w-full p-2 border ${
              errors.email ? "border-red-500" : "border-gray-300"
            } rounded-md`}
            disabled={!!accommodationId}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

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
            disabled={!!accommodationId}
          />
          {errors.contactNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>
          )}
        </div>
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
            disabled={!!accommodationId}
          />
          {errors.whatsappNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.whatsappNumber}</p>
          )}
        </div>

        {/* Room Category as Select Option */}
        <div>
          <select
            name="roomCategory"
            value={formData.roomCategory}
            onChange={handleChange}
            className={`w-full p-2 border ${
              errors.roomCategory ? "border-red-500" : "border-gray-300"
            } rounded-md`}
            disabled={!!accommodationId}
          >
            <option value="">Select Room Category</option>
            <option value="Budget">Budjet</option>
            <option value="Standard">Standard</option>
            <option value="Deluxe">Deluxe</option>
            <option value="3 Star">3 Star</option>
            <option value="4 Star">4 Star</option>
            <option value="5 Star">5 Star</option>
            <option value="Tent Stay">Tent stay</option>
            <option value="Home Stay">Home stay</option>
            <option value="Apartment">Apartment</option>
            <option value="House Boat">HouseBoat</option>
          </select>
          {errors.roomCategory && (
            <p className="text-red-500 text-sm mt-1">{errors.roomCategory}</p>
          )}
        </div>
      </div>

      {/* Three Fields per Row for Prices */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <div>
          <input
            type="text"
            name="price_2bed_ap"
            value={formData.price_2bed_ap}
            onChange={handleChange}
            placeholder="2-Bed EP Price"
            className={`w-full p-2 border ${
              errors.price_2bed_ap ? "border-red-500" : "border-gray-300"
            } rounded-md`}
            min="0"
          />
          {errors.price_2bed_ap && (
            <p className="text-red-500 text-sm mt-1">{errors.price_2bed_ap}</p>
          )}
          {/* Conditionally render the placeholder below if there is a value */}
          {formData.price_2bed_ap && (
            <p className="text-gray-500 text-sm mt-1"> 2-Bed EP Price</p>
          )}
        </div>
        <div>
          <input
            type="text"
            name="price_2bed_cp"
            value={formData.price_2bed_cp}
            onChange={handleChange}
            placeholder="2-Bed CP Price"
            className={`w-full p-2 border ${
              errors.price_2bed_cp ? "border-red-500" : "border-gray-300"
            } rounded-md`}
            min="0"
          />
          {errors.price_2bed_cp && (
            <p className="text-red-500 text-sm mt-1">{errors.price_2bed_cp}</p>
          )}
          {/* Conditionally render the placeholder below if there is a value */}
          {formData.price_2bed_cp && (
            <p className="text-gray-500 text-sm mt-1"> 2-Bed CP Price</p>
          )}
        </div>
        <div>
          <input
            type="text"
            name="price_2bed_map"
            value={formData.price_2bed_map}
            onChange={handleChange}
            placeholder="2-Bed MAP Price"
            className={`w-full p-2 border ${
              errors.price_2bed_map ? "border-red-500" : "border-gray-300"
            } rounded-md`}
            min="0"
          />
          {errors.price_2bed_map && (
            <p className="text-red-500 text-sm mt-1">{errors.price_2bed_map}</p>
          )}
          {/* Conditionally render the placeholder below if there is a value */}
          {formData.price_2bed_map && (
            <p className="text-gray-500 text-sm mt-1"> 2-Bed MAP Price</p>
          )}
        </div>
        <div>
          <input
            type="text"
            name="price_3bed_ap"
            value={formData.price_3bed_ap}
            onChange={handleChange}
            placeholder="3-Bed EP Price"
            className={`w-full p-2 border ${
              errors.price_3bed_ap ? "border-red-500" : "border-gray-300"
            } rounded-md`}
            min="0"
          />
          {errors.price_3bed_ap && (
            <p className="text-red-500 text-sm mt-1">{errors.price_3bed_ap}</p>
          )}
          {/* Conditionally render the placeholder below if there is a value */}
          {formData.price_3bed_ap && (
            <p className="text-gray-500 text-sm mt-1"> 3-Bed EP Price</p>
          )}
        </div>
        <div>
          <input
            type="text"
            name="price_3bed_cp"
            value={formData.price_3bed_cp}
            onChange={handleChange}
            placeholder="3-Bed CP Price"
            className={`w-full p-2 border ${
              errors.price_3bed_cp ? "border-red-500" : "border-gray-300"
            } rounded-md`}
            min="0"
          />
          {errors.price_3bed_cp && (
            <p className="text-red-500 text-sm mt-1">{errors.price_3bed_cp}</p>
          )}
          {/* Conditionally render the placeholder below if there is a value */}
          {formData.price_3bed_cp && (
            <p className="text-gray-500 text-sm mt-1"> 3-Bed CP Price</p>
          )}
        </div>
        <div>
          <input
            type="text"
            name="price_3bed_map"
            value={formData.price_3bed_map}
            onChange={handleChange}
            placeholder="3-Bed MAP Price"
            className={`w-full p-2 border ${
              errors.price_3bed_map ? "border-red-500" : "border-gray-300"
            } rounded-md`}
            min="0"
          />
          {errors.price_3bed_map && (
            <p className="text-red-500 text-sm mt-1">{errors.price_3bed_map}</p>
          )}
          {/* Conditionally render the placeholder below if there is a value */}
          {formData.price_3bed_map && (
            <p className="text-gray-500 text-sm mt-1"> 3-Bed MAP Price</p>
          )}
        </div>
        <div>
          <input
            type="text"
            name="price_extrabed_ap"
            value={formData.price_extrabed_ap}
            onChange={handleChange}
            placeholder="Extra-Bed EP Price"
            className={`w-full p-2 border ${
              errors.price_extrabed_ap ? "border-red-500" : "border-gray-300"
            } rounded-md`}
            min="0"
          />
          {errors.price_extrabed_ap && (
            <p className="text-red-500 text-sm mt-1">
              {errors.price_extrabed_ap}
            </p>
          )}
          {/* Conditionally render the placeholder below if there is a value */}
          {formData.price_extrabed_ap && (
            <p className="text-gray-500 text-sm mt-1"> Extra-Bed AP Price</p>
          )}
        </div>
        <div>
          <input
            type="text"
            name="price_extrabed_cp"
            value={formData.price_extrabed_cp}
            onChange={handleChange}
            placeholder="Extra-Bed CP Price"
            className={`w-full p-2 border ${
              errors.price_extrabed_cp ? "border-red-500" : "border-gray-300"
            } rounded-md`}
            min="0"
          />
          {errors.price_extrabed_cp && (
            <p className="text-red-500 text-sm mt-1">
              {errors.price_extrabed_cp}
            </p>
          )}
          {/* Conditionally render the placeholder below if there is a value */}
          {formData.price_extrabed_cp && (
            <p className="text-gray-500 text-sm mt-1"> Extra-Bed CP Price</p>
          )}
        </div>
        <div>
          <input
            type="text"
            name="price_extrabed_map"
            value={formData.price_extrabed_map}
            onChange={handleChange}
            placeholder="Extra-Bed MAP Price"
            className={`w-full p-2 border ${
              errors.price_extrabed_map ? "border-red-500" : "border-gray-300"
            } rounded-md`}
            min="0"
          />
          {errors.price_extrabed_map && (
            <p className="text-red-500 text-sm mt-1">
              {errors.price_extrabed_map}
            </p>
          )}
          {/* Conditionally render the placeholder below if there is a value */}
          {formData.price_extrabed_map && (
            <p className="text-gray-500 text-sm mt-1"> Extra-Bed MAP Price</p>
          )}
        </div>
        <div>
          <input
            type="text"
            name="earlyCheckInPrice"
            value={formData.earlyCheckInPrice}
            onChange={handleChange}
            placeholder="Early Check-In Price"
            className={`w-full p-2 border ${
              errors.earlyCheckInPrice ? "border-red-500" : "border-gray-300"
            } rounded-md`}
            min="0"
          />
          {errors.earlyCheckInPrice && (
            <p className="text-red-500 text-sm mt-1">
              {errors.earlyCheckInPrice}
            </p>
          )}
          {/* Conditionally render the placeholder below if there is a value */}
          {formData.earlyCheckInPrice && (
            <p className="text-gray-500 text-sm mt-1">Early Check-In Price</p>
          )}
        </div>
        <div>
          <input
            type="text"
            name="lateCheckoutPrice"
            value={formData.lateCheckoutPrice}
            onChange={handleChange}
            placeholder="Late Checkout Price"
            className={`w-full p-2 border ${
              errors.lateCheckoutPrice ? "border-red-500" : "border-gray-300"
            } rounded-md`}
            min="0"
          />
          {errors.lateCheckoutPrice && (
            <p className="text-red-500 text-sm mt-1">
              {errors.lateCheckoutPrice}
            </p>
          )}
          {/* Conditionally render the placeholder below if there is a value */}
          {formData.lateCheckoutPrice && (
            <p className="text-gray-500 text-sm mt-1">Late Checkout Price</p>
          )}
        </div>
        <div>
          <input
            type="text"
            name="freshUpPrice"
            value={formData.freshUpPrice}
            onChange={handleChange}
            placeholder="Fresh Up Price"
            className={`w-full p-2 border ${
              errors.freshUpPrice ? "border-red-500" : "border-gray-300"
            } rounded-md`}
            min="0"
          />
          {errors.freshUpPrice && (
            <p className="text-red-500 text-sm mt-1">{errors.freshUpPrice}</p>
          )}
          {/* Conditionally render the placeholder below if there is a value */}
          {formData.freshUpPrice && (
            <p className="text-gray-500 text-sm mt-1">Fresh Up Price</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        {accommodationId ? "Update Accommodation" : "Create Accommodation"}{" "}
      </button>
      {/* Switch Button */}
      <div className="flex justify-center mt-2">
        <button
          type="button"
          onClick={onNext}
          className="w-full py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Switch
        </button>
      </div>
      <div>
        {/* Popup */}
        {showPopup && (
          <div className="popup-overlay">
            <div className="popup-content">
              <p>Please note down the accommodation ID:</p>
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

export default AccommodationForm;
