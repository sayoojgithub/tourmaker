import React, { useState } from "react";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";

const ClientRegistrationReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const userId = JSON.parse(localStorage.getItem("user"))?._id;

  const handleDownload = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/salesManager/downloadClientsData`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ startDate, endDate, userId }),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "clients.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("PDF downloaded successfully");
      } else {
        const errorData = await response.json(); 
        const errorMessage = errorData.message || "Failed to download PDF"; 
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("An error occurred while downloading the PDF");
    }
  };

  return (
    <div className="relative flex min-h-15 flex-col justify-center overflow-hidden bg-white/20 py-12 mt-14 shadow-xl">
      <div className="relative bg-white/20 px-4 pt-9 pb-7 shadow-2xl mx-auto w-full max-w-md rounded-lg md:max-w-lg">
        <div className="mx-auto flex w-full flex-col space-y-8">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="font-semibold text-2xl md:text-3xl">
              <p>Download Data</p>
            </div>
          </div>

          <div>
            <div className="flex flex-col space-y-4 md:space-y-8">
              <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                <input
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <span className="md:mx-2">to</span>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
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

export default ClientRegistrationReport;
