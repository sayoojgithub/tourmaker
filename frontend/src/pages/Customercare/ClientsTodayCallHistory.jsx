import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB");
};

const ClientsTodayCallHistory = ({ onSeeMore }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // 'all' | 'called-once' | 'not-called'

  const fetchClients = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const companyId = user?.companyId;
      const customerCareId = user?._id;
      const status = "Day Ago,End Day,Ongoing,Start Day,Scheduled";

      const queryParams = new URLSearchParams({
        companyId,
        customerCareId,
        status,
      });

      const response = await fetch(
        `${BASE_URL}/customercare/todo-clients-with-feedback?${queryParams}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch clients");
      }

      const data = await response.json();
      setClients(data.clients);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      toast.error(error.message || "An error occurred while fetching clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);
  const handleDownloadReport = async () => {
    try {
      const response = await fetch(`${BASE_URL}/customercare/download-client-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clients: clients }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to download report");
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "clients_report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error(error.message || "Error downloading report");
    }
  };
console.log(clients)
  // Apply filter to clients
  const filteredClients = clients.filter((client) => {
    if (filter === "called-once") return client.feedbacks?.length === 1;
    if (filter === "not-called") return !client.feedbacks || client.feedbacks.length === 0;
    return true; // 'all'
  });

  return (
    <div className="w-full p-6 bg-white/20 rounded-lg shadow-md border">
      {/* Filter Dropdown */}
      <div className="mb-4 flex justify-end">
        <select
          className="border border-gray-300 rounded px-3 py-1 text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="called-once">Called Only Once</option>
          <option value="not-called">Not Called Yet</option>
        </select>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Loading clients...</p>
      ) : (
        <div
          className="overflow-y-auto space-y-4"
          style={{ maxHeight: "340px", scrollbarWidth: "none" }}
        >
          {filteredClients.map((client, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl p-4 bg-gray-100 shadow-md"
            >
              <div className="flex flex-wrap justify-between text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                  <button
                    onClick={() => onSeeMore(client._id,client.tourStatus)}
                    className="w-4 h-4 bg-blue-600 rounded-full hover:bg-blue-800 transition"
                    title="See more"
                  ></button>
                  ID: {client.clientId}
                </span>
                <span>Name: {client.name}</span>
                <span>Status: {client.tourStatus}</span>
                <span>Start: {formatDate(client.finalizedTourDateAt)}</span>
                <span>End: {formatDate(client.finalizedTourEndDateAt)}</span>
              </div>

              <div
  className="overflow-x-auto"
  style={{
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  }}
>
  <div
    className="flex gap-3 min-w-max"
    style={{
      overflowX: 'scroll',
      WebkitOverflowScrolling: 'touch',
    }}
  >
    {client.feedbacks?.map((fb) => (
      <div
        key={fb._id}
        className="flex items-center gap-2 bg-blue-100 px-3 py-2 rounded-md shadow-sm whitespace-nowrap"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <span className="text-blue-800 font-medium">{fb.status}</span>
        <span className="text-gray-600 text-xs">({fb.submittedTime})</span>
      </div>
    ))}
  </div>
</div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 flex justify-center">
  <button
    onClick={handleDownloadReport}
    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow"
  >
    Download Report
  </button>
</div>
    </div>
  );
};

export default ClientsTodayCallHistory;
