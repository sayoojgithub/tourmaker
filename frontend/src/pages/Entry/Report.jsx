import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";

const Report = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const userId = useMemo(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    return u?._id;
  }, []);

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const handleDownload = async () => {
    if (!userId) {
      toast.error("User not found in local storage.");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Start date cannot be after end date");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/entry/download-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate, userId }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to generate PDF");
      }

      // download PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clients_${startDate}_${endDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully");
    } catch (e) {
      console.error("Download error:", e);
      toast.error(e.message || "An error occurred while downloading the PDF");
    }
  };

  return (
    <div className="relative flex min-h-15 flex-col justify-center overflow-hidden bg-white/20 py-12 mt-20 shadow-xl">
      <div className="relative bg-white/20 px-4 pt-9 pb-7 shadow-2xl mx-auto w-full max-w-md rounded-lg md:max-w-lg mt-1">
        <div className="mx-auto flex w-full flex-col space-y-8">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="font-semibold text-2xl md:text-3xl">
              <p>Download Report</p>
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
                  max={today} // don't allow future
                />
                <span className="md:mx-2">to</span>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  max={today} // don't allow future
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

export default Report;
