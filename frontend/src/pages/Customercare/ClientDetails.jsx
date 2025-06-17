import React, { useState, useEffect } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";

const ClientDetails = ({ clientId,clientTourStatus,goToHistory }) => {
  console.log(clientId);
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
    TourType: "",
    TourName: "",
    ArticleNumber: "",
    ItineraryText: "",
  });
  console.log(formData);

  const [errors, setErrors] = useState({});
  const [itineryButtonRendering, setItineryButtonRendering] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);
  const conditionOptions = [
    { value: "Suggestions", label: "Suggestions" },
    { value: "Changes/Upgrade", label: "Changes/Upgrade" },
    { value: "Addons", label: "Addons" },
    { value: "Difficulty", label: "Difficulty" },
    { value: "Complaint", label: "Complaint" },
    { value: "Hotel", label: "Hotel" },
    { value: "Transport", label: "Transport" },
    { value: "Destination", label: "Destination" },
    { value: "Food", label: "Food" },
    { value: "Activity", label: "Activity" },
    { value: "Flight", label: "Flight" },
    { value: "Train", label: "Train" },
    { value: "Driver", label: "Driver" },
    { value: "RoomService", label: "RoomService" },
    { value: "All good", label: "All good" },
  ];
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [feedbackData, setFeedbackData] = useState({
    status: "",
    conditions: [],
    scheduleDate: "",
    hour: "12",
    minute: "00",
    amPm: "AM",
    comment: "",
  });
  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedbackData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleConditionsChange = (selectedOptions) => {
    setSelectedConditions(selectedOptions);
    setFeedbackData((prev) => ({
      ...prev,
      conditions: selectedOptions.map((opt) => opt.value),
    }));
  };
