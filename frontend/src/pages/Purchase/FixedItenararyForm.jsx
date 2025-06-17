import React, { useState, useEffect } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";

const FixedItineraryForm = ({ onNext, fixedTourId }) => {
  const [destinations, setDestinations] = useState([]);
  const [articleNumbers, setArticleNumbers] = useState([]);
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
    if (fixedTourId) {
      const fetchFixedTour = async () => {
        try {
          const response = await fetch(
            `${BASE_URL}/purchaser/fixedTour/${fixedTourId}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch fixedtour details");
          }
          const data = await response.json();
          // Convert startDates strings to Date objects
          data.startDates = data.startDates.map((dateStr) => new Date(dateStr));

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
  }, [fixedTourId]);

  const categoryOptions = [
    { value: "budget", label: "Budget" },
    { value: "standard", label: "Standard" },
    { value: "deluxe", label: "Deluxe" },
    { value: "star", label: "Star" },
  ];
  const customStyles = {
    menuList: (provided) => ({
      ...provided,
      maxHeight: 120, // Max height of 120px to show approximately 3 options
      overflowY: "auto", // Enable vertical scrolling
    }),
  };
  const fetchDestinations = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`${BASE_URL}/purchaser/getDestinationsName?companyId=${storedUser.companyId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch destinations");
      }
      const data = await response.json();
      const options = data.map((destination) => ({
        _id: destination._id,
        value: destination.value,
        label: destination.label,
      }));
      setDestinations(options);
    } catch (error) {
      console.error("Failed to fetch destinations:", error);
      toast.error(
        error.message || "An error occurred while fetching destinations"
      );
    } finally {
      //setLoading(false); // Set loading to false after fetching
    }
  };
  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchArticleNumbers = async () => {
    try {
      // Retrieve the user data from local storage and parse it
      const user = JSON.parse(localStorage.getItem("user"));
      const companyId = user?.companyId;

      if (!companyId) {
        throw new Error("Company ID not found in local storage");
      }

      const response = await fetch(
        `${BASE_URL}/purchaser/getArticleNumbers?companyId=${companyId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch article numbers");
      }

      const data = await response.json();
      const options = data.map((article) => ({
        value: article.value,
        label: article.label,
      }));
      setArticleNumbers(options);
    } catch (error) {
      console.error("Failed to fetch article numbers:", error);
      toast.error(
        error.message || "An error occurred while fetching article numbers"
      );
    } finally {
      // setLoading(false); // Set loading to false after fetching if using a loading state
    }
  };

  useEffect(() => {
    fetchArticleNumbers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (selectedOption, { name }) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption,
    }));
  };
  // Handle date selection and add it to startDates array
  const handleDateChange = (date) => {
    // Convert to UTC midnight to avoid timezone issues
    const normalizedDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );

    if (
      normalizedDate &&
      !formData.startDates.some((d) => d.getTime() === normalizedDate.getTime())
    ) {
      setFormData((prev) => ({
        ...prev,
        startDates: [...prev.startDates, normalizedDate],
      }));
    }
  };

  // Handle removal of a selected date
  const handleRemoveDate = (index) => {
    setFormData((prev) => ({
      ...prev,
      startDates: prev.startDates.filter((_, i) => i !== index),
    }));
  };
  const handleAddInclusion = () => {
    if (formData.inclusion) {
      setFormData((prev) => ({
        ...prev,
        inclusionsList: [...prev.inclusionsList, formData.inclusion],
        inclusion: "", // clear the inclusion input field
      }));
    }
  };

  const handleRemoveInclusion = (index) => {
    setFormData((prev) => ({
      ...prev,
      inclusionsList: prev.inclusionsList.filter((_, i) => i !== index),
    }));
  };

  const handleAddExclusion = () => {
    if (formData.exclusion) {
      setFormData((prev) => ({
        ...prev,
        exclusionsList: [...prev.exclusionsList, formData.exclusion],
        exclusion: "", // clear the exclusion input field
      }));
    }
  };

  const handleRemoveExclusion = (index) => {
    setFormData((prev) => ({
      ...prev,
      exclusionsList: prev.exclusionsList.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (formData) => {
    if (!formData.destination) {
      toast.error("Destination is required");
      return false;
    }
    if (!formData.tourName) {
      toast.error("Tour name is required");
      return false;
    }
    if (!formData.articleNumber) {
      toast.error("Article number is required");
      return false;
    }
    if (!formData.day || formData.day <= 0) {
      toast.error("Day is required and positive");
      return false;
    }
    if (!formData.night || formData.night <= 0) {
      toast.error("Night is required and positive");
      return false;
    }
    if (!formData.totalPax || formData.totalPax <= 0) {
      toast.error("Total Pax is required and positive");
      return false;
    }
    if (!formData.mrp || formData.mrp <= 0) {
      toast.error("MRP is required and positive");
      return false;
    }
    if (!formData.category) {
      toast.error("Category is required");
      return false;
    }
    if (!formData.startDates || formData.startDates.length === 0) {
      toast.error("Start Dates are required");
      return false;
    }
    if (!formData.tourStartFrom) {
      toast.error("Tour Start From is required");
      return false;
    }
    if (!formData.inclusionsList || formData.inclusionsList.length === 0) {
      toast.error("Inclusions list is required");
      return false;
    }
    if (!formData.exclusionsList || formData.exclusionsList.length === 0) {
      toast.error("Exclusions list is required");
      return false;
    }
    if (!formData.itineraryText) {
      toast.error("Itinerary text is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(formData)) return;

    try {
      // Retrieve purchaser ID from localStorage
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const purchaserId = storedUser ? storedUser._id : null;

      // Add purchaserId to formData
      const dataToSend = { ...formData, purchaserId };

      // Determine the API endpoint and HTTP method based on fixedTourId
      const url = fixedTourId
        ? `${BASE_URL}/purchaser/updateFixedTour/${fixedTourId}` // Update route
        : `${BASE_URL}/purchaser/createFixedTour`; // Create route
      const method = fixedTourId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit form");
      }

      const data = await response.json();
      toast.success(
        fixedTourId
          ? "Tour updated successfully!"
          : "Tour submitted successfully!"
      );
      console.log("Tour submitted:", data);

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
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "An error occurred during submission");
    }
  };

  return (
    <div className="w-full  p-4 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-2xl mt-1">
    {/* Main Form */}
   <div
        className="overflow-y-auto" // Enable vertical scrolling
        style={{ maxHeight: "455px",
        scrollbarWidth: "none", // For Firefox
        msOverflowStyle: "none", // For IE/Edge
        }} // Set max height to 170px
      >
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-white/20 shadow-md rounded-lg w-full mx-auto"
    >
      <div className="flex justify-center mb-4">
  <div className="inline-block bg-white px-3 py-1 rounded-md shadow">
    <h2 className="text-xl font-bold text-red-600 text-center">
      {fixedTourId ? "Edit Group Tour" : "Create Group Tour"}
    </h2>
  </div>
</div>
      <div className="grid grid-cols-4 gap-2">
        <div className="col-span-1">
          <Select
            options={destinations}
            value={formData.destination}
            onChange={(selectedOption) =>
              handleSelectChange(selectedOption, { name: "destination" })
            }
            placeholder="Destination"
            className="mt-1 rounded-md"
            onMenuOpen={fetchDestinations}
            styles={customStyles}
            name="destination" // Explicitly set name here
          />
          {fixedTourId && (
            <div className="mt-2 text-gray-500 italic">Destination</div>
          )}
        </div>

        <div className="col-span-1">
          <input
            type="text"
            name="tourName"
            value={formData.tourName}
            onChange={handleChange}
            placeholder="Tour Name"
            className="mt-1 p-2 border  rounded-md w-full"
          />
          {fixedTourId && (
            <div className="mt-2 text-gray-500 italic">Tour Name</div>
          )}
        </div>

        <div className="col-span-1">
          <CreatableSelect
            options={articleNumbers} // Replace with your predefined article numbers
            value={
              formData.articleNumber
                ? {
                    label: formData.articleNumber,
                    value: formData.articleNumber,
                  }
                : null
            }
            onChange={(selectedOption) => {
              handleChange({
                target: {
                  name: "articleNumber",
                  value: selectedOption ? selectedOption.value : "",
                },
              });
            }}
            placeholder="Article Number"
            className="mt-1 rounded-md"
            styles={customStyles}
            name="articleNumber"
            isClearable
            formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
          />
          {fixedTourId && (
            <div className="mt-2 text-gray-500 italic">Article Number</div>
          )}
        </div>

        <div className="col-span-1">
          <input
            type="number"
            name="day"
            value={formData.day}
            onChange={handleChange}
            placeholder="Day"
            className="mt-1 p-2 border rounded-md w-full"
          />
          {fixedTourId && <div className="mt-2 text-gray-500 italic">Day</div>}
        </div>

        <div className="col-span-1">
          <input
            type="number"
            name="night"
            value={formData.night}
            onChange={handleChange}
            placeholder="Night"
            className="mt-1 p-2 border rounded-md w-full"
          />
          {fixedTourId && (
            <div className="mt-2 text-gray-500 italic">Night</div>
          )}
        </div>

        <div className="col-span-1">
          <input
            type="number"
            name="totalPax"
            value={formData.totalPax}
            onChange={handleChange}
            placeholder="Total Pax"
            className="mt-1 p-2 border rounded-md w-full"
          />
          {fixedTourId && (
            <div className="mt-2 text-gray-500 italic">Total Pax</div>
          )}
        </div>

        <div className="col-span-1">
          <input
            type="number"
            name="mrp"
            value={formData.mrp}
            onChange={handleChange}
            placeholder="MRP"
            className="mt-1 p-2 border rounded-md w-full"
          />
          {fixedTourId && <div className="mt-2 text-gray-500 italic">MRP</div>}
        </div>

        <div className="col-span-1">
          <Select
            name="category"
            value={formData.category}
            onChange={handleSelectChange}
            options={categoryOptions}
            placeholder="Category"
            className="mt-1 rounded-md"
          />
          {fixedTourId && (
            <div className="mt-2 text-gray-500 italic">Category</div>
          )}
        </div>

        {/* Multi Start Date Selection Field */}
        <div className="col-span-1">
          <DatePicker
            selected={null}
            onChange={handleDateChange}
            placeholderText="Select Start Dates"
            className="mt-1 p-2 border rounded-md w-full"
            minDate={new Date()} // Prevent selection of past dates
          />
        </div>

        <div className="col-span-1">
          <input
            type="text"
            name="tourStartFrom"
            value={formData.tourStartFrom}
            onChange={handleChange}
            placeholder="Tour Start From"
            className="mt-1 p-2 border rounded-md w-full"
          />
        </div>

        {/* Inclusion Field */}
        <div className="col-span-1 flex items-center relative">
          <input
            type="text"
            name="inclusion"
            value={formData.inclusion}
            onChange={handleChange}
            placeholder="Add Inclusion"
            className="mt-1 p-2 border rounded-md w-full pr-8" // Add padding to the right to make space for the button
          />
          <button
            type="button"
            onClick={handleAddInclusion}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-500 bg-white p-1 rounded-full hover:bg-blue-500 hover:text-white focus:outline-none"
          >
            +
          </button>
        </div>

        {/* Exclusion Field */}
        <div className="col-span-1 flex items-center relative">
          <input
            type="text"
            name="exclusion"
            value={formData.exclusion}
            onChange={handleChange}
            placeholder="Add Exclusion"
            className="mt-1 p-2 border rounded-md w-full pr-8" // Padding to make space for the "+" button
          />
          <button
            type="button"
            onClick={handleAddExclusion}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-500 bg-white p-1 rounded-full hover:bg-blue-500 hover:text-white focus:outline-none"
          >
            +
          </button>
        </div>
      </div>
      <div className="col-span-1">
        <textarea
          name="itineraryText"
          value={formData.itineraryText}
          onChange={handleChange}
          placeholder="Type itinerary text here"
          className="mt-1 p-2 border rounded-md w-full resize-none"
          rows="9" // Adjust this number based on desired height
        />
      </div>

      <div
        className="mt-1 w-full flex items-center space-x-2 overflow-x-auto py-2 px-2 border rounded-md bg-gray-100"
        style={{ minHeight: "50px", maxHeight: "50px" }}
      >
        {formData.startDates.map((date, index) => {
          // Check if 'date' is already a Date object, if not, create a new Date object from it
          const validDate = date instanceof Date ? date : new Date(date);

          return (
            <span
              key={index}
              className="bg-gray-500 text-white py-1 px-2 rounded-full flex items-center mr-2"
            >
              {validDate.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
              <button
                type="button"
                onClick={() => handleRemoveDate(index)}
                className="ml-2 text-white hover:text-gray-300 focus:outline-none"
              >
                &times;
              </button>
            </span>
          );
        })}
      </div>

      {/* Display Inclusions */}
      <div
        className="mt-1 w-full flex items-center space-x-2 overflow-x-auto py-2 px-2 border rounded-md bg-gray-100"
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
              onClick={() => handleRemoveInclusion(index)}
              className="ml-2 text-white hover:text-gray-300 focus:outline-none"
            >
              &times;
            </button>
          </span>
        ))}
      </div>

      {/* Display Exclusions */}
      <div
        className="mt-1 w-full flex items-center space-x-2 overflow-x-auto py-2 px-2 border rounded-md bg-gray-100"
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
              onClick={() => handleRemoveExclusion(index)}
              className="ml-2 text-white hover:text-gray-300 focus:outline-none"
            >
              &times;
            </button>
          </span>
        ))}
      </div>

      <div className="mt-2 flex justify-center">
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          {fixedTourId ? "Update Group Tour" : "Create Group Tour"}
        </button>
      </div>
      <div className="flex justify-center mt-1">
        <button
          type="button"
          onClick={onNext}
          className="w-full py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Switch
        </button>
      </div>
    </form>
    </div>
    </div>
  );
};

export default FixedItineraryForm;
