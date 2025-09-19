import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";

const CreateClient = () => {
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    primaryTourName: null, // { _id, value, label }
    connectedThrough: null, // { value, label }  (REQUIRED)
    clientType: null,       // { value, label }  (OPTIONAL)
  });
    const connectedThroughOptions = [
    { value: "social media organic", label: "social media organic" },
    { value: "social media promotions", label: "social media promotions" },
    { value: "customer enquiry", label: "customer enquiry" },
    { value: "by call", label: "by call" },
    { value: "recommented", label: "recommented" },
    { value: "instagram chat", label: "instagram chat" },
  ];

  const clientTypeOptions = [
    { value: "Urgent Contact", label: "Urgent Contact" },
  ];

  const [destinations, setDestinations] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingDest, setLoadingDest] = useState(false);

  const customStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "#f3f4f6",
      borderRadius: "10px",
      boxShadow: state.isFocused ? "0 0 5px rgba(0, 120, 255, 0.3)" : "none",
      border: state.isFocused ? "2px solid #007BFF" : "1px solid #ccc",
      padding: "4px",
      minHeight: "48px",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#007BFF" : "white",
      color: state.isFocused ? "white" : "black",
      cursor: "pointer",
    }),
    indicatorSeparator: () => ({ display: "none" }),
  };

  const fetchDestinations = async () => {
    try {
      setLoadingDest(true);
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser?.companyId) {
        toast.error("Company not found in local storage.");
        return;
      }

      const res = await fetch(
        `${BASE_URL}/purchaser/getDestinationsName?companyId=${storedUser.companyId}`
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to fetch destinations");
      }
      const data = await res.json();

      const options = data.map((d) => ({
        _id: d._id,
        value: d.value,
        label: d.label,
      }));
      setDestinations(options);
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Unable to load destinations");
    } finally {
      setLoadingDest(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const validate = () => {
  
    if (!formData.mobileNumber.trim()) {
      toast.error("Mobile number is required");
      return false;
    }
    if (!/^\d{10,15}$/.test(formData.mobileNumber.trim())) {
      toast.error("Mobile number must be 10–15 digits");
      return false;
    }
    if (!formData.primaryTourName || !formData.primaryTourName.value) {
      toast.error("Please select a primary destination");
      return false;
    }
        if (!formData.connectedThrough || !formData.connectedThrough.value) {
      toast.error("Please select Connected Through");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!validate()) return;

    try {
      setSubmitting(true);
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const entryId = storedUser?._id;

      if (!entryId) {
        toast.error("Entry ID not found in local storage (user._id).");
        return;
      }

      const payload = {
        name: formData.name.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        primaryTourName: {
          _id: formData.primaryTourName._id,
          value: formData.primaryTourName.value,
          label: formData.primaryTourName.label,
        },
        entryId,
               connectedThrough: formData.connectedThrough
         ? { value: formData.connectedThrough.value, label: formData.connectedThrough.label }
         : null,
       clientType: formData.clientType
         ? { value: formData.clientType.value, label: formData.clientType.label }
         : null,
      };

      const res = await fetch(`${BASE_URL}/entry/client-by-entry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create client");
      }

      toast.success("Client created successfully");
      setFormData({
        name: "",
        mobileNumber: "",
        primaryTourName: null,
        connectedThrough: null,
        clientType: null,
      });
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full p-4 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg">
      <div className="grid grid-cols-1 gap-4 p-4 bg-white/20 rounded-lg shadow-lg">
        {/* Name */}
        <div>
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) =>
              setFormData((s) => ({ ...s, name: e.target.value }))
            }
            className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
          />
        </div>

        {/* Mobile Number */}
        <div>
          <input
            type="text"
            placeholder="Mobile Number"
            value={formData.mobileNumber}
            onChange={(e) =>
              setFormData((s) => ({ ...s, mobileNumber: e.target.value }))
            }
            className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
          />
        </div>

        {/* Primary Destination */}
        <div>
          <Select
            isClearable
            isLoading={loadingDest}
            options={destinations}
            styles={customStyles}
            value={formData.primaryTourName}
            onChange={(opt) =>
              setFormData((s) => ({ ...s, primaryTourName: opt }))
            }
            placeholder="Select Primary Destination"
          />
        </div>
               {/* Connected Through (REQUIRED) */}
       <div>
         <Select
           isClearable
           options={connectedThroughOptions}
           styles={customStyles}
           value={formData.connectedThrough}
           onChange={(opt) =>
             setFormData((s) => ({ ...s, connectedThrough: opt }))
           }
           placeholder="Connected Through *"
         />
       </div>

       {/* Client Type (OPTIONAL) */}
       <div>
         <Select
           isClearable
           options={clientTypeOptions}
           styles={customStyles}
           value={formData.clientType}
           onChange={(opt) =>
             setFormData((s) => ({ ...s, clientType: opt }))
           }
           placeholder="Client Type (optional)"
         />
       </div>

        {/* Submit Button */}
        <div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-blue-600 text-white font-semibold w-full py-2 px-4 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create Client"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateClient;
