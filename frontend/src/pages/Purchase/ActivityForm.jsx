import React, { useState,useEffect } from 'react'
import { BASE_URL } from '../../config';
import Select from 'react-select'
import { toast } from 'react-toastify';

const customStyles = {
  menuList: (provided) => ({
    ...provided,
    maxHeight: 120, // Max height of 120px to show approximately 3 options
    overflowY: "auto", // Enable vertical scrolling
  }),
};

const ActivityForm = ({onNext, activityId}) => {
  const initialFormData = {
    destinationName: null,
    destinationId: null,
    tripName: null,
    tripNameId: null,
    activityName:'',
    activityDescription:'',
    pricePerHead:''
  };
  const [formData,setFormData] = useState(initialFormData)
  const [destinations, setDestinations] = useState([])
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState({
    destinations: false,
    trips: false,
  })

  useEffect(() => {
    if (activityId) {
      const fetchActivity = async () => {
        try {
          const response = await fetch(
            `${BASE_URL}/purchaser/activity/${activityId}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch activity details");
          }
          const data = await response.json();
          setFormData(data);
        } catch (error) {
          console.error("Failed to fetch activity details:", error);
          toast.error("Failed to fetch activity details");
        }
      };

      fetchActivity();
    } else {
      // Reset form data if no accommodationId is provided
      setFormData(initialFormData);
    }
  }, [activityId]);
  console.log(formData,'formData after fetching activity using id')

  const handleSelectChange = (selectedOption, field) => {
    setFormData((prev) => {
      if (field === "destinationName") {
        // Clear tripName when a new destination is selected
        return { ...prev, 
          destinationName:selectedOption,
          destinationId:selectedOption._id
          , tripName: null };
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
    setFormData((prevData) => ({ ...prevData, [name]: value }));
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
  const handleDestinationNameFocus =()=>{
    if(destinations.length === 0){
      fetchDestinations();
    }
  }
  // Function to fetch trips based on selected destination and purchaserId
  const fetchTrips = async (destinationName) => {
   
    setTrips([]);
    setFormData((prevData) => ({
      ...prevData,
      tripName: null, // Reset tripName in formData
    }));

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
  const handleTripNameFocus = () => {
    if (!formData.destinationName) {
      toast.error("Please select a destination first");
      return;
    }
    fetchTrips(formData.destinationName);
  };
  useEffect(() => {
    if (formData.destinationName  && !activityId) {
      fetchTrips(formData.destinationName);
    }
  }, [formData.destinationName]);
  

  const handleAddOrUpdateActivity = async () => {
    // Basic validation to ensure required fields are filled
    if (!formData.destinationName || !formData.tripName || !formData.activityName || !formData.pricePerHead) {
      toast.error("Please fill in all required fields.");
      return;
    }
  
    // Validate that pricePerHead is greater than zero
    if (formData.pricePerHead <= 0) {
      toast.error("Price per head must be positive.");
      return;
    }
  
    // Get purchaser ID from local storage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const purchaserId = storedUser?._id;
  
    if (!purchaserId) {
      toast.error("Purchaser information is missing. Please log in again.");
      return;
    }
  
    // Prepare data for the API call
    const { destinationId, tripNameId } = formData;
    const activityData = {
      purchaserId,
      destinationName: formData.destinationName.value, // Only pass the value of the selected option
      destinationId,
      tripName: formData.tripName.value, // Only pass the value of the selected option
      tripNameId,
      activityName: formData.activityName,
      activityDescription: formData.activityDescription,
      pricePerHead: formData.pricePerHead,
    };
  
    try {
      // If activityId is present, update the existing activity
      if (activityId) {
        const response = await fetch(`${BASE_URL}/purchaser/updateActivity/${activityId}`, {
          method: 'PUT',  // Use the PUT method for updates
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(activityData),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update the activity");
        }
  
        toast.success("Activity updated successfully!");
         // Optional: Clear form fields or reset state
      setFormData(initialFormData);
      setDestinations([]);
      setTrips([]);
  
      } else {
        // If no activityId, create a new activity
        const response = await fetch(`${BASE_URL}/purchaser/addActivity`, {
          method: 'POST', // Use the POST method to add a new activity
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(activityData),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to add the activity");
        }
  
        toast.success("Activity added successfully!");
      }
  
      // Optional: Clear form fields or reset state
      setFormData(initialFormData);
      setDestinations([]);
      setTrips([]);
  
    } catch (error) {
      console.error("Error saving activity:", error);
      toast.error(error.message || "An error occurred while saving the activity.");
    }
  };
  
  


  return (
   <div className="w-full  p-4 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-2xl mt-1">
    <div
        className="overflow-y-auto" // Enable vertical scrolling
        style={{ maxHeight: "420px",
        scrollbarWidth: "none", // For Firefox
        msOverflowStyle: "none", // For IE/Edge
        }} // Set max height to 170px
      >
      {/* Select Destination */ }
      <div className='w-full mt-4'>
       <Select
        name='destinationName'
        value={FormData.destinationName}
        onChange={(option) => handleSelectChange(option,'destinationName')}
        options={destinations}
        isLoading={loading.destinations}
        placeholder={activityId && formData.destinationName ? formData.destinationName.label : 'Select Destination'}
        classNamePrefix='react-select'
        className='w-full'
        onFocus={handleDestinationNameFocus}
        styles={customStyles}
        isDisabled={!!activityId}
       />
      </div>
      {/* select Trip */}
      <div className='w-full mt-4'>
      <Select
        name='tripName'
        value={formData.tripName}
        onChange={(option) => handleSelectChange(option, 'tripName')}
        options={trips}
        isLoading={loading.trips}
        placeholder='Select Trip'
        classNamePrefix='react-select'
        className='w-full'
        onFocus={handleTripNameFocus}
        styles={customStyles}
        isDisabled={!!activityId}
      />

      </div>
      {/* Activity Name */}
      <div className='w-full mt-4'>
      <input
        type='text'
        name='activityName'
        value={formData.activityName}
        onChange={handleInputChange}
        placeholder='Activity Name'
        className='w-full p-2 border border-gray-300 rounded-md'
        
      />

      </div>
      {/* Activity Description */}
      <div className='w-full mt-4'>
      <textarea
        name='activityDescription'
        value={formData.activityDescription}
        onChange={handleInputChange}
        placeholder='Activity Description'
        className='w-full p-2 border border-gray-300 rounded-md'
        rows={4}
        // disabled={!!activityId}
      />

      </div>
      {/* Price Per Head */}
      <div className='w-full mt-4'>
      <input
      type='number'
      name='pricePerHead'
      value={formData.pricePerHead}
      onChange={handleInputChange}
      placeholder='Price Per Head'
      className='w-full p-2 border border-gray-300 rounded-md'

      />
      </div>
      {/* Add Activity Button */}
      <div className='mt-4 flex justify-center'>
      <button
      type='button'
      onClick={handleAddOrUpdateActivity}
      className='py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600'
      >
      {activityId ? "Update Activity" : "Add Activity"}{" "}

      </button>

      </div>
      {/* switch button */}
      <div className='mt-4 flex justify-center'>
      <button
      type='button'
      onClick={onNext}
      className='px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors'
      >
       Switch
      </button>

      </div>
    </div>
    </div>
  )
}

export default ActivityForm