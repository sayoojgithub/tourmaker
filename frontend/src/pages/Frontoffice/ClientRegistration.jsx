import React, { useState, useEffect } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";

const ClientRegistration = () => {
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    whatsappNumber: "",
    additionalNumber: "",
    primaryTourName: "",
    tourName: [],
    groupType: "",
    numberOfPersons: "",
    startDate: "",
    endDate: "",
    numberOfDays: "",
    pincode: "",
    district: "",
    state: "",
    clientContactOption: "",
    clientType: "",
    clientCurrentLocation: "",
    connectedThrough: "",
    behavior: "",
    additionalRequirments: "",
    gstNumber: "",
  });
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
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

  const fetchDestinations = async () => {
    try {
      setLoading(true); // Set loading to true before fetching
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`${BASE_URL}/purchaser/getDestinationsName?companyId=${storedUser.companyId}`);
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
      setLoading(false); // Set loading to false after fetching
    }
  };

  const handleChange = (selectedOption, name) => {
    setFormData({
      ...formData,
      [name]: selectedOption,
    });
  };
  const fetchPincodeDetails = async (pincode) => {
    try {
      console.log("Fetching details for pincode:", pincode); // Log pincode
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );
      console.log("Fetch response status:", response.status); // Log HTTP status
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("API Response:", data); // Log full response to debug
      if (data[0].Status !== "Success") {
        toast.error("Invalid Pincode , Please check the pincode.");
        return {
          error: "Invalid Pincode",
          details: null,
        };
      }
      const postOffice = data[0].PostOffice[0];
      if (!postOffice) {
        throw new Error("No Post Office found for this pincode");
      }
      return {
        country: postOffice.Country,
        state: postOffice.State,
        district: postOffice.District,
      };
    } catch (error) {
      console.error("Error fetching pincode details:", error.message);
      toast.error(error.message);
      return {
        error: error.message,
        details: null,
      };
    }
  };

  const handlePincodeChange = async (e) => {
    const value = e.target.value;

    // Set the pincode value and reset district and state to null
    setFormData((prevState) => ({
      ...prevState,
      pincode: value,
      district: "", // Reset district
      state: "", // Reset state
    }));
    // Check if the pincode length exceeds 6 digits
    if (value.length > 6) {
      toast.error("Pincode should be exactly 6 digits.");
      return; // Exit the function if the pincode is invalid
    }

    // Check if the pincode is completely filled (assuming it's 6 digits)
    if (value.length === 6) {
      const details = await fetchPincodeDetails(value);
      if (details && !details.error) {
        setFormData((prevState) => ({
          ...prevState,
          district: details.district || "",
          state: details.state || "",
        }));
      }
    }
  };
  // Function to calculate the number of days
  const calculateNumberOfDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date(); // Get the current date

    // Set the time of today's date to midnight for accurate date comparison
    today.setHours(0, 0, 0, 0);

    // Check if start date or end date is in the past
    if (start < today) {
      toast.error("Start date cannot be in the past.");
      return "";
    }

    if (end < today) {
      toast.error("End date cannot be in the past.");
      return "";
    }

    // Ensure the start date is before the end date
    if (start > end) {
      toast.error("Start date should be before the end date.");
      return "";
    }

    // Calculate the difference in milliseconds
    const timeDiff = end - start;

    // Convert the difference to days (1000 ms * 60 s * 60 min * 24 hrs)
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;

    return daysDiff >= 0 ? daysDiff : "";
  };

  // Use useEffect to automatically update the number of days when startDate or endDate changes
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const days = calculateNumberOfDays(formData.startDate, formData.endDate);
      setFormData((prevState) => ({
        ...prevState,
        numberOfDays: days.toString(),
      }));
    }
  }, [formData.startDate, formData.endDate]);

  console.log(formData);
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "It is mandatory.";
    }
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "It is mandatory.";
    } else if (!/^\d+$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "must be digits.";
    }

    if (!formData.primaryTourName) {
      newErrors.primaryTourName = "It is mandatory.";
    }
    // if (!formData.tourName.length) {
    //   newErrors.tourName = "It is mandatory.";
    // }
    if (!formData.groupType) {
      newErrors.groupType = "It is mandatory.";
    }
    if (!formData.numberOfPersons) {
      newErrors.numberOfPersons = "It is mandatory.";
    } else if (
      isNaN(formData.numberOfPersons) ||
      formData.numberOfPersons <= 0
    ) {
      newErrors.numberOfPersons = "Must be greater than 0.";
    }
    if (!formData.startDate) {
      newErrors.startDate = "It is mandatory.";
    }
    if (!formData.endDate) {
      newErrors.endDate = "It is mandatory.";
    }
    if (!formData.numberOfDays) {
      newErrors.numberOfDays = "It is mandatory.";
    }
    if (!formData.pincode) {
      newErrors.pincode = "It is mandatory.";
    }
    if (!formData.district) {
      newErrors.district = "It is mandatory.";
    }
    if (!formData.state) {
      newErrors.state = "It is mandatory.";
    }
    if (!formData.clientContactOption) {
      newErrors.clientContactOption = "It is mandatory.";
    }
    if (!formData.clientType) {
      newErrors.clientType = "It is mandatory.";
    }
    if (!formData.clientCurrentLocation) {
      newErrors.clientCurrentLocation = "It is mandatory.";
    }
    if (!formData.connectedThrough) {
      newErrors.connectedThrough = "It is mandatory.";
    }
    if (!formData.behavior) {
      newErrors.behavior = "It is mandatory.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  const handleCreateClient = async () => {
    if (isLoading) return;
    // Perform form validation
    if (!validateForm()) {
      toast.error("Please correct the errors in the form.");
      return; // Prevent the submission if validation fails
    }
    setIsLoading(true);
    try {
      // Set loading state if needed
      setLoading(true);

      // Get user data (frontOfficerId and companyId) from localStorage
      const userData = JSON.parse(localStorage.getItem("user")); // Ensure 'user' contains both _id and companyId
      const frontOfficerId = userData?._id;
      const companyId = userData?.companyId;

      // Prepare the client data to send in the request body
      const clientData = {
        name: formData.name, // Assume formData holds the input values
        mobileNumber: formData.mobileNumber,
        whatsappNumber: formData.whatsappNumber,
        additionalNumber: formData.additionalNumber,
        primaryTourName: formData.primaryTourName,
        tourName: formData.tourName, // Array of objects
        groupType: formData.groupType, // { value, label }
        numberOfPersons: formData.numberOfPersons,
        startDate: formData.startDate,
        endDate: formData.endDate,
        numberOfDays: formData.numberOfDays,
        pincode: formData.pincode,
        district: formData.district,
        state: formData.state,
        clientContactOption: formData.clientContactOption,
        clientType: formData.clientType,
        clientCurrentLocation: formData.clientCurrentLocation,
        connectedThrough: formData.connectedThrough,
        behavior: formData.behavior,
        additionalRequirments: formData.additionalRequirments,
        gstNumber: formData.gstNumber,
        frontOfficerId: frontOfficerId, // From localStorage
        companyId: companyId, // From localStorage
      };

      // Make the API call to register the client
      const response = await fetch(`${BASE_URL}/frontoffice/registerClient`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clientData), // Send clientData as JSON
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to register client");
      }

      // Handle success response
      const data = await response.json();
      console.log("Client registered successfully:", data);
      toast.success("Client registered successfully");
      // Reset the form data to initial state
      setFormData({
        name: "",
        mobileNumber: "",
        whatsappNumber: "",
        additionalNumber: "",
        primaryTourName: "",
        tourName: [],
        groupType: "",
        numberOfPersons: "",
        startDate: "",
        endDate: "",
        numberOfDays: "",
        pincode: "",
        district: "",
        state: "",
        clientContactOption: "",
        clientType: "",
        clientCurrentLocation: "",
        connectedThrough: "",
        behavior: "",
        additionalRequirments: "",
        gstNumber: "",
      });
    } catch (error) {
      console.error("Failed to register client:", error);
      toast.error(
        error.message || "An error occurred while registering the client"
      );
    } finally {
      // Reset loading state
      setLoading(false);
      setIsLoading(false);
    }
  };
  return (
    <div className="w-full  p-4 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg mt-1">
      <form className="grid grid-cols-4 gap-3 p-4 bg-white/20 rounded-lg shadow-lg ">
        {/* Row 1 */}
        <div>
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => (
              setFormData({ ...formData, name: e.target.value }),
              errors.name && setErrors({ ...errors, name: "" })
            )}
            className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
          />
          {errors.name && (
            <p style={{ color: "red", fontWeight: "500" }}>{errors.name}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            placeholder="Mobile Number"
            value={formData.mobileNumber}
            onChange={(e) => (
              setFormData({ ...formData, mobileNumber: e.target.value }),
              errors.mobileNumber && setErrors({ ...errors, mobileNumber: "" })
            )}
            className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
          />
          {errors.mobileNumber && (
            <p style={{ color: "red", fontWeight: "500" }}>
              {errors.mobileNumber}
            </p>
          )}
        </div>
        <input
          type="text"
          placeholder="WhatsApp Number"
          value={formData.whatsappNumber}
          onChange={(e) =>
            setFormData({ ...formData, whatsappNumber: e.target.value })
          }
          className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
        />
        <input
          type="text"
          placeholder="Additional Number"
          value={formData.additionalNumber}
          onChange={(e) =>
            setFormData({ ...formData, additionalNumber: e.target.value })
          }
          className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
        />

        {/* Row 2 */}
        {/* Single-select field for primary destination */}
        <div>
          <Select
            options={destinations}
            value={formData.primaryTourName}
            onChange={(selected) => {
              handleChange(selected, "primaryTourName");
              if (errors.primaryTourName)
                setErrors({ ...errors, primaryTourName: "" });
            }}
            placeholder="Select Primary Destination"
            styles={customStyles}
            onMenuOpen={fetchDestinations}
          />
          {errors.primaryTourName && (
            <p style={{ color: "red", fontWeight: "500" }}>
              {errors.primaryTourName}
            </p>
          )}
        </div>

        <div>
          <Select
            isMulti
            options={destinations}
            value={formData.tourName}
            onChange={(selected) => {
              handleChange(selected, "tourName");
              if (errors.tourName) setErrors({ ...errors, tourName: "" });
            }}
            placeholder="Select Add-on Destinations"
            styles={customStyles}
            onMenuOpen={fetchDestinations} // Fetch destinations on menu open
          />
          {errors.tourName && (
            <p style={{ color: "red", fontWeight: "500" }}>{errors.tourName}</p>
          )}
        </div>
        <div>
          <Select
            options={[
              { value: "Single", label: "Single" },
              { value: "Couple", label: "Couple" },
              { value: "Family", label: "Family" },
              { value: "Friends", label: "Friends" },
            ]}
            value={formData.groupType}
            onChange={(selected) => handleChange(selected, "groupType")}
            placeholder="Select Group Type"
            styles={customStyles}
          />
          {errors.groupType && ( // Show error if groupType has an error
            <p style={{ color: "red", fontWeight: "500" }}>
              {errors.groupType}
            </p>
          )}
        </div>
        <div>
          <input
            type="text"
            placeholder="Number of Persons"
            value={formData.numberOfPersons}
            onChange={(e) =>
              setFormData({ ...formData, numberOfPersons: e.target.value })
            }
            className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
          />
          {errors.numberOfPersons && (
            <p style={{ color: "red", fontWeight: "500" }}>
              {errors.numberOfPersons}
            </p>
          )}
        </div>
        <div>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => {
              setFormData({ ...formData, startDate: e.target.value });
              if (errors.startDate) setErrors({ ...errors, startDate: "" });
            }}
            className="bg-gray-100 border p-3 rounded w-full"
          />
          {errors.startDate && (
            <p style={{ color: "red", fontWeight: "500" }}>
              {errors.startDate}
            </p>
          )}
        </div>

        {/* Row 3 */}
        <div>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => (
              setFormData({ ...formData, endDate: e.target.value }),
              errors.endDate && setErrors({ ...errors, endDate: "" })
            )}
            className="bg-gray-100 border p-3 rounded w-full"
          />
          {errors.endDate && (
            <p style={{ color: "red", fontWeight: "500" }}>{errors.endDate}</p>
          )}
        </div>

        <input
          type="text"
          placeholder="Number of Days"
          value={formData.numberOfDays}
          disabled
          className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
        />
        <div>
          <input
            type="text"
            placeholder="Pincode"
            value={formData.pincode}
            onChange={handlePincodeChange}
            className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
          />
          {errors.pincode && (
            <p style={{ color: "red", fontWeight: "500" }}>{errors.pincode}</p>
          )}
        </div>
        <div>
        <input
          type="text"
          placeholder="District"
          value={formData.district}
          onChange={(e) => (
            setFormData({ ...formData, district: e.target.value }),
            errors.district && setErrors({ ...errors, district: "" })
          )}
          className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
        />
        {errors.district && (
            <p style={{ color: "red", fontWeight: "500" }}>{errors.district}</p>
          )}
        </div>
        <div>
        <input
          type="text"
          placeholder="State"
          value={formData.state}
          onChange={(e) => (
            setFormData({ ...formData, state: e.target.value }),
            errors.state && setErrors({ ...errors, state: "" })
          )}
          className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
        />
        {errors.state && (
            <p style={{ color: "red", fontWeight: "500" }}>{errors.state}</p>
          )}
        </div>
        <div>
          <Select
            options={[
              { value: "Phone", label: "Phone" },
              { value: "Whatsapp", label: "Whatsapp" },
            ]}
            value={formData.clientContactOption}
            onChange={(selected) => (
              handleChange(selected, "clientContactOption"),
              errors.clientContactOption &&
                setErrors({ ...errors, clientContactOption: "" })
            )}
            placeholder="Client Contact Option"
            styles={customStyles}
          />
          {errors.clientContactOption && (
            <p style={{ color: "red", fontWeight: "500" }}>
              {errors.clientContactOption}
            </p>
          )}
        </div>
        <div>
          <Select
            options={[
              { value: "Urgent Contact", label: "Urgent Contact" },
              { value: "Non-Urgent Contact", label: "Non-Urgent Contact" },
            ]}
            value={formData.clientType}
            onChange={(selected) => (
              handleChange(selected, "clientType"),
              errors.clientType && setErrors({ ...errors, clientType: "" })
            )}
            placeholder="Client Type"
            styles={customStyles}
          />
          {errors.clientType && (
            <p style={{ color: "red", fontWeight: "500" }}>
              {errors.clientType}
            </p>
          )}
        </div>
        <div>
          <Select
            options={[
              { value: "insider", label: "Insider" },
              { value: "outsider", label: "Outsider" },
            ]}
            value={formData.clientCurrentLocation}
            onChange={(selected) => (
              handleChange(selected, "clientCurrentLocation"),
              errors.clientCurrentLocation &&
                setErrors({ ...errors, clientCurrentLocation: "" })
            )}
            placeholder="Client Current Location"
            styles={customStyles}
          />
          {errors.clientCurrentLocation && (
            <p style={{ color: "red", fontWeight: "500" }}>
              {errors.clientCurrentLocation}
            </p>
          )}
        </div>

        {/* Row 5 */}
        <div>
          <Select
            options={[
              { value: "Old Customer", label: "Old Customer" },
              { value: "Facebook", label: "Facebook" },
              { value: "Instagram", label: "Instagram" },
              { value: "Whatsapp", label: "Whatsapp" },
            ]}
            value={formData.connectedThrough}
            onChange={(selected) => (
              handleChange(selected, "connectedThrough"),
              errors.connectedThrough &&
                setErrors({ ...errors, connectedThrough: "" })
            )}
            placeholder="Connected Through"
            styles={customStyles}
          />
          {errors.connectedThrough && (
            <p style={{ color: "red", fontWeight: "500" }}>
              {errors.connectedThrough}
            </p>
          )}
        </div>
        <div>
          <Select
            options={[
              { value: "Polite", label: "Polite" },
              { value: "Normal", label: "Normal" },
              { value: "Hard", label: "Hard" },
              { value: "Educated", label: "Educated" },
            ]}
            value={formData.behavior}
            onChange={(selected) => (
              handleChange(selected, "behavior"),
              errors.behavior && setErrors({ ...errors, behavior: "" })
            )}
            placeholder="Client Behavior"
            styles={customStyles}
          />
          {errors.behavior && (
            <p style={{ color: "red", fontWeight: "500" }}>{errors.behavior}</p>
          )}
        </div>
        <textarea
          placeholder="Additional Requirments"
          value={formData.additionalRequirments}
          onChange={(e) =>
            setFormData({ ...formData, additionalRequirments: e.target.value })
          }
          className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 col-span-1"
        />
        {/* GST Number Field */}
        <div className="col-span-4 flex justify-center mt-1">
          <input
            type="text"
            placeholder="GST Number"
            value={formData.gstNumber}
            onChange={(e) =>
              setFormData({ ...formData, gstNumber: e.target.value })
            }
            className="bg-gray-100 border border-gray-300 rounded-lg p-1 w-full max-w-md shadow-md text-center focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
          />
        </div>

        {/* Create Client Button */}
        <div className="col-span-4 flex justify-center mt-1">
          {" "}
          {/* Centering the button */}
          <button
            type="button" // Adjust the type based on your form's needs
            className="bg-blue-600 text-white font-semibold w-full py-2 px-4 rounded-lg shadow-lg hover:bg-blue-600 transition duration-300"
            onClick={handleCreateClient}
            disabled={isLoading}

          >
            Create Client
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientRegistration;
