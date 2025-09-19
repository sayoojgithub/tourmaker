// import React, { useEffect, useState } from "react";
// import { toast } from "react-toastify";
// import { BASE_URL } from "../../config";

// const ClientsToCreate = ({ onCreate }) => {
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [totalClients, setTotalClients] = useState(0);

//   const storedUser = JSON.parse(localStorage.getItem("user"));
//   const companyId = storedUser?.companyId;

//   const fetchRows = async (page = currentPage, term = searchTerm) => {
//     if (!companyId) {
//       toast.error("Company not found in local storage.");
//       return;
//     }
//     setLoading(true);
//     try {
//       const queryParams = new URLSearchParams({
//         page: page.toString(),
//         limit: "5",
//         search: term.trim(),
//         companyId,
//       });

//       const response = await fetch(
//         `${BASE_URL}/frontoffice/allClientsToCreate?${queryParams.toString()}`
//       );
//       if (!response.ok) {
//         const err = await response.json().catch(() => ({}));
//         throw new Error(err.message || "Failed to fetch clients");
//       }
//       const data = await response.json();
//       setRows(data.clients || []);
//       setTotalPages(data.totalPages || 1);
//       setTotalClients(data.totalClients || 0);
//     } catch (e) {
//       console.error(e);
//       toast.error(e.message || "Error fetching clients");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchRows(currentPage, searchTerm);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [currentPage]);

//   const handleSearch = () => {
//     setCurrentPage(1);
//     fetchRows(1, searchTerm);
//   };

//   const handleNextPage = () => {
//     if (currentPage < totalPages) setCurrentPage((p) => p + 1);
//   };
//   const handlePrevPage = () => {
//     if (currentPage > 1) setCurrentPage((p) => p - 1);
//   };

//   const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString("en-GB") : "-");
//   const fmtTime = (iso) =>
//     iso ? new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "-";

//   return (
//     <div className="p-6 bg-white/20 shadow-2xl rounded-lg mt-1 w-full max-w-[90vw] mx-auto">
//       <div className="flex items-center justify-center mb-1">
//         <div className="flex items-center gap-1 bg-white/30 px-4 py-2 rounded-lg shadow">
//           <h2 className="text-2xl font-semibold text-red-600">Clients To Create</h2>
//           <span className="ml-2 text-xl text-red-600 font-bold">({totalClients})</span>
//         </div>
//       </div>

//       {/* Search */}
//       <div className="mb-4 flex items-center gap-4">
//         <input
//           type="text"
//           placeholder="Search by Name or Mobile Number"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="border rounded-lg px-3 py-2 border-black w-full bg-white/30"
//         />
//         <button
//           onClick={handleSearch}
//           className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-full shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
//           title="Search"
//         >
//           🔍
//         </button>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full border border-gray-200 text-left rounded-lg">
//           <thead className="bg-gray-400">
//             <tr>
//               <th className="px-4 py-2 border-b font-extrabold">Name</th>
//               <th className="px-4 py-2 border-b font-extrabold">Mobile Number</th>
//               <th className="px-4 py-2 border-b font-extrabold">Destination</th>
//               <th className="px-4 py-2 border-b font-extrabold">Created Date</th>
//               <th className="px-4 py-2 border-b font-extrabold">Created Time</th>
//               <th className="px-4 py-2 border-b font-extrabold">Create</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan="6" className="text-center p-4">Loading...</td>
//               </tr>
//             ) : rows.length > 0 ? (
//               rows.map((c) => (
//                 <tr key={c._id} className="hover:bg-white/20">
//                   <td className="px-4 py-2 border-b font-bold">{c.name || "-"}</td>
//                   <td className="px-4 py-2 border-b font-bold">{c.mobileNumber}</td>
//                   <td className="px-4 py-2 border-b font-bold">
//                     {c.primaryTourName?.label || c.primaryTourName?.value || "-"}
//                   </td>
//                   <td className="px-4 py-2 border-b font-bold">{fmtDate(c.createdAtByEntry)}</td>
//                   <td className="px-4 py-2 border-b font-bold">{fmtTime(c.createdAtByEntry)}</td>
//                   <td className="px-4 py-2 border-b">
//                     <button
//                       className="px-3 py-1 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700"
//                       title="Create this client"
//                       onClick={() => onCreate?.(c)}
//                     >
//                       ＋
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="6" className="text-center p-4 font-extrabold text-red-600">
//                   No clients found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       <div className="flex items-center justify-between mt-4">
//         <button
//           onClick={handlePrevPage}
//           disabled={currentPage === 1}
//           className={`px-3 py-2 rounded-full text-white ${currentPage === 1 ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"}`}
//           title="Prev page"
//         >
//           &#8592;
//         </button>
//         <span className="mx-4 w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white font-semibold">
//           {currentPage}
//         </span>
//         <button
//           onClick={handleNextPage}
//           disabled={currentPage === totalPages}
//           className={`px-3 py-2 rounded-full text-white ${currentPage === totalPages ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"}`}
//           title="Next page"
//         >
//           &#8594;
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ClientsToCreate;
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";

