import React, { useState, useEffect } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";

const customStyles = {
  menuList: (provided) => ({
    ...provided,
    maxHeight: 120,
    overflowY: "auto",
  }),
};

const Itinerary = ({ selectedClientId, numberOfDays, gotoConfirmed }) => {
  const [days, setDays] = useState(
    Array.from({ length: numberOfDays }, (_, index) => ({
      value: index + 1,
      label: `Day ${index + 1}`,
    }))
  );
  console.log(selectedClientId, days);
  const [formData, setFormData] = useState({
    day: null,
    destination: null,
    tripsWithVehicles: [],
    roomCategory: null,
    roomName: null,
    roomPriceType: null,
    totalPrice: 0, // New field to track total price
  });
  console.log(formData);

  const [destinations, setDestinations] = useState([]);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [availableActivities, setAvailableActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [addOnTrips, setAddOnTrips] = useState([]);
  const [selectedAddOnTrip, setSelectedAddOnTrip] = useState(null);
  const [availableAddOnVehicles, setAvailableAddOnVehicles] = useState([]);
  const [availableAccommodations, setAvailableAccommodations] = useState([]);
  const [roomPrices, setRoomPrices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const roomCategories = [
    { value: "budget", label: "Budget" },
    { value: "standard", label: "Standard" },
    { value: "deluxe", label: "Deluxe" },
    { value: "3_star", label: "3 Star" },
    { value: "4_star", label: "4 Star" },
    { value: "5_star", label: "5 Star" },
    { value: "tent_stay", label: "Tent Stay" },
    { value: "home_stay", label: "Home Stay" },
    { value: "apartment", label: "Apartment" },
    { value: "house_boat", label: "House Boat" },
  ];

  const fetchDestinations = async () => {
    try {
      setAvailableVehicles([]);
      setAddOnTrips([]);
      setAvailableAddOnVehicles([]);
      setAvailableActivities([]);
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

  const fetchTrips = async (destinationId) => {
    try {
      setSelectedTrip(null);
      setSelectedAddOnTrip(null);
      setSelectedActivity(null);
      setAvailableAddOnVehicles([]);
      if (destinationId) {
        // Make an API call to fetch trips based on destinationId
        const response = await fetch(
          `${BASE_URL}/executive/getTripsName/${destinationId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch trips");
        }

        const data = await response.json();
        const options = data.map((trip) => ({
          value: trip.value, // Ensure 'value' is the trip ID
          label: trip.label, // Ensure 'label' is the trip name
          description: trip.description,
        }));
        setTrips(options);
      } else {
        // If no destination is selected, reset trips
        setTrips([]);
        console.warn("No destination selected or destination ID is missing");
      }
    } catch (error) {
      console.error("Failed to fetch trips:", error);
      toast.error("Failed to fetch trips");
    }
  };

  const fetchVehicles = async (tripId) => {
    try {
      setAvailableVehicles([]);
      if (tripId) {
        // Make an API call to fetch vehicles based on tripId
        const response = await fetch(
          `${BASE_URL}/executive/getVehicles/${tripId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch vehicles");
        }

        const data = await response.json();
        const options = data.map((vehicle) => ({
          value: vehicle.vehicleId, // Ensure 'value' is the vehicleId
          label: `${vehicle.vehicleCategory} - ${vehicle.vehicleName}`, // Custom label format
          displaylabel: `${vehicle.vehicleCategory} - ${vehicle.vehicleName} - ${vehicle.price}`, // Custom label format
        }));

        setAvailableVehicles(options);
      } else {
        // If no trip is selected, reset vehicles
        setAvailableVehicles([]);
        console.warn("No trip selected or tripId is missing");
      }
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
      toast.error("Failed to fetch vehicles");
    }
  };

  const fetchAddOnTrips = async (tripId) => {
    try {
      setAddOnTrips([]);
      if (tripId) {
        // Make an API call to fetch add-on trips based on tripId
        const response = await fetch(
          `${BASE_URL}/executive/getAddOnTrips/${tripId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch add-on trips");
        }

        const data = await response.json();
        const options = data.map((addOnTrip) => ({
          value: addOnTrip.value, // Ensure 'value' is the add-on trip's ID
          label: addOnTrip.label, // Only show the addOnTripName
          description: addOnTrip.description,
        }));

        setAddOnTrips(options);
      } else {
        // If no trip is selected, reset add-on trips
        setAddOnTrips([]);
        console.warn("No trip selected or tripId is missing");
      }
    } catch (error) {
      console.error("Failed to fetch add-on trips:", error);
      toast.error("No add-on trips");
    }
  };

  const fetchActivities = async (tripId) => {
    try {
      setAvailableActivities([]);
      if (tripId) {
        // Make an API call to fetch activities based on tripId
        const response = await fetch(
          `${BASE_URL}/executive/getActivities/${tripId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch activities");
        }

        const data = await response.json();

        // Set available activities as { value: activity._id, label: activity.activityName }
        const options = data.map((activity) => ({
          value: activity.value, // Activity ID
          label: activity.label, // Activity name
          displaylabel: activity.displaylabel,
          description: activity.description,
        }));

        setAvailableActivities(options); // Set the activities in state
      } else {
        setAvailableActivities([]);
        console.warn("No trip selected or tripId is missing");
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
      toast.error("Failed to fetch activities");
    }
  };

  const fetchAddOnVehicles = async (addOnTrip) => {
    try {
      setAvailableAddOnVehicles([]);
      if (addOnTrip?.value) {
        // Make an API call to fetch vehicles based on addOnTripId
        const response = await fetch(
          `${BASE_URL}/executive/getAddOnVehicles/${addOnTrip.value}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch add-on vehicles");
        }

        const data = await response.json();
        const options = data.map((vehicle) => ({
          value: vehicle.vehicleId, // Using vehicleId as the value
          label: `${vehicle.vehicleCategory} - ${vehicle.vehicleName}`, // Formatting label
          displaylabel: `${vehicle.vehicleCategory} - ${vehicle.vehicleName} - ${vehicle.price}`, // Custom label format
        }));

        setAvailableAddOnVehicles(options);
      } else {
        // Reset vehicles if no add-on trip is selected
        setAvailableAddOnVehicles([]);
        console.warn("No add-on trip selected or addOnTrip.value is missing");
      }
    } catch (error) {
      console.error("Failed to fetch add-on vehicles:", error);
      toast.error("Failed to fetch add-on vehicles");
    }
  };
  const fetchAccommodations = async (category, destinationId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/executive/accommodations?category=${category}&destinationId=${destinationId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch accommodations");
      }

      const data = await response.json();

      // Check if accommodations exist in the response
      if (data && data.length > 0) {
        const options = data.map((accommodation) => ({
          value: accommodation._id,
          label: accommodation.propertyName,
        }));
        setAvailableAccommodations(options); // Set available accommodations
      } else {
        setAvailableAccommodations([]); // No accommodations found, clear the list
      }
    } catch (error) {
      console.error("Error fetching accommodations:", error);
      setAvailableAccommodations([]); // Clear the list on error
    }
  };
  const fetchSelectedAccommodationDetails = async (accommodationId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/executive/selectedAccommodation/${accommodationId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch accommodation details");
      }

      const accommodationDetails = await response.json();

      // Check if accommodation details were retrieved
      if (accommodationDetails) {
        // Convert the details into a value-label format and filter out invalid entries
        const options = [
          {
            value: "price_2bed_ap",
            label: `2 Bed EP`,
            displaylabel: `2 Bed AP - ${accommodationDetails.price_2bed_ap}`,
          },
          {
            value: "price_2bed_cp",
            label: `2 Bed CP`,
            displaylabel: `2 Bed CP - ${accommodationDetails.price_2bed_cp}`,
          },
          {
            value: "price_2bed_map",
            label: `2 Bed MAP`,
            displaylabel: `2 Bed MAP - ${accommodationDetails.price_2bed_map}`,
          },
          {
            value: "price_3bed_ap",
            label: `3 Bed EP`,
            displaylabel: `3 Bed AP - ${accommodationDetails.price_3bed_ap}`,
          },
          {
            value: "price_3bed_cp",
            label: `3 Bed CP`,
            displaylabel: `3 Bed CP - ${accommodationDetails.price_3bed_cp}`,
          },
          {
            value: "price_3bed_map",
            label: `3 Bed MAP`,
            displaylabel: `3 Bed MAP - ${accommodationDetails.price_3bed_map}`,
          },
          {
            value: "price_extrabed_ap",
            label: "Extra Bed EP",
            displaylabel: `Extra Bed AP - ${accommodationDetails.price_extrabed_ap}`,
          },
          {
            value: "price_extrabed_cp",
            label: "Extra Bed CP",
            displaylabel: `Extra Bed CP - ${accommodationDetails.price_extrabed_cp}`,
          },
          {
            value: "price_extrabed_map",
            label: "Extra Bed MAP",
            displaylabel: `Extra Bed MAP - ${accommodationDetails.price_extrabed_map}`,
          },
          {
            value: "earlyCheckInPrice",
            label: "Early Check-In",
            displaylabel: `Early Check-In - ${accommodationDetails.earlyCheckInPrice}`,
          },
          {
            value: "lateCheckoutPrice",
            label: "Late Checkout",
            displaylabel: `Late Checkout - ${accommodationDetails.lateCheckoutPrice}`,
          },
          {
            value: "freshUpPrice",
            label: "Fresh Up",
            displaylabel: `Fresh Up - ${accommodationDetails.freshUpPrice}`,
          },
          // Add any additional price fields as necessary
        ].filter((option) => accommodationDetails[option.value]); // Filter only valid prices

        setRoomPrices(options); // Set the formatted price options

        // Optionally, show a success message
        toast.success("Accommodation details loaded successfully.");
      } else {
        toast.error("No accommodation details found.");
      }
    } catch (error) {
      console.error("Error fetching accommodation details:", error);
      toast.error("Error fetching accommodation details.");
    }
  };

  const handleSelectChange = (selectedOption, fieldName) => {
    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: selectedOption,
    }));
    if (fieldName === "roomCategory") {
      // Check if the destination is selected
      if (!formData.destination) {
        // Show a toast notification if destination is not selected
        toast.error("Please select a destination first.");
        return;
      }

      // If destination is selected, proceed to make the backend call
      fetchAccommodations(selectedOption.label, formData.destination.value);
    }
    if (fieldName === "roomName") {
      fetchSelectedAccommodationDetails(selectedOption.value); // Using accommodationId
    }
  };
  // const handleDaySelection = (selectedDay) => {
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     day: selectedDay,
  //   }));
  // };

  const handleTripSelection = (selectedTrip) => {
    setSelectedTrip(selectedTrip);

    setFormData((prevData) => {
      // Check if any trip has already been added for the current day
      const tripOnSameDay = prevData.tripsWithVehicles.find(
        (trip) => trip.day === prevData.day
      );

      // If a trip already exists for the day, show an error and prevent adding a new one
      if (tripOnSameDay) {
        toast.error("A trip has already been added for this day!");
        return prevData; // No changes to the state
      }

      // If no trip exists for the current day, add the new trip
      return {
        ...prevData,
        tripsWithVehicles: [
          ...prevData.tripsWithVehicles,
          {
            tripName: selectedTrip,
            vehicles: [],
            addOnTrips: [],
            activities: [],
            hotels: [],
            day: prevData.day,
            destination: prevData.destination,
          },
        ],
      };
    });

    fetchVehicles(selectedTrip.value);
    fetchAddOnTrips(selectedTrip.value);
    fetchActivities(selectedTrip.value);
  };

  const handleActivitySelection = (activity) => {
    if (!selectedTrip) {
      toast.error("Please select a trip first");
      return;
    }
    setSelectedActivity(activity);

    const price = parseFloat(activity.displaylabel.split(" - ").pop()); // Extract price from activity label

    setFormData((prevData) => {
      let newTotalPrice = prevData.totalPrice; // Start with the current total price

      const updatedTrips = prevData.tripsWithVehicles.map((trip) => {
        // Check if the trip name and day match the selected trip and current day
        if (
          trip.tripName.value === selectedTrip.value &&
          trip.day === prevData.day
        ) {
          // Ensure that no activity has been added to this trip for this day
          if (trip.activities.length === 0) {
            newTotalPrice += price; // Add the activity price to the total price
            return {
              ...trip,
              activities: [{ ...activity, count: 1, price }], // Add price to the activity
            };
          } else {
            toast.error(
              "An activity has already been added for this trip on this day!"
            );
          }
        }
        return trip;
      });

      return {
        ...prevData,
        tripsWithVehicles: updatedTrips,
        totalPrice: newTotalPrice, // Update total price
      };
    });
  };

  const handleActivityCountChange = (
    tripName,
    day,
    activityValue,
    newCount
  ) => {
    setFormData((prevData) => {
      let newTotalPrice = prevData.totalPrice; // Start with the current total price

      const updatedTrips = prevData.tripsWithVehicles.map((trip) => {
        if (trip.tripName.value === tripName && trip.day === day) {
          return {
            ...trip,
            activities: trip.activities.map((activity) => {
              if (activity.value === activityValue) {
                // Calculate the difference in price based on the count change
                const priceDifference =
                  (newCount - activity.count) * activity.price;
                newTotalPrice += priceDifference; // Adjust the total price

                return { ...activity, count: Math.max(1, newCount) }; // Update the count
              }
              return activity;
            }),
          };
        }
        return trip;
      });

      return {
        ...prevData,
        tripsWithVehicles: updatedTrips,
        totalPrice: newTotalPrice, // Update the total price
      };
    });
  };

  // Handle vehicle addition and calculate price
  const handleVehicleAddition = (vehicle) => {
    if (!selectedTrip) {
      toast.error("Please select a trip first");
      return;
    }

    const newVehicle = {
      ...vehicle,
      id: Date.now() + Math.random(),
      count: 1, // Initial count is 1
      price: Number(vehicle.displaylabel.split(" - ").pop()) || 0, // Assuming vehicle has a price field
    };

    setFormData((prevData) => {
      let newTotalPrice = prevData.totalPrice;

      const updatedTrips = prevData.tripsWithVehicles.map((trip) => {
        // Check if the trip matches the selected trip and day
        if (
          trip.tripName.value === selectedTrip.value &&
          trip.day === prevData.day
        ) {
          newTotalPrice += newVehicle.price; // Update the total price for the matched trip and day
          return {
            ...trip,
            vehicles: [...trip.vehicles, newVehicle], // Add the unique vehicle
          };
        }
        return trip;
      });

      return {
        ...prevData,
        tripsWithVehicles: updatedTrips,
        totalPrice: newTotalPrice, // Update the total price in the state
      };
    });
  };

  // Handle vehicle count change and adjust price
  const handleVehicleCountChange = (tripName, day, vehicleId, newCount) => {
    setFormData((prevData) => {
      let priceAdjustment = 0;

      const updatedTrips = prevData.tripsWithVehicles.map((trip) => {
        if (trip.tripName.value === tripName && trip.day === day) {
          return {
            ...trip,
            vehicles: trip.vehicles.map((vehicle) => {
              if (vehicle.id === vehicleId) {
                const updatedVehicle = {
                  ...vehicle,
                  count: Math.max(1, newCount),
                }; // Ensure count is at least 1
                const vehicleTotalPrice =
                  updatedVehicle.price * updatedVehicle.count;
                const prevVehicleTotalPrice = vehicle.price * vehicle.count;
                priceAdjustment += vehicleTotalPrice - prevVehicleTotalPrice; // Adjust the price difference

                return updatedVehicle;
              }
              return vehicle;
            }),
          };
        }
        return trip;
      });

      return {
        ...prevData,
        tripsWithVehicles: updatedTrips,
        totalPrice: prevData.totalPrice + priceAdjustment, // Update total price
      };
    });
  };

  const handleAddOnTripSelection = (addOnTrip) => {
    setSelectedAddOnTrip(addOnTrip);

    setFormData((prevData) => {
      // Find the trip that matches the selected trip name and current day
      const updatedTrips = prevData.tripsWithVehicles.map((trip) => {
        if (
          trip.tripName.value === selectedTrip.value &&
          trip.day === prevData.day
        ) {
          // Check if an addon trip has already been added for this trip on this day
          if (trip.addOnTrips.length === 0) {
            // Add the addOnTrip if no addon trip exists
            return {
              ...trip,
              addOnTrips: [{ addOnTripName: addOnTrip, vehicles: [] }],
            };
          } else {
            toast.error(
              "An addon trip has already been added for this trip on this day!"
            );
          }
        }
        return trip;
      });

      return { ...prevData, tripsWithVehicles: updatedTrips };
    });

    fetchAddOnVehicles(addOnTrip);
  };

  const handleAddOnVehicleAddition = (vehicle) => {
    if (!selectedAddOnTrip) {
      toast.error("Please select an Add-on Trip first");
      return;
    }

    const price = parseFloat(vehicle.displaylabel.split(" - ").pop()) || 0; // Extract price
    const newVehicle = {
      ...vehicle,
      id: Date.now() + Math.random(),
      count: 1,
      price,
    }; // Add price to the vehicle

    setFormData((prevData) => {
      let newTotalPrice = prevData.totalPrice;

      const updatedTrips = prevData.tripsWithVehicles.map((trip) => {
        if (
          trip.tripName.value === selectedTrip.value &&
          trip.day === prevData.day
        ) {
          trip.addOnTrips = trip.addOnTrips.map((addOn) => {
            if (addOn.addOnTripName.value === selectedAddOnTrip.value) {
              newTotalPrice += newVehicle.price; // Update the total price only when conditions match
              return { ...addOn, vehicles: [...addOn.vehicles, newVehicle] };
            }
            return addOn;
          });
        }
        return trip;
      });

      return {
        ...prevData,
        tripsWithVehicles: updatedTrips,
        totalPrice: newTotalPrice, // Update the total price in the state
      };
    });
  };

  const handleAddOnVehicleCountChange = (
    tripName,
    day,
    addOnTripName,
    vehicleId,
    newCount
  ) => {
    setFormData((prevData) => {
      let newTotalPrice = prevData.totalPrice; // Start with the current total price

      const updatedTrips = prevData.tripsWithVehicles.map((trip) => {
        if (trip.tripName.value === tripName && trip.day === day) {
          return {
            ...trip,
            addOnTrips: trip.addOnTrips.map((addOn) => {
              if (addOn.addOnTripName.value === addOnTripName) {
                return {
                  ...addOn,
                  vehicles: addOn.vehicles.map((vehicle) => {
                    if (vehicle.id === vehicleId) {
                      // Calculate the difference in price
                      const priceDifference =
                        (newCount - vehicle.count) * vehicle.price;
                      newTotalPrice += priceDifference; // Adjust total price based on the count change

                      return { ...vehicle, count: Math.max(1, newCount) };
                    }
                    return vehicle;
                  }),
                };
              }
              return addOn;
            }),
          };
        }
        return trip;
      });

      return {
        ...prevData,
        tripsWithVehicles: updatedTrips,
        totalPrice: newTotalPrice, // Update total price with the new calculated total
      };
    });
  };

  useEffect(() => {
    // Check if all three fields (roomCategory, roomName, roomPriceType) are filled
    if (formData.roomCategory && formData.roomName && formData.roomPriceType) {
      handleHotelAddition();
    }
  }, [formData.roomCategory, formData.roomName, formData.roomPriceType]); // Depend on these fields

  const handleHotelAddition = () => {
    if (!selectedTrip) {
      toast.error("Please select a trip first");
      return;
    }

    if (
      !formData.roomCategory ||
      !formData.roomName ||
      !formData.roomPriceType
    ) {
      toast.error("Please select room category, name, and price");
      return;
    }

    const uniqueId = `${selectedTrip.value}-${formData.roomCategory}-${
      formData.roomName
    }-${formData.roomPriceType}-${Date.now()}`;

    const price =
      parseFloat(formData.roomPriceType.displaylabel.split("-").pop().trim()) ||
      0;

    setFormData((prevData) => {
      const updatedTrips = prevData.tripsWithVehicles.map((trip) => {
        if (
          trip.tripName.value === selectedTrip.value &&
          trip.day === prevData.day
        ) {
          if (!trip.hotels) {
            trip.hotels = [];
          }

          return {
            ...trip,
            hotels: [
              ...trip.hotels,
              {
                id: uniqueId,
                roomCategory: formData.roomCategory,
                roomName: formData.roomName,
                roomPriceType: formData.roomPriceType,
                count: 1,
                price: price, // Store the extracted price
              },
            ],
          };
        }
        return trip;
      });

      // Update total price
      return {
        ...prevData,
        tripsWithVehicles: updatedTrips,
        totalPrice: prevData.totalPrice + price, // Add the price to the total
      };
    });

    setFormData((prevData) => ({
      ...prevData,
      roomCategory: null,
      roomName: null,
      roomPriceType: null,
    }));
  };

  const handleHotelCountChange = (tripName, day, hotelId, newCount) => {
    setFormData((prevData) => {
      let priceDifference = 0;

      const updatedTrips = prevData.tripsWithVehicles.map((trip) => {
        if (trip.tripName.value === tripName && trip.day === day) {
          return {
            ...trip,
            hotels: trip.hotels.map((hotel) => {
              if (hotel.id === hotelId) {
                const currentPrice = hotel.price * hotel.count;
                const newPrice = hotel.price * newCount;
                priceDifference = newPrice - currentPrice; // Calculate the difference in price
                return { ...hotel, count: newCount }; // Update the hotel count
              }
              return hotel;
            }),
          };
        }
        return trip;
      });

      return {
        ...prevData,
        tripsWithVehicles: updatedTrips,
        totalPrice: prevData.totalPrice + priceDifference, // Update total price
      };
    });
  };

  const handleTripRemoval = (tripName, day) => {
    setFormData((prevData) => {
      // Find the trip you want to remove
      const tripToRemove = prevData.tripsWithVehicles.find(
        (trip) => trip.tripName.value === tripName && trip.day === day
      );

      // If trip not found, return the previous state
      if (!tripToRemove) {
        toast.error("Trip not found!");
        return prevData;
      }

      // Check if any vehicles, addOnTrips, activities, or hotels are present
      if (
        tripToRemove.vehicles.length > 0 ||
        tripToRemove.addOnTrips.length > 0 ||
        tripToRemove.activities.length > 0 ||
        tripToRemove.hotels.length > 0
      ) {
        toast.error(
          "Trip cannot be removed until all vehicles, add-on trips, activities, and hotels are removed!"
        );
        return prevData; // Don't allow removal if arrays are not empty
      }

      // Proceed to remove the trip if all related arrays are empty
      const updatedTrips = prevData.tripsWithVehicles.filter(
        (trip) => !(trip.tripName.value === tripName && trip.day === day)
      );

      toast.success("Trip removed successfully!");

      return {
        ...prevData,
        tripsWithVehicles: updatedTrips,
      };
    });
  };
  const handleActivityRemoval = (tripName, day, activityValue) => {
    setFormData((prevData) => {
      let removedActivityPrice = 0; // Track the price of the removed activity

      const updatedTrips = prevData.tripsWithVehicles.map((trip) => {
        if (trip.tripName.value === tripName && trip.day === day) {
          return {
            ...trip,
            activities: trip.activities.filter((activity) => {
              if (activity.value === activityValue) {
                removedActivityPrice = activity.price * activity.count; // Calculate the total price of the removed activity
                return false; // Remove the activity
              }
              return true;
            }),
          };
        }
        return trip;
      });

      return {
        ...prevData,
        tripsWithVehicles: updatedTrips,
        totalPrice: prevData.totalPrice - removedActivityPrice, // Subtract the activity price from total
      };
    });
  };

  // Handle vehicle removal and subtract its price
  const handleVehicleRemoval = (tripName, day, vehicleId) => {
    setFormData((prevData) => {
      let priceAdjustment = 0;

      const updatedTrips = prevData.tripsWithVehicles.map((trip) => {
        if (trip.tripName.value === tripName && trip.day === day) {
          const updatedVehicles = trip.vehicles.filter((vehicle) => {
            if (vehicle.id === vehicleId) {
              priceAdjustment -= vehicle.price * vehicle.count; // Subtract vehicle price from total
            }
            return vehicle.id !== vehicleId;
          });

          return {
            ...trip,
            vehicles: updatedVehicles,
          };
        }
        return trip;
      });

      return {
        ...prevData,
        tripsWithVehicles: updatedTrips,
        totalPrice: prevData.totalPrice + priceAdjustment, // Update total price
      };
    });
  };

  const handleAddOnRemoval = (tripName, day, addOnTripName) => {
    setFormData((prevData) => {
      let totalPriceReduction = 0;

      const updatedTrips = prevData.tripsWithVehicles.map((trip) => {
        if (trip.tripName.value === tripName && trip.day === day) {
          const updatedAddOnTrips = trip.addOnTrips.filter((addOn) => {
            if (addOn.addOnTripName.value === addOnTripName) {
              // Calculate the total price reduction for this add-on trip's vehicles
              const addOnVehiclesTotal = addOn.vehicles.reduce(
                (sum, vehicle) => {
                  return sum + vehicle.price * vehicle.count;
                },
                0
              );
              totalPriceReduction += addOnVehiclesTotal; // Track the total price reduction
              return false; // Remove the add-on trip
            }
            return true; // Keep other add-on trips
          });

          return { ...trip, addOnTrips: updatedAddOnTrips };
        }
        return trip;
      });

      return {
        ...prevData,
        tripsWithVehicles: updatedTrips,
        totalPrice: prevData.totalPrice - totalPriceReduction, // Subtract the total reduction
      };
    });
  };

  const handleAddOnVehicleRemoval = (
    tripName,
    day,
    addOnTripName,
    vehicleId
  ) => {
    setFormData((prevData) => {
      let removedVehiclePrice = 0; // To track the price of the removed vehicle

      const updatedTrips = prevData.tripsWithVehicles.map((trip) => {
        if (trip.tripName.value === tripName && trip.day === day) {
          return {
            ...trip,
            addOnTrips: trip.addOnTrips.map((addOn) => {
              if (addOn.addOnTripName.value === addOnTripName) {
                return {
                  ...addOn,
                  vehicles: addOn.vehicles.filter((vehicle) => {
                    if (vehicle.id === vehicleId) {
                      removedVehiclePrice = vehicle.price * vehicle.count; // Track the price of the removed vehicle
                      return false;
                    }
                    return true;
                  }),
                };
              }
              return addOn;
            }),
          };
        }
        return trip;
      });

      return {
        ...prevData,
        tripsWithVehicles: updatedTrips,
        totalPrice: prevData.totalPrice - removedVehiclePrice, // Subtract removed vehicle price from total
      };
    });
  };

  const handleHotelRemoval = (tripName, day, hotelId) => {
    setFormData((prevData) => {
      let priceReduction = 0;

      const updatedTrips = prevData.tripsWithVehicles.map((trip) => {
        if (trip.tripName.value === tripName && trip.day === day) {
          const updatedHotels = trip.hotels.filter((hotel) => {
            if (hotel.id === hotelId) {
              priceReduction = hotel.price * hotel.count; // Calculate the reduction in price
            }
            return hotel.id !== hotelId;
          });

          return {
            ...trip,
            hotels: updatedHotels,
          };
        }
        return trip;
      });

      return {
        ...prevData,
        tripsWithVehicles: updatedTrips,
        totalPrice: prevData.totalPrice - priceReduction, // Subtract the price from the total
      };
    });
  };

  const handleDownloadReferral = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const executive = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(
        `${BASE_URL}/executive/customTour/downloadReferralItinerary`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId: selectedClientId,
            formData: formData,
            executiveIdd: executive._id,
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
      a.download = "custom_referral_itinerary.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
      console.log("success");
    } catch (error) {
      console.error("Error downloading itinerary:", error.message);
      alert("Failed to download the itinerary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCustomTracksheet = async () => {
    console.log(formData);
    try {
      const response = await fetch(
        `${BASE_URL}/executive/customTour/downloadCustomTracksheet`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId: selectedClientId,
            formData: formData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download tracksheet");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "custom_tracksheet.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
      console.log("Tracksheet download successful");
    } catch (error) {
      console.error("Error downloading tracksheet:", error.message);
      alert("Failed to download the tracksheet. Please try again.");
    }
  };

  const handleDownloadConfirm = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      // Retrieve executive details from localStorage
      const executive = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(
        `${BASE_URL}/executive/customTour/downloadConfirmItinerary`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId: selectedClientId,
            formData: formData,
            executiveIdd: executive._id, // Send executive _id to backend
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
      a.download = "custom_confirm_itinerary.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
      console.log("success");
      handleDownloadCustomTracksheet();
      gotoConfirmed();
    } catch (error) {
      console.error("Error downloading itinerary:", error.message);
      alert("Failed to download the itinerary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  console.log(formData.tripsWithVehicles);
  return (
    <div className="w-full  p-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg mt-1">
      <div
        className="overflow-y-auto" // Enable vertical scrolling
        style={{
          maxHeight: "400px",
          scrollbarWidth: "none", // For Firefox
          msOverflowStyle: "none", // For IE/Edge
        }} // Set max height to 170px
      >
        {/* <h1 className="text-xl font-bold text-center">Create Itinerary</h1> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
          <div className="w-full">
            <Select
              name="day"
              value={formData.day}
              onChange={(option) => handleSelectChange(option, "day")}
              options={days}
              placeholder="Select Day"
              className="w-full"
              styles={customStyles}
            />
          </div>

          <div className="w-full">
            <Select
              name="destination"
              value={formData.destination}
              onChange={(option) => {
                if (!formData.day) {
                  toast.error(
                    "Please select a day before selecting the destination."
                  );
                  return;
                }
                handleSelectChange(option, "destination");
                fetchTrips(option.value);
              }}
              options={destinations}
              placeholder="Select Destination"
              className="w-full"
              onFocus={fetchDestinations}
              styles={customStyles}
            />
          </div>

          <div className="w-full">
            <Select
              name="trip"
              value={selectedTrip}
              onChange={(option) => handleTripSelection(option)}
              options={trips}
              placeholder="Select Trip"
              className="w-full"
              styles={customStyles}
            />
          </div>

          <div className="w-full">
            <Select
              name="vehicle"
              value={null}
              onChange={(vehicle) => handleVehicleAddition(vehicle)}
              options={availableVehicles}
              placeholder="Select Vehicle"
              className="w-full"
              styles={customStyles}
            />
          </div>

          {/* Add-On Trip Selection */}
          <div className="w-full">
            <Select
              name="addOnTrip"
              value={selectedAddOnTrip}
              onChange={(option) => handleAddOnTripSelection(option)}
              options={addOnTrips}
              placeholder="Select Add-on Trip"
              className="w-full"
              styles={customStyles}
            />
          </div>

          <div className="w-full">
            <Select
              name="addOnVehicle"
              value={null}
              onChange={(vehicle) => handleAddOnVehicleAddition(vehicle)}
              options={availableAddOnVehicles}
              placeholder="Select Add-on Vehicle"
              className="w-full"
              styles={customStyles}
            />
          </div>
          <div className="w-full">
            <Select
              name="activity"
              value={selectedActivity}
              onChange={(activity) => handleActivitySelection(activity)}
              options={availableActivities}
              placeholder="Select Activities"
              className="w-full"
              styles={customStyles}
            />
          </div>
          <div className="w-full">
            <Select
              name="roomCategory"
              value={formData.roomCategory} // Value from formData
              onChange={(option) => handleSelectChange(option, "roomCategory")} // Update formData
              options={roomCategories}
              placeholder="Select Room Category"
              className="w-full"
              styles={customStyles} // Apply custom styles if needed
            />
          </div>
          {/* Room Name Select */}
          <div className="w-full">
            <Select
              name="roomName"
              value={formData.roomName} // Value from formData
              onChange={(option) => handleSelectChange(option, "roomName")} // Update formData
              options={formData.roomCategory ? availableAccommodations : []} // Dynamically update options
              placeholder="Select Room Name"
              className="w-full"
              styles={customStyles} // Apply custom styles if needed
              isDisabled={!formData.roomCategory} // Disable if no room category selected
            />
          </div>
          <div className="w-full mb-4">
            <Select
              name="roomPriceType"
              value={formData.roomPriceType} // Value from formData
              onChange={(option) => handleSelectChange(option, "roomPriceType")} // Update formData
              options={formData.roomName ? roomPrices : []} // Dynamically update price options based on selected room
              placeholder="Select Room Price"
              className="w-full"
              styles={customStyles} // Apply custom styles if needed
              isDisabled={!formData.roomName} // Disable if no room selected
            />
          </div>
        </div>

        <div className="mt-1">
          <h2 className="text-2xl text-center font-semibold text-gray-800 mb-1">
            Itinerary Summary
          </h2>
          {formData.totalPrice > 0 && (
            <div className="flex justify-center">
              <div className="bg-red-600 text-white rounded-full px-4 py-2 text-lg font-bold">
                ₹{formData.totalPrice} {/* Display total vehicle price */}
              </div>
            </div>
          )}

          <div className="max-h-50 overflow-y-auto">
            {formData.tripsWithVehicles.length > 0 ? (
              formData.tripsWithVehicles.map((trip, index) => (
                <div
                  key={index}
                  className="bg-gray-100 rounded-lg p-4 shadow-md mb-6"
                >
                  {/* Display day as a header */}
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Day: {trip.day.label || "Not Selected"}
                  </h3>

                  {/* Display destination from trip */}
                  <div className="mb-2">
                    <strong className="text-gray-700">Destination:</strong>
                    <span className="text-blue-600 ml-2">
                      {trip.destination?.label || "Not Selected"}
                    </span>
                  </div>

                  {/* Trip Details */}
                  <div className="mt-4 bg-white p-3 rounded-md shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <strong className="text-lg text-gray-800">
                        {trip.tripName.label}
                      </strong>
                      <span
                        onClick={() =>
                          handleTripRemoval(trip.tripName.value, trip.day)
                        }
                        className="cursor-pointer text-red-600 text-lg font-bold bg-red-200 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-300 transition"
                      >
                        &times;
                      </span>
                    </div>

                    {/* Vehicles */}
                    <div>
                      <strong className="text-gray-700">Vehicles:</strong>
                      {trip.vehicles.length > 0 ? (
                        trip.vehicles.map((vehicle) => (
                          <div
                            key={vehicle.id}
                            className="flex items-center justify-between mb-2"
                          >
                            <span className="text-blue-600">
                              {vehicle.label}
                            </span>

                            <div className="flex items-center">
                              {/* Input for Vehicle Count */}
                              {/* Decrease Button */}
                              <button
                                onClick={() =>
                                  handleVehicleCountChange(
                                    trip.tripName.value,
                                    trip.day,
                                    vehicle.id,
                                    Math.max(0, vehicle.count - 1) // Prevents negative values
                                  )
                                }
                                className="w-7 h-7 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full transition"
                              >
                                −
                              </button>

                              {/* Display Count (Read-Only Input) */}
                              <input
                                type="text"
                                value={vehicle.count}
                                readOnly
                                className="w-12 text-center font-black border rounded-lg mx-1 bg-gray-100 focus:outline-none"
                              />

                              {/* Increase Button */}
                              <button
                                onClick={() =>
                                  handleVehicleCountChange(
                                    trip.tripName.value,
                                    trip.day,
                                    vehicle.id,
                                    vehicle.count + 1
                                  )
                                }
                                className="w-7 h-7 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full transition"
                              >
                                +
                              </button>

                              {/* Remove Button */}
                              <span
                                onClick={() =>
                                  handleVehicleRemoval(
                                    trip.tripName.value,
                                    trip.day,
                                    vehicle.id
                                  )
                                }
                                className="cursor-pointer text-red-600 text-lg font-bold bg-red-200 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-300 transition ml-1"
                              >
                                &times;
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">
                          No vehicles selected for this trip
                        </p>
                      )}
                    </div>

                    {/* Add-On Trips */}
                    {trip.addOnTrips.length > 0 && (
                      <div>
                        <h4 className="font-semibold mt-2">Add-on Trips:</h4>
                        {trip.addOnTrips.map((addOn, idx) => (
                          <div
                            key={idx}
                            className="mt-2 bg-gray-50 p-2 rounded-md shadow-sm"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-blue-600">
                                {addOn.addOnTripName.label}
                              </span>
                              <span
                                onClick={() =>
                                  handleAddOnRemoval(
                                    trip.tripName.value,
                                    trip.day,
                                    addOn.addOnTripName.value
                                  )
                                }
                                className="cursor-pointer text-red-600 text-lg font-bold bg-red-200 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-300 transition ml-2"
                              >
                                &times;
                              </span>
                            </div>
                            <strong className="text-gray-700">Vehicles:</strong>
                            {addOn.vehicles.length > 0 ? (
                              addOn.vehicles.map((vehicle) => (
                                <div
                                  key={vehicle.id}
                                  className="flex items-center justify-between mb-2"
                                >
                                  <span className="text-blue-600">
                                    {vehicle.label}
                                  </span>

                                  {/* Wrapper for the count input and remove button to place them close */}
                                  <div className="flex items-center space-x-2">
                                    {/* Input for Vehicle Count */}
                                    {/* Decrease Button */}
                                    <button
                                      onClick={() =>
                                        handleAddOnVehicleCountChange(
                                          trip.tripName.value,
                                          trip.day,
                                          addOn.addOnTripName.value,
                                          vehicle.id,
                                          Math.max(0, vehicle.count - 1) // Prevents negative values
                                        )
                                      }
                                      className="w-7 h-7 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full transition"
                                    >
                                      −
                                    </button>

                                    {/* Read-Only Display Count */}
                                    <input
                                      type="text"
                                      value={vehicle.count}
                                      readOnly
                                      className="w-12 text-center font-black border rounded-lg mx-1 bg-gray-100 focus:outline-none"
                                    />

                                    {/* Increase Button */}
                                    <button
                                      onClick={() =>
                                        handleAddOnVehicleCountChange(
                                          trip.tripName.value,
                                          trip.day,
                                          addOn.addOnTripName.value,
                                          vehicle.id,
                                          vehicle.count + 1
                                        )
                                      }
                                      className="w-7 h-7 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full transition"
                                    >
                                      +
                                    </button>

                                    <span
                                      onClick={() =>
                                        handleAddOnVehicleRemoval(
                                          trip.tripName.value,
                                          trip.day,
                                          addOn.addOnTripName.value,
                                          vehicle.id
                                        )
                                      }
                                      className="cursor-pointer text-red-600 text-lg font-bold bg-red-200 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-300 transition"
                                    >
                                      &times;
                                    </span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500">
                                No vehicles selected for this add-on trip
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Activities */}
                    {trip.activities.length > 0 && (
                      <div>
                        <h4 className="font-semibold mt-2">Activities:</h4>
                        {trip.activities.map((activity, aIndex) => (
                          <div
                            key={aIndex}
                            className="flex items-center justify-between mb-2"
                          >
                            <span className="text-blue-600">
                              {activity.label}
                            </span>

                            {/* Input field for activity count */}
                            <div className="flex items-center">
                              {/* Decrease Button */}
                              <button
                                onClick={() =>
                                  handleActivityCountChange(
                                    trip.tripName.value,
                                    trip.day,
                                    activity.value,
                                    Math.max(1, activity.count - 1) // Prevents going below 1
                                  )
                                }
                                className="w-7 h-7 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full transition"
                              >
                                −
                              </button>

                              {/* Read-Only Display Count */}
                              <input
                                type="text"
                                value={activity.count}
                                readOnly
                                className="w-12 text-center font-black border rounded-lg mx-1 bg-gray-100 focus:outline-none"
                              />

                              {/* Increase Button */}
                              <button
                                onClick={() =>
                                  handleActivityCountChange(
                                    trip.tripName.value,
                                    trip.day,
                                    activity.value,
                                    activity.count + 1
                                  )
                                }
                                className="w-7 h-7 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full transition"
                              >
                                +
                              </button>

                              <span
                                onClick={() =>
                                  handleActivityRemoval(
                                    trip.tripName.value,
                                    trip.day,
                                    activity.value
                                  )
                                }
                                className="cursor-pointer text-red-600 text-lg font-bold bg-red-200 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-300 transition ml-1" // Adjusted margin to make it closer to input
                              >
                                &times;
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Hotels */}
                    {trip.hotels?.length > 0 && (
                      <div>
                        <h4 className="font-semibold mt-4">Hotels:</h4>
                        {trip.hotels.map((hotel, hIndex) => (
                          <div
                            key={hotel.id} // Use the unique id here
                            className="mt-2 bg-gray-50 p-2 rounded-md shadow-sm"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-blue-600">
                                {hotel.roomCategory.label} -{" "}
                                {hotel.roomName.label} (
                                {hotel.roomPriceType.label})
                              </span>
                              <div className="flex items-center">
                                {/* Count input */}
                                {/* Decrease Button */}
                                <button
                                  onClick={() =>
                                    handleHotelCountChange(
                                      trip.tripName.value,
                                      trip.day,
                                      hotel.id,
                                      Math.max(1, hotel.count - 1) // Prevents going below 1
                                    )
                                  }
                                  className="w-7 h-7 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full transition"
                                >
                                  −
                                </button>

                                {/* Read-Only Display Count */}
                                <input
                                  type="text"
                                  value={hotel.count}
                                  readOnly
                                  className="w-12 text-center font-black border rounded-lg mx-1 bg-gray-100 focus:outline-none"
                                />

                                {/* Increase Button */}
                                <button
                                  onClick={() =>
                                    handleHotelCountChange(
                                      trip.tripName.value,
                                      trip.day,
                                      hotel.id,
                                      hotel.count + 1
                                    )
                                  }
                                  className="w-7 h-7 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full transition"
                                >
                                  +
                                </button>
                                <span
                                  onClick={() =>
                                    handleHotelRemoval(
                                      trip.tripName.value,
                                      trip.day,
                                      hotel.id
                                    )
                                  }
                                  className="cursor-pointer text-red-600 text-lg font-bold bg-red-200 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-300 transition ml-1"
                                >
                                  &times;
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 mt-2 text-center">No trips added</p>
            )}
            <div className="flex justify-center mt-4">
              <button
                onClick={handleDownloadReferral}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
              >
                Download Referral Itinerary
              </button>
              <button
                onClick={handleDownloadConfirm}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition ml-4"
              >
                Download Confirm Itinerary
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Itinerary;
