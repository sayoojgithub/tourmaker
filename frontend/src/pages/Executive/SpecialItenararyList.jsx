import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "rgba(255, 255, 255, 0.2)", // Equivalent to bg-white/20
    border: "1px solid black", // Black border
    //boxShadow: state.isFocused ? "0 0 0 2px rgba(0, 0, 0, 0.5)" : "none", // Optional focus effect
    "&:hover": {
      border: "1px solid black", // Ensures black border on hover
    },
  }),
  menuList: (provided) => ({
    ...provided,
    maxHeight: 120,
    overflowY: "auto",
  }),
};

const SpecialItenararyList = ({
  selectedClientId,
  selectedPrimaryTourName,
  handleSeeMoreOfSpecialTrip,
}) => {
  const [tours, setTours] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch available destinations
  const fetchDestinations = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const companyId = storedUser?.companyId;
      const response = await fetch(`${BASE_URL}/executive/getDestinationsName?companyId=${companyId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch destinations");
      }
      const data = await response.json();
      const options = data.map((destination) => ({
        value: destination.value,
        label: destination.label,
      }));
      setDestinations(options);
    } catch (error) {
      console.error("Failed to fetch destinations:", error);
      toast.error("failed to fetch destinations");
    }
  };

  // Fetch fixed tours
  const fetchSpecialTours = async () => {
    const id = selectedDestination
      ? selectedDestination.value
      : selectedPrimaryTourName?._id;

    if (!id) {
      toast.error("Tour ID is required.");
      return;
    }

    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        primaryTourNameId: id,
        clientId: selectedClientId,
        page: currentPage,
      });

      const response = await fetch(
        `${BASE_URL}/executive/special-itineraries?${queryParams}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch tours");
      }

      const data = await response.json();
      setTours(data.tours);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch fixed tours:", error);
      toast.error(error.message || "An error occurred while fetching tours");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  useEffect(() => {
    fetchSpecialTours();
  }, [selectedPrimaryTourName, selectedDestination, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="p-6 bg-white/20 shadow-md rounded-lg mt-2 w-full max-w-[90vw] mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-center">FIXED TOURS</h2>

      {/* Destination Selector */}
      <div className="mb-4">
        <Select
          options={destinations}
          value={selectedDestination}
          onChange={(option) => {
            setSelectedDestination(option);
            setCurrentPage(1); // Reset to the first page on selection change
          }}
          placeholder="Select Destination"
          isClearable
          styles={customStyles}
        />
      </div>

      {/* Table Section */}
      {/* Table Section */}
<div className="overflow-x-auto">
  <table className="w-full border border-gray-200 text-left rounded-lg">
    <thead className="bg-gray-400">
      <tr>
        <th className="px-4 py-2 border-b font-extrabold">Tour Name</th>
        <th className="px-4 py-2 border-b font-extrabold">Article Number</th>
        <th className="px-4 py-2 border-b font-extrabold">Category</th>
        <th className="px-4 py-2 border-b font-extrabold">Validity Start</th>
        <th className="px-4 py-2 border-b font-extrabold">Validity End</th>
        <th className="px-4 py-2 border-b font-extrabold">Details</th>
      </tr>
    </thead>
    <tbody>
      {loading ? (
        <tr>
          <td colSpan="7" className="text-center p-4">
            Loading...
          </td>
        </tr>
      ) : tours.length > 0 ? (
        tours.map((tour) => {
          const formatDate = (date) => date ? new Date(date).toLocaleDateString("en-GB") : "-";

          return (
            <tr key={tour._id} className="hover:bg-white/20">
              <td className="px-4 py-2 border-b font-bold">{tour.tourName || "-"}</td>
              <td className="px-4 py-2 border-b font-bold">{tour.articleNumber || "-"}</td>
              <td className="px-4 py-2 border-b font-bold">{tour.category?.label || "-"}</td>
              <td className="px-4 py-2 border-b font-bold">{formatDate(tour.validStartDate)}</td>
              <td className="px-4 py-2 border-b font-bold">{formatDate(tour.validEndDate)}</td>
              <td className="px-4 py-2 border-b text-blue-500 hover:underline cursor-pointer">
                <span title="See More" onClick={() => handleSeeMoreOfSpecialTrip(tour._id)}>➕</span>
              </td>
            </tr>
          );
        })
      ) : (
        <tr>
          <td colSpan="7" className="text-center p-4 font-extrabold text-red-600">
            No tours found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>


      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-full text-white ${
            currentPage === 1 ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          &#8592;
        </button>
        <span className="mx-4 w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white font-semibold">
          {currentPage}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-full text-white ${
            currentPage === totalPages
              ? "bg-gray-300"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          &#8594;
        </button>
      </div>
    </div>
  );
};

export default SpecialItenararyList;
