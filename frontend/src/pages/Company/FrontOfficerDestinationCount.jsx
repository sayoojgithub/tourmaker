import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";



const FrontOfficerDestinationCount = () => {
  const [allDestinations, setAllDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [stats, setStats] = useState([]);
  console.log(selectedDestination,startDate,endDate)

  const isFormComplete = selectedDestination && startDate && endDate;

  useEffect(() => {
    const fetchAllDestinations = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const response = await fetch(
          `${BASE_URL}/company/getDestinationsName?companyId=${storedUser._id}`
        );
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

   const handleShow = async () => {
    if (!isFormComplete) {
      toast.warn("Please complete all fields.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/company/front-officer-destination-count`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationId: selectedDestination,
          startDate,
          endDate,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch stats");

      const data = await response.json();
       if (data.message === "No clients created") {
      setStats([]); // Clear existing stats
      toast.info("No clients created for the given info.");
      return;
    }
      setStats(data);
      toast.success("Data fetched successfully!");
    } catch (error) {
      console.error(error.message);
      toast.error("Failed to fetch stats");
    }
  };

  return (
    <div className="w-full p-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl mt-3">
      <div className="flex items-center justify-center mb-2">
  <div className="flex items-center gap-1 bg-white/30 px-2 py-2 rounded-lg shadow">
    <h2 className="text-lg font-semibold text-red-600">
      Destination Creation Stats
    </h2>
  </div>
</div>

      {/* Selection Fields */}
      <div className="flex flex-col md:flex-row md:items-center justify-center gap-4 mb-6">
        <select
          value={selectedDestination}
          onChange={(e) => setSelectedDestination(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Select Destination</option>
          {allDestinations.map((dest) => (
            <option key={dest._id} value={dest._id}>
              {dest.label}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full md:w-40 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full md:w-40 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Show Button */}
      <div className="flex justify-center mb-4">
        <button
          onClick={handleShow}
          disabled={!isFormComplete}
          className={`px-4 py-2 w-full md:w-40 text-white rounded-lg shadow-md transition duration-300 ${
            isFormComplete
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Show
        </button>
      </div>

      {/* Result Table */}
      {stats.length > 0 && (
        <div className="bg-white/30 p-4 rounded-lg shadow-md">
          <h3 className="text-md font-semibold text-gray-800 mb-2">Result:</h3>
          <div
            className="max-h-40 overflow-y-auto pr-1"
            style={{
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // IE/Edge
            }}
          >
            <ul
              className="divide-y divide-gray-200"
              style={{ overflow: "hidden" }}
            >
              {stats.map(({ name, count }) => (
                <li
                  key={name}
                  className="py-2 flex justify-between text-gray-700 font-medium"
                >
                  <span>{name}</span>
                  <span>{count} clients</span>
                </li>
              ))}
            </ul>
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrontOfficerDestinationCount;
