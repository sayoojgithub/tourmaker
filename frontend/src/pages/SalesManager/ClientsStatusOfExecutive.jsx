import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { BASE_URL } from "../../config";

// Import Chart.js components
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const ClientsStatusOfExecutive = ({ executiveId }) => {
  const [statusCounts, setStatusCounts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchClientStatusCounts = async () => {
    setLoading(true);
    try {
      if (!executiveId) {
        throw new Error("Executive ID not found.");
      }

      const response = await fetch(
        `${BASE_URL}/salesManager/client-status-counts-of-executive?executiveId=${executiveId}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch status counts");
      }
      const data = await response.json();
      setStatusCounts(data.statusCounts);
    } catch (error) {
      console.error("Error fetching client status counts:", error);
      alert("Failed to fetch status counts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientStatusCounts();
  }, [executiveId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (statusCounts.length === 0) {
    return <div>No data available to display</div>;
  }

  const chartData = {
    labels: statusCounts.map((status) => status._id),
    datasets: [
      {
        label: "Number of Clients",
        data: statusCounts.map((status) => status.count),
        backgroundColor: [
          "#4CAF50", 
          "#FFA500", 
          "#2196F3", 
          "#9C27B0", 
          "#FFEB3B", 
          "#00BCD4",
          "#FF5722",
        ],
        borderColor: "#FFFFFF",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "18px",
        height: "auto",
      }}
      className="bg-white/20 shadow-2xl"
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1000px",
          padding: "18px",
          backgroundColor: "#ffffff33",
          borderRadius: "10px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          // height: "500px", // Updated to increase the height
        }}
      >
        <h2
          style={{
            fontWeight: "900",
            color: "black",
            marginBottom: "20px",
          }}
        >
          Client Status Chart
        </h2>
        <div
          style={{
            height: "300px",
            maxWidth: "100%",
          }}
        >
          <Pie
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "top",
                  align: "center",
                  labels: {
                    boxWidth: 12,
                    padding: 10,
                    font: {
                      weight: "bold",
                      size: 14,
                    },
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ClientsStatusOfExecutive;
