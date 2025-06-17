import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";

const PendingTable = ({ onSeeMore }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalClients, setTotalClients] = useState('');
  

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?._id;

  const fetchClients = async (term = searchTerm) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        executiveId: userId,
        page: currentPage,
        ...(term && (isNaN(term) ? { clientId: term } : { mobileNumber: term })), // Dynamically add clientId or mobileNumber based on search term type
      });

      console.log("Query Params:", queryParams.toString()); // Debugging line

      const response = await fetch(`${BASE_URL}/executive/pending-clients?${queryParams}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch clients");
      }
      const data = await response.json();
      setClients(data.clients);
      setTotalPages(data.totalPages);
      setTotalClients(data.totalClients);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      toast.error(error.message || "An error occurred while fetching clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients(searchTerm); // Pass searchTerm to ensure it’s used
  }, [currentPage, searchTerm]);

  const handleSearch = () => {
    setCurrentPage(1); // Reset to page 1 when searching
    fetchClients(searchTerm); // Trigger fetch with updated search term
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="p-6 bg-white/20 shadow-2xl rounded-lg mt-2 w-full max-w-[90vw] mx-auto">
      <div className="flex items-center justify-center mb-1">
      <div className="flex items-center gap-1 bg-white/30 px-4 py-2 rounded-lg shadow">
      <h2 className="text-2xl font-semibold text-red-600">Pending Clients</h2>
      <span className="ml-2 text-xl text-red-600 font-bold">
      ({totalClients})
      </span>
    </div>
    </div>

      {/* Search Section */}
      <div className="mb-4 flex items-center gap-4">
        <input
          type="text"
          placeholder="Search by Client ID or Mobile Number"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded-lg px-3 py-2 border-black w-full bg-white/30"
        />
        <button
          onClick={handleSearch} // Use handleSearch to trigger fetch
          className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-full shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
        >
          🔍
        </button>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 text-left rounded-lg">
          <thead className="bg-gray-400">
            <tr>
              <th className="px-4 py-2 border-b font-extrabold">Client ID</th>
              <th className="px-4 py-2 border-b font-extrabold">Client Type</th>
              <th className="px-4 py-2 border-b font-extrabold">Start Date</th>
              <th className="px-4 py-2 border-b font-extrabold">Primary Tour</th>
              <th className="px-4 py-2 border-b font-extrabold">Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center p-4">Loading...</td>
              </tr>
            ) : clients.length > 0 ? (
              clients.map((client) => (
                <tr key={client._id} className="hover:bg-white/20">
                  <td className="px-4 py-2 border-b font-bold">{client.clientId}</td>
                  <td className="px-4 py-2 border-b font-bold">{client.clientType?.label || "-"}</td>
                  <td className="px-4 py-2 border-b font-bold">
                    {new Date(client.startDate).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4 py-2 border-b font-bold">{client.primaryTourName?.label || "-"}</td>
                  <td className="px-4 py-2 border-b text-blue-500 hover:underline cursor-pointer">
                    <span title="See More" onClick={() => onSeeMore(client._id)}>➕</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-4 font-extrabold text-red-600">No clients found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-full text-white ${currentPage === 1 ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          &#8592;
        </button>
        <span className="mx-4 w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white font-semibold">
          {currentPage}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-full text-white ${currentPage === totalPages ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          &#8594;
        </button>
      </div>
    </div>
  );
};

export default PendingTable;
