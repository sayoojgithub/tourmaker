import React, { useState, useEffect } from "react";
import { BASE_URL } from "../../config";
import { toast } from 'react-toastify';

const ActivityList = ({ onEdit }) => {
  const [activities, setActivities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);

  useEffect(() => {
    fetchActivities();
  }, [currentPage, searchQuery]);
  
  // Define the fetchActivities function outside of useEffect
  const fetchActivities = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user._id) {
        const purchaserId = user._id;
  
        const response = await fetch(
          `${BASE_URL}/purchaser/activities?purchaserId=${purchaserId}&page=${currentPage}&limit=4&search=${searchQuery}`
        );
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch activities");
        }
  
        const result = await response.json();
        setActivities(result.data);
        setTotalPages(result.totalPages);
      } else {
        console.error("User ID not found in localStorage");
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error.message);
    }
  };
  
  const handleEdit = (id) => {
    onEdit(id); // Trigger edit callback with the selected activity id
  };
  
  const handleDelete = async () => {
    try {
      const response = await fetch(`${BASE_URL}/purchaser/deleteActivity/${activityToDelete}`, {
        method: "DELETE",
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete activity");
      }
  
      toast.success("Activity deleted successfully!");
      
      // Call fetchActivities to refresh the activities list
      fetchActivities();
  
     
  
      // Close modal after deletion
      setShowModal(false);
     
    } catch (error) {
      console.error("Failed to delete activity:", error.message);
      toast.error(error.message || "Failed to delete activity");
    }
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset to the first page on new search
  };
  const openModal = (activityId) => {
    setActivityToDelete(activityId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="p-4 bg-white/20 shadow-2xl rounded-lg">
  <div className="flex justify-center mb-4">
  <div className="inline-block bg-white px-3 py-1 rounded-md shadow">
    <h2 className="text-xl font-bold text-red-600 text-center">
      Activity List
    </h2>
  </div>
</div>

  {/* Search Input and Button */}
  <div className="flex mb-4">
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search by TripName or Destination..."
      className="p-2 border rounded-lg flex-grow mr-2"
    />
    <button
          onClick={handleSearch}
          className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-full shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
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

  {/* Table Wrapper to ensure responsiveness */}
  <div className="overflow-x-auto">
    <table className="min-w-full w-full border-collapse">
      <thead>
        <tr>
          <th className="border px-4 py-1 font-extrabold">Destination</th>
          <th className="border px-4 py-1 font-extrabold">TripName</th>
          <th className="border px-4 py-1 font-extrabold">Activity</th>
          <th className="border px-4 py-1 font-extrabold">Price</th>
          <th className="border px-4 py-1 font-extrabold">Edit</th>
          <th className="border px-4 py-1 font-extrabold">Delete</th>
        </tr>
      </thead>
      <tbody>
        {activities.map((activity) => (
          <tr key={activity._id}>
            <td className="border px-4 py-1 font-bold text-center">
              {activity.destinationName}
            </td>
            <td className="border px-4 py-1 font-bold text-center">
              {/* Scrollable Trip Name */}
              <div className="max-w-[150px] overflow-x-auto">
                {activity.tripName}
              </div>
            </td>
            <td className="border px-4 py-1 font-bold text-center">
              {/* Scrollable Activity Name */}
              <div className="max-w-[150px] overflow-x-auto">
                {activity.activityName}
              </div>
            </td>
            <td className="border px-4 py-1 font-bold text-center">
              {activity.pricePerHead}
            </td>
            <td className="border px-4 py-1 text-center">
              <button
                onClick={() => handleEdit(activity._id)}
                className="px-3 py-1 bg-blue-500 text-white rounded-2xl"
              >
                Edit
              </button>
            </td>
            <td className="border px-4 py-1 text-center">
              <button
                onClick={() => openModal(activity._id)}
                className="px-3 py-1 bg-red-500 text-white rounded-2xl"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Pagination */}
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
  {/* Modal Popup */}
  {showModal && (
  <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
    <div className="bg-gray-600 p-6 rounded-lg shadow-lg w-62 h-62 flex flex-col justify-between">
      
      <p className="text-center text-white font-extrabold">Are you sure you want to delete this Activity?</p>
      <div className="mt-4 flex justify-around">
        <button
          onClick={closeModal}
          className="px-4 py-2 bg-gray-300 text-black rounded-md"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-500 text-white rounded-md"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}


</div>

  );
};

export default ActivityList;
