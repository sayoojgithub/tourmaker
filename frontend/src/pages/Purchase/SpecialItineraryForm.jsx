import React, { useState, useEffect } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";

const SpecialItineraryForm = ({onNext,specialTourId}) => {
  const [destinations, setDestinations] = useState([]);
  const [articleNumbers, setArticleNumbers] = useState([]);
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
    1:"",
    2:"",
    3:"",
    4:"",
    5:"",
    6:"",
    7:"",
    8:"",
    9:"",
    10:"",
    11:"",
    12:"",
    13:"",
    14:"",
    15:"",
    16:"",
  });

  console.log(formData);
  
  useEffect(() => {
    if (specialTourId) {
      const fetchSpecialTour = async () => {
        try {
          const response = await fetch(
            `${BASE_URL}/purchaser/specialTour/${specialTourId}`
          );
  
          if (!response.ok) {
            throw new Error("Failed to fetch special tour details");
          }
  
          const data = await response.json();
          console.log(data)
  
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
  }, [specialTourId]);
  

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
        `${BASE_URL}/purchaser/getArticleNumbersSpecialTour?companyId=${companyId}`
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
    
    if (!formData.category) {
      toast.error("Category is required");
      return false;
    }
    
    if (!formData.tourStartFrom) {
      toast.error("Tour Start From is required");
      return false;
    }
    if (!formData.inclusionsList || formData.inclusionsList.length === 0) {
      toast.error("Inclusion is required");
      return false;
    }
    if (!formData.exclusionsList || formData.exclusionsList.length === 0) {
      toast.error("Exclusion is required");
      return false;
    }
    if (!formData.itineraryText) {
      toast.error("Itinerary text is required");
      return false;
    }
    if (!formData.validStartDate) {
      toast.error("Validity starting date is required");
      return false;
    }
    if (!formData.validEndDate) {
      toast.error("Validity ending date is required");
      return false;
    }
      // Validate fields 1 to 16
  for (let i = 1; i <= 16; i++) {
    const fieldKey = i.toString();
    if (formData[fieldKey] && (isNaN(formData[fieldKey]) || Number(formData[fieldKey]) <= 0)) {
      toast.error(`Price for packs ${fieldKey} must be a positive number`);
      return false;
    }
  }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate the form before submitting
     if (!validateForm(formData)) return;
  
    try {
      // Retrieve purchaser ID from localStorage
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const purchaserId = storedUser ? storedUser._id : null;
  
      // Add purchaserId to formData
      const dataToSend = { ...formData, purchaserId };
  
      // Determine the API endpoint and HTTP method based on fixedTourId
            const url = specialTourId
              ? `${BASE_URL}/purchaser/updateSpecialTour/${specialTourId}` // Update route
              : `${BASE_URL}/purchaser/createSpecialTour`; // Create route
            const method = specialTourId ? "PUT" : "POST";
      
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
              specialTourId
                ? "Tour updated successfully!"
                : "Tour submitted successfully!"
            );
            console.log("Tour submitted:", data);
      // Reset the form data
      setFormData({
        destination: "",
        tourName: "",
        articleNumber: "",
        day: "",
        night: "",
        category: null,
        startDates: [],
        tourStartFrom: "",
        inclusion: "",
        exclusion: "",
        inclusionsList: [],
        exclusionsList: [],
        itineraryText: "",
        validStartDate: "",
        validEndDate: "",
        1:"",
        2:"",
        3:"",
        4:"",
        5:"",
        6:"",
        7:"",
        8:"",
        9:"",
        10:"",
        11:"",
        12:"",
        13:"",
        14:"",
        15:"",
        16:"",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
  
      // Error message
      toast.error(error.message || "An error occurred during submission");
    }
  };
  

  return (
    <div className="w-full  p-4 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-2xl mt-1">
     <div
        className="overflow-y-auto" // Enable vertical scrolling
        style={{ maxHeight: "430px",
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
      {specialTourId ? "Edit Fixed Itinerary" : "Create Fixed Itinerary"}
    </h2>
  </div>
</div>
          <div className="grid grid-cols-3 gap-2">
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
              {/* {fixedTourId && (
                <div className="mt-2 text-gray-500 italic">Destination</div>
              )} */}
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
              {/* {fixedTourId && (
                <div className="mt-2 text-gray-500 italic">Tour Name</div>
              )} */}
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
              {/* {fixedTourId && (
                <div className="mt-2 text-gray-500 italic">Article Number</div>
              )} */}
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
              {/* {fixedTourId && (
                <div className="mt-2 text-gray-500 italic">Day</div>
              )} */}
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
              {/* {fixedTourId && (
                <div className="mt-2 text-gray-500 italic">Night</div>
              )} */}
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
              {/* {fixedTourId && (
                <div className="mt-2 text-gray-500 italic">Category</div>
              )} */}
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
              rows="8" // Adjust this number based on desired height
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-1">
  {/* Valid Start Date */}
  <div>
    <label htmlFor="validStartDate" className="block text-sm font-medium text-gray-700">
      Validity Start Date
    </label>
    <input
      type="date"
      name="validStartDate"
      id="validStartDate"
      value={formData.validStartDate}
      onChange={handleChange}
      className="mt-1 p-2 border rounded-md w-full"
    />
  </div>

  {/* Valid End Date */}
  <div>
    <label htmlFor="validEndDate" className="block text-sm font-medium text-gray-700">
      Validity End Date
    </label>
    <input
      type="date"
      name="validEndDate"
      id="validEndDate"
      value={formData.validEndDate}
      onChange={handleChange}
      className="mt-1 p-2 border rounded-md w-full"
    />
  </div>
</div>
{/* Pack Fields */}
<div className="grid grid-cols-8 gap-4 mt-4">
  {/* Pack 1 */}
  <div>
  <label htmlFor="1" className="block text-sm font-medium text-gray-700">
    Pack 1
  </label>
  <input
    type="text"
    name="1" // Use numeric key
    id="1" // Use numeric key
    value={formData[1]} // Access numeric key in formData
    onChange={handleChange}
    className="mt-1 p-2 border rounded-md w-full"
  />
</div>

  {/* Pack 2 */}
  <div>
    <label htmlFor="2" className="block text-sm font-medium text-gray-700">
      Pack 2
    </label>
    <input
      type="text"
      name="2"
      id="2"
      value={formData[2]}
      onChange={handleChange}
      className="mt-1 p-2 border rounded-md w-full"
    />
  </div>

  {/* Pack 3 */}
  <div>
    <label htmlFor="3" className="block text-sm font-medium text-gray-700">
      Pack 3
    </label>
    <input
      type="text"
      name="3"
      id="3"
      value={formData[3]}
      onChange={handleChange}
      className="mt-1 p-2 border rounded-md w-full"
    />
  </div>

  {/* Pack 4 */}
  <div>
    <label htmlFor="4" className="block text-sm font-medium text-gray-700">
      Pack 4
    </label>
    <input
      type="text"
      name="4"
      id="4"
      value={formData[4]}
      onChange={handleChange}
      className="mt-1 p-2 border rounded-md w-full"
    />
  </div>

  {/* Pack 5 */}
  <div>
    <label htmlFor="5" className="block text-sm font-medium text-gray-700">
      Pack 5
    </label>
    <input
      type="text"
      name="5"
      id="5"
      value={formData[5]}
      onChange={handleChange}
      className="mt-1 p-2 border rounded-md w-full"
    />
  </div>

  {/* Pack 6 */}
  <div>
    <label htmlFor="6" className="block text-sm font-medium text-gray-700">
      Pack 6
    </label>
    <input
      type="text"
      name="6"
      id="6"
      value={formData[6]}
      onChange={handleChange}
      className="mt-1 p-2 border rounded-md w-full"
    />
  </div>

  {/* Pack 7 */}
  <div>
    <label htmlFor="7" className="block text-sm font-medium text-gray-700">
      Pack 7
    </label>
    <input
      type="text"
      name="7"
      id="7"
      value={formData[7]}
      onChange={handleChange}
      className="mt-1 p-2 border rounded-md w-full"
    />
  </div>

  {/* Pack 8 */}
  <div>
    <label htmlFor="8" className="block text-sm font-medium text-gray-700">
      Pack 8
    </label>
    <input
      type="text"
      name="8"
      id="8"
      value={formData[8]}
      onChange={handleChange}
      className="mt-1 p-2 border rounded-md w-full"
    />
  </div>

  {/* Pack 9 */}
  <div>
    <label htmlFor="9" className="block text-sm font-medium text-gray-700">
      Pack 9
    </label>
    <input
      type="text"
      name="9"
      id="9"
      value={formData[9]}
      onChange={handleChange}
      className="mt-1 p-2 border rounded-md w-full"
    />
  </div>

  {/* Pack 10 */}
  <div>
    <label htmlFor="10" className="block text-sm font-medium text-gray-700">
      Pack 10
    </label>
    <input
      type="text"
      name="10"
      id="10"
      value={formData[10]}
      onChange={handleChange}
      className="mt-1 p-2 border rounded-md w-full"
    />
  </div>

  {/* Pack 11 */}
  <div>
    <label htmlFor="11" className="block text-sm font-medium text-gray-700">
      Pack 11
    </label>
    <input
      type="text"
      name="11"
      id="11"
      value={formData[11]}
      onChange={handleChange}
      className="mt-1 p-2 border rounded-md w-full"
    />
  </div>

  {/* Pack 12 */}
  <div>
    <label htmlFor="12" className="block text-sm font-medium text-gray-700">
      Pack 12
    </label>
    <input
      type="text"
      name="12"
      id="12"
      value={formData[12]}
      onChange={handleChange}
      className="mt-1 p-2 border rounded-md w-full"
    />
  </div>

  {/* Pack 13 */}
  <div>
    <label htmlFor="13" className="block text-sm font-medium text-gray-700">
      Pack 13
    </label>
    <input
      type="text"
      name="13"
      id="13"
      value={formData[13]}
      onChange={handleChange}
      className="mt-1 p-2 border rounded-md w-full"
    />
  </div>

  {/* Pack 14 */}
  <div>
    <label htmlFor="14" className="block text-sm font-medium text-gray-700">
      Pack 14
    </label>
    <input
      type="text"
      name="14"
      id="14"
      value={formData[14]}
      onChange={handleChange}
      className="mt-1 p-2 border rounded-md w-full"
    />
  </div>

  {/* Pack 15 */}
  <div>
    <label htmlFor="15" className="block text-sm font-medium text-gray-700">
      Pack 15
    </label>
    <input
      type="text"
      name="15"
      id="15"
      value={formData[15]}
      onChange={handleChange}
      className="mt-1 p-2 border rounded-md w-full"
    />
  </div>

  {/* Pack 16 */}
  <div>
    <label htmlFor="16" className="block text-sm font-medium text-gray-700">
      Pack 16
    </label>
    <input
      type="text"
      name="16"
      id="16"
      value={formData[16]}
      onChange={handleChange}
      className="mt-1 p-2 border rounded-md w-full"
    />
  </div>
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
              {specialTourId ? "Update FixedItinerary" : "Create FixedItinerary"} 
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

export default SpecialItineraryForm;
