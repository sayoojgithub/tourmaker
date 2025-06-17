import React, { useState, useEffect } from "react";
import { BASE_URL } from "../../config";
import { toast } from "react-toastify";

const AddedBanksList = ({ onEdit }) => {
  const [banks, setBanks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchBanksListsController, setFetchBanksListsController] = useState(false);

  useEffect(() => {
    const fetchBanksLists = async () => {
      try {
        const company = JSON.parse(localStorage.getItem("user"));
        if (company && company._id) {
          const companyId = company._id;

          const response = await fetch(
            `${BASE_URL}/company/banksList?companyId=${companyId}&page=${currentPage}&limit=4&search=${searchQuery}`
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch banks list");
          }

          const result = await response.json();
          setBanks(result.data);
          setTotalPages(result.totalPages);
        } else {
          console.error("User ID not found in localStorage");
        }
      } catch (error) {
        console.error("Failed to fetch banks list:", error.message);
      }
    };

    fetchBanksLists();
  }, [currentPage, searchQuery,fetchBanksListsController]);

  const handleEdit = (id) => {
    onEdit(id);
  };
  const handleDelete = async (id) => {
    
  
    try {
      const company = JSON.parse(localStorage.getItem("user"));
      if (!company || !company._id) {
        return;
      }
  
      const companyId = company._id;
  
      const response = await fetch(`${BASE_URL}/company/deleteBank/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyId }), // Send companyId in request body
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete bank");
      }
      toast.success("Deleted successfully")
  
      setFetchBanksListsController((prev) => !prev);
      
      
    } catch (error) {
      console.error("Error deleting bank:", error.message);
      alert("Failed to delete bank. Please try again.");
    }
  };
  

  const handleSearch = () => {
    setCurrentPage(1);
  };

  return (
    <div className="p-6 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg w-full  mx-auto">
      <div className="flex items-center justify-start mb-2">
  <div className="flex items-center gap-1 bg-white/30 px-2 py-2 rounded-lg shadow">
    <h2 className="text-xl font-semibold text-red-600">Bank List</h2>
  </div>
</div>

      {/* Search Input */}
      <div className="flex mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by bank name"
          className="p-2 border border-gray-300 rounded-lg flex-grow mr-2 bg-white/50 placeholder-gray-600"
        />
        <button
          onClick={handleSearch}
          className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-full shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
        >
          🔍
        </button>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse border border-white/30 rounded-lg overflow-hidden">
          <thead className="bg-white/30 text-gray-900">
            <tr>
              <th className="border border-white/30 px-4 py-2 font-bold">
                Name
              </th>
              <th className="border border-white/30 px-4 py-2 font-bold">
                IFSC Code
              </th>
              <th className="border border-white/30 px-4 py-2 font-bold">
                Account Number
              </th>
              <th className="border border-white/30 px-4 py-2 font-bold">
                Edit
              </th>
              <th className="border border-white/30 px-4 py-2 font-bold">
                Delete
              </th>
            </tr>
          </thead>
          <tbody>
            {banks.map((bank) => (
              <tr key={bank._id} className="text-gray-800">
                <td className="border border-white/30 px-4 py-2 text-center">
                  {bank.bankName}
                </td>
                <td className="border border-white/30 px-4 py-2 text-center">
                  {bank.bankIfscCode}
                </td>
                <td className="border border-white/30 px-4 py-2 text-center">
                  {bank.bankAccountNumber}
                </td>
                <td className="border border-white/30 px-4 py-2 text-center">
                  <button
                    onClick={() => handleEdit(bank._id)}
                    className="px-4 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
                  >
                    ✏️ Edit
                  </button>
                </td>
                <td className="border border-white/30 px-4 py-2 text-center">
                  <button
                    onClick={() => handleDelete(bank._id)}
                    className="px-4 py-1 bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold rounded-lg shadow-md hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
                  >
                    🗑️ Delete
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
        <div className="px-4 py-2 bg-gray-400 text-white rounded-full">
          {currentPage}
        </div>
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

export default AddedBanksList;
