// import React, { useState } from "react";
// import { toast } from "react-toastify";
// import { BASE_URL } from "../../config";

// const MyClientDetails = () => {
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [taken, setTaken] = useState(""); // New state
//   const userId = JSON.parse(localStorage.getItem("user"))?._id;
//     // Get today's date
//     const today = new Date().toISOString().split("T")[0]; // Format to YYYY-MM-DD

//   const handleDownload = async () => {
//     if (!startDate || !endDate) {
//       toast.error("Please select both start and end dates");
//       return;
//     }
//     if (!taken || isNaN(taken) || Number(taken) <= 0 ||  !Number.isInteger(Number(taken))) {
//       toast.error("Please enter a valid positive whole number for 'Taken'");
//       return;
//     }

//     try {
//       const response = await fetch(
//         `${BASE_URL}/frontoffice/downloadClientsData`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ startDate, endDate, userId,taken: Number(taken) }),
//         }
//       );

//       if (response.ok) {
//         const blob = await response.blob();
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         a.href = url;
//         a.download = "clients.pdf";
//         document.body.appendChild(a);
//         a.click();
//         document.body.removeChild(a);
//         toast.success("PDF downloaded successfully");
//       } else {
//         const errorData = await response.json(); 
//         const errorMessage = errorData.message || "Failed to download PDF"; 
//         toast.error(errorMessage);
//       }
//     } catch (error) {
//       console.error("Download error:", error);
//       toast.error("An error occurred while downloading the PDF");
//     }
//   };

//   return (
//     <div className="relative flex min-h-15 flex-col justify-center overflow-hidden bg-white/20 py-12 mt-3 shadow-xl">
//       <div className="relative bg-white/20 px-4 pt-9 pb-7 shadow-2xl mx-auto w-full max-w-md rounded-lg md:max-w-lg mt-1">
//         <div className="mx-auto flex w-full flex-col space-y-8">
//           <div className="flex flex-col items-center justify-center text-center space-y-2">
//             <div className="font-semibold text-2xl md:text-3xl">
//               <p>Download Data</p>
//             </div>
//           </div>

//           <div>
//             <div className="flex flex-col space-y-2 md:space-y-4">
//               <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
//                 <input
//                   type="date"
//                   className="w-full p-2 border border-gray-300 rounded-md"
//                   value={startDate}
//                   onChange={(e) => setStartDate(e.target.value)}
//                   min={today} // Disable past dates
//                   max={today} // Disable future dates
//                 />
//                 <span className="md:mx-2">to</span>
//                 <input
//                   type="date"
//                   className="w-full p-2 border border-gray-300 rounded-md"
//                   value={endDate}
//                   onChange={(e) => setEndDate(e.target.value)}
//                   min={today} // Disable past dates
//                   max={today} // Disable future dates
//                 />
//               </div>
//                  {/* New Taken Field */}
//                  <input
//                 type="number"
//                 min="1"
//                 className="w-full p-2 border border-gray-300 rounded-md"
//                 placeholder="Enter number of taken clients"
//                 value={taken}
//                 onChange={(e) => setTaken(e.target.value)}
//               />

//               <div className="flex flex-col space-y-5">
//                 <button
//                   onClick={handleDownload}
//                   className="flex items-center justify-center w-full py-4 text-white bg-primaryColor rounded-lg font-bold shadow-sm"
//                 >
//                   Download
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MyClientDetails;
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";

const MyClientDetails = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [taken, setTaken] = useState(0);

  const user = useMemo(() => JSON.parse(localStorage.getItem("user")) || {}, []);
  const userId = user?._id;          // still needed for the download endpoint
  const companyId = user?.companyId; // ← use this for taken

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    setStartDate(today);
    setEndDate(today);
  }, [today]);

  // Fetch taken using companyId
  useEffect(() => {
    const fetchTaken = async () => {
      if (!companyId) {
        toast.error("Company not found in local storage.");
        return;
      }
      if (!startDate || !endDate) return;

      try {
        const qs = new URLSearchParams({
          companyId,
          startDate,
          endDate,
        });
        const resp = await fetch(`${BASE_URL}/frontoffice/taken-today?${qs.toString()}`);
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.message || "Failed to fetch taken count");
        }
        const data = await resp.json();
        setTaken(Number(data.taken || 0));
      } catch (e) {
        console.error("Taken fetch error:", e);
        toast.error(e.message || "Unable to fetch taken count");
        setTaken(0);
      }
    };

    fetchTaken();
  }, [companyId, startDate, endDate]);

  const handleDownload = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }
    if (!userId) {
      toast.error("User not found in local storage.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/frontoffice/downloadClientsData`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate,
          endDate,
          userId,            // your PDF generator still needs userId
          taken: Number(taken), // auto-filled value
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to download PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "clients.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error(error.message || "An error occurred while downloading the PDF");
    }
  };

  return (
    <div className="relative flex min-h-15 flex-col justify-center overflow-hidden bg-white/20 py-12 mt-3 shadow-xl">
      <div className="relative bg-white/20 px-4 pt-9 pb-7 shadow-2xl mx-auto w-full max-w-md rounded-lg md:max-w-lg mt-1">
        <div className="mx-auto flex w-full flex-col space-y-8">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="font-semibold text-2xl md:text-3xl">
              <p>Download Data</p>
            </div>
          </div>

          <div>
            <div className="flex flex-col space-y-2 md:space-y-4">
              <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                <input
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  // remove min/max if you want a custom range
                  min={today}
                  max={today}
                />
                <span className="md:mx-2">to</span>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={today}
                   max={today}
                />
              </div>

              {/* Taken (auto, read-only) */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-800"
                  value={taken}
                  readOnly
                  disabled
                />
                <span className="text-sm font-medium text-gray-700">(auto)</span>
              </div>

              <div className="flex flex-col space-y-5">
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center w-full py-4 text-white bg-primaryColor rounded-lg font-bold shadow-sm"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyClientDetails;