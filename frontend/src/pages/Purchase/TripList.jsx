import React, { useState, useEffect } from "react";
import { BASE_URL } from "../../config";

const TripList = ({ onEdit }) => {
  const [trips, setTrips] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user && user._id) {
          const purchaserId = user._id;

          // Modify the API call to include the search query
          const response = await fetch(
            `${BASE_URL}/purchaser/trips?purchaserId=${purchaserId}&page=${currentPage}&limit=4&search=${searchQuery}`
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch trips");
          }

          const result = await response.json();
          setTrips(result.data);
          setTotalPages(result.totalPages);
        } else {
          console.error("User ID not found in localStorage");
        }
      } catch (error) {
        console.error("Failed to fetch trips:", error.message);
      }
    };

    fetchTrips();
  }, [currentPage, searchQuery]);

  const handleEdit = (id) => {
    onEdit(id);
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset to the first page on new search
  };

  return (
    <div className="p-4 bg-white/20 shadow-2xl rounded-lg">
      <div className="flex justify-center mb-4">
  <div className="inline-block bg-white px-3 py-1 rounded-md shadow">
    <h2 className="text-xl font-bold text-red-600 text-center">
      Trip List
    </h2>
  </div>
</div>

      {/* Search Input and Button */}
      <div className="flex mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by trip name or destination name..."
          className="p-2 border rounded-lg flex-grow mr-2"
        />
        <button
          onClick={handleSearch}
          className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-full shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 16l-6-6m6 6l6-6M9 9a4 4 0 11-4 4 4 4 0 014-4m0-2a6 6 0 100 12 6 6 0 000-12z"
            />
          </svg>
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
           
            <th className="border px-8 py-1 font-extrabold">Trip Name</th>
            <th className="border px-4 py-1 font-extrabold">Destination</th>
            <th className="border px-4 py-1 font-extrabold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {trips.map((trip) => (
            <tr key={trip._id}>
              
              <td className="border px-8 py-1 font-bold text-center">{trip.tripName}</td>
              <td className="border px-4 py-1 font-bold text-center">
                {trip.destinationName}
              </td>
              <td className="border px-4 py-1 flex justify-center items-center">
                <button
                  onClick={() => handleEdit(trip._id)}
                  className="px-3 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 inline-block mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 17l-4-4m0 0l4-4m-4 4h12m-6-4v8"
                    />
                  </svg>
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-between">
        <button
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="px-4 py-2 bg-gray-400 text-white rounded-md"
        >
          Previous
        </button>
        <div className="px-4 py-2 bg-gray-400 text-white rounded-full">
          {currentPage}
        </div>
        <button
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="px-8 py-2 bg-gray-400 text-white rounded-md"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TripList;
