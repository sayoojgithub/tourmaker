// import React, { useEffect, useState } from "react";
// import { toast } from "react-toastify";
// import { BASE_URL } from "../../config";

// const ClientSearch = ({ onSeeMore }) => {
//   const [clients, setClients] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [mobileNumber, setMobileNumber] = useState("");


//   const storedUser = JSON.parse(localStorage.getItem("user"));
//   const frontOfficerId = storedUser?._id;

//   const fetchClients = async () => {
//     if (!mobileNumber.trim()) {
//       //toast.error("Please enter a valid mobile number.");
//       return;
//     }
    

//     setLoading(true);
//     try {
//       const queryParams = new URLSearchParams({
//         frontOfficerId: frontOfficerId,
//         page: currentPage,
//         mobileNumber,
//       });
     

//       const response = await fetch(
//         `${BASE_URL}/frontoffice/all-clients?${queryParams}`
//       );
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to fetch clients");
//       }
//       const data = await response.json();
//       setClients(data.clients);
//       setTotalPages(data.totalPages);
//     } catch (error) {
//       console.error("Failed to fetch clients:", error);
//       toast.error(error.message || "An error occurred while fetching clients");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     // if (currentPage > 1) {
//     //   fetchClients();
//     // }
//     fetchClients()
    
//   }, [currentPage]);

//   const handleSearch = () => {
   
//     setCurrentPage(1); // Reset to page 1 when searching
//     fetchClients(); // Trigger fetch with updated mobile number
//   };

//   const handleNextPage = () => {
//     if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
//   };

//   const handlePrevPage = () => {
//     if (currentPage > 1) setCurrentPage((prev) => prev - 1);
//   };

//   return (
    
//       <div className="p-6 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-2xl w-full mx-auto mt-2">
//         <h2 className="text-xl font-bold mb-4 text-gray-800">Clients</h2>
  
//         {/* Search Section */}
//         <div className="flex mb-4">
//           <input
//             type="text"
//             placeholder="Enter Mobile Number"
//             value={mobileNumber}
//             onChange={(e) => setMobileNumber(e.target.value)}
//             className="p-2 border border-gray-300 rounded-lg flex-grow mr-2 bg-white/50 placeholder-gray-600"
//           />
//           <button
//             onClick={handleSearch}
//             className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-full shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
//           >
//             🔍
//           </button>
//         </div>
  
//         {/* Table Section */}
//         <div className="w-full overflow-x-auto">
//           <table className="w-full border-collapse border border-white/30 rounded-lg overflow-hidden">
//             <thead className="bg-white/30 text-gray-900">
//               <tr>
//                 <th className="border border-white/30 px-4 py-2 font-bold">C.ID</th>
//                 <th className="border border-white/30 px-4 py-2 font-bold">Mobile Number</th>
//                 <th className="border border-white/30 px-4 py-2 font-bold">Executive</th>
//                 <th className="border border-white/30 px-4 py-2 font-bold">Start Date</th>
//                 <th className="border border-white/30 px-4 py-2 font-bold">Primary Tour</th>
//                 <th className="border border-white/30 px-4 py-2 font-bold">Status</th>
//                 <th className="border border-white/30 px-4 py-2 font-bold">Details</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan="7" className="text-center p-4">Loading...</td>
//                 </tr>
//               ) : clients.length > 0 ? (
//                 clients.map((client) => (
//                   <tr key={client._id} className="text-gray-800">
//                     <td className="border border-white/30 px-4 py-2 text-center">{client.clientId}</td>
//                     <td className="border border-white/30 px-4 py-2 text-center">{client.mobileNumber}</td>
//                     <td className="border border-white/30 px-4 py-2 text-center">{client.executiveName}</td>
//                     <td className="border border-white/30 px-4 py-2 text-center">{new Date(client.startDate).toLocaleDateString("en-GB")}</td>
//                     <td className="border border-white/30 px-4 py-2 text-center">{client.primaryTourName?.label || "-"}</td>
//                     <td className="border border-white/30 px-4 py-2 text-center">{client.status}</td>
//                     <td className="border border-white/30 px-4 py-2 text-center text-blue-500 hover:underline cursor-pointer">
//                       <span
//                         title="See More"
//                         onClick={() => {
//                           if (!['Confirmed', 'Booked', 'Ongoing', 'Completed'].includes(client.status)) {
//                             onSeeMore(client._id);
//                           }
//                         }}
//                         className={`${
//                           ['Confirmed', 'Booked', 'Ongoing', 'Completed'].includes(client.status)
//                             ? 'cursor-not-allowed text-gray-400'
//                             : ''
//                         }`}
//                       >
//                         ➕
//                       </span>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="7" className="text-center p-4 font-extrabold text-red-600">No clients found</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
  
