import React, { useState, useEffect } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";

const ClientDetails = ({ clientId, switchToBookedClients }) => {
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
    pincode: "",
    district: "",
    state: "",
    clientContactOption: "",
    clientType: "",
    clientCurrentLocation: "",
    connectedThrough: "",
    behavior: "",
    additionalRequirments: "",
    amountToBePaid: "",
    amountPaid: "",
    balance: "",
    invoiceNumber:"",
  });
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [notes, setNotes] = useState([]);
  const [executives, setExecutives] = useState([]);
  const [selectedExecutive, setSelectedExecutive] = useState(null);
  const [discount, setDiscount] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [senderName, setSenderName] = useState("");
  const [itineryButtonRendering, setItineryButtonRendering] = useState(false);
  const [fetchClient , setFetchClient] = useState(false);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
  const [isLoadingVoucher, setIsLoadingVoucher] = useState(false);

  console.log(amount, paymentMode, transactionId, senderName);
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
      setLoading(true);

      try {
        const response = await fetch(
          `${BASE_URL}/billing/ClientDetailsFetch/${clientId}`,
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
          amountToBePaid: clientData.amountToBePaid || "",
          amountPaid: clientData.amountPaid || 0,
          balance: clientData.balance || 0,
          invoiceNumber: clientData.invoiceNumber
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
  }, [clientId,fetchClient]);
  console.log(itineryButtonRendering);

  const fetchDestinations = async () => {
    try {
      setLoading(true); // Set loading to true before fetching
      const response = await fetch(`${BASE_URL}/purchaser/getDestinationsName`);
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
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "It is mandatory.";
    }
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "It is mandatory.";
    }
    if (!formData.primaryTourName) {
      newErrors.primaryTourName = "It is mandatory.";
    }
    // if (!formData.tourName.length) {
    //   newErrors.tourName = "It is mandatory.";
    // }
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };
  const handleItineraryDownloadByBilling = async () => {
    if (!clientId) {
      toast.error("No ClientId Here");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/billing/downloadItineraryByBilling`,
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
  const handleConfirmItineraryDownloadByBilling = async () => {
    if (!clientId) {
      toast.error("No ClientId Here");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/billing/downloadCustomItineraryByBilling`,
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

  const handleInvoiceDownloadByBilling = async () => {
    if (isLoadingInvoice) return;
    if (!clientId) {
      toast.error("No ClientId Here");
      return;
    }
    if (discount < 0) {
      toast.error("Discount amount cannot be negative");
      return;
    }
    setIsLoadingInvoice(true);
    try {
      const response = await fetch(
        `${BASE_URL}/billing/downloadInvoiceByBilling`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId: clientId,
            amount,
            paymentMode,
            transactionId: paymentMode === "Cash" ? null : transactionId,
            senderName,
            ...(discount > 0 ? { discount } : {}),
          }),
        }
      );

      if (!response.ok) {
        // Extract and handle the backend error message
        const errorData = await response.json(); // Parse the JSON error message
        const errorMessage = errorData.message || "Failed to download invoice"; // Default fallback message
        toast.error(errorMessage);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "invoice.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
      setFetchClient(!fetchClient)

      if (formData.amountPaid === 0) {
        await handleVoucherDownloadByBilling();
      }
    } catch (error) {
      console.error("Error downloading invoice:", error.message);
      toast.error("Failed to download the invoice. Please try again.");
    } finally {
      setIsLoadingInvoice(false);
    }
  };
  const handleVoucherDownloadByBilling = async () => {
    if (isLoadingVoucher) return;
    if (!clientId) {
      toast.error("Client ID is required.");
      return;
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error("Please enter a valid positive amount.");
      return;
    }
    if (Number(amount) > formData.balance) {
      toast.error("Amount cannot be greater than the available balance.");
      return;
    }

    if (!paymentMode) {
      toast.error("Payment mode is required.");
      return;
    }

    if (
      paymentMode !== "Cash" &&
      (!transactionId || transactionId.trim() === "")
    ) {
      toast.error("Transaction ID is required for non-cash payments.");
      return;
    }

    if (!senderName || senderName.trim() === "") {
      toast.error("Sender name is required.");
      return;
    }
    // Retrieve billingStaffId from local storage
    const user = JSON.parse(localStorage.getItem("user"));
    const billingStaffId = user?._id;

    if (!billingStaffId) {
      toast.error("Billing staff ID is missing.");
      return;
    }
    setIsLoadingVoucher(true);
    try {
      const response = await fetch(
        `${BASE_URL}/billing/downloadVoucherByBilling`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId,
            amount,
            paymentMode,
            transactionId: paymentMode === "Cash" ? null : transactionId,
            senderName,
            billingStaffId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || "Failed to download voucher.";
        toast.error(errorMessage);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "voucher.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
      switchToBookedClients();
    } catch (error) {
      console.error("Error downloading voucher:", error.message);
      toast.error("Failed to download the voucher. Please try again.");
    } finally {
      setIsLoadingVoucher(false)
    }
  };

  return (
    <div className="w-full  p-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl mt-1">
    <div
        className="overflow-y-auto" // Enable vertical scrolling
        style={{ maxHeight: "430px",
        scrollbarWidth: "none", // For Firefox
        msOverflowStyle: "none", // For IE/Edge
        }} // Set max height to 170px
      >
      <form className="grid grid-cols-4 gap-3 p-4 bg-white/20 rounded-lg shadow-lg">
        {/* Amount to Be Paid and Balance Badges */}
        <div className="col-span-4 flex justify-center space-x-8 items-center mb-1">
          {/* Amount to Be Paid */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">
              Amount to Pay:
            </span>
            <span
              className={`font-bold text-lg ${
                formData.amountToBePaid > 0
                  ? "text-green-500"
                  : "text-green-500"
              }`}
            >
              {formData.amountToBePaid}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">
              Amount Paid:
            </span>
            <span
              className={`font-bold text-lg ${
                formData.amountPaid > 0 ? "text-orange-500" : "text-orange-500"
              }`}
            >
              {formData.amountPaid}
            </span>
          </div>

          {/* Balance */}

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Balance:</span>
            <span
              className={`font-bold text-lg ${
                formData.balance > 0 ? "text-red-500" : "text-red-500"
              }`}
            >
              {formData.balance}
            </span>
          </div>
        </div>

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
            placeholder="Select Add-on Destinations"
            styles={customStyles}
            onMenuOpen={fetchDestinations}
            isDisabled={true} // Fetch destinations on menu open
          />
          {errors.tourName && (
            <p style={{ color: "red", fontWeight: "500" }}>{errors.tourName}</p>
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
        <input
          type="text"
          placeholder="Pincode"
          value={formData.pincode}
          readOnly
          onChange={handlePincodeChange}
          className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
        />
        <input
          type="text"
          placeholder="District"
          value={formData.district}
          readOnly
          className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
        />

        {/* Row 4 */}
        <input
          type="text"
          placeholder="State"
          value={formData.state}
          readOnly
          className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
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
            isDisabled={true}
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
            isDisabled={true}
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
            isDisabled={true}
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
            isDisabled={true}
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
            isDisabled={true}
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
          readOnly
          className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 col-span-1"
        />
        {/* Amount Field */}
        <input
          type="number"
          placeholder="Enter Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
        />
        {/* Payment Mode Select */}
        <Select
          options={[
            { value: "UPI", label: "UPI" },
            { value: "Cash", label: "Cash" },
            { value: "IMPS", label: "IMPS" },
            { value: "NEFT", label: "NEFT" },
          ]}
          value={
            paymentMode ? { label: paymentMode, value: paymentMode } : null
          }
          onChange={(selected) => setPaymentMode(selected.value)}
          placeholder="Payment Mode"
          styles={customStyles}
        />
        {/* Transaction ID Field */}
        <input
          type="text"
          placeholder="Enter Transaction ID"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
        />
        {/* Sender Name Field */}
        <input
          type="text"
          placeholder="Enter Sender Name"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
          className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
        />
        <div className="col-span-4 flex justify-center mt-1">
          <input
            type="number"
            placeholder="Enter Discount Amount"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            disabled={!!formData.invoiceNumber}
            className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-8 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-1/2 text-center"
          />
        </div>

        {/* Button container */}
        <div className="col-span-4 flex justify-center space-x-2 mt-1">
          <button
            type="button"
            className="bg-green-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-green-600 transition duration-300 w-48"
            onClick={handleInvoiceDownloadByBilling}
            disabled={isLoadingInvoice}
          >
            Download Invoice
          </button>
          {itineryButtonRendering ? (
            <button
              type="button"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 w-48"
              onClick={handleItineraryDownloadByBilling}
            >
              Download Itinerary
            </button>
          ) : (
            <button
              type="button"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 w-48"
              onClick={handleConfirmItineraryDownloadByBilling}
            >
              Download Itinerary
            </button>
          )}
          <button
            type="button"
            className="bg-green-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-green-600 transition duration-300 w-48"
            onClick={handleVoucherDownloadByBilling}
            disabled={isLoadingVoucher}
          >
            Download Voucher
          </button>
        </div>
      </form>
    </div>
    </div>
  );
};

export default ClientDetails;