const ClientsToCreate = ({ onCreate }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalClients, setTotalClients] = useState(0);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const companyId = storedUser?.companyId;

  const fetchRows = async (page = currentPage, term = searchTerm) => {
    if (!companyId) {
      toast.error("Company not found in local storage.");
      return;
    }
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "5",
        search: term.trim(),
        companyId,
      });

      const response = await fetch(
        `${BASE_URL}/frontoffice/allClientsToCreate?${queryParams.toString()}`
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

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const fmtDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString("en-GB") : "-";
  const fmtTime = (iso) =>
    iso
      ? new Date(iso).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  return (
    <div className="p-6 bg-white/20 shadow-2xl rounded-lg mt-1 w-full max-w-[90vw] mx-auto">
      <div className="flex items-center justify-center mb-1">
        <div className="flex items-center gap-1 bg-white/30 px-4 py-2 rounded-lg shadow">
          <h2 className="text-2xl font-semibold text-red-600">
            Clients To Create
          </h2>
          <span className="ml-2 text-xl text-red-600 font-bold">
            ({totalClients})
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 flex items-center gap-4">
        <input
          type="text"
          placeholder="Search by Name or Mobile Number"
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
              <th className="px-4 py-2 border-b font-extrabold">
                Mobile Number
              </th>
              <th className="px-4 py-2 border-b font-extrabold">Destination</th>
              <th className="px-4 py-2 border-b font-extrabold">Type</th>
              <th className="px-4 py-2 border-b font-extrabold">
                Created Date
              </th>
              <th className="px-4 py-2 border-b font-extrabold">
                Created Time
              </th>
              <th className="px-4 py-2 border-b font-extrabold">Create</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : rows.length > 0 ? (
              rows.map((c) => {
                const isUrgent = c?.clientType?.value === "Urgent Contact";
                return (
                  <tr
                    key={c._id}
                    className={`hover:bg-white/20 ${
                      isUrgent ? "bg-red-50 text-red-700" : ""
                    }`}
                  >
                    <td className="px-4 py-2 border-b font-bold">
                      <div
                        className="max-w-[180px] truncate"
                        title={c.name || "-"}
                      >
                        {c.name || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-2 border-b font-bold">
                      {c.mobileNumber}
                    </td>
                    <td className="px-4 py-2 border-b font-bold">
                      <div
                        className="max-w-[220px] truncate"
                        title={
                          c.primaryTourName?.label ||
                          c.primaryTourName?.value ||
                          "-"
                        }
                      >
                        {c.primaryTourName?.label ||
                          c.primaryTourName?.value ||
                          "-"}
                      </div>
                    </td>
                    <td className="px-4 py-2 border-b font-bold">
                      {c?.clientType?.value === "Urgent Contact"
                        ? "Urgent"
                        : "-"}
                    </td>
                    <td className="px-4 py-2 border-b font-bold">
                      {fmtDate(c.createdAtByEntry)}
                    </td>
                    <td className="px-4 py-2 border-b font-bold">
                      {fmtTime(c.createdAtByEntry)}
                    </td>
                    <td className="px-4 py-2 border-b">
                      <button
                        className="px-3 py-1 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700"
                        title="Create this client"
                        onClick={() => onCreate?.(c)}
                      >
                        ＋
                      </button>
                    </td>
                  </tr>
                );
              })
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
            currentPage === totalPages
              ? "bg-gray-300"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          title="Next page"
        >
          &#8594;
        </button>
      </div>
    </div>
  );
};

export default ClientsToCreate;