console.log(feedbackData)
  const toggleItinerary = () => setShowItinerary(!showItinerary);
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

  useEffect(() => {
    const fetchClientDetails = async () => {
      if (!clientId) return; // Only fetch if clientId is provided

      try {
        const response = await fetch(
          `${BASE_URL}/customercare/ClientDetailsFetch/${clientId}`,
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
        const startDate = clientData.finalizedTourDateAt
          ? new Date(clientData.finalizedTourDateAt)
          : null;
        const endDate = clientData.finalizedTourEndDateAt
          ? new Date(clientData.finalizedTourEndDateAt)
          : null;

        const numberOfDays =
          startDate && endDate
            ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
            : clientData.numberOfDays || "";
        // Determine tour type based on itineraryType
        let tourType = "";
        const itineraryType = clientData.itinerary?.[0]?.itineraryType;
        if (itineraryType === "custom") {
          tourType = "Custom";
        } else if (itineraryType === "fixed") {
          tourType = "Group";
        } else if (itineraryType === "special") {
          tourType = "Fixed";
        }
        setFormData({
          name: clientData.name || "",
          mobileNumber: clientData.mobileNumber || "",
          whatsappNumber: clientData.whatsappNumber || "",
          additionalNumber: clientData.additionalNumber || "",
          primaryTourName: clientData.primaryTourName || "",
          tourName: clientData.tourName || [],
          groupType: clientData.groupType || "",
          numberOfPersons: clientData.numberOfPersons || "",
          startDate: clientData.finalizedTourDateAt
            ? new Date(clientData.finalizedTourDateAt)
                .toISOString()
                .split("T")[0]
            : "",
          endDate: clientData.finalizedTourEndDateAt
            ? new Date(clientData.finalizedTourEndDateAt)
                .toISOString()
                .split("T")[0]
            : "",
          numberOfDays: numberOfDays,
          TourType: tourType,
          TourName: clientData.itineraryDetails?.tourName || "",
          ArticleNumber: clientData.itineraryDetails?.articleNumber || "",
          ItineraryText: clientData.itineraryDetails?.itineraryText || "",
        });
        if (clientData.itineraryDetails?.clientName) {
          setItineryButtonRendering(true);
        }
      } catch (error) {
        toast.error("Error loading client details");
        console.error("Error fetching client details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientDetails();
  }, [clientId]);

  const handleChange = (selectedOption, name) => {
    setFormData({
      ...formData,
      [name]: selectedOption,
    });
  };

  const handleItineraryDownloadByCustomerCare = async () => {
    if (!clientId) {
      toast.error("No ClientId Here");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/customercare/downloadItineraryByCustomerCare`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId: clientId,
          }),
        }
      );

      if (!response.ok) {
        // Extract and handle the backend error message
        const errorData = await response.json(); // Parse the JSON error message
        const errorMessage =
          errorData.message || "Failed to download itinerary"; // Default fallback message
        toast.error(errorMessage);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "itinerary.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading itinerary:", error.message);
      toast.error("Failed to download the itinerary. Please try again.");
    }
  };
  const handleCustomItineraryDownloadByCustomerCare = async () => {
    if (!clientId) {
      toast.error("No ClientId Here");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/customercare/downloadCustomItineraryByCustomCare`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId: clientId,
          }),
        }
      );

      if (!response.ok) {
        // Extract and handle the backend error message
        const errorData = await response.json(); // Parse the JSON error message
        const errorMessage =
          errorData.message || "Failed to download itinerary"; // Default fallback message
        toast.error(errorMessage);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "custom_confirm_itinerary.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
      console.log("success");
    } catch (error) {
      console.error("Error downloading itinerary:", error.message);
      toast.error("Failed to download the itinerary. Please try again.");
    }
  };

  const handleChangeToOngoing = async () => {
    if (!clientId) {
      toast.error("No ClientId Here");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/customercare/changeToOngoing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: clientId,
        }),
      });

      if (!response.ok) {
        // Extract and handle the backend error message
        const errorData = await response.json(); // Parse the JSON error message
        const errorMessage =
          errorData.message || "Failed to update client status"; // Default fallback message
        toast.error(errorMessage);
        return;
      }

      toast.success("Client status updated to Ongoing successfully.");
    } catch (error) {
      console.error("Error updating client status:", error.message);
      toast.error("Failed to update client status. Please try again.");
    }
  };

  const handleChangeToTourCompleted = async () => {
    if (!clientId) {
      toast.error("No ClientId Here");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/customercare/changeToCompleted`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId: clientId,
          }),
        }
      );

      if (!response.ok) {
        // Extract and handle the backend error message
        const errorData = await response.json(); // Parse the JSON error message
        const errorMessage =
          errorData.message || "Failed to update client status"; // Default fallback message
        toast.error(errorMessage);
        return;
      }

      toast.success("Client status updated to Completed.");
    } catch (error) {
      console.error("Error updating client status:", error.message);
      toast.error("Failed to update client status");
    }
  };
  const handleChangeToHomeReached = async () => {
    if (!clientId) {
      toast.error("No ClientId Here");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/customercare/changeToHomeReached`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId: clientId,
          }),
        }
      );

      if (!response.ok) {
        // Extract and handle the backend error message
        const errorData = await response.json(); // Parse the JSON error message
        const errorMessage =
          errorData.message || "Failed to update client status"; // Default fallback message
        toast.error(errorMessage);
        return;
      }

      toast.success("Client status updated to Home Reached.");
    } catch (error) {
      console.error("Error updating client status:", error.message);
      toast.error("Failed to update client status");
    }
  };
  const handleChangeToReviewGiven = async () => {
    if (!clientId) {
      toast.error("No ClientId Here");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/customercare/changeToReviewGiven`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId: clientId,
          }),
        }
      );

      if (!response.ok) {
        // Extract and handle the backend error message
        const errorData = await response.json(); // Parse the JSON error message
        const errorMessage =
          errorData.message || "Failed to update client status"; // Default fallback message
        toast.error(errorMessage);
        return;
      }

      toast.success("Client status updated to Review Given.");
    } catch (error) {
      console.error("Error updating client status:", error.message);
      toast.error("Failed to update client status");
    }
  };
  const computeScheduleTime = () => {
    const { hour, minute, amPm } = feedbackData;
    return `${hour.padStart(2, '0')}:${minute} ${amPm}`;
  };
  const handleAddFeedback = async () => {
    const userId = JSON.parse(localStorage.getItem("user"))?._id;
    if (!userId || !clientId) {
      toast.error("Missing user or client ID.");
      return;
    }
       // Validate feedbackData fields
  const { status, conditions, scheduleDate, hour, minute, amPm, comment } = feedbackData;

  if (!status.trim()) {
    toast.error("Status is required.");
    return;
  }

  if (!conditions || !Array.isArray(conditions) || conditions.length === 0) {
    toast.error("At least one condition must be selected.");
    return;
  }

  if (!scheduleDate.trim()) {
    toast.error("Schedule date is required.");
    return;
  }

  if (!hour.trim() || !minute.trim() || !amPm.trim()) {
    toast.error("Valid schedule time (hour, minute, AM/PM) is required.");
    return;
  }

  if (!comment.trim()) {
    toast.error("Comment is required.");
    return;
  }
  
    const scheduleTime = computeScheduleTime();
  
    // Create formatted submitted date and time
    const now = new Date();
  
    const submittedDate = now.toLocaleDateString("en-GB"); // "06/05/2025"
    const submittedTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }); // "03:45 PM"
  
    const payload = {
      ...feedbackData,
      scheduleTime,
      submittedDate,  // e.g., "06/05/2025"
      submittedTime,  // e.g., "03:45 PM"
      submittedBy: userId,
      clientId: clientId,
    };
  console.log(payload)
    try {
      const response = await fetch(`${BASE_URL}/customercare/addFeedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }
  
      const result = await response.json();
      toast.success("Feedback submitted successfully");
      console.log(result);
  
      // Reset the form
      setFeedbackData({
        status: "",
        conditions: [],
        scheduleDate: "",
        hour: "12",
        minute: "00",
        amPm: "AM",
        comment: "",
      });
  
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Something went wrong while submitting feedback");
    }
  };
  

  return (
    <div className="w-full  p-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl mt-3">
    {clientTourStatus && (
  <div className="text-lg font-semibold text-blue-600 mb-4 text-center">
    Tour Stage: {clientTourStatus}
  </div>
)}
{/* Full history indicator */}
<div 
className="flex items-center justify-center mt-1 cursor-pointer hover:text-blue-700 transition"
onClick={goToHistory}
>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 mr-1 text-gray-700"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span className="text-sm font-medium">View Full History</span>
  </div>
      <div
        className="overflow-y-auto" // Enable vertical scrolling
        style={{
          maxHeight: "335px",
          scrollbarWidth: "none", // For Firefox
          msOverflowStyle: "none", // For IE/Edge
        }} // Set max height to 170px
      >
        <form className="grid grid-cols-4 gap-7 p-6 bg-white/20 rounded-lg shadow-lg ">
          {/* Row 1 */}
          <div>
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              readOnly
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
              readOnly
              onChange={(e) => (
                setFormData({ ...formData, mobileNumber: e.target.value }),
                errors.mobileNumber &&
                  setErrors({ ...errors, mobileNumber: "" })
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
            readOnly
            onChange={(e) =>
              setFormData({ ...formData, whatsappNumber: e.target.value })
            }
            className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
          />
          <input
            type="text"
            placeholder="Additional Number"
            value={formData.additionalNumber}
            readOnly
            onChange={(e) =>
              setFormData({ ...formData, additionalNumber: e.target.value })
            }
            className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
          />

          {/* Row 2 */}
          {/* Single-select field for primary destination */}
          <div>
            <Select
              //options={destinations}
              value={formData.primaryTourName}
              onChange={(selected) => {
                handleChange(selected, "primaryTourName");
                if (errors.primaryTourName)
                  setErrors({ ...errors, primaryTourName: "" });
              }}
              placeholder="Select Primary Destination"
              styles={customStyles}
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
              //options={destinations}
              value={formData.tourName}
              onChange={(selected) => {
                handleChange(selected, "tourName");
                if (errors.tourName) setErrors({ ...errors, tourName: "" });
              }}
              placeholder="Select Add-on Destinations"
              styles={customStyles}
              isDisabled={true} // Fetch destinations on menu open
            />
            {errors.tourName && (
              <p style={{ color: "red", fontWeight: "500" }}>
                {errors.tourName}
              </p>
            )}
          </div>
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
            isDisabled={true}
          />
          <div>
            <input
              type="text"
              placeholder="Number of Persons"
              value={formData.numberOfPersons}
              readOnly
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
              readOnly
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
              readOnly
              className="bg-gray-100 border p-3 rounded w-full"
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
            className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
          />
          <input
            type="text"
            placeholder="TourType"
            value={formData.TourType}
            readOnly
            //onChange={handlePincodeChange}
            className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
          />
           {/* Conditional Rendering of TourName, ArticleNumber, and ItineraryText */}
      {formData.TourName ||
      formData.ArticleNumber ||
      formData.ItineraryText ? (
        <>
          {/* Row: Tour Name (3/4) and Article Number (1/4) */}
          <div className="col-span-4 grid grid-cols-4 gap-3">
            <div className="col-span-3">
              <input
                type="text"
                placeholder="Tour Name"
                value={formData.TourName}
                readOnly
                className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
              />
            </div>
            <div className="col-span-1">
              <input
                type="text"
                placeholder="Article Number"
                value={formData.ArticleNumber}
                readOnly
                className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
              />
            </div>
          </div>

          {/* Row: Itinerary Text */}
          {formData.ItineraryText && (
            <div className="col-span-4 mt-4 bg-white/30 p-4 rounded-lg shadow-inner border border-gray-200">
              {/* Header with Toggle */}
              <div className="flex justify-center items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-center">
                  Itinerary Details
                </h3>
                <button
                  type="button" // ← important if inside a form
                  onClick={toggleItinerary}
                  className="text-2xl focus:outline-none"
                  title={showItinerary ? "Hide Itinerary" : "Show Itinerary"}
                >
                  {showItinerary ? "🙈" : "👁️"}
                </button>
              </div>

              {/* Conditionally Rendered Itinerary Text */}
              {showItinerary && (
                <p className="whitespace-pre-line text-gray-800">
                  {formData.ItineraryText}
                </p>
              )}
            </div>
          )}
        </>
      ) : null}
     {/* Status - 1/4 */}
<div className="col-span-1">
  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
  <select
    name="status"
    value={feedbackData.status}
    onChange={handleFeedbackChange}
    className="w-full h-12 p-3 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 bg-gray-100"
    
  >
    <option value="">Select Status</option>
    <option>Happy</option>
    <option>Smooth</option>
    <option>Ok</option>
    <option>Satisfied</option>
    <option>NotSatisfied</option>
    <option>Hate</option>
  </select>
</div>

{/* Conditions - 3/4 */}
<div className="col-span-3">
  <label className="block text-sm font-medium text-gray-700 mb-1">Conditions</label>
  <Select
    options={conditionOptions}
    isMulti
    value={selectedConditions}
    onChange={handleConditionsChange}
    className="react-select-container"
    classNamePrefix="react-select"
    styles={customStyles}
  />
</div>



  {/* Schedule Date - 1/4 */}
<div className="col-span-1">
  <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Date</label>
  <input
    type="date"
    name="scheduleDate"
    value={feedbackData.scheduleDate}
    onChange={handleFeedbackChange}
    className="w-full h-12 p-3 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
  />
</div>

{/* Schedule Time (12-hour format with AM/PM) - 1/4 */}
<div className="col-span-1">
  <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Time</label>
  <div className="flex gap-2">
    {/* Hour */}
    <select
      name="hour"
      value={feedbackData.hour}
      onChange={handleFeedbackChange}
      className="w-1/3 h-12 p-2 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
     
    >
      {Array.from({ length: 12 }, (_, i) => {
        const hour = i + 1;
        return <option key={hour} value={hour}>{hour}</option>;
      })}
    </select>

    {/* Minute */}
    <select
      name="minute"
      value={feedbackData.minute}
      onChange={handleFeedbackChange}
      className="w-1/3 h-12 p-2 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      {["00", "15", "30", "45"].map((m) => (
        <option key={m} value={m}>{m}</option>
      ))}
    </select>

    {/* AM/PM */}
    <select
      name="amPm"
      value={feedbackData.amPm}
      onChange={handleFeedbackChange}
      className="w-1/3 h-12 p-2 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      <option value="AM">AM</option>
      <option value="PM">PM</option>
    </select>
  </div>
