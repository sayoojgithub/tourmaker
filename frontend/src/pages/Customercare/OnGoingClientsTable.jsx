import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";

const OnGoingClientsTable = ({ onSeeMore }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchClients = async (term = searchTerm) => {
    setLoading(true);
    try {
          // Get the user data from local storage
    const user = JSON.parse(localStorage.getItem("user")); // Parse the stored string
    const companyId = user?.companyId; // Extract companyId, safely handle undefined
      const queryParams = new URLSearchParams({
        page: currentPage,
        companyId,
        ...(term === "pending"
          ? { balanceStatus: "positive" } // Add balance status filter for "red"
          : isNaN(term)
          ? { clientId: term }
          : { mobileNumber: term }),
      });

      console.log("Query Params:", queryParams.toString()); // Debugging line

      const response = await fetch(
        `${BASE_URL}/customercare/ongoing-clients?${queryParams}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch clients");
      }
      const data = await response.json();
      setClients(data.clients);
      setTotalPages(data.totalPages);
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
    <div className="p-6 bg-white/20 shadow-2xl rounded-lg mt-4">
      <h2 className="text-2xl font-semibold mb-4">Ongoing Clients</h2>

      {/* Search Section */}
      {/* Search Section */}
      <div className="mb-4 bg-white/20 shadow-md rounded-xl p-3 flex flex-col md:flex-row items-center gap-4">
        {/* Search Input */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="🔍 Search by Client ID, Mobile Number, or 'pending'"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-white/20"
          />
          <div className="absolute left-3 top-2.5 text-gray-400 pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M16 10a6 6 0 11-12 0 6 6 0 0112 0z"
              />
            </svg>
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-indigo-700 transition transform hover:scale-105 shadow-sm w-full md:w-auto"
        >
          Search
        </button>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 text-left rounded-lg">
          <thead className="bg-gray-400">
            <tr>
              <th className="px-4 py-2 border-b font-extrabold">Client ID</th>
              <th className="px-4 py-2 border-b font-extrabold">Itinerary</th>
              <th className="px-4 py-2 border-b font-extrabold">Due Date</th>
              <th className="px-4 py-2 border-b font-extrabold">Tour Date</th>
              <th className="px-4 py-2 border-b font-extrabold">Amount</th>
              <th className="px-4 py-2 border-b font-extrabold">Balance</th>
              <th className="px-4 py-2 border-b font-extrabold">Details</th>
              
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : clients.length > 0 ? (
              clients.map((client) => (
                <tr
            key={client._id}
            className={`hover:bg-gray-50 ${
              client.balance === 0
                ? "bg-green-100"
                : client.balance > 0
                ? "bg-red-100"
                : ""
            }`}
          >
                  <td className="px-4 py-2 border-b font-bold">
                    {client.clientId}
                  </td>
                  <td className="px-4 py-2 border-b font-bold">
                    {(() => {
                      const itineraryType =
                        client.itinerary?.[0]?.itineraryType;
                      if (itineraryType === "custom") return "Custom";
                      if (itineraryType === "fixed") return "Group";
                      if (itineraryType === "special") return "Fixed";
                      return "N/A";
                    })()}
                  </td>
                  <td className="px-4 py-2 border-b font-bold">
                    {client.dueDate}
                  </td>
                  <td className="px-4 py-2 border-b font-bold">
                    {client.finalizedTourDate}
                  </td>
                  <td className="px-4 py-2 border-b font-bold">
                    {client.amountToBePaid}
                  </td>
                  <td className="px-4 py-2 border-b font-bold">
                    {client.balance}
                  </td>
                  <td className="px-4 py-2 border-b text-blue-500 hover:underline cursor-pointer">
                    <span
                      title="See More"
                      onClick={() => onSeeMore(client._id)}
                    >
                      ➕
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center p-4 font-extrabold text-red-600"
                >
                  No clients found
                </td>
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
          className={`px-3 py-2 rounded-full text-white ${
            currentPage === 1 ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          &#8592;
        </button>
        <span className="mx-4 w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white font-semibold">
          {currentPage}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-full text-white ${
            currentPage === totalPages
              ? "bg-gray-300"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          &#8594;
        </button>
      </div>
    </div>
  );
};

export default OnGoingClientsTable;
