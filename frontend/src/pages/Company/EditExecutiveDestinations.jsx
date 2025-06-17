import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";

const EditExecutiveDestinations = ({ executive, onBack }) => {
  const [allDestinations, setAllDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshFlag, setRefreshFlag] = useState(false);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/company/executiveDestinations/${executive._id}?page=${page}&search=${searchQuery}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch destinations");
        }

        const result = await response.json();
        setDestinations(result.data);
        setTotalPages(result.totalPages);
        setPage(result.currentPage);
      } catch (error) {
        console.error("Error fetching destinations:", error.message);
      }
    };

    fetchDestinations();
  }, [executive._id, page, searchQuery, refreshFlag]); // Fetch when page or search changes
  useEffect(() => {
    const fetchAllDestinations = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(`${BASE_URL}/company/getDestinationsName?companyId=${storedUser._id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch all destinations");
        }
        const data = await response.json();
        const options = data.map((destination) => ({
          _id: destination._id,
          value: destination.value,
          label: destination.label,
        }));
        setAllDestinations(options);
      } catch (error) {
        console.error("Error fetching all destinations:", error.message);
        toast.error("Error fetching destinations");
      }
    };

    fetchAllDestinations();
  }, []);

  const handleAddDestination = async () => {
    if (!selectedDestination) {
      toast.error("Please select a destination");
      return;
    }
    // Check if the destination already exists in the destinations array
  const isAlreadyAdded = destinations.some(
    (destination) => destination._id === selectedDestination._id
  );

  if (isAlreadyAdded) {
    toast.warning("This destination is already added");
    return;
  }
    console.log(selectedDestination);

    try {
      const response = await fetch(
        `${BASE_URL}/company/addExecutiveDestination/${executive._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ destination: selectedDestination }),
        }
      );

      if (!response.ok) {
       const errorData = await response.json();
       
       // Show warning if it's a duplicate destination
       if (response.status === 409) {
         toast.warning(errorData.message);
       } else {
         toast.error(errorData.message || "Failed to add destination");
       }
       return;
     }

      setRefreshFlag((prev) => !prev);
      toast.success("Destination added successfully");
      setSelectedDestination(null);
    } catch (error) {
      console.error("Error adding destination:", error.message);
      toast.error("Failed to add destination");
    }
  };

  const handleDelete = async (destinationId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/company/deleteExecutiveDestinations/${executive._id}/${destinationId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete destination");
      }

      setRefreshFlag((prev) => !prev);
    } catch (error) {
      console.error("Error deleting destination:", error.message);
    }
  };
  const handleSearch = () => {
    setPage(1);
  };

  return (
    <div className="p-4 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg w-full mx-auto mt-1">
      <div className="flex items-center justify-start mb-2">
  <div className="flex items-center gap-1 bg-white/30 px-2 py-2 rounded-lg shadow">
    <h2 className="text-xl font-semibold text-red-600">
      {executive.name}'s Assigned Destinations
    </h2>
  </div>
</div>
      <div className="flex mb-1">
        <select
          value={selectedDestination?._id || ""}
          onChange={(e) => {
            const selectedDest = allDestinations.find(
              (dest) => dest._id === e.target.value
            );
            setSelectedDestination(selectedDest || null); // Store the full object
          }}
          className="p-1 border border-gray-300 rounded-lg flex-grow mr-2 bg-white/50 placeholder-gray-600"
        >
          <option value="" disabled>
            Select and Add destination here
          </option>
          {allDestinations.map((destination) => (
            <option key={destination._id} value={destination._id}>
              {destination.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleAddDestination}
          className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-full shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
        >
          ➕
        </button>
      </div>

      <div className="flex mb-1">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by destination name"
          className="p-1 border border-gray-300 rounded-lg flex-grow mr-2 bg-white/50 placeholder-gray-600"
        />
        <button
          onClick={handleSearch}
          className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-full shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
        >
          🔍
        </button>
      </div>

      {/* Destinations Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse border border-white/30 rounded-lg overflow-hidden">
          <thead className="bg-white/30 text-gray-900">
            <tr>
              <th className="border border-white/30 px-3 py-1 font-bold">
                Number
              </th>
              <th className="border border-white/30 px-3 py-1 font-bold">
                Assigned Destinations
              </th>
              <th className="border border-white/30 px-3 py-1 font-bold">
                Delete
              </th>
            </tr>
          </thead>
          <tbody>
            {destinations.length > 0 ? (
              destinations.map((destination, index) => (
                <tr key={destination._id} className="text-gray-800">
                  <td className="border border-white/30 px-3 py-1 text-center">
                    {(page - 1) * 3 + index + 1}
                  </td>
                  <td className="border border-white/30 px-3 py-1 text-center">
                    {destination.label}
                  </td>
                  <td className="border border-white/30 px-3 py-1 text-center">
                    <button
                      onClick={() => handleDelete(destination._id)}
                      className="px-4 py-1 bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold rounded-lg shadow-md hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-9 justify-center">
                  No destinations found for the executive 
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className={`px-2 py-2 ${
            page === 1 ? "bg-gray-300" : "bg-gray-500 hover:bg-gray-700"
          } text-white rounded-md shadow-md`}
        >
          ⬅ Prev
        </button>

        <span className="bg-gray-500 text-white w-8 h-8 flex items-center justify-center  rounded-full">
          {page}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className={`px-2 py-1 ${
            page === totalPages
              ? "bg-gray-300"
              : "bg-gray-500 hover:bg-gray-700"
          } text-white rounded-md shadow-md`}
        >
          Next ➡
        </button>
      </div>

      {/* Back Button */}
      <div className="flex justify-center mt-4">
        <button
          onClick={onBack}
          className="px-2 py-1 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-700 "
        >
          ⬅ Back
        </button>
      </div>
    </div>
  );
};

export default EditExecutiveDestinations;