</div>


{/* Comment Section - 2/4 */}
<div className="col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
  <textarea
    name="comment"
    value={feedbackData.comment}
    onChange={handleFeedbackChange}
    rows={1}
    className="w-full p-3 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 resize-none"
    placeholder="Enter comment..."
  />
</div>
<div className="col-span-4 flex justify-center mt-1 w-full">
  <button
    type="button"
    onClick={handleAddFeedback} // Replace with your actual handler function
    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300 w-full"
  >
    ADD
  </button>
</div>

          {/* Button container */}
          <div className="col-span-4 flex justify-center space-x-2 mt-1">
            {itineryButtonRendering ? (
              <button
                type="button"
                className="bg-blue-500 text-white px-3 py-2 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 w-48"
                onClick={handleItineraryDownloadByCustomerCare}
              >
                Download Itinerary
              </button>
            ) : (
              <button
                type="button"
                className="bg-blue-500 text-white px-3 py-2 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 w-48"
                onClick={handleCustomItineraryDownloadByCustomerCare}
              >
                Download Itinerary
              </button>
            )}
            <button
              type="button"
              className="bg-blue-500 text-white px-3 py-2 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 w-48"
              onClick={handleChangeToOngoing}
            >
              Change to Ongoing
            </button>
            <button
              type="button"
              className="bg-blue-500 text-white px-3 py-2 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 w-48"
              onClick={handleChangeToTourCompleted}
            >
              Change to completed
            </button>
            <button
              type="button"
              className="bg-blue-500 text-white px-3 py-2 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 w-48"
              onClick={handleChangeToHomeReached}
            >
              Mark homeReached
            </button>
            <button
              type="button"
              className="bg-blue-500 text-white px-3 py-2 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 w-48"
              onClick={handleChangeToReviewGiven}
            >
              Mark reviewGiven
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientDetails;
