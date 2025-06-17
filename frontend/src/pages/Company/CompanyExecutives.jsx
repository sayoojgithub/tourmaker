import React, { useState, useEffect } from "react";
import { BASE_URL } from "../../config";
import { toast } from "react-toastify";

const CompanyExecutives = ({onEdit}) => {
  const [executives, setExecutives] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchExecutives = async () => {
      try {
        const company = JSON.parse(localStorage.getItem("user"));
        if (company && company._id) {
          const companyId = company._id;
          const response = await fetch(
            `${BASE_URL}/company/executivesList?companyId=${companyId}&page=${currentPage}&limit=4&search=${searchQuery}`
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch executives list");
          }

          const result = await response.json();
          setExecutives(result.data);
          setTotalPages(result.totalPages);
        } else {
          console.error("User ID not found in localStorage");
        }
      } catch (error) {
        console.error("Failed to fetch executives list:", error.message);
      }
    };

    fetchExecutives();
  }, [currentPage, searchQuery]);

  return (
    <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg w-full mx-auto mt-5">
      <div className="flex items-center justify-start mb-1">
  <div className="flex items-center gap-1 bg-white/30 px-2 py-2 rounded-lg shadow">
    <h2 className="text-xl font-semibold text-red-600">Executives List</h2>
  </div>
</div>

      {/* Search Input with Button */}
      <div className="flex mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by executive name"
          className="p-2 border border-gray-300 rounded-lg flex-grow mr-2 bg-white/50 placeholder-gray-600"
        />
        <button
          onClick={() => setCurrentPage(1)}
          className="px-4 py-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105"
        >
          🔍
        </button>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse border border-white/30 rounded-lg overflow-hidden">
          <thead className="bg-white/30 text-gray-900">
            <tr>
              <th className="border border-white/30 px-4 py-2 font-bold">Name</th>
              <th className="border border-white/30 px-4 py-2 font-bold">Mobile Number</th>
              <th className="border border-white/30 px-4 py-2 font-bold">Email</th>
              <th className="border border-white/30 px-4 py-2 font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            {executives.map((executive) => (
              <tr key={executive._id} className="text-gray-800">
                <td className="border border-white/30 px-4 py-2 text-center">{executive.name}</td>
                <td className="border border-white/30 px-4 py-2 text-center">{executive.mobileNumber}</td>
                <td className="border border-white/30 px-4 py-2 text-center">{executive.email}</td>
                <td className="border border-white/30 px-4 py-2 text-center">
                  <button
                    onClick={() => onEdit(executive)}
                    className="px-4 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
                  >
                    ✏️ Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex justify-between items-center">
        <button
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="px-4 py-2 bg-gray-400 text-white rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        <div className="px-4 py-2 bg-gray-400 text-white rounded-full">{currentPage}</div>
        <button
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="px-8 py-2 bg-gray-400 text-white rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CompanyExecutives;