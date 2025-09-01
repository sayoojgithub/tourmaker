import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";

const SearchClients = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalClients, setTotalClients] = useState(0);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const entryId = storedUser?._id; // send user _id to match entryId

  const fetchRows = async (page = currentPage, term = searchTerm) => {
    if (!entryId) {
      toast.error("User not found in local storage.");
      return;
    }

    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "5",            // 5 per page as requested
        search: term.trim(),   // search by mobile number
        entryId,               // backend will match entryId field
      });

      const response = await fetch(
        `${BASE_URL}/entry/search-clients?${queryParams.toString()}`
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to fetch clients");
      }

      const data = await response.json();
      setRows(data.clients || []);
      setTotalPages(data.totalPages || 1);
      setTotalClients(data.totalClients || 0);
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Error fetching clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows(currentPage, searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchRows(1, searchTerm);
  };
// const handleSearch = () => {
//   const term = searchTerm.trim();
//   setCurrentPage(1);
//   fetchRows(1, term === "" ? "" : term);
// };


  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString("en-GB") : "-");
  const fmtTime = (iso) =>
    iso ? new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "-";

  const StatusBadge = ({ value }) => (
    <span
      className={`px-2 py-1 rounded-full text-xs font-bold ${
        value ? "bg-green-600 text-white" : "bg-gray-300 text-gray-800"
      }`}
    >
      {value ? "Created" : "Pending"}
    </span>
  );

  return (
    <div className="p-6 bg-white/20 shadow-2xl rounded-lg mt-1 w-full max-w-[90vw] mx-auto">
      <div className="flex items-center justify-center mb-1">
        <div className="flex items-center gap-1 bg-white/30 px-4 py-2 rounded-lg shadow">
          <h2 className="text-2xl font-semibold text-red-600">Search Clients</h2>
          <span className="ml-2 text-xl text-red-600 font-bold">({totalClients})</span>
        </div>
      </div>

      {/* Search (mobile number) */}
      <div className="mb-4 flex items-center gap-4">
        <input
          type="text"
          inputMode="numeric"
          placeholder="Search by Mobile Number"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded-lg px-3 py-2 border-black w-full bg-white/30"
        />
        <button
          onClick={handleSearch}
          className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-full shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
          title="Search"
        >
          🔍
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 text-left rounded-lg">
          <thead className="bg-gray-400">
            <tr>
              <th className="px-4 py-2 border-b font-extrabold">Name</th>
              <th className="px-4 py-2 border-b font-extrabold">Mobile Number</th>
              <th className="px-4 py-2 border-b font-extrabold">Destination</th>
              <th className="px-4 py-2 border-b font-extrabold">Created Date</th>
              <th className="px-4 py-2 border-b font-extrabold">Created Time</th>
              <th className="px-4 py-2 border-b font-extrabold">Front Office Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : rows.length > 0 ? (
              rows.map((c) => (
                <tr key={c._id} className="hover:bg-white/20">
                  <td className="px-4 py-2 border-b font-bold">{c.name || "-"}</td>
                  <td className="px-4 py-2 border-b font-bold">{c.mobileNumber}</td>
                  <td className="px-4 py-2 border-b font-bold">
                    {c.primaryTourName?.label || c.primaryTourName?.value || "-"}
                  </td>
                  <td className="px-4 py-2 border-b font-bold">{fmtDate(c.createdAtByEntry)}</td>
                  <td className="px-4 py-2 border-b font-bold">{fmtTime(c.createdAtByEntry)}</td>
                  <td className="px-4 py-2 border-b">
                    <StatusBadge value={c.frontOfficeCreatedStatus} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-4 font-extrabold text-red-600">
                  No clients found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-full text-white ${
            currentPage === 1 ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
          }`}
          title="Prev page"
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
            currentPage === totalPages ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
          }`}
          title="Next page"
        >
          &#8594;
        </button>
      </div>
    </div>
  );
};

export default SearchClients;
