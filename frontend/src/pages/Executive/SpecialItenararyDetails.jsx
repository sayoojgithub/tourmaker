import React, { useState, useEffect } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";

const SpecialItenararyDetails = ({
  selectedClientId,
  selectedSpecialTripId,
  gotoConfirmed,
}) => {
  const [formData, setFormData] = useState({
    destination: "",
    tourName: "",
    articleNumber: "",
    day: "",
    night: "",
    category: null,
    validStartDate: "",
    validEndDate: "",
    tourStartFrom: "",
    inclusion: "",
    exclusion: "",
    inclusionsList: [],
    exclusionsList: [],
    itineraryText: "",
    1: "",
    2: "",
    3: "",
    4: "",
    5: "",
    6: "",
    7: "",
    8: "",
    9: "",
    10: "",
    11: "",
    12: "",
    13: "",
    14: "",
    15: "",
    16: "",
  });
  const [tourDate, setTourDate] = useState("");
  console.log(tourDate);

  console.log(formData);

  useEffect(() => {
    if (selectedSpecialTripId) {
      const fetchSpecialTour = async () => {
        try {
          const response = await fetch(
            `${BASE_URL}/executive/specialTour/${selectedSpecialTripId}`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch special tour details");
          }

          const data = await response.json();
          console.log(data);

          // Map fetched data to formData explicitly
          setFormData({
            destination: data.destination || "",
            tourName: data.tourName || "",
            articleNumber: data.articleNumber || "",
            day: data.day || "",
            night: data.night || "",
            category: data.category || null,
            validStartDate: data.validStartDate || "",
            validEndDate: data.validEndDate || "",
            tourStartFrom: data.tourStartFrom || "",
            inclusionsList: data.inclusionsList || [],
            exclusionsList: data.exclusionsList || [],
            itineraryText: data.itineraryText || "",
            1: data[1] || "",
            2: data[2] || "",
            3: data[3] || "",
            4: data[4] || "",
            5: data[5] || "",
            6: data[6] || "",
            7: data[7] || "",
            8: data[8] || "",
            9: data[9] || "",
            10: data[10] || "",
            11: data[11] || "",
            12: data[12] || "",
            13: data[13] || "",
            14: data[14] || "",
            15: data[15] || "",
            16: data[16] || "",
          });
        } catch (error) {
          console.error("Failed to fetch special tour details:", error);
          toast.error("Failed to fetch special tour details");
        }
      };

      fetchSpecialTour();
    } else {
      // Reset formData to default values when no specialTourId is provided
      setFormData({
        destination: "",
        tourName: "",
        articleNumber: "",
        day: "",
        night: "",
        category: null,
        validStartDate: "",
        validEndDate: "",
        tourStartFrom: "",
        inclusion: "",
        exclusion: "",
        inclusionsList: [],
        exclusionsList: [],
        itineraryText: "",
        1: "",
        2: "",
        3: "",
        4: "",
        5: "",
        6: "",
        7: "",
        8: "",
        9: "",
        10: "",
        11: "",
        12: "",
        13: "",
        14: "",
        15: "",
        16: "",
      });
    }
  }, [selectedSpecialTripId]);
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "rgba(255, 255, 255, 0.4)", // White background for the input field
      borderColor: state.isFocused ? "#60a5fa" : "#d1d5db", // Blue border on focus, light gray otherwise
      boxShadow: state.isFocused ? "0 0 0 2px rgba(96, 165, 250, 0.5)" : "none", // Focus effect
      "&:hover": {
        borderColor: "#9ca3af", // Slightly darker gray on hover
      },
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: 120, // Limit dropdown height
      overflowY: "auto", // Enable scrolling
      backgroundColor: "white", // White background for dropdown menu
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "black", // Ensure text inside the field is readable
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#9ca3af", // Gray placeholder text
    }),
  };
  console.log(formData.validStartDate);
  console.log(formData.validEndDate);
  console.log(tourDate);
  const handleReferralDownload = async () => {
    if (!selectedClientId || !selectedSpecialTripId || !tourDate) {
      toast.error("Please Select the Tour Date!");
      return;
    }
    // Convert dates to comparable format
    const startDate = new Date(formData.validStartDate);
    const endDate = new Date(formData.validEndDate);
    const selectedDate = new Date(tourDate);

    // Validate if tourDate is within range
    if (selectedDate < startDate || selectedDate > endDate) {
      toast.error("Selected date is out of the valid range!");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/executive/specialTour/downloadReferralItinerary`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId: selectedClientId,
            specialTripId: selectedSpecialTripId,
            date: tourDate,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download itinerary");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "referral_itinerary.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading itinerary:", error.message);
      alert("Failed to download the itinerary. Please try again.");
    }
  };
  const handleTrackSheetDownload = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/executive/specialTour/downloadTrackSheet`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId: selectedClientId,
            specialTripId: selectedSpecialTripId,
            date: tourDate,
          }),
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || "Failed to download track sheet";
        toast.error(errorMessage);
        return;
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "fixed_tracksheet.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading track sheet:", error.message);
      alert("Failed to download the track sheet. Please try again.");
    }
  };




  const handleConfirmDownload = async () => {
    if (!selectedClientId || !selectedSpecialTripId || !tourDate) {
      toast.error("Please Select the Tour Date!");
      return;
    }
    // Convert dates to comparable format
    const startDate = new Date(formData.validStartDate);
    const endDate = new Date(formData.validEndDate);
    const selectedDate = new Date(tourDate);

    // Validate if tourDate is within range
    if (selectedDate < startDate || selectedDate > endDate) {
      toast.error("Selected date is out of the valid range!");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/executive/specialTour/downloadConfirmItinerary`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId: selectedClientId,
            specialTripId: selectedSpecialTripId,
            date: tourDate,
          }),
        }
      );

      if (!response.ok) {
        // Extract and handle the backend error message
        const errorData = await response.json(); // Parse the JSON error message
        const errorMessage =
          errorData.message || "Failed to download itinerary"; // Default fallback message
        toast.error(errorMessage);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "confirm_itinerary.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
      await handleTrackSheetDownload();
      gotoConfirmed();
    } catch (error) {
      console.error("Error downloading itinerary:", error.message);
      alert("Failed to download the itinerary. Please try again.");
    }
  };

  return (
    <div className="w-full  p-1 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg mt-1">
      {/* Main Form */}
      <div
        className="overflow-y-auto" // Enable vertical scrolling
        style={{
          maxHeight: "420px",
          scrollbarWidth: "none", // For Firefox
          msOverflowStyle: "none", // For IE/Edge
        }} // Set max height to 170px
      >
        <form
          //onSubmit={handleSubmit}
          className="p-4 bg-white/20 shadow-md rounded-lg w-full mx-auto"
        >
          <h2 className="text-xl font-bold mb-1 text-center"></h2>
          <div className="grid grid-cols-3 gap-1">
            <div className="col-span-3 md:col-span-1 w-full">
              <label
                htmlFor="destination"
                className="block text-sm font-medium text-gray-700"
              >
                destination
              </label>
              <Select
                value={formData.destination}
                placeholder="Destination"
                className="mt-1 rounded-md"
                styles={customStyles}
                name="destination" // Explicitly set name here
                id="destination"
              />
              {/* {fixedTourId && (
                <div className="mt-2 text-gray-500 italic">Destination</div>
              )} */}
            </div>

            <div className="col-span-3 md:col-span-1 w-full">
              <label
                htmlFor="tourName"
                className="block text-sm font-medium text-gray-700"
              >
                Tour Name
              </label>
              <input
                type="text"
                name="tourName"
                id="tourName"
                value={formData.tourName}
                placeholder="Tour Name"
                className="mt-1 p-2 border  rounded-md w-full bg-white/40"
              />
              {/* {fixedTourId && (
                <div className="mt-2 text-gray-500 italic">Tour Name</div>
              )} */}
            </div>

            <div className="col-span-3 md:col-span-1 w-full">
              <label
                htmlFor="articleNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Article Number
              </label>
              <CreatableSelect
                value={
                  formData.articleNumber
                    ? {
                        label: formData.articleNumber,
                        value: formData.articleNumber,
                      }
                    : null
                }
                placeholder="Article Number"
                className="mt-1 rounded-md"
                styles={customStyles}
                name="articleNumber"
                id="articleNumber"
                isClearable
                formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
              />
              {/* {fixedTourId && (
                <div className="mt-2 text-gray-500 italic">Article Number</div>
              )} */}
            </div>

            <div className="col-span-1">
              <label
                htmlFor="day"
                className="block text-sm font-medium text-gray-700"
              >
                Day
              </label>
              <input
                type="number"
                name="day"
                id="day"
                value={formData.day}
                placeholder="Day"
                className="mt-1 p-2 border rounded-md w-full bg-white/40"
              />
              {/* {fixedTourId && (
                <div className="mt-2 text-gray-500 italic">Day</div>
              )} */}
            </div>

            <div className="col-span-1">
              <label
                htmlFor="night"
                className="block text-sm font-medium text-gray-700"
              >
                Night
              </label>
              <input
                type="number"
                name="night"
                id="night"
                value={formData.night}
                placeholder="Night"
                className="mt-1 p-2 border rounded-md w-full bg-white/40"
              />
              {/* {fixedTourId && (
                <div className="mt-2 text-gray-500 italic">Night</div>
              )} */}
            </div>

            <div className="col-span-1">
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <Select
                name="category"
                id="category"
                value={formData.category}
                placeholder="Category"
                className="mt-1 rounded-md bg-white/40"
                styles={customStyles}
              />
              {/* {fixedTourId && (
                <div className="mt-2 text-gray-500 italic">Category</div>
              )} */}
            </div>
            {/* <div className="col-span-1">
              <input
                type="text"
                name="tourStartFrom"
                value={formData.tourStartFrom}
                placeholder="Tour Start From"
                className="mt-1 p-2 border rounded-md w-full bg-white/40"
              />
            </div> */}
          </div>
          <div className="col-span-1">
            <textarea
              name="itineraryText"
              value={formData.itineraryText}
              placeholder="Type itinerary text here"
              className="mt-1 p-2 border rounded-md w-full resize-none bg-white/40"
              rows="8" // Adjust this number based on desired height
            />
          </div>

          {/* Pack Fields */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4 mt-4">
            {/* Pack 1 */}
            <div>
              <label
                htmlFor="1"
                className="block text-sm font-medium text-gray-700"
              >
                Pack 1
              </label>
              <input
                type="text"
                name="1" // Use numeric key
                id="1" // Use numeric key
                value={formData[1]} // Access numeric key in formData
                className="mt-1 p-2 border rounded-md w-full bg-white/40"
              />
            </div>

            {/* Pack 2 */}
            <div>
              <label
                htmlFor="2"
                className="block text-sm font-medium text-gray-700"
              >
                Pack 2
              </label>
              <input
                type="text"
                name="2"
                id="2"
                value={formData[2]}
                className="mt-1 p-2 border rounded-md w-full bg-white/40"
              />
            </div>

            {/* Pack 3 */}
            <div>
              <label
                htmlFor="3"
                className="block text-sm font-medium text-gray-700"
              >
                Pack 3
              </label>
              <input
                type="text"
                name="3"
                id="3"
                value={formData[3]}
                className="mt-1 p-2 border rounded-md w-full bg-white/40"
              />
            </div>

            {/* Pack 4 */}
            <div>
              <label
                htmlFor="4"
                className="block text-sm font-medium text-gray-700"
              >
                Pack 4
              </label>
              <input
                type="text"
                name="4"
                id="4"
                value={formData[4]}
                className="mt-1 p-2 border rounded-md w-full bg-white/40"
              />
            </div>

            {/* Pack 5 */}
            <div>
              <label
                htmlFor="5"
                className="block text-sm font-medium text-gray-700"
              >
                Pack 5
              </label>
              <input
                type="text"
                name="5"
                id="5"
                value={formData[5]}
                className="mt-1 p-2 border rounded-md w-full bg-white/40"
              />
            </div>

            {/* Pack 6 */}
            <div>
              <label
                htmlFor="6"
                className="block text-sm font-medium text-gray-700"
              >
                Pack 6
              </label>
              <input
                type="text"
                name="6"
                id="6"
                value={formData[6]}
                className="mt-1 p-2 border rounded-md w-full bg-white/40"
              />
            </div>

            {/* Pack 7 */}
            <div>
              <label
                htmlFor="7"
                className="block text-sm font-medium text-gray-700"
              >
                Pack 7
              </label>
              <input
                type="text"
                name="7"
                id="7"
                value={formData[7]}
                className="mt-1 p-2 border rounded-md w-full bg-white/40"
              />
            </div>

            {/* Pack 8 */}
            <div>
              <label
                htmlFor="8"
                className="block text-sm font-medium text-gray-700"
              >
                Pack 8
              </label>
              <input
                type="text"
                name="8"
                id="8"
                value={formData[8]}
                className="mt-1 p-2 border rounded-md w-full bg-white/40"
              />
            </div>

            {/* Pack 9 */}
            <div>
              <label
                htmlFor="9"
                className="block text-sm font-medium text-gray-700"
              >
                Pack 9
              </label>
              <input
                type="text"
                name="9"
                id="9"
                value={formData[9]}
                className="mt-1 p-2 border rounded-md w-full bg-white/40"
              />
            </div>

            {/* Pack 10 */}
            <div>
              <label
                htmlFor="10"
                className="block text-sm font-medium text-gray-700"
              >
                Pack 10
              </label>
              <input
                type="text"
                name="10"
                id="10"
                value={formData[10]}
                className="mt-1 p-2 border rounded-md w-full bg-white/40"
              />
            </div>

            {/* Pack 11 */}
            <div>
              <label
                htmlFor="11"
                className="block text-sm font-medium text-gray-700"
              >
                Pack 11
              </label>
              <input
                type="text"
                name="11"
                id="11"
                value={formData[11]}
                className="mt-1 p-2 border rounded-md w-full bg-white/40"
              />
            </div>

            {/* Pack 12 */}
            <div>
              <label
                htmlFor="12"
                className="block text-sm font-medium text-gray-700"
              >
                Pack 12
              </label>
              <input
                type="text"
                name="12"
                id="12"
                value={formData[12]}
                className="mt-1 p-2 border rounded-md w-full bg-white/40"
              />
            </div>

            {/* Pack 13 */}
            <div>
              <label
                htmlFor="13"
                className="block text-sm font-medium text-gray-700"
              >
                Pack 13
              </label>
              <input
                type="text"
                name="13"
                id="13"
                value={formData[13]}
                className="mt-1 p-2 border rounded-md w-full bg-white/40"
              />
            </div>

            {/* Pack 14 */}
            <div>
              <label
                htmlFor="14"
                className="block text-sm font-medium text-gray-700"
              >
                Pack 14
              </label>
              <input
                type="text"
                name="14"
                id="14"
                value={formData[14]}
                className="mt-1 p-2 border rounded-md w-full bg-white/40"
              />
            </div>

            {/* Pack 15 */}
            <div>
              <label
                htmlFor="15"
                className="block text-sm font-medium text-gray-700"
              >
                Pack 15
              </label>
              <input
                type="text"
                name="15"
                id="15"
                value={formData[15]}
                className="mt-1 p-2 border rounded-md w-full bg-white/40"
              />
            </div>

            {/* Pack 16 */}
            <div>
              <label
                htmlFor="16"
                className="block text-sm font-medium text-gray-700"
              >
                Pack 16
              </label>
              <input
                type="text"
                name="16"
                id="16"
                value={formData[16]}
                className="mt-1 p-2 border rounded-md w-full bg-white/40"
              />
            </div>
          </div>

          {/* Display Inclusions */}
          <div
            className="mt-1 w-full max-w-[90vw] mx-auto flex items-center space-x-2 overflow-x-auto py-2 px-2 border rounded-md bg-gray-100"
            style={{ minHeight: "50px", maxHeight: "50px" }}
          >
            {formData.inclusionsList.map((item, index) => (
              <span
                key={index}
                className="bg-green-500 text-white py-1 px-2 rounded-full flex items-center mr-2"
              >
                {item}
                <button
                  type="button"
                  className="ml-2 text-white hover:text-gray-300 focus:outline-none"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>

          {/* Display Exclusions */}
          <div
            className="mt-1 w-full max-w-[90vw] mx-auto flex items-center space-x-2 overflow-x-auto py-2 px-2 border rounded-md bg-gray-100"
            style={{ minHeight: "50px", maxHeight: "50px" }}
          >
            {formData.exclusionsList.map((item, index) => (
              <span
                key={index}
                className="bg-red-500 text-white py-1 px-2 rounded-full flex items-center mr-2"
              >
                {item}
                <button
                  type="button"
                  className="ml-2 text-white hover:text-gray-300 focus:outline-none"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-1">
            {/* Column 1 - Tour Start From */}
            <div className="col-span-1">
              <label
                htmlFor="tourStartFrom"
                className="block text-sm font-medium text-gray-700"
              >
                Tour Start From
              </label>
              <input
                type="text"
                name="tourStartFrom"
                id="tourStartFrom"
                value={formData.tourStartFrom}
                placeholder="Tour Start From"
                className="mt-1 p-2 border rounded-md w-full bg-white/40"
              />
            </div>

            {/* Column 2 - Validity Start Date */}
            <div>
              <label
                htmlFor="validStartDate"
                className="block text-sm font-medium text-gray-700"
              >
                Validity Start Date
              </label>
              <input
                type="date"
                name="validStartDate"
                id="validStartDate"
                value={formData.validStartDate}
                className="mt-1 p-2 border rounded-md w-full bg-white/40"
              />
            </div>

            {/* Column 3 - Validity End Date */}
            <div>
              <label
                htmlFor="validEndDate"
                className="block text-sm font-medium text-gray-700"
              >
                Validity End Date
              </label>
              <input
                type="date"
                name="validEndDate"
                id="validEndDate"
                value={formData.validEndDate}
                className="mt-1 p-2 border rounded-md w-full bg-white/40"
              />
            </div>

            {/* Column 4 - Tour Date */}
            <div>
              <label
                htmlFor="tourDate"
                className="block text-sm font-medium text-gray-700"
              >
                Tour Date
              </label>
              <input
                type="date"
                name="tourDate"
                id="tourDate"
                value={tourDate} // Controlled by separate state
                onChange={(e) => setTourDate(e.target.value)} // Handle change
                className="mt-1 p-2 border rounded-md w-full bg-white/40"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-center space-x-4">
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring focus:ring-red-300"
              onClick={handleReferralDownload}
            >
              Download Referral Itinerary
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring focus:ring-green-300"
              onClick={handleConfirmDownload}
            >
              Download Confirm Itinerary
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SpecialItenararyDetails;
