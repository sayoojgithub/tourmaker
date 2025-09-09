import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";

const ExecutivesReport = () => {
  const [reportType, setReportType] = useState("executive");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [singleDate, setSingleDate] = useState("");
  const [executives, setExecutives] = useState([]);
  const [frontOfficers, setFrontOfficers] = useState([]);
  const [selectedExecutive, setSelectedExecutive] = useState("");
  const [selectedFrontOfficer, setSelectedFrontOfficer] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [foDropdownOpen, setFODropdownOpen] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState("");
  const [destinationDropdownOpen, setDestinationDropdownOpen] = useState(false);
  const [searchDestination, setSearchDestination] = useState("");
  



  const userId = JSON.parse(localStorage.getItem("user"))?._id;

  useEffect(() => {
    const fetchExecutives = async () => {
      try {
        const res = await fetch(`${BASE_URL}/salesManager/executives/${userId}`);
        const data = await res.json();
        setExecutives(data);
      } catch (error) {
        toast.error("Failed to load executives");
      }
    };

    const fetchFrontOfficers = async () => {
      try {
        const res = await fetch(`${BASE_URL}/salesManager/frontofficers/${userId}`);
        const data = await res.json();
        setFrontOfficers(data);
      } catch (error) {
        toast.error("Failed to load front officers");
      }
    };
    
  const fetchDestinations = async () => {
    try {
      const res = await fetch(`${BASE_URL}/salesManager/destinations/${userId}`);
      const data = await res.json();
      setDestinations(data);
    } catch (error) {
      toast.error("Failed to load destinations");
    }
  };

    if (userId) {
      fetchExecutives();
      fetchFrontOfficers();
      fetchDestinations();
    }
  }, [userId]);

  const handleExecutiveDownload = async () => {
    if (!startDate || !endDate || !selectedExecutive) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/salesManager/downloadClientsDataOfExecutive`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ startDate, endDate, userId, executiveId: selectedExecutive }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "executive_clients.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("Executive report downloaded");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to download");
      }
    } catch (err) {
      toast.error("Error during download");
    }
  };
console.log(selectedFrontOfficer,singleDate)
  const handleFrontOfficerDownload = async () => {
    console.log(selectedFrontOfficer,singleDate)
    if (!selectedFrontOfficer || !singleDate) {
      toast.error("Please select front officer and date");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/salesManager/downloadClientsDataOfFrontOfficer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date: singleDate, frontOfficerId: selectedFrontOfficer }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "frontofficer_clients.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("Front officer report downloaded");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to download");
      }
    } catch (err) {
      toast.error("Error during download");
    }
  };
 const handleExecutiveRemarksDownload = async () => {
    if (!startDate || !endDate || !selectedExecutive) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/salesManager/downloadExecutiveRemarksReport`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ startDate, endDate, executiveId: selectedExecutive }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "executive_remarks_report.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("Executive Remarks report downloaded");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to download");
      }
    } catch (err) {
      toast.error("Error during download");
    }
  };
  const handleDestinationReportDownload = async () => {
  if (!selectedDestination) {
    toast.error("Please select a destination");
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/salesManager/downloadDestinationBasedClientReport`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ destinationId: selectedDestination }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "destination_clients.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Destination-based report downloaded");
    } else {
      const errorData = await response.json();
      toast.error(errorData.message || "Failed to download");
    }
  } catch (err) {
    toast.error("Error during download");
  }
};
const handleFrontOfficerMonthlyDownload = async () => {
  if (!selectedFrontOfficer || !startDate || !endDate) {
    toast.error("Please select front officer and date range");
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/salesManager/downloadFrontOfficerMonthlyReport`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate,
          endDate,
          frontOfficerId: selectedFrontOfficer, // ✅ matches backend
        }),
      }
    );

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const filename = `frontofficer_monthly_report`;

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast.success("Front officer monthly report downloaded");
    } else {
      const errorData = await response.json();
      toast.error(errorData.error || "Failed to download");
    }
  } catch (err) {
    toast.error("Error during download");
  }
};

  return (
    <div className="relative flex min-h-15 flex-col justify-center overflow-hidden bg-white/20 py-10 mt-5 shadow-xl">
      <div className="relative bg-white/20 px-4 pt-9 pb-7 shadow-2xl mx-auto w-full max-w-md rounded-lg md:max-w-lg">
        <div className="mx-auto flex w-full flex-col space-y-3">
          <div className="text-center font-semibold text-2xl md:text-3xl">
            <p>Download Report</p>
          </div>

          {/* Report Type Selector */}
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="executive">Executive Report</option>
            <option value="frontoffice">Front Office Report</option>
            <option value="frontofficeMonthly">Front Office Monthly Report</option>
            <option value="executiveWithRemarks">Executive Report with Client Remarks</option>
            <option value="destination">Destination Based Client Report</option>
          </select>

          {/* Executive Report UI */}
          {reportType === "executive" && (
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <div
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full p-2 border border-gray-300 rounded-md cursor-pointer"
                >
                  {selectedExecutive
                    ? executives.find((exec) => exec._id === selectedExecutive)?.name
                    : "Select Executive"}
                </div>

                {dropdownOpen && (
                  <ul className="absolute w-full mt-1 bg-white border border-gray-300 rounded-md max-h-48 overflow-y-auto z-10">
                    {executives.map((exec) => (
                      <li
                        key={exec._id}
                        className="px-2 py-1 cursor-pointer hover:bg-gray-200"
                        onClick={() => {
                          setSelectedExecutive(exec._id);
                          setDropdownOpen(false);
                        }}
                      >
                        {exec.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

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

              <button
                onClick={handleExecutiveDownload}
                className="w-full py-2 text-white bg-primaryColor rounded-lg font-bold shadow-sm"
              >
                Download Executive Report
              </button>
            </div>
          )}

          {/* Front Officer Report UI */}
          {reportType === "frontoffice" && (
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <div
                  onClick={() => setFODropdownOpen(!foDropdownOpen)}
                  className="w-full p-2 border border-gray-300 rounded-md cursor-pointer"
                >
                  {selectedFrontOfficer
                    ? frontOfficers.find((fo) => fo._id === selectedFrontOfficer)?.name
                    : "Select Front Officer"}
                </div>

                {foDropdownOpen && (
                  <ul className="absolute w-full mt-1 bg-white border border-gray-300 rounded-md max-h-48 overflow-y-auto z-10">
                    {frontOfficers.map((fo) => (
                      <li
                        key={fo._id}
                        className="px-2 py-1 cursor-pointer hover:bg-gray-200"
                        onClick={() => {
                          setSelectedFrontOfficer(fo._id);
                          setFODropdownOpen(false);
                        }}
                      >
                        {fo.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)}
              />

              <button
                onClick={handleFrontOfficerDownload}
                className="w-full py-2 text-white bg-primaryColor rounded-lg font-bold shadow-sm"
              >
                Download Front Officer Report
              </button>
            </div>
          )}
          {/* Front Officer Monthly Report UI */}
          {reportType === "frontofficeMonthly" && (
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <div
                  onClick={() => setFODropdownOpen(!foDropdownOpen)}
                  className="w-full p-2 border border-gray-300 rounded-md cursor-pointer"
                >
                  {selectedFrontOfficer
                    ? frontOfficers.find((fo) => fo._id === selectedFrontOfficer)?.name
                    : "Select Front Officer"}
                </div>

                {foDropdownOpen && (
                  <ul className="absolute w-full mt-1 bg-white border border-gray-300 rounded-md max-h-48 overflow-y-auto z-10">
                    {frontOfficers.map((fo) => (
                      <li
                        key={fo._id}
                        className="px-2 py-1 cursor-pointer hover:bg-gray-200"
                        onClick={() => {
                          setSelectedFrontOfficer(fo._id);
                          setFODropdownOpen(false);
                        }}
                      >
                        {fo.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

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

              <button
                onClick={handleFrontOfficerMonthlyDownload}
                className="w-full py-2 text-white bg-primaryColor rounded-lg font-bold shadow-sm"
              >
                Download Front Officer Monthly Report
              </button>
            </div>
          )}
          {/* Executive Report with Remarks */}
          {reportType === "executiveWithRemarks" && (
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <div
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full p-2 border border-gray-300 rounded-md cursor-pointer"
                >
                  {selectedExecutive
                    ? executives.find((exec) => exec._id === selectedExecutive)?.name
                    : "Select Executive"}
                </div>
                {dropdownOpen && (
                  <ul className="absolute w-full mt-1 bg-white border border-gray-300 rounded-md max-h-48 overflow-y-auto z-10">
                    {executives.map((exec) => (
                      <li
                        key={exec._id}
                        className="px-2 py-1 cursor-pointer hover:bg-gray-200"
                        onClick={() => {
                          setSelectedExecutive(exec._id);
                          setDropdownOpen(false);
                        }}
                      >
                        {exec.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

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

              <button
                onClick={handleExecutiveRemarksDownload}
                className="w-full py-2 text-white bg-primaryColor rounded-lg font-bold shadow-sm"
              >
                Download Executive Report With Remarks
              </button>
            </div>
          )}
 {reportType === "destination" && (
  <div className="flex flex-col space-y-4">
    {/* Searchable Destination Selector */}
    <div className="relative">
      <input
        type="text"
        placeholder="Search destination..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
        value={
          destinationDropdownOpen
            ? searchDestination
            : selectedDestination
            ? destinations.find((d) => d._id === selectedDestination)?.name || ""
            : ""
        }
        onChange={(e) => {
          setSearchDestination(e.target.value);
          setDestinationDropdownOpen(true);
        }}
        onFocus={() => setDestinationDropdownOpen(true)}
      />

      {/* Clear Button */}
      {selectedDestination && !destinationDropdownOpen && (
        <button
          type="button"
          className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 hover:text-black"
          onClick={() => {
            setSelectedDestination("");
            setSearchDestination("");
          }}
        >
          ✕
        </button>
      )}

      {/* Dropdown List */}
      {destinationDropdownOpen && (
        <ul className="absolute w-full mt-1 bg-white border border-gray-300 rounded-md max-h-[9.5rem] overflow-y-auto z-10">
          {destinations
            .filter((d) =>
              d.name.toLowerCase().includes(searchDestination.toLowerCase())
            )
            .map((d) => (
              <li
                key={d._id}
                className="px-2 py-1 cursor-pointer hover:bg-gray-200"
                onClick={() => {
                  setSelectedDestination(d._id);
                  setSearchDestination("");
                  setDestinationDropdownOpen(false);
                }}
              >
                {d.name}
              </li>
            ))}
        </ul>
      )}
    </div>

    {/* Download Button */}
    <button
      onClick={handleDestinationReportDownload}
      className="w-full py-2 text-white bg-primaryColor rounded-lg font-bold shadow-sm"
    >
      Download Destination Based Client Report
    </button>
  </div>
)}





        </div>
      </div>
    </div>
  );
};

export default ExecutivesReport;
