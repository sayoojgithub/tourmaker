import { useEffect, useState } from "react";
import { BASE_URL } from "../../config";
import { toast } from "react-toastify";


const roles = ["Front Office", "Executive", "Billing", "Customer Care"];
const ranges = [
  "01-09", "10-19", "20-29", "30-39", "40-49",
  "50-59", "60-69", "70-79", "80-89", "90-99","100-100"
];

const ManagePoints = () => {
  const [selectedRole, setSelectedRole] = useState("");
  const [points, setPoints] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const companyId = JSON.parse(localStorage.getItem("user"))?.companyId;

  const isFormComplete = selectedRole && ranges.every((range) => points[range]);

  // Handle role selection and fetch existing points
  const handleRoleChange = async (role) => {
    setSelectedRole(role);
    setPoints({});
    setSubmitted(false);

    try {
      const res = await fetch(`${BASE_URL}/salesManager/getPoints?companyId=${companyId}&role=${role}`);
      if (res.ok) {
        const data = await res.json();
        setPoints(data?.points || {});
      }
    } catch (error) {
      console.error("Error fetching role data", error);
    }
  };

  const handlePointChange = (range, value) => {
    setPoints((prev) => ({
      ...prev,
      [range]: value
    }));
  };

  // Create all points at once
  const handleCreate = async () => {
    if (!isFormComplete || !companyId) return;
  
    const payload = { companyId, role: selectedRole, points };
  
    try {
      const response = await fetch(`${BASE_URL}/salesManager/pointsCreate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        if (response.status === 400 && result.message === "Points already exist for this role") {
          toast.info(result.message); // Show toast if points already exist
        } else {
          throw new Error(result.message || "Failed to save points");
        }
        return;
      }
  
      setSubmitted(true);
      toast.success("Points saved successfully!");
    } catch (err) {
      console.error(err);
      
    }
  };
  

  // Update individual point
  const handleUpdate = async (range) => {
    try {
      const payload = {
        companyId,
        role: selectedRole,
        range,
        point: points[range] === "" ? 0 : points[range],
      };
     
      const response = await fetch(`${BASE_URL}/salesManager/updateSinglePoint`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
  
      const result = await response.json(); // read response JSON
  
      if (!response.ok) {
        if (response.status === 404 && result.message === "Create complete points first") {
          toast.info(result.message); // show toast if points not created
        } else {
          throw new Error(result.message || "Failed to update point");
        }
        return;
      }
  
      toast.success(`Point for ${range} updated successfully!`);
    } catch (err) {
      console.error(err);
      toast.error("Error updating point");
    }
  };
  

  return (
    <div className="w-full p-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl mt-1">
      <h2 className="text-lg font-semibold text-gray-800 mb-3 text-center">Manage Points</h2>

      {/* Role Buttons */}
      <div className="flex justify-center gap-4 mb-6 flex-wrap">
        {roles.map((role) => (
          <button
            key={role}
            onClick={() => handleRoleChange(role)}
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              selectedRole === role ? "bg-blue-500 border-blue-500 text-white" : "border-gray-400 text-gray-700"
            }`}
          >
            <span className="text-xs">{role.split(" ")[0][0]}</span>
          </button>
        ))}
      </div>

      {/* Role Labels */}
      <div className="flex justify-center gap-8 mb-8 flex-wrap">
        {roles.map((role) => (
          <span key={role} className="text-sm font-medium text-gray-700">
            {role}
          </span>
        ))}
      </div>

      {/* Point Inputs */}
      <div className="overflow-y-auto" style={{ maxHeight: "190px", scrollbarWidth: "none" }}>
        {ranges.map((range) => (
          <div
            key={range}
            className="flex items-center justify-between bg-white/30 p-3 mb-2 rounded-lg shadow-md hover:bg-white/50 transition duration-300"
          >
            <div className="text-gray-900 font-medium">{range}</div>
            <input
              type="number"
              placeholder="Set Points"
              value={points[range] || 0}
              onChange={(e) => handlePointChange(range, e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 w-24 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              // disabled={!points[range]}
              onClick={() => handleUpdate(range)}
              className={`px-3 py-1 text-white rounded-lg shadow-md text-sm ${
                points[range]
                  ? "bg-blue-500 hover:bg-blue-600 transition duration-300"
                  : "bg-blue-500 hover:bg-blue-600 transition duration-300"
              }`}
            >
              Update
            </button>
          </div>
        ))}
      </div>

      {/* Create Button */}
      <div className="flex justify-center mt-4 ">
        <button
          onClick={handleCreate}
          disabled={!isFormComplete || submitted}
          className={`px-4 py-2 text-white w-full rounded-lg shadow-md transition duration-300 ${
            isFormComplete && !submitted ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {submitted ? "Created" : "Create"}
        </button>
      </div>
    </div>
  );
};

export default ManagePoints;
