import React, { useState, useEffect } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";

const ClientSearch = ({ clientId, onFixedItineraryOption, onCustomItineraryOption, onSpecialItineraryOption }) => {
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
    status: "",
    scheduleDate: "",
    response: "",
  });
  console.log(formData);

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [notes, setNotes] = useState([]);
  const [scheduleDates, setScheduleDates] = useState([]);
  const [remarks, setRemarks] = useState([]);
  const [statusus, setStatusus] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null); // State to store selected option
  const [clientIId ,setClientIId] = useState(null);

  const handleSelect = (option) => {
    setSelectedOption(option); // Update state when an option is selected
  };

  const customStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "rgba(255, 255, 255, 0.4)", // Equivalent to bg-white/40
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
    menuList: (base) => ({
      ...base,
      maxHeight: "100px",
      overflowY: "auto",
      scrollbarWidth: "none", // Firefox
      msOverflowStyle: "none", // IE & Edge
      "&::-webkit-scrollbar": {
        display: "none", // Chrome, Safari, Edge
      },
    }),
  };
  // const fetchedDestinations = [
  //   { destination: "New York", startDate: "2024-11-01" },
  //   { destination: "Tokyo", startDate: "2024-11-10" },
  // ];
  useEffect(() => {
    const fetchClientDetails = async () => {
      if (!clientId) return; // Only fetch if clientId is provided
      setLoading(true);

      try {
        const response = await fetch(
          `${BASE_URL}/executive/newClientDetailsFetch/${clientId}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch client details");
        }

        const clientData = await response.json();
        console.log(clientData);
        // Update formData with the fetched client data
        setFormData({
          name: clientData.name || "",
          mobileNumber: clientData.mobileNumber || "",
          whatsappNumber: clientData.whatsappNumber || "",
          additionalNumber: clientData.additionalNumber || "",
          primaryTourName: clientData.primaryTourName || "",
          tourName: clientData.tourName || [],
          groupType: clientData.groupType || "",
          numberOfPersons: clientData.numberOfPersons || "",
          startDate: clientData.startDate
            ? new Date(clientData.startDate).toISOString().split("T")[0]
            : "",
          endDate: clientData.endDate
            ? new Date(clientData.endDate).toISOString().split("T")[0]
            : "",
          numberOfDays: clientData.numberOfDays || "",
          pincode: clientData.pincode || "",
          district: clientData.district || "",
          state: clientData.state || "",
          clientContactOption: clientData.clientContactOption || "",
          clientType: clientData.clientType || "",
          clientCurrentLocation: clientData.clientCurrentLocation || "",
          connectedThrough: clientData.connectedThrough || "",
          behavior: clientData.behavior || "",
          additionalRequirments: clientData.additionalRequirments || "",
        });
        setClientIId(clientData.clientId)
        setNotes(clientData.notes || []);
        setScheduleDates(clientData.scheduleDate || []);
        setRemarks(clientData.response || []);
        setStatusus(clientData.status || []);
      } catch (error) {
        toast.error("Error loading client details");
        console.error("Error fetching client details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientDetails();
  }, [clientId]);
  console.log(formData);
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
    console.log(selectedOption, name);
    // Update formData state first
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: selectedOption,
    }));

    // Clear errors for the field being updated, if any
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };

  const fetchPincodeDetails = async (pincode) => {
    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
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
      toast.error(
        "There was a problem fetching the pincode details. Please wait and try again."
      );
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

    // // Check if start date or end date is in the past
    // if (start < today) {
    //   toast.error("Start date cannot be in the past.");
    //   return "";
    // }

    // if (end < today) {
    //   toast.error("End date cannot be in the past.");
    //   return "";
    // }

    // Ensure the start date is before the end date
    if (start > end) {
      toast.error("Start date should be before the end date.");
      return "";
    }

    // Calculate the difference in milliseconds
    const timeDiff = end - start;

    // Convert the difference to days (1000 ms * 60 s * 60 min * 24 hrs)
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))+1;

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

    if (!formData.primaryTourName) {
      newErrors.primaryTourName = "It is mandatory.";
    }
    if (formData.numberOfPersons && formData.numberOfPersons <= 0) {
      newErrors.numberOfPersons = "must be greater than 0.";
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
    if (!formData.status) {
      newErrors.status = "It is mandatory.";
    }
    if (!formData.scheduleDate) {
      newErrors.scheduleDate = "It is mandatory.";
    }

    if (
      formData.status &&
      formData.status.label === "Call Attended" &&
      !formData.response
    ) {
      newErrors.response = "It is mandatory.";
    }
    if (
      formData.status &&
      formData.status.label === "Fixed Itinerary" &&
      (!formData.groupType || !formData.numberOfPersons)
    ) {
      if (!formData.groupType) {
        newErrors.groupType = "It is mandatory.";
      }
      if (!formData.numberOfPersons) {
        newErrors.numberOfPersons = "It is mandatory.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  const handleUpdateClient = async () => {
    // Perform form validation
    if (!validateForm()) {
      toast.error("Please correct the errors in the form.");
      return; // Prevent the submission if validation fails
    }
    try {
      // Set loading state if needed
      setLoading(true);
      // Get user data (frontOfficerId and companyId) from localStorage
      const userData = JSON.parse(localStorage.getItem("user")); // Ensure 'user' contains both _id and companyId
      const frontOfficerId = userData?._id;
      const companyId = userData?.companyId;

      // Prepare the client data to send in the request body
      const updatedClientData = {
        name: formData.name,
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
        companyId: companyId, // From localStorage
        status: formData.status, // New field
        scheduleDate: formData.scheduleDate, // New field
        response: formData.response, // New field
      };

      // Make the API call to update the client
      const response = await fetch(
        `${BASE_URL}/executive/updateClient/${clientId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedClientData), // Send updatedClientData as JSON
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update client");
      }

      // Handle success response
      const data = await response.json();
      console.log("Client updated successfully:", data);
      toast.success("Client updated successfully");
      // Call onFixedItineraryOption if status is "Fixed Itinerary"
      if (
        formData.status &&
        formData.status.label === "Group Tours" &&
        onFixedItineraryOption
      ) {
        onFixedItineraryOption(formData.primaryTourName);
      }
      if (
        formData.status &&
        formData.status.label === "Custom Tour" &&
        onCustomItineraryOption
      ) {
        onCustomItineraryOption(formData.numberOfDays);
      }
      if (
        formData.status &&
        formData.status.label === "Fixed Tours" &&
        onSpecialItineraryOption
      ) {
        onSpecialItineraryOption(formData.primaryTourName);
      }

      // Optionally reset the form after update
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
        status: "", // Resetting new field
        scheduleDate: "", // Resetting new field
        response: "", // Resetting new field
      });
        setClientIId("")
        setNotes([]);
        setScheduleDates([]);
        setRemarks([]);
        setStatusus([]);
    } catch (error) {
      console.error("Failed to update client:", error);
      toast.error(
        error.message || "An error occurred while updating the client"
      );
    } finally {
      // Reset loading state
      setLoading(false);
    }
  };

  return (
    <div className="w-full  p-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl mt-1">
     <div className="text-red-600 font-extrabold text-lg p-1 text-center mt-1 ">
      Client ID: {clientIId}
    </div>
      {/* Main Form */}
      <div
        className="overflow-y-auto" // Enable vertical scrolling
        style={{ maxHeight: "350px",
        scrollbarWidth: "none", // For Firefox
        msOverflowStyle: "none", // For IE/Edge
        }} // Set max height to 170px
      >
      
      <form className="grid sm:grid-cols-2 gap-4 p-4 bg-white/20 rounded-lg shadow-lg w-full max-w-[90vw] mx-auto">
      {/* Row 1 */}
      
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            readOnly
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="bg-white/40 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
          />
          
          
          <input
            type="text"
            placeholder="Mobile Number"
            value={formData.mobileNumber}
            readOnly
            onChange={(e) =>
              setFormData({ ...formData, mobileNumber: e.target.value })
            }
            className="bg-white/40 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
          />
          
          
          <input
            type="text"
            placeholder="WhatsApp Number"
            value={formData.whatsappNumber}
            onChange={(e) =>
              setFormData({ ...formData, whatsappNumber: e.target.value })
            }
            className="bg-white/40 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
          />
         
        
          <input
            type="text"
            placeholder="Additional Number"
            value={formData.additionalNumber}
            onChange={(e) =>
              setFormData({ ...formData, additionalNumber: e.target.value })
            }
            className="bg-white/40 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
          />
          

          {/* Row 2 */}
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
              isDisabled={true}
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
              placeholder="Select Tour Destinations"
              styles={customStyles}
              onMenuOpen={fetchDestinations} // Fetch destinations on menu open
            />
            {errors.tourName && (
              <p style={{ color: "red", fontWeight: "500" }}>
                {errors.tourName}
              </p>
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
            {errors.groupType && (
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
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, numberOfPersons: value });

                // Clear the error for `numberOfPersons` when typing starts
                if (errors.numberOfPersons) {
                  setErrors({ ...errors, numberOfPersons: "" });
                }
              }}
              className="bg-white/40 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
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
              className="bg-white/40 border p-3 rounded w-full"
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
              className="bg-white/40 border p-3 rounded w-full"
            />
            {errors.endDate && (
              <p style={{ color: "red", fontWeight: "500" }}>
                {errors.endDate}
              </p>
            )}
          </div>
          <input
            type="text"
            placeholder="Number of Days"
            value={formData.numberOfDays}
            disabled
            className="bg-white/40 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
          />
          <input
            type="text"
            placeholder="Pincode"
            value={formData.pincode}
            onChange={handlePincodeChange}
            className="bg-white/40 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
          />
          <input
            type="text"
            placeholder="District"
            value={formData.district}
            readOnly
            className="bg-white/40 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
          />

          {/* Row 4 */}
          <input
            type="text"
            placeholder="State"
            value={formData.state}
            readOnly
            className="bg-white/40 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
          />
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
              <p style={{ color: "red", fontWeight: "500" }}>
                {errors.behavior}
              </p>
            )}
          </div>
          <textarea
            placeholder="Additional Requirements"
            value={formData.additionalRequirments}
            onChange={(e) =>
              setFormData({
                ...formData,
                additionalRequirments: e.target.value,
              })
            }
            className="bg-white/40 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 col-span-1"
          />
          <div className="col-span-4 bg-gray-100 p-1 rounded-lg">
            <div className="grid grid-cols-3 gap-3">
              {/* Mark Status Field */}
              <div className="col-span-1">
                <h3 className="text-gray-600 font-semibold mb-1">
                  Mark Status
                </h3>
                <Select
                  options={[
                    { value: "Switched Off", label: "Switched Off" },
                    { value: "Not Reachable", label: "Not Reachable" },
                    { value: "Not Answering", label: "Not Answering" },
                    { value: "Call Attended", label: "Call Attended" },
                    { value: "Group Tours", label: "Group Tours" },
                    { value: "Custom Tour", label: "Custom Tour" },
                    { value: "Fixed Tours", label:"Fixed Tours"}
                  ]}
                  value={formData.status}
                  onChange={(selected) => (
                    handleChange(selected, "status"),
                    errors.status && setErrors({ ...errors, status: "" })
                  )}
                  placeholder="Client Status"
                  styles={customStyles}
                  className="w-full"
                />
                {errors.status && (
                  <p style={{ color: "red", fontWeight: "500" }}>
                    {errors.status}
                  </p>
                )}
              </div>

              {/* Schedule Date Field */}
              <div className="col-span-1">
                <h3 className="text-gray-600 font-semibold mb-1">
                  Schedule Time
                </h3>
                <input
                  type="date"
                  value={formData.scheduleDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    setFormData({ ...formData, scheduleDate: e.target.value });
                    if (errors.scheduleDate)
                      setErrors({ ...errors, scheduleDate: "" });
                  }}
                  className="bg-white/40 border border-gray-300 p-3 rounded-lg w-full h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
                />
                {errors.scheduleDate && (
                  <p style={{ color: "red", fontWeight: "500" }}>
                    {errors.scheduleDate}
                  </p>
                )}
              </div>

              {/* Mark Response Field */}
              <div className="col-span-1">
                <h3 className="text-gray-800 font-semibold mb-1">
                  Mark Remarks
                </h3>
                <textarea
                  placeholder="Mark Response"
                  value={formData.response}
                  onChange={(e) =>
                    setFormData({ ...formData, response: e.target.value })
                  }
                  className="bg-white/40 border border-gray-300 rounded-lg p-3 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full h-12"
                />
                {errors.response && (
                  <p style={{ color: "red", fontWeight: "500" }}>
                    {errors.response}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="col-span-4 bg-gray-100 p-2 rounded-lg mt-1 flex justify-center items-center space-x-8">
            {/* Notes with small circle */}
            <div
              className="flex flex-col items-center space-y-2 cursor-pointer"
              onClick={() =>
                setSelectedOption(selectedOption === "Notes" ? null : "Notes")
              }
            >
              <span
                className={`text-gray-800 font-extrabold ${
                  selectedOption === "Notes" ? "text-blue-500" : ""
                }`}
              >
                Notes
              </span>
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  selectedOption === "Notes"
                    ? "bg-blue-500 border-blue-500"
                    : "bg-white border-blue-500"
                }`}
              ></div>
            </div>

            {/* Schedule Dates with small circle */}
            <div
              className="flex flex-col items-center space-y-2 cursor-pointer"
              onClick={() =>
                setSelectedOption(
                  selectedOption === "Schedule Dates" ? null : "Schedule Dates"
                )
              }
            >
              <span
                className={`text-gray-800 font-extrabold ${
                  selectedOption === "Schedule Dates" ? "text-blue-500" : ""
                }`}
              >
                Schedule Dates
              </span>
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  selectedOption === "Schedule Dates"
                    ? "bg-blue-500 border-blue-500"
                    : "bg-white border-blue-500"
                }`}
              ></div>
            </div>

            {/* Remarks with small circle */}
            <div
              className="flex flex-col items-center space-y-2 cursor-pointer"
              onClick={() =>
                setSelectedOption(
                  selectedOption === "Remarks" ? null : "Remarks"
                )
              }
            >
              <span
                className={`text-gray-800 font-extrabold ${
                  selectedOption === "Remarks" ? "text-blue-500" : ""
                }`}
              >
                Remarks
              </span>
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  selectedOption === "Remarks"
                    ? "bg-blue-500 border-blue-500"
                    : "bg-white border-blue-500"
                }`}
              ></div>
            </div>
            <div
              className="flex flex-col items-center space-y-2 cursor-pointer"
              onClick={() =>
                setSelectedOption(selectedOption === "Status" ? null : "Status")
              }
            >
              <span
                className={`text-gray-800 font-extrabold ${
                  selectedOption === "Status" ? "text-blue-500" : ""
                }`}
              >
                Status
              </span>
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  selectedOption === "Status"
                    ? "bg-blue-500 border-blue-500"
                    : "bg-white border-blue-500"
                }`}
              ></div>
            </div>
          </div>
          {selectedOption && (
          <div className="col-span-4 bg-gray-200 p-4 rounded-lg mt-1">
            {selectedOption === "Notes" && (
              <div>
                <h3 className="text-gray-600 font-semibold mb-3">Notes</h3>
                <div
                  className="w-full flex overflow-x-auto py-3 px-3 border rounded-md bg-gray-100"
                  style={{ minHeight: "80px" }}
                >
                  {notes
                    .slice()
                    .reverse() // Show most recent notes first
                    .map((note, index) => (
                      <span
                        key={index}
                        className="bg-gray-500 text-white py-2 px-2 rounded-full flex items-center mr-2"
                        style={{ whiteSpace: "nowrap" }} // Ensures the text doesn't wrap and stays on one line
                      >
                        {note}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {selectedOption === "Schedule Dates" && (
              <div>
                <h3 className="text-gray-600 font-semibold mb-3">
                  Schedule Dates
                </h3>
                <div
                  className="w-full flex overflow-x-auto py-3 px-3 border rounded-md bg-gray-100"
                  style={{ minHeight: "80px" }}
                >
                  {scheduleDates.map((date, index) => (
                    <span
                      key={index}
                      className="bg-gray-500 text-white py-2 px-4 rounded-full flex items-center mr-2"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {new Date(date).toLocaleDateString("en-GB")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedOption === "Remarks" && (
              <div>
                <h3 className="text-gray-600 font-semibold mb-3">Remarks</h3>
                <div
                  className="w-full flex overflow-x-auto py-3 px-3 border rounded-md bg-gray-100"
                  style={{ minHeight: "80px" }}
                >
                  {remarks.map((remark, index) => (
                    <span
                      key={index}
                      className="bg-gray-500 text-white py-2 px-4 rounded-full flex items-center mr-2"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {remark}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedOption === "Status" && (
              <div>
                <h3 className="text-gray-600 font-semibold mb-3">Status</h3>
                <div
                  className="w-full flex overflow-x-auto py-3 px-3 border rounded-md bg-gray-100"
                  style={{ minHeight: "80px" }}
                >
                  {statusus.map((status, index) => (
                    <span
                      key={index}
                      className="bg-gray-500 text-white py-2 px-4 rounded-full flex items-center mr-2"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {status.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          )}

          {/* Create Client Button */}
          <div className="col-span-4 flex justify-center mt-1">
            {" "}
            {/* Centering the button */}
            <button
              type="button" // Adjust the type based on your form's needs
              className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:bg-blue-600 transition duration-300"
              onClick={handleUpdateClient}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientSearch;
