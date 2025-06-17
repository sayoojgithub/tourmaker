import { useEffect, useState } from "react";
import { BASE_URL } from "../../config";

const History = ({ clientId, handleBackFromHistory }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/customercare/client-history/${clientId}`,
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch client history");

        const data = await response.json();
        setFeedbacks(data.feedbacks || []);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [clientId]);

  return (
    <div className="w-full flex justify-center px-2">
<div className="w-full p-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl mt-4">        <h2 className="text-2xl font-bold text-center text-black drop-shadow mb-1">
          ✨ Client Feedback History ✨
        </h2>

        <div
            className="overflow-y-auto space-y-4"
            style={{ maxHeight: "310px", scrollbarWidth: "none" }}
        >
          {loading ? (
            <p className="text-center text-gray-100 animate-pulse">
              Fetching history...
            </p>
          ) : feedbacks.length === 0 ? (
            <p className="text-center text-white/70">
              No feedback history available.
            </p>
          ) : (
            feedbacks.map((item, index) => (
              <div
                key={index}
                className="bg-white/30 rounded-xl p-5 shadow-md border border-white/20 transition-all duration-300 hover:scale-[1.01] hover:bg-white/40"
              >
                <p className="text-blue-900 font-semibold mb-2 text-lg">
                  📌 Status: {item.status}
                </p>
                <ul className="space-y-1 text-sm text-gray-800">
                  <li>
                    <strong>Conditions:</strong>{" "}
                    {item.conditions.length ? item.conditions.join(", ") : "None"}
                  </li>
                  <li>
                    <strong>Schedule Date:</strong>{" "}
                    {new Date(item.scheduleDate).toLocaleDateString("en-GB")}
                  </li>
                  <li>
                    <strong>Schedule Time:</strong> {item.scheduleTime}
                  </li>
                  <li>
                    <strong>Comment:</strong> {item.comment}
                  </li>
                  <li>
                    <strong>Submitted Date:</strong> {item.submittedDate}
                  </li>
                  <li>
                    <strong>Submitted Time:</strong> {item.submittedTime}
                  </li>
                </ul>

                {item.submittedBy && (
                  <div className="mt-3 p-3 bg-white/50 rounded-lg shadow-inner text-sm">
                    <p className="text-gray-900 font-medium mb-1">
                      🧑 Submitted By
                    </p>
                    <p>
                      <strong>Name:</strong> {item.submittedBy.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {item.submittedBy.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {item.submittedBy.mobileNumber}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={handleBackFromHistory}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 via-blue-500 to-blue-500 text-white font-medium  shadow-lg hover:from-blue-500 hover:to-blue-500 transition-all duration-300"
          >
            ⬅️ Back
          </button>
        </div>
      </div>

      {/* Custom Scrollbar Styling */}
      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 8px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default History;
