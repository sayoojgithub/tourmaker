import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";

const customStyles = {
  menuList: (provided) => ({
    ...provided,
    maxHeight: 120, // Max height of 120px to show approximately 3 options
    overflowY: "auto", // Enable vertical scrolling
  }),
};

const AddOnTripForm = ({ onNext, tripId }) => {
  const initialFormData = {
    destinationId: null,
    destinationName: null,
    tripNameId: null,
    tripName: null,
    addOnTripName: "",
    addOnTripDescription: "",
    selectedAgency: null,
    selectedCategory: null,
    selectedVehicle: null,
    selectedVehicleId: null,
    price: "",
    travelsDetails: [],
  };
  const [formData, setFormData] = useState(initialFormData);
  const [destinations, setDestinations] = useState([]);
  const [trips, setTrips] = useState([]);
  const [travelAgencies, setTravelAgencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [loading, setLoading] = useState({
    destinations: false,
    trips: false,
    agencies: false,
    vehicles: false,
    categories: false,
  });
  const isEditing = Boolean(tripId); // Check if tripId exists to determine if we're editing

  const [filterTravelsName, setFilterTravelsName] = useState("");
  const [filterVehicleName, setFilterVehicleName] = useState("");

  useEffect(() => {
    if (tripId) {
      const fetchAddOnTripDetails = async () => {
        try {
          const response = await fetch(
            `${BASE_URL}/purchaser/addOnTrip/${tripId}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch trip details");
          }
          const data = await response.json();
          setFormData(data);
        } catch (error) {
          console.error("Failed to fetch AddOnTrip details:", error);
          toast.error("Failed to fetch AddOnTrip details");
        }
      };

      fetchAddOnTripDetails();
    } else {
      // Reset form data if no tripId is provided
      setFormData(initialFormData);
    }
  }, [tripId]);
  console.log(formData, "formData after tripId");

  // const filteredTravelsDetails = formData.travelsDetails
  // .map((detail, index) => ({ ...detail, originalIndex: index }))  // Add original index
  // .filter((detail) => {
  //   const travelsNameMatch = detail.travelsName.label
  //     .toLowerCase()
  //     .includes(filterTravelsName.toLowerCase());
  //   const vehicleNameMatch = detail.vehicleName.label
  //     .toLowerCase()
  //     .includes(filterVehicleName.toLowerCase());
  //   return travelsNameMatch && vehicleNameMatch;
  // });

  const handleSelectChange = (selectedOption, field) => {
    setFormData((prev) => {
      if (field === "destinationName") {
        // Clear tripName when a new destination is selected
        return { ...prev, 
          destinationName:selectedOption,
          destinationId:selectedOption._id
          , tripName: null };
      }
      // Store value in selectedVehicle and id in selectedVehicleId
      if (field === "selectedVehicle") {
        return {
          ...prev,
          selectedVehicle: selectedOption, // Store vehicle name
          selectedVehicleId: selectedOption.id, // Store vehicle ID
        };
      }
      if (field === "tripName") {
        return {
          ...prev,
          tripName: selectedOption,
          tripNameId: selectedOption._id, 
        };
      }

      return { ...prev, [field]: selectedOption };
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // const handlePriceChange = (filteredIndex, value) => {
  //   // Get the original index from the filtered list item
  //   const originalIndex = filteredTravelsDetails[filteredIndex].originalIndex;

  //   // Create a copy of the travelsDetails array
  //   const updatedTravelsDetails = [...formData.travelsDetails];

  //   if (originalIndex !== -1) {
  //     // Update the price in the original travelsDetails array
  //     updatedTravelsDetails[originalIndex].price = value;

  //     // Update formData with the modified travelsDetails
  //     setFormData({
  //       ...formData,
  //       travelsDetails: updatedTravelsDetails,
  //     });
  //   }
  // };
  const getFilteredTravelsDetails = () => {
    return formData.travelsDetails
      .map((detail, index) => ({ ...detail, originalIndex: index })) // Add original index
      .filter((detail) => {
        const travelsNameMatch = detail.travelsName.label
          .toLowerCase()
          .includes(filterTravelsName.toLowerCase());
        const vehicleNameMatch = detail.vehicleName.label
          .toLowerCase()
          .includes(filterVehicleName.toLowerCase());
        return travelsNameMatch && vehicleNameMatch;
      });
  };

  // Get filtered travels details
  const filteredTravelsDetails = getFilteredTravelsDetails();

  // Function to handle price changes
  const handlePriceChange = (filteredIndex, value) => {
    // Get the original index from the filtered travelsDetails
    const originalIndex = filteredTravelsDetails[filteredIndex].originalIndex;

    // Create a copy of the original travelsDetails array
    const updatedTravelsDetails = [...formData.travelsDetails];

    // Update the price in the original travelsDetails array
    if (originalIndex >= 0 && originalIndex < updatedTravelsDetails.length) {
      updatedTravelsDetails[originalIndex].price = value; // Update price
    }

    // Update formData with the modified travelsDetails
    setFormData({
      ...formData,
      travelsDetails: updatedTravelsDetails,
    });
  };

  // Function to handle vehicle removal
  const handleRemoveVehicle = (filteredIndex) => {
    // Get the original index from the filtered list item
    const originalIndex = filteredTravelsDetails[filteredIndex].originalIndex;

    // Create a copy of the original travelsDetails array
    const updatedTravelsDetails = [...formData.travelsDetails];

    // Check if the originalIndex is valid
    if (originalIndex >= 0 && originalIndex < updatedTravelsDetails.length) {
      // Remove the vehicle based on the original index
      updatedTravelsDetails.splice(originalIndex, 1); // Remove the vehicle from travelsDetails
    }

    // Update formData with the modified travelsDetails
    setFormData({
      ...formData,
      travelsDetails: updatedTravelsDetails,
    });
  };

  // Function to fetch destinations from the backend
  const fetchDestinations = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`${BASE_URL}/purchaser/getDestinationsName?companyId=${storedUser.companyId}`);
      if (!response.ok) {
        // Get the error message from the response
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
      setLoading((prevLoading) => ({ ...prevLoading, destinations: false }));
    } catch (error) {
      console.error("Failed to fetch destinations:", error);
      toast.error(
        error.message || "An error occurred while fetching destinations"
      );
    }
  };
  // Function to fetch trips based on selected destination and purchaserId
  const fetchTrips = async (destinationName) => {
    // setLoading((prev) => ({ ...prev, trips: true }));
    setTrips([]);

    try {
      // Get purchaser ID from localStorage
      const purchaserId = JSON.parse(localStorage.getItem("user"))._id;

      // API call with destinationName and purchaserId as query parameters
      const response = await fetch(
        `${BASE_URL}/purchaser/tripsName?destination=${destinationName.value}&purchaserId=${purchaserId}`
      );

      if (!response.ok) {
        // Get the error message from the response
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch trips");
      }

      const data = await response.json();
      const options = data.map((trip) => ({
        _id: trip._id,
        value: trip.value,
        label: trip.label,
      }));

      setTrips(options);
    } catch (error) {
      console.error("Failed to fetch trips:", error);
      toast.error(error.message || "An error occurred while fetching trips");
    } finally {
      setLoading((prevLoading) => ({ ...prevLoading, trips: false }));
    }
  };
  const fetchTravelAgencies = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const purchaserId = user._id;
      if (!formData.destinationName) {
        toast.error("Please select a destination first");
        return;
      }
      setTravelAgencies([]);
      setFormData((prevFormData) => ({
        ...prevFormData,
        selectedAgency: null,
      }));
      const response = await fetch(
        `${BASE_URL}/purchaser/getTravelAgenciesName?purchaserId=${purchaserId}&destinationName=${encodeURIComponent(
          formData.destinationName.value
        )}`
      );
      if (!response.ok) {
        // Get the error message from the response
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch agencies");
      }
      const data = await response.json();
      const options = data.map((travelagency) => ({
        id:travelagency.id,
        value: travelagency.value,
        label: travelagency.label,
      }));
      setTravelAgencies(options);
      setLoading((prevLoading) => ({ ...prevLoading, agencies: false }));
    } catch (error) {
      console.error("Failed to fetch travelagencies:", error);
      toast.error(error.message || "An error occurred while fetching agencies");
    }
  };
  useEffect(() => {
    if (formData.destinationName && !tripId) {
      // Reset related fields and arrays when destinationName changes
      setFormData((prevFormData) => ({
        ...prevFormData,
        selectedAgency: null,
        selectedCategory: null,
        selectedVehicle: null,
        travelsDetails: [],
      }));
      setTravelAgencies([]); // Reset travel agencies
      setCategories([]); // Reset categories
      setVehicles([]); // Reset vehicles

      // Fetch the new travel agencies after resetting
      fetchTravelAgencies();
    }
  }, [formData.destinationName]);

  const fetchVehicleCategories = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const purchaserId = user._id;

      if (!formData.selectedAgency) {
        toast.error("Please select a travel agency first");
        return;
      }

      // Clear previous vehicle categories and reset selected category
      setCategories([]);
      setFormData((prevFormData) => ({
        ...prevFormData,
        selectedCategory: null,
      }));

      const response = await fetch(
       `${BASE_URL}/purchaser/getVehicleCategories?purchaserId=${purchaserId}&agencyId=${formData.selectedAgency.id}`
      );

      if (!response.ok) {
        // Get the error message from the response
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch vehicle categories"
        );
      }

      const data = await response.json();
      const options = data.map((category) => ({
        value: category.value,
        label: category.label,
      }));

      setCategories(options);
      setLoading((prevLoading) => ({ ...prevLoading, vehicles: false }));
    } catch (error) {
      console.error("Failed to fetch vehicle categories:", error);
      toast.error(
        error.message || "An error occurred while fetching vehicle categories"
      );
    }
  };
  useEffect(() => {
    if (formData.selectedAgency) {
      fetchVehicleCategories();
    }
  }, [formData.selectedAgency]);

  const fetchVehicles = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const purchaserId = user?._id;

      if (!purchaserId) {
        toast.error("User not found. Please log in.");
        return;
      }

      if (!formData.selectedCategory) {
        toast.error("Please select a vehicle category first.");
        return;
      }

      // Clear previous vehicle data
      setVehicles([]); // Assuming you're storing vehicles in a `vehicles` state
      setFormData((prevFormData) => ({
        ...prevFormData,
        selectedVehicle: null,
      })); // Reset selected vehicle if needed

      // Make the backend API call
      const response = await fetch(
        `${BASE_URL}/purchaser/getVehicles?purchaserId=${purchaserId}&agencyId=${formData.selectedAgency.id}&vehicleCategory=${encodeURIComponent(formData.selectedCategory.value)}`

      );

      // Check if the response is okay
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch vehicles");
      }

      // Extract and map vehicle options
      const data = await response.json();

      const options = data.map((vehicle) => ({
        value: vehicle.value, // Assuming vehicle.value contains the identifier
        label: vehicle.label, // Assuming vehicle.label contains the name/description
        id: vehicle.id,
      }));

      // Update state with fetched vehicle options
      setVehicles(options);
      setLoading((prevLoading) => ({ ...prevLoading, vehicles: false }));
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast.error(
        error.message || "An error occurred while fetching vehicles."
      );
    }
  };

  useEffect(() => {
    if (formData.selectedCategory) {
      fetchVehicles();
    }
  }, [formData.selectedCategory]);

  const handleDestinationNameFocus = () => {
    if (destinations.length === 0) {
      // Fetch only if not already fetched
      fetchDestinations();
    }
  };

  const handleTripNameFocus = () => {
    if (!formData.destinationName) {
      toast.error("Please select a destination first");
      return;
    }
    fetchTrips(formData.destinationName);
  };
  useEffect(() => {
    if (formData.destinationName) {
      fetchTrips(formData.destinationName);
    }
  }, [formData.destinationName]);
  const handleTravelAgencyFocus = () => {
    if (!formData.destinationName) {
      toast.error("Please select a destination first");
      return;
    }

    if (travelAgencies.length === 0 && formData.destinationName) {
      // Fetch travel agencies only if not already fetched
      fetchTravelAgencies();
    }
  };
  const handleVehicleCategoryFocus = () => {
    if (categories.length === 0) {
      // Fetch only if not already fetched
      fetchVehicleCategories();
    }
  };
  const handleVehicleNameFocus = () => {
    if (vehicles.length === 0) {
      fetchVehicles();
    }
  };

  const handleAddTravelDetail = () => {
    const {
      selectedAgency,
      selectedCategory,
      selectedVehicle,
      selectedVehicleId,
      price,
    } = formData;
    if (!selectedAgency || !selectedCategory || !selectedVehicle || !price) {
      toast.error("Please fill out all travel details.");
      return;
    }
    if (Number(price) <= 0) {
      toast.error("Price must be greater than zero.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      travelsDetails: [
        ...prev.travelsDetails,
        {
          travelsName: selectedAgency,
          vehicleCategory: selectedCategory,
          vehicleName: selectedVehicle,
          vehicleId: selectedVehicleId,
          price: price,
        },
      ],
      selectedAgency: null,
      selectedCategory: null,
      selectedVehicle: null,
      price: "",
    }));
  };
  const handleAddTrip = async () => {
    const {
      destinationName,
      destinationId,
      tripName,
      tripNameId,
      addOnTripName,
      addOnTripDescription,
      travelsDetails,
    } = formData;

    if (
      !destinationName ||
      !tripName ||
      !addOnTripName ||
      !addOnTripDescription ||
      travelsDetails.length === 0
    ) {
      toast.error("Please fill out all fields before adding the trip.");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const purchaserId = user?._id;

      if (!purchaserId) {
        toast.error("User not found. Please log in.");
        return;
      }

      if (tripId) {
        // Validate that all prices are positive
        const invalidPrice = travelsDetails.some((detail) => detail.price <= 0);

        if (invalidPrice) {
          toast.error("All prices must be positive.");
          return;
        }
        // Update existing trip
        const response = await fetch(
          `${BASE_URL}/purchaser/updateAddOnTrip/${tripId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              addOnTripName,
              addOnTripDescription,
              travelsDetails: travelsDetails.map((detail) => ({
                ...(detail._id && { _id: detail._id }), // Include _id if present
                travelsName: detail.travelsName.label,
                vehicleCategory: detail.vehicleCategory.label,
                vehicleName: detail.vehicleName.label,
                vehicleId: detail.vehicleId,
                price: detail.price,
              })),
            }),
          }
        );

        const data = await response.json();
        if (response.ok) {
          toast.success("Trip updated successfully.");
          onNext(); // Call the onNext function after a successful update
        } else {
          toast.error(data.message);
        }
      } else {
        // Add new trip
        const response = await fetch(`${BASE_URL}/purchaser/addAddOnTrip`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            destinationName: destinationName.label,
            destinationId,
            tripName: tripName.label,
            tripNameId,
            addOnTripName,
            addOnTripDescription,
            travelsDetails: travelsDetails.map((detail) => ({
              travelsName: detail.travelsName.label,
              vehicleCategory: detail.vehicleCategory.label,
              vehicleName: detail.vehicleName.label,
              vehicleId: detail.vehicleId,
              price: detail.price,
            })),
            purchaserId,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          toast.success(data.message);
          setTrips((prevTrips) => [...prevTrips, data.trip]);
          setFormData({
            destinationName: null,
            tripName: "",
            addOnTripName: "",
            addOnTripDescription: "",
            travelsDetails: [],
            selectedAgency: null,
            selectedCategory: null,
            selectedVehicle: null,
            price: "",
          });
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.error("Error adding/updating trip:", error);
      toast.error("An error occurred while processing the trip.");
    }
  };

  return (
     <div className="w-full  p-4 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-2xl mt-1">
     <div
        className="overflow-y-auto" // Enable vertical scrolling
        style={{ maxHeight: "470px",
        scrollbarWidth: "none", // For Firefox
        msOverflowStyle: "none", // For IE/Edge
        }} // Set max height to 170px
      >
      {/*Select Destination */}
      <div className="w-full mt-4">
        <Select
          name="destinationName"
          value={formData.destinationName}
          onChange={(option) => handleSelectChange(option, "destinationName")}
          options={destinations}
          isLoading={loading.destinations}
          placeholder="Select Destination"
          classNamePrefix="react-select"
          className="w-full"
          onFocus={handleDestinationNameFocus}
          styles={customStyles}
          isDisabled={!!tripId}
        />
      </div>
      {/* select trip */}
      <div className="w-full mt-4">
        <Select
          name="tripName"
          value={formData.tripName}
          onChange={(option) => handleSelectChange(option, "tripName")}
          options={trips}
          isLoading={loading.trips}
          placeholder="Select Trip"
          classNamePrefix="react-select"
          className="w-full"
          onFocus={handleTripNameFocus}
          styles={customStyles}
          isDisabled={!!tripId}
        />
      </div>
      {/* AddOnTrip Name*/}
      <div className="w-full mt-4">
        <input
          type="text"
          name="addOnTripName"
          value={formData.addOnTripName}
          onChange={handleInputChange}
          placeholder="Add-On Trip Name"
          className="w-full p-2 border border-gray-300 rounded-md"
          // disabled={!!tripId}
        />
      </div>
      {/*AddOnTrip Name Description*/}
      <div className="w-full mt-4">
        <textarea
          name="addOnTripDescription"
          value={formData.addOnTripDescription}
          onChange={handleInputChange}
          placeholder="Add-On Trip Description"
          className="w-full p-2 border border-gray-300 rounded-md"
          rows="4"
          //disabled={!!tripId}
        />
      </div>
      {/* Add Travel Details Section */}
      <div className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Select Travel Agency*/}
          <div className="w-full">
            <Select
              name="selectedAgency"
              value={formData.selectedAgency}
              onChange={(option) =>
                handleSelectChange(option, "selectedAgency")
              }
              options={formData.destinationName ? travelAgencies : []}
              isLoading={loading.agencies}
              placeholder="Agency"
              classNamePrefix="react-select"
              className="w-full"
              styles={customStyles}
              onFocus={handleTravelAgencyFocus}
            />
          </div>
          {/* Select Vehicle Category */}
          <div className="w-full">
            <Select
              name="selectedCategory"
              value={formData.selectedCategory}
              onChange={(option) =>
                handleSelectChange(option, "selectedCategory")
              }
              options={formData.selectedAgency ? categories : []}
              isLoading={loading.categories}
              placeholder="Category"
              classNamePrefix="react-select"
              className="w-full"
              styles={customStyles}
              onFocus={handleVehicleCategoryFocus}
            />
          </div>
          {/* Select Vehicle */}
          <div className="w-full">
            <Select
              name="selectedVehicle"
              value={formData.selectedVehicle}
              onChange={(option) =>
                handleSelectChange(option, "selectedVehicle")
              }
              options={formData.selectedCategory ? vehicles : []}
              isLoading={loading.vehicles}
              placeholder="Vehicle"
              classNamePrefix="react-select"
              className="w-full"
              styles={customStyles}
              onFocus={handleVehicleNameFocus}
            />
          </div>
          {/* Price input and + button */}
          <div className="flex space-x-2 w-full">
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Price"
              className="w-full p-2 border border-gray-300 rounded-md"
            />

            {/* + Button */}
            <button
              type="button"
              onClick={handleAddTravelDetail}
              className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              +
            </button>
          </div>
        </div>
      </div>
      {/* Display Travel Details */}
      <div className="mt-6">
        {/* Filter Inputs */}
        {tripId && (
          <div className="flex space-x-4 mb-4">
            <input
              type="text"
              placeholder="Filter by Travels Name"
              value={filterTravelsName}
              onChange={(e) => setFilterTravelsName(e.target.value)}
              className="p-2 border border-gray-300 rounded-md w-full"
            />
            <input
              type="text"
              placeholder="Filter by Vehicle Name"
              value={filterVehicleName}
              onChange={(e) => setFilterVehicleName(e.target.value)}
              className="p-2 border border-gray-300 rounded-md w-full"
            />
          </div>
        )}

        {filteredTravelsDetails.length > 0 && (
          <div className="max-h-20 overflow-y-auto border border-gray-300 rounded-md p-2">
            {filteredTravelsDetails.map((detail, index) => (
              <div
                key={detail._id} // Ensure to use a unique key
                className="flex justify-between items-center p-2 border-b border-gray-800"
              >
                <div>
                  <p className="font-semibold">
                    {detail.travelsName.label} - {detail.vehicleName.label}
                  </p>
                  <p className="text-sm text-gray-500">
                    {detail.vehicleCategory.label}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Editable Price Field */}
                  <input
                    type="number"
                    value={detail.price}
                    onChange={(e) => handlePriceChange(index, e.target.value)}
                    className="w-20 p-1 border border-gray-300 rounded-md"
                  />

                  {/* Remove Vehicle Button */}
                  <button
                    onClick={() => handleRemoveVehicle(index)}
                    className="bg-red-600 text-white font-bold rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-800"
                  >
                    x
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Create or Update Trip Button */}
      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={handleAddTrip}
          className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          {isEditing ? "Update Trip" : "Create Trip"}
        </button>
      </div>
      {/* Switch Button (Optional) */}
      <div className="flex justify-center mt-4">
        <button
          type="button"
          onClick={onNext}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Switch
        </button>
      </div>
    </div>
    </div>
  );
};

export default AddOnTripForm;