//         {/* Pagination Controls */}
//         <div className="mt-4 flex justify-between items-center">
//           <button
//             disabled={currentPage <= 1}
//             onClick={handlePrevPage}
//             className="px-4 py-2 bg-gray-400 text-white rounded-md disabled:opacity-50"
//           >
//             Previous
//           </button>
//           <div className="px-4 py-2 bg-gray-400 text-white rounded-full">{currentPage}</div>
//           <button
//             disabled={currentPage >= totalPages}
//             onClick={handleNextPage}
//             className="px-8 py-2 bg-gray-400 text-white rounded-md disabled:opacity-50"
//           >
//             Next
//           </button>
//         </div>
//       </div>
    
//   );
// };

// export default ClientSearch;
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";

const ClientSearch = ({ onSeeMore }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const frontOfficerId = storedUser?._id;

  const fetchClients = async () => {
    if (!searchInput.trim()) return;

    setLoading(true);
    try {
      const isNumber = /^\d+$/.test(searchInput.trim());
      const queryParams = new URLSearchParams({
        frontOfficerId,
        page: currentPage,
      });

      if (isNumber) {
        queryParams.append("mobileNumber", searchInput);
      } else {
        queryParams.append("clientId", searchInput.toLowerCase());
      }

      const response = await fetch(
        `${BASE_URL}/frontoffice/all-clients?${queryParams}`
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
    fetchClients();
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchClients();
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="p-6 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-2xl w-full mx-auto mt-2">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Clients</h2>

      {/* Search Section */}
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Enter Mobile Number or Client ID"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg flex-grow mr-2 bg-white/50 placeholder-gray-600"
        />
        <button
          onClick={handleSearch}
          className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-full shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
        >
          🔍
        </button>
      </div>

      {/* Table Section */}
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse border border-white/30 rounded-lg overflow-hidden">
          <thead className="bg-white/30 text-gray-900">
            <tr>
              <th className="border border-white/30 px-4 py-2 font-bold">C.ID</th>
              <th className="border border-white/30 px-4 py-2 font-bold">Mobile Number</th>
              <th className="border border-white/30 px-4 py-2 font-bold">Executive</th>
              <th className="border border-white/30 px-4 py-2 font-bold">Start Date</th>
              <th className="border border-white/30 px-4 py-2 font-bold">Primary Tour</th>
              <th className="border border-white/30 px-4 py-2 font-bold">Status</th>
              <th className="border border-white/30 px-4 py-2 font-bold">Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center p-4">Loading...</td>
              </tr>
            ) : clients.length > 0 ? (
              clients.map((client) => (
                <tr key={client._id} className="text-gray-800">
                  <td className="border border-white/30 px-4 py-2 text-center">{client.clientId}</td>
                  <td className="border border-white/30 px-4 py-2 text-center">{client.mobileNumber}</td>
                  <td className="border border-white/30 px-4 py-2 text-center">{client.executiveName}</td>
                  <td className="border border-white/30 px-4 py-2 text-center">
                    {new Date(client.startDate).toLocaleDateString("en-GB")}
                  </td>
                  <td className="border border-white/30 px-4 py-2 text-center">
                    {client.primaryTourName?.label || "-"}
                  </td>
                  <td className="border border-white/30 px-4 py-2 text-center">{client.status}</td>
                  <td className="border border-white/30 px-4 py-2 text-center text-blue-500 hover:underline cursor-pointer">
                    <span
                      title="See More"
                      onClick={() => {
                        if (!["Confirmed", "Booked", "Ongoing", "Completed"].includes(client.status)) {
                          onSeeMore(client._id);
                        }
                      }}
                      className={`${
                        ["Confirmed", "Booked", "Ongoing", "Completed"].includes(client.status)
                          ? "cursor-not-allowed text-gray-400"
                          : ""
                      }`}
                    >
                      ➕
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center p-4 font-extrabold text-red-600">
                  No clients found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex justify-between items-center">
        <button
          disabled={currentPage <= 1}
          onClick={handlePrevPage}
          className="px-4 py-2 bg-gray-400 text-white rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        <div className="px-4 py-2 bg-gray-400 text-white rounded-full">{currentPage}</div>
        <button
          disabled={currentPage >= totalPages}
          onClick={handleNextPage}
          className="px-8 py-2 bg-gray-400 text-white rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ClientSearch;
