import React, { useState, useEffect } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";

const FixedItenararyDetails = ({ selectedClientId, selectedFixedTripId, gotoConfirmed }) => {
  const [destinations, setDestinations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [stateVariableForApiCallAgain, setStateVariableForApiCallAgain] = useState(true)

  console.log(selectedDate);
  const [formData, setFormData] = useState({
    destination: "",
    tourName: "",
    articleNumber: "",
    day: "",
    night: "",
    totalPax: "",
    mrp: "",
    category: null,
    startDates: [],
    tourStartFrom: "",
    inclusion: "",
    exclusion: "",
    inclusionsList: [],
    exclusionsList: [],
    itineraryText: "",
  });
  console.log(formData);
  useEffect(() => {
    if (selectedFixedTripId) {
      const fetchFixedTour = async () => {
        try {
          const response = await fetch(
            `${BASE_URL}/executive/fixedTour/${selectedFixedTripId}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch fixedtour details");
          }
          const data = await response.json();
          // Ensure startDates include both date and available fields
          data.startDates = data.startDates.map((startDate) => ({
            date: new Date(startDate.date), // Convert date string to Date object
            available: startDate.available, // Include available field
            id: startDate.id,
          }));

          setFormData(data);
        } catch (error) {
          console.error("Failed to fetch fixedtrip details:", error);
          toast.error("Failed to fetch fixedtrip details");
        }
      };

      fetchFixedTour();
    } else {
      setFormData({
        destination: "",
        tourName: "",
        articleNumber: "",
        day: "",
        night: "",
        totalPax: "",
        mrp: "",
        category: null,
        startDates: [],
        tourStartFrom: "",
        inclusion: "",
        exclusion: "",
        inclusionsList: [],
        exclusionsList: [],
        itineraryText: "",
      });
    }
  }, [selectedFixedTripId,stateVariableForApiCallAgain]);
  console.log(formData);
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
  
  

  const handleReferralDownload = async () => {
    if (!selectedClientId || !selectedFixedTripId || !selectedDate) {
      toast.error("Please Select a date!");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/executive/fixedTour/downloadReferralItinerary`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId: selectedClientId,
            fixedTripId: selectedFixedTripId,
            date: selectedDate,
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
        `${BASE_URL}/executive/fixedTour/downloadFixedTrackSheet`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId: selectedClientId,
            fixedTripId: selectedFixedTripId,
            date: selectedDate,
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
      a.download = "group_tracksheet.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading track sheet:", error.message);
      alert("Failed to download the track sheet. Please try again.");
    }
  };




  const handleConfirmDownload = async () => {
    if (!selectedClientId || !selectedFixedTripId || !selectedDate) {
      toast.error("Please Select a date!");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/executive/fixedTour/downloadConfirmItinerary`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId: selectedClientId,
            fixedTripId: selectedFixedTripId,
            date: selectedDate,
          }),
        }
      );

      if (!response.ok) {
        // Extract and handle the backend error message
      const errorData = await response.json(); // Parse the JSON error message
      const errorMessage = errorData.message || "Failed to download itinerary"; // Default fallback message
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
      setStateVariableForApiCallAgain(!stateVariableForApiCallAgain)
      gotoConfirmed()
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
        style={{ maxHeight: "370px" ,
          scrollbarWidth: "none", // For Firefox
          msOverflowStyle: "none", // For IE/Edge
        }} // Set max height to 170px
      >
        <form className="p-2 bg-white/20 shadow-md rounded-lg w-full max-w-[90vw] mx-auto">
          <div className="grid grid-cols-3 gap-2 ">
            <div className="col-span-3 md:col-span-1 w-full ">
              <Select
                options={destinations}
                value={formData.destination}
                placeholder="Destination"
                className="mt-1 rounded-md"
                styles={customStyles}
                name="destination" // Explicitly set name here
                isDisabled={true}
              />
              {selectedFixedTripId && (
                <p className="text-sm text-gray-500 mt-1">Destination</p>
              )}
            </div>

            <div className="col-span-3 md:col-span-1 w-full ">
              <input
                type="text"
                name="tourName"
                value={formData.tourName}
                placeholder="Tour Name"
                className="mt-1 p-2 border  rounded-md w-full bg-white/40"
                disabled
              />
              {selectedFixedTripId && (
                <p className="text-sm text-gray-500 mt-1">Tour Name</p>
              )}
            </div>

            <div className="col-span-3 md:col-span-1 w-full ">
              <CreatableSelect // Replace with your predefined article numbers
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
                isClearable
                formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                isDisabled={true}
              />
              {selectedFixedTripId && (
                <p className="text-sm text-gray-500 mt-1">Article Number</p>
              )}
            </div>

            <div className="col-span-1">
              <input
                type="number"
                name="day"
                value={formData.day}
                placeholder="Day"
                className="mt-1 p-2 border rounded-md w-full bg-white/40"
                disabled
              />
              {selectedFixedTripId && (
                <p className="text-sm text-gray-500 mt-1">Day</p>
              )}
            </div>

            <div className="col-span-1">
              <input
                type="number"
                name="night"
                value={formData.night}
                placeholder="Night"
                className="mt-1 p-2 border rounded-md w-full bg-white/40"
                disabled
              />
              {selectedFixedTripId && (
                <p className="text-sm text-gray-500 mt-1">Night</p>
              )}
            </div>

            <div className="col-span-1">
              <input
                type="number"
                name="totalPax"
                value={formData.totalPax}
                placeholder="Total Pax"
                className="mt-1 p-2 border rounded-md w-full bg-white/40"
                disabled
              />
              {selectedFixedTripId && (
                <p className="text-sm text-gray-500 mt-1">Total Pax</p>
              )}
            </div>

            <div className="col-span-3 md:col-span-1 w-full">
              <input
                type="number"
                name="mrp"
                value={formData.mrp}
                placeholder="MRP"
                className="mt-1 p-2 border rounded-md w-full bg-white/40"
                disabled
              />
              {selectedFixedTripId && (
                <p className="text-sm text-gray-500 mt-1">MRP</p>
              )}
            </div>

            <div className="col-span-3 md:col-span-1 w-full">
              <Select
                name="category"
                value={formData.category}
                placeholder="Category"
                className="mt-1 rounded-md"
                styles={customStyles}
                isDisabled={true}
              />
              {selectedFixedTripId && (
                <p className="text-sm text-gray-500 mt-1">Category</p>
              )}
            </div>

            <div className="col-span-3 md:col-span-1 w-full">
              <input
                type="text"
                name="tourStartFrom"
                value={formData.tourStartFrom}
                placeholder="Tour Start From"
                className="mt-1 p-2 border rounded-md w-full bg-white/40"
                disabled
              />
              {selectedFixedTripId && (
                <p className="text-sm text-gray-500 mt-1">Tour Start From</p>
              )}
            </div>
          </div>
          <div className="col-span-1">
            <textarea
              name="itineraryText"
              value={formData.itineraryText}
              placeholder="Type itinerary text here"
              className="mt-1 p-2 border rounded-md w-full resize-none bg-white/40"
              rows="4" // Adjust this number based on desired height
              disabled
            />
          </div>

          {/*Display Dates */}
          <div
            className="mt-1 w-full flex items-center space-x-2 overflow-x-auto py-2 px-2 border rounded-md bg-white/40"
            style={{ minHeight: "70px", maxHeight: "70px" }}
          >
            {formData.startDates.map((date, id) => {
              // Check if 'date' is already a Date object, if not, create a new Date object from it
              const validDate =
                date.date instanceof Date ? date.date : new Date(date.date);

              // Determine if this date is selected
              const isSelected = selectedDate && selectedDate.id === date.id; // Compare IDs to check selection

              return (
                <span
                  key={id}
                  className={`py-1 px-2 rounded-full flex items-center mr-2 space-x-2 cursor-pointer ${
                    isSelected
                      ? "bg-gray-700 text-white"
                      : "bg-gray-400 text-white"
                  }`}
                  onClick={() => setSelectedDate(date)} // Set selected date on click
                >
                  {/* Display the formatted date */}
                  <span>
                    {validDate.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>

                  {/* Display the available count in a green circle */}
                  <span
                    className="bg-blue-300 text-white text-sm font-bold rounded-full flex items-center justify-center"
                    style={{
                      width: "24px",
                      height: "24px",
                      lineHeight: "24px",
                    }}
                  >
                    {date.available}
                  </span>
                </span>
              );
            })}
          </div>

          {/* Display Inclusions */}
          <div
            className="mt-1 w-full max-w-[90vw] mx-auto flex items-center space-x-2 overflow-x-auto py-2 px-2 border rounded-md bg-white/40"
            style={{ minHeight: "50px", maxHeight: "50px" }}
          >
            {formData.inclusionsList.map((item, index) => (
              <span
                key={index}
                className="bg-green-400 text-white py-1 px-2 rounded-full flex items-center mr-2"
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
            className="mt-1 w-full max-w-[90vw] mx-auto flex items-center space-x-2 overflow-x-auto py-2 px-2 border rounded-md bg-white/40"
            style={{ minHeight: "50px", maxHeight: "50px" }}
          >
            {formData.exclusionsList.map((item, index) => (
              <span
                key={index}
                className="bg-red-400 text-white py-1 px-2 rounded-full flex items-center mr-2"
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
          {/* New Buttons */}
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

export default FixedItenararyDetails;
