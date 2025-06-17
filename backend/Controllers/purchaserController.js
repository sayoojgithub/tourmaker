import Purchase from "../models/Purchase.js";
import Destination from "../models/Destination.js";
import Accommodation from "../models/Accommodation.js";
import TravelAgency from "../models/TravelAgency.js";
import Vehicle from "../models/Vehicle.js";
import mongoose from "mongoose";
import Trip from "../models/Trip.js";
import AddOnTrip from "../models/AddOnTrip.js";
import Activity from "../models/Activity.js";
import FixedTour from "../models/FixedTour.js";
import SpecialTour from "../models/SpecialTour.js";

//_______________getPurchaserDetails______________//
export const getPurchaserDetails = async (req, res) => {
  const { purchaserId } = req.params;

  try {
    const purchaser = await Purchase.findById(purchaserId);

    if (!purchaser) {
      return res.status(404).json({ message: "not found" });
    }

    res.status(200).json(purchaser);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
//_____________createDestination_____________//

export const createDestination = async (req, res) => {
  const { name, purchaserId } = req.body;

  try {
    // Validate input
    if (!name || !purchaserId) {
      return res
        .status(400)
        .json({ message: "Destination name and purchaser ID are required" });
    }

    // Normalize the name by trimming whitespace
    const trimmedName = name.trim();

    // Retrieve the purchaser details from the database
    const purchaser = await Purchase.findById(purchaserId);
    if (!purchaser) {
      return res.status(404).json({ message: "Purchaser not found" });
    }

    // Check if a destination with the normalized name already exists for this purchaser
    const existingDestination = await Destination.findOne({
      name: trimmedName,
      purchaserId: purchaser._id,
    });

    if (existingDestination) {
      return res
        .status(400)
        .json({ message: "Destination with this name already exists" });
    }

    // Create a new destination with the normalized name
    const newDestination = new Destination({
      name: trimmedName,
      purchaserId: purchaser._id,
      purchaserName: purchaser.name,
      companyId: purchaser.companyId,
      companyName: purchaser.companyName,
    });

    // Save the destination to the database
    await newDestination.save();
    res.status(201).json(newDestination);
  } catch (error) {
    console.error("Error creating destination:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// ____________Accommodation section_____________//

export const getDestinationsName = async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
    }
    // Fetch only the `name` field from the destinations
    const destinations = await Destination.find({companyId}, "name");

    // Map the destinations to an array of objects with `value` and `label`
    const destinationNames = destinations.map((destination) => ({
      _id: destination._id,
      value: destination.name,
      label: destination.name,
    }));

    // Send the list of destinations as a response
    res.status(200).json(destinationNames);
  } catch (error) {
    console.error("Error fetching destination names:", error);
    res.status(500).json({ message: "Failed to fetch destination names" });
  }
};

export const createAccommodation = async (req, res) => {
  try {
    // Extract purchaserId and other accommodation data from the request body
    const { purchaserId, destinationName, roomCategory, ...accommodationData } =
      req.body;

    if (roomCategory == "Normal") {
      return res.status(400).json({
        message: "roomCategory should be added",
      });
    }

    // Find the purchaser document by purchaserId
    const purchaser = await Purchase.findById(purchaserId);

    if (!purchaser) {
      return res.status(404).json({
        message: "Purchaser not found",
      });
    }

    // Generate a unique accommodationId
    const generateAccommodationId = async () => {
      const baseId = "A" + destinationName.substring(0, 2).toUpperCase(); // e.g., "AN" for destination "New York"

      // Find the most recent document in the Accommodation collection (based on the order of insertion)
      const mostRecentAccommodation = await Accommodation.findOne().sort({
        _id: -1,
      }); // Sort by _id in descending order

      let uniqueNumber;

      if (mostRecentAccommodation) {
        // Extract the number from the accommodationId and increment it
        const lastAccommodationId = mostRecentAccommodation.accommodationId;
        uniqueNumber = parseInt(lastAccommodationId.slice(baseId.length)) + 1;
      } else {
        // If no accommodation exists, start the numbering at 2000
        uniqueNumber = 2000;
      }

      return `${baseId}${uniqueNumber}`;
    };
    const accommodationId = await generateAccommodationId();

    // Create a new accommodation entry
    const newAccommodation = new Accommodation({
      ...accommodationData,
      destinationName,
      accommodationId,
      roomCategory,
      purchaserId, // Add purchaserId to the accommodation data
      purchaserName: purchaser.name,
      companyId: purchaser.companyId,
      companyName: purchaser.companyName,
    });

    // Save the new accommodation to the database
    const savedAccommodation = await newAccommodation.save();

    // Respond with the saved accommodation data
    res.status(201).json({
      message: "Accommodation created successfully",
      data: savedAccommodation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create accommodation",
      error: error.message,
    });
  }
};

export const getAccommodationsByPurchaser = async (req, res) => {
  try {
    const { purchaserId, page = 1, limit = 5, search = "" } = req.query; // Get purchaserId, pagination, and search parameters from query

    if (!purchaserId) {
      return res.status(400).json({ message: "purchaserId is required" });
    }

    // Create a filter object based on purchaserId and search query
    const filter = {
      purchaserId,
      $or: [
        { propertyName: { $regex: search, $options: "i" } }, // Case-insensitive search for propertyName
        { accommodationId: search }, // Exact match for accommodationId
      ],
    };

    // Fetch accommodations based on the filter, pagination, and limit
    const accommodations = await Accommodation.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Count total accommodations that match the filter
    const totalAccommodations = await Accommodation.countDocuments(filter);

    res.status(200).json({
      data: accommodations,
      totalPages: Math.ceil(totalAccommodations / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("Failed to fetch accommodations:", error);
    res.status(500).json({
      message: "Failed to fetch accommodations",
      error: error.message,
    });
  }
};

export const getAccommodationById = async (req, res) => {
  try {
    const { accommodationId } = req.params;

    // Fetch accommodation details by ID
    const accommodation = await Accommodation.findById(accommodationId);

    if (!accommodation) {
      return res.status(404).json({ message: "Accommodation not found" });
    }

    res.status(200).json(accommodation);
  } catch (error) {
    console.error("Error fetching accommodation details:", error);
    res.status(500).json({ message: "Failed to fetch accommodation details" });
  }
};

export const updateAccommodation = async (req, res) => {
  try {
    const { accommodationId } = req.params;
    const updatedData = req.body;

    // Find the accommodation by ID and update it with the new data
    const updatedAccommodation = await Accommodation.findByIdAndUpdate(
      accommodationId,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    if (!updatedAccommodation) {
      return res.status(404).json({ message: "Accommodation not found" });
    }

    res.status(200).json({
      message: "Accommodation updated successfully",
      accommodation: updatedAccommodation,
    });
  } catch (error) {
    console.error("Error updating accommodation:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// _____________TravelAgency section___________ //

export const createTravelAgency = async (req, res) => {
  try {
    const {
      destinationId,
      destinationName,
      travelsName,
      ownerName,
      address,
      email,
      contactNumber,
      whatsappNumber,
      purchaserId,
    } = req.body;

    // Find the purchaser using purchaserId
    const purchaser = await Purchase.findById(purchaserId);
    if (!purchaser) {
      return res.status(404).json({ message: "Purchaser not found" });
    }
    const generateTravelAgencyId = async () => {
      const baseId = "T" + destinationName.substring(0, 2).toUpperCase();

      // Find the most recent document in the Travelagency collection (based on the order of insertion)
      const mostRecentTravelAgency = await TravelAgency.findOne().sort({
        _id: -1,
      }); // Sort by _id in descending order

      let uniqueNumber;

      if (mostRecentTravelAgency) {
        // Extract the number from the travelAgencyId and increment it
        const lastTravelAgencyId = mostRecentTravelAgency.travelAgencyId;
        uniqueNumber = parseInt(lastTravelAgencyId.slice(baseId.length)) + 1;
      } else {
        // If no travel agency exists, start the numbering at 1000
        uniqueNumber = 1000;
      }

      return `${baseId}${uniqueNumber}`;
    };
    const travelAgencyId = await generateTravelAgencyId();

    // Create a new TravelAgency document
    const newTravelAgency = new TravelAgency({
      destinationId,
      destinationName,
      travelsName,
      ownerName,
      address,
      email,
      contactNumber,
      whatsappNumber,
      purchaserId: purchaser._id,
      purchaserName: purchaser.name,
      companyId: purchaser.companyId,
      companyName: purchaser.companyName,
      travelAgencyId,
    });

    // Save the travel agency details to the database
    const savedTravelAgency = await newTravelAgency.save();

    return res.status(201).json({
      message: "Travel agency created successfully",
      data: savedTravelAgency,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create travel agency" });
  }
};

export const getTravelAgenciesByPurchaser = async (req, res) => {
  try {
    const { purchaserId, page = 1, limit = 5, search = "" } = req.query; // Get purchaserId, pagination, and search parameters from query

    if (!purchaserId) {
      return res.status(400).json({ message: "purchaserId is required" });
    }

    // Create a filter object based on purchaserId and search query
    const filter = {
      purchaserId,
      $or: [
        { travelsName: { $regex: search, $options: "i" } }, // Case-insensitive search for propertyName
        { travelAgencyId: search }, // Exact match for accommodationId
        { destinationName: { $regex: search, $options: "i" } },
      ],
    };

    // Fetch accommodations based on the filter, pagination, and limit
    const TravelAgencies = await TravelAgency.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Count total accommodations that match the filter
    const totalTravelAgencies = await TravelAgency.countDocuments(filter);

    res.status(200).json({
      data: TravelAgencies,
      totalPages: Math.ceil(totalTravelAgencies / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("Failed to fetch accommodations:", error);
    res.status(500).json({
      message: "Failed to fetch accommodations",
      error: error.message,
    });
  }
};

export const getTravelAgencyById = async (req, res) => {
  try {
    const { travelAgencyId } = req.params;

    // Fetch travelagency details by ID
    const travelAgency = await TravelAgency.findById(travelAgencyId);

    if (!travelAgency) {
      return res.status(404).json({ message: "travel agency not found" });
    }

    res.status(200).json(travelAgency);
  } catch (error) {
    console.error("Error fetching travelagency details:", error);
    res.status(500).json({ message: "Failed to fetch travelagency details" });
  }
};

export const updateTravelAgency = async (req, res) => {
  try {
    const { travelAgencyId } = req.params;
    const updatedData = req.body;

    // Find the accommodation by ID and update it with the new data
    const updatedTravelAgency = await TravelAgency.findByIdAndUpdate(
      travelAgencyId,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    if (!updatedTravelAgency) {
      return res.status(404).json({ message: "TravelAgency not found" });
    }

    res.status(200).json({
      message: "TravelAgency updated successfully",
      travelagency: updatedTravelAgency,
    });
  } catch (error) {
    console.error("Error updating travelagency:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//______________Vehicle_____________//
export const getTravelAgencyByIdForVehicle = async (req, res) => {
  const { travelAgencyId } = req.params; // travelAgencyId from URL parameter
  const { purchaserId } = req.query; // purchaserId from query parameter

  try {
    // Find the travel agency by travelAgencyId
    const travelAgency = await TravelAgency.findOne({ travelAgencyId });

    if (!travelAgency) {
      return res.status(404).json({ message: "Travel agency not found" });
    }

    // Check if the purchaserId matches
    if (travelAgency.purchaserId.toString() !== purchaserId) {
      return res.status(403).json({ message: "You are unauthorised" });
    }

    // If purchaserId matches, return the travel agency data
    res.status(200).json(travelAgency);
  } catch (error) {
    console.error("Error fetching travel agency:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const createVehicle = async (req, res) => {
  try {
    const {
      travelAgencyId,
      purchaserId,
      vehicleName,
      vehicleCategory,
      destinationName,
      travelsName,
      ownerName,
      email,
      contactNumber,
      address,
    } = req.body;

    // Validation for required fields
    if (!travelAgencyId) {
      return res
        .status(400)
        .json({ message: "Travel agency ID is a necessary field" });
    }
    if (!vehicleName) {
      return res
        .status(400)
        .json({ message: "Vehicle name is a necessary field" });
    }
    if (!vehicleCategory) {
      return res
        .status(400)
        .json({ message: "Vehicle category is a necessary field" });
    }
    if (!destinationName) {
      return res
        .status(400)
        .json({ message: "Destination name is a necessary field" });
    }
    if (!travelsName) {
      return res
        .status(400)
        .json({ message: "Travels name is a necessary field" });
    }

    // 1. Find the TravelAgency document based on travelsId
    const travelAgency = await TravelAgency.findOne({ travelAgencyId });

    if (!travelAgency) {
      return res.status(404).json({ message: "Travel agency not found" });
    }

    // 2. Find the Purchaser document based on purchaserId
    const purchaser = await Purchase.findById(purchaserId);

    if (!purchaser) {
      return res.status(404).json({ message: "Purchaser not found" });
    }

    // 3. Extract necessary purchaser details
    const purchaserName = purchaser.name;
    const companyId = purchaser.companyId;
    const companyName = purchaser.companyName;

    // 4. Create a new vehicle document
    const newVehicle = new Vehicle({
      vehicleName,
      vehicleCategory,
      travelAgencyId,
      travelAgencyDocumentId: travelAgency._id, // Reference to Travelagency document
      destinationName: travelAgency.destinationName,
      destinationId: travelAgency.destinationId,
      travelsName: travelAgency.travelsName,
      ownerName: travelAgency.ownerName,
      email: travelAgency.email,
      contactNumber: travelAgency.contactNumber,
      whatsappNumber: travelAgency.whatsappNumber,
      address: travelAgency.address,
      purchaserId,
      purchaserName,
      companyId,
      companyName,
    });

    // 5. Save the new vehicle document
    const savedVehicle = await newVehicle.save();

    res.status(201).json({
      message: "Vehicle created successfully",
      vehicle: savedVehicle,
    });
  } catch (error) {
    console.error("Error creating vehicle:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getVehiclesByPurchaser = async (req, res) => {
  try {
    const { purchaserId, page = 1, limit = 5, search = "" } = req.query; // Get purchaserId, pagination, and search parameters from query

    if (!purchaserId) {
      return res.status(400).json({ message: "purchaserId is required" });
    }

    // Create a filter object based on purchaserId and search query
    const filter = {
      purchaserId,
      $or: [
        { travelsName: { $regex: search, $options: "i" } }, // Case-insensitive search for propertyName
        { travelAgencyId: search },
        { vehicleName: { $regex: search, $options: "i" } }, // Exact match for accommodationId
      ],
    };

    // Fetch vehicles based on the filter, pagination, and limit
    const Vehicles = await Vehicle.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Count total accommodations that match the filter
    const totalVehicles = await Vehicle.countDocuments(filter);

    res.status(200).json({
      data: Vehicles,
      totalPages: Math.ceil(totalVehicles / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("Failed to fetch vehicles:", error);
    res.status(500).json({
      message: "Failed to fetch vehicles",
      error: error.message,
    });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { purchaserId } = req.body;

    // Find and delete the vehicle by ID
    const vehicle = await Vehicle.findByIdAndDelete(vehicleId);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Remove vehicle reference from Trip documents
    await Trip.updateMany(
      { purchaserId,"travelsDetails.vehicleId": vehicleId },
      { $pull: { travelsDetails: { vehicleId } } }
    );

    // Remove vehicle reference from AddOnTrip documents
    await AddOnTrip.updateMany(
      { purchaserId,"travelsDetails.vehicleId": vehicleId },
      { $pull: { travelsDetails: { vehicleId } } }
    );

    res.status(200).json({ message: "Vehicle and references deleted successfully" });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    res.status(500).json({ message: "Server error, unable to delete vehicle" });
  }
};

//____________Trip____________//
export const getTravelAgenciesByPurchaserIdForTrip = async (req, res) => {
  try {
    // Get the purchaserId from the query parameters
    const { purchaserId, destinationName } = req.query;

    // Find all travel agencies that match the given purchaserId
    const travelAgencies = await TravelAgency.find({
      purchaserId,
      destinationName,
      // Match the destinationName as well
    });

    // If no travel agencies are found, return a 404 error
    if (!travelAgencies.length) {
      return res
        .status(404)
        .json({
          message: "No travel agencies found for the provided purchaserId",
        });
    }

    // Map the results to the format required (value and label)
    const travelAgencyOptions = travelAgencies.map((agency) => ({
      id: agency._id,
      value: agency.travelsName,
      label: agency.travelsName,
    }));

    // Return the options as a JSON response
    return res.status(200).json(travelAgencyOptions);
  } catch (error) {
    console.error("Error fetching travel agencies:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getVehicleCategories = async (req, res) => {
  try {
    const { purchaserId, agencyId } = req.query;
    
   

    // Validate required parameters
    if (!purchaserId || !agencyId) {
      return res
        .status(400)
        .json({ message: "purchaserId and travelsid are required" });
    }

    const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
    const purchaserObjectId = isValidObjectId(purchaserId) ? new mongoose.Types.ObjectId(purchaserId) : purchaserId;
    const agencyObjectId = isValidObjectId(agencyId) ? new mongoose.Types.ObjectId(agencyId) : agencyId;
   

    // Query to find vehicle categories based on purchaserId and travelsName
    const vehicles = await Vehicle.aggregate([
      {
        $match: {
          purchaserId: purchaserObjectId, // Convert purchaserId to ObjectId
          travelAgencyDocumentId: agencyObjectId // No need to convert travelsName
        },
      },
      {
        $group: {
          _id: "$vehicleCategory",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          value: "$_id",
          label: "$_id",
          count: 1,
        },
      },
    ]);
    

    // Return the list of vehicle categories
    res.status(200).json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicle categories:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const fetchVehicles = async (req, res) => {
  try {
    const { purchaserId, agencyId, vehicleCategory } = req.query;

    // Validate the required fields
    if (!purchaserId) {
      return res.status(400).json({ message: "Purchaser ID is required" });
    }

    if (!agencyId) {
      return res.status(400).json({ message: "Travel agency ID is required" });
    }
    if (!vehicleCategory) {
      return res
        .status(400)
        .json({ message: "Please select a category first" });
    }
    const purchaserObjectId = new mongoose.Types.ObjectId(purchaserId);
    const agencyObjectId = new mongoose.Types.ObjectId(agencyId);

    //Find the purchaser by ID (optional validation, depending on your needs)
    // const purchaser = await Purchase.findById(purchaserId);
    // if (!purchaser) {
    //   return res.status(404).json({ message: "Purchaser not found" });
    // }

    // Fetch vehicles based on purchaserId, selectedAgency, and selectedCategory
    const vehicles = await Vehicle.find({
      purchaserId: purchaserObjectId,
      travelAgencyDocumentId: agencyObjectId,
      vehicleCategory: vehicleCategory,
    });

    if (!vehicles || vehicles.length === 0) {
      return res
        .status(404)
        .json({
          message: "No vehicles found for the selected category and agency",
        });
    }

    // Format the response (if needed)
    const vehicleOptions = vehicles.map((vehicle) => ({
      value: vehicle.vehicleName,
      label: vehicle.vehicleName,
      id: vehicle._id,
    }));

    res.status(200).json(vehicleOptions);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching vehicles" });
  }
};

export const addTrip = async (req, res) => {
  try {
    const {
      destinationName,
      destinationId,
      tripName,
      tripDescription,
      travelsDetails,
      purchaserId,
    } = req.body;

    // Validate required fields
    if (
      !destinationName ||
      !tripName ||
      !tripDescription ||
      !travelsDetails ||
      travelsDetails.length === 0 ||
      !purchaserId
    ) {
      return res
        .status(400)
        .json({
          message: "Please fill out all fields before adding the trip.",
        });
    }

    // Find the purchaser details
    const purchaser = await Purchase.findById(purchaserId);
    if (!purchaser) {
      return res.status(404).json({ message: "Purchaser not found." });
    }

    // Create a new trip instance with details from the purchaser
    const newTrip = new Trip({
      destinationName,
      destinationId,
      tripName,
      tripDescription,
      travelsDetails,
      purchaserId,
      purchaserName: purchaser.name,
      companyId: purchaser.companyId,
      companyName: purchaser.companyName,
    });

    // Save the trip to the database
    await newTrip.save();

    res
      .status(201)
      .json({ message: "Trip added successfully!", trip: newTrip });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while adding the trip." });
  }
};


export const getTripsByPurchaser = async (req, res) => {
  try {
    const { purchaserId, page = 1, limit = 4, search = "" } = req.query; // Get purchaserId, pagination, and search parameters from query

    if (!purchaserId) {
      return res.status(400).json({ message: "purchaserId is required" });
    }

    // Create a filter object based on purchaserId and search query
    const filter = {
      purchaserId,
      $or: [
        { tripName: { $regex: search, $options: "i" } }, // Case-insensitive search for propertyName
        { destinationName: { $regex: search, $options: "i" } },
      ],
    };

    // Fetch accommodations based on the filter, pagination, and limit
    const Trips = await Trip.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Count total accommodations that match the filter
    const totalTrips = await Trip.countDocuments(filter);

    res.status(200).json({
      data: Trips,
      totalPages: Math.ceil(totalTrips / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("Failed to fetch accommodations:", error);
    res.status(500).json({
      message: "Failed to fetch accommodations",
      error: error.message,
    });
  }
};

export const getTripById = async (req, res) => {
  try {
    const { tripId } = req.params;

    // Fetch trip details by ID
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Format the trip details
    const formattedTravelsDetails = trip.travelsDetails.map(detail => ({
      travelsName: {
        label: detail.travelsName,
        value: detail.travelsName,
      },
      vehicleCategory: {
        label: detail.vehicleCategory,
        value: detail.vehicleCategory,
      },
      vehicleName: {
        label: detail.vehicleName,
        value: detail.vehicleName,
      },
      price: detail.price,
      vehicleId: detail.vehicleId,
      _id: detail._id,
    }));

    // Adjust the format for destinationName to include label and value
    const formattedTrip = {
      ...trip._doc, // Spread the trip data
      destinationName: {
        label: trip.destinationName,
        value: trip.destinationName,
      },
      travelsDetails: formattedTravelsDetails, // Use the formatted travels details
    };

    res.status(200).json(formattedTrip);
  } catch (error) {
    console.error("Error fetching trip details:", error);
    res.status(500).json({ message: "Failed to fetch trip details" });
  }
};

export const updateTrip = async (req, res) => {
  const { tripId } = req.params;
  const { tripName,tripDescription,travelsDetails } = req.body;

  try {
    // Find the trip by its ID
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    trip.tripName = tripName
    // Update trip description
    trip.tripDescription = tripDescription;
     // Create a set of _ids from the incoming travelsDetails
     const incomingDetailIds = new Set(travelsDetails.map((detail) => detail._id));

     // Remove any existing details that are not present in the incoming data
     trip.travelsDetails = trip.travelsDetails.filter((detail) =>
       incomingDetailIds.has(detail._id.toString())
     );

    // Iterate through travelsDetails and update existing ones or add new ones
    travelsDetails.forEach((detail) => {
      if (detail._id) {
        // If _id exists, find the existing detail and update it
        const existingDetail = trip.travelsDetails.id(detail._id);
        if (existingDetail) {
          existingDetail.travelsName = detail.travelsName;
          existingDetail.vehicleCategory = detail.vehicleCategory;
          existingDetail.vehicleName = detail.vehicleName;
          existingDetail.vehicleId = detail.vehicleId;
          existingDetail.price = detail.price;
        }
      } else {
        // If no _id, it's a new item, so add it to the array
        trip.travelsDetails.push({
          travelsName: detail.travelsName,
          vehicleCategory: detail.vehicleCategory,
          vehicleName: detail.vehicleName,
          vehicleId: detail.vehicleId,
          price: detail.price,
        });
      }
    });

    // Save the updated trip document
    await trip.save();

    res.status(200).json({
      message: 'Trip updated successfully',
      trip,
    });
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({ message: 'An error occurred while updating the trip' });
  }
};

//___________ADDON TRIPS____________//


export const getTripsByDestinationAndPurchaser = async (req, res) => {
  const { destination, purchaserId } = req.query; // Get destinationName and purchaserId from query parameters

  try {
    // Find trips based on destinationName and purchaserId
    const trips = await Trip.find({
      destinationName: destination,
      purchaserId: purchaserId,
    });

    if (!trips || trips.length === 0) {
      return res.status(404).json({ message: "No trips found for the selected destination and purchaser." });
    }
    // Map the results to the format required (value and label)
    const tripOptions = trips.map((trip) => ({
      _id: trip._id,
      value: trip.tripName,
      label: trip.tripName,
    }));

    // Send the trips as a response
    res.status(200).json(tripOptions);
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ message: "An error occurred while fetching trips." });
  }
};


export const addAddOnTrip = async (req, res) => {
  try {
    const {
      destinationName,
      destinationId,
      tripName,
      tripNameId,
      addOnTripName,
      addOnTripDescription,
      travelsDetails,
      purchaserId,
    } = req.body;

    // Validate required fields
    if (
      !destinationName ||
      !tripName ||
      !addOnTripName ||
      !addOnTripDescription ||
      !travelsDetails ||
      travelsDetails.length === 0 ||
      !purchaserId
    ) {
      return res
        .status(400)
        .json({
          message: "Please fill out all fields before adding the addOnTrip.",
        });
    }

    // Find the purchaser details
    const purchaser = await Purchase.findById(purchaserId);
    if (!purchaser) {
      return res.status(404).json({ message: "Purchaser not found." });
    }

    // Create a new trip instance with details from the purchaser
    const newAddOnTrip = new AddOnTrip({
      destinationName,
      destinationId,
      tripName,
      tripNameId,
      addOnTripName,
      addOnTripDescription,
      travelsDetails,
      purchaserId,
      purchaserName: purchaser.name,
      companyId: purchaser.companyId,
      companyName: purchaser.companyName,
    });

    // Save the trip to the database
    await newAddOnTrip.save();

    res
      .status(201)
      .json({ message: "AddOnTrip added successfully!", trip: newAddOnTrip });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while adding the trip." });
  }
};


export const getAddOnTripsByPurchaser = async (req, res) => {
  try {
    const { purchaserId, page = 1, limit = 5, search = "" } = req.query; // Get purchaserId, pagination, and search parameters from query

    if (!purchaserId) {
      return res.status(400).json({ message: "purchaserId is required" });
    }

    // Create a filter object based on purchaserId and search query
    const filter = {
      purchaserId,
      $or: [
        { tripName: { $regex: search, $options: "i" } }, // Case-insensitive search for propertyName
        { destinationName: { $regex: search, $options: "i" } },
        { addOnTripName : { $regex: search, $options: "i"} },
      ],
    };

    // Fetch accommodations based on the filter, pagination, and limit
    const AddOnTrips = await AddOnTrip.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Count total accommodations that match the filter
    const totalTrips = await AddOnTrip.countDocuments(filter);

    res.status(200).json({
      data: AddOnTrips,
      totalPages: Math.ceil(totalTrips / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("Failed to fetch AddOnTrips:", error);
    res.status(500).json({
      message: "Failed to fetch AddOnTrips",
      error: error.message,
    });
  }
};


export const getAddOnTripById = async (req, res) => {
  try {
    const { tripId } = req.params;

    // Fetch trip details by ID
    const trip = await AddOnTrip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Format the trip details
    const formattedTravelsDetails = trip.travelsDetails.map(detail => ({
      travelsName: {
        label: detail.travelsName,
        value: detail.travelsName,
      },
      vehicleCategory: {
        label: detail.vehicleCategory,
        value: detail.vehicleCategory,
      },
      vehicleName: {
        label: detail.vehicleName,
        value: detail.vehicleName,
      },
      price: detail.price,
      vehicleId: detail.vehicleId,
      _id: detail._id,
    }));

    // Adjust the format for destinationName to include label and value
    const formattedTrip = {
      ...trip._doc, // Spread the trip data
      destinationName: {
        label: trip.destinationName,
        value: trip.destinationName,
      },
      tripName: {
        label: trip.tripName,
        value: trip.tripName,
      },
      travelsDetails: formattedTravelsDetails, // Use the formatted travels details
    };
   

    res.status(200).json(formattedTrip);
  } catch (error) {
    console.error("Error fetching trip details:", error);
    res.status(500).json({ message: "Failed to fetch trip details" });
  }
};


export const updateAddOnTrip = async (req, res) => {
  const { tripId } = req.params;
  const { addOnTripName,addOnTripDescription,travelsDetails } = req.body;
 

  try {
    // Find the trip by its ID
    const trip = await AddOnTrip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: 'AddOnTrip not found' });
    }
    trip.addOnTripName = addOnTripName
    trip.addOnTripDescription = addOnTripDescription
     // Create a set of _ids from the incoming travelsDetails
    const incomingDetailIds = new Set(travelsDetails.map((detail) => detail._id));

    // Remove any existing details that are not present in the incoming data
    trip.travelsDetails = trip.travelsDetails.filter((detail) =>
      incomingDetailIds.has(detail._id.toString())
    );

    // Iterate through travelsDetails and update existing ones or add new ones
    travelsDetails.forEach((detail) => {
      if (detail._id) {
        // If _id exists, find the existing detail and update it
        const existingDetail = trip.travelsDetails.id(detail._id);
        if (existingDetail) {
          existingDetail.travelsName = detail.travelsName;
          existingDetail.vehicleCategory = detail.vehicleCategory;
          existingDetail.vehicleName = detail.vehicleName;
          existingDetail.vehicleId = detail.vehicleId;
          existingDetail.price = detail.price;
        }
      } else {
        // If no _id, it's a new item, so add it to the array
        trip.travelsDetails.push({
          travelsName: detail.travelsName,
          vehicleCategory: detail.vehicleCategory,
          vehicleName: detail.vehicleName,
          vehicleId: detail.vehicleId,
          price: detail.price,
        });
      }
    });

    // Save the updated trip document
    await trip.save();

    res.status(200).json({
      message: 'Trip updated successfully',
      trip,
    });
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({ message: 'An error occurred while updating the trip' });
  }
};


//_____________ADD ACTIVITY_____________//
export const addActivity = async (req, res) => {
  try {
    const { purchaserId, destinationName,destinationId, tripName,tripNameId, activityName, activityDescription, pricePerHead } = req.body;

    // Basic server-side validation
    if (!destinationName || !tripName || !activityName || pricePerHead <= 0) {
      return res.status(400).json({ message: "Please provide valid data for all required fields." });
    }

    // Find purchaser by ID
    const purchaser = await Purchase.findById(purchaserId);

    if (!purchaser) {
      return res.status(404).json({ message: "Purchaser not found" });
    }

    // Extract necessary purchaser details
    const purchaserName = purchaser.name;
    const companyId = purchaser.companyId;
    const companyName = purchaser.companyName;

    // Create a new activity object
    const newActivity = new Activity({
      destinationName,
      destinationId,
      tripName,
      tripNameId,
      activityName,
      activityDescription,
      pricePerHead,
      purchaserId,
      purchaserName,
      companyId,
      companyName,
    });

    // Save the activity to the database
    const savedActivity = await newActivity.save();

    return res.status(201).json({
      message: "Activity added successfully!",
      activity: savedActivity,
    });
  } catch (error) {
    console.error("Error adding activity:", error);
    return res.status(500).json({ message: "An error occurred while adding the activity." });
  }
};



export const getActivitiesByPurchaser = async (req, res) => {
  try {
    const { purchaserId, page = 1, limit = 4, search = "" } = req.query; // Get purchaserId, pagination, and search parameters from query

    if (!purchaserId) {
      return res.status(400).json({ message: "purchaserId is required" });
    }

    // Create a filter object based on purchaserId and search query
    const filter = {
      purchaserId,
      $or: [
        { tripName: { $regex: search, $options: "i" } }, // Case-insensitive search for propertyName
        { destinationName: { $regex: search, $options: "i" } },
       
      ],
    };

    // Fetch activities based on the filter, pagination, and limit
    const Activities = await Activity.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Count total activities that match the filter
    const totalActivities = await Activity.countDocuments(filter);

    res.status(200).json({
      data: Activities,
      totalPages: Math.ceil(totalActivities / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("Failed to fetch Activities:", error);
    res.status(500).json({
      message: "Failed to fetch Activities",
      error: error.message,
    });
  }
};


export const deleteActivity = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedActivity = await Activity.findByIdAndDelete(id)
    if(!deletedActivity) {
      return res.status(404).json({ message: "Activity not found" })
    }
    res.status(200).json({ message: "Activity deleted successfully" })

  } catch (error) {
    res.status(500).json({ message: "Failed to delete activity", error: error.message });

  }
}


export const getActivityById = async (req, res) => {
  const { activityId } = req.params;

  try {
    // Find the activity by its ID
    const activity = await Activity.findById(activityId);

    // If the activity doesn't exist, return an error
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    // Structure the response to send `label` and `value` for `destinationName` and `tripName`
    const formattedActivity = {
      _id: activity._id,
      destinationName: {
        label: activity.destinationName, // Assuming the label is the string value of `destinationName`
        value: activity.destinationName, // The actual value stored in the DB
      },
      tripName: {
        label: activity.tripName, // Assuming the label is the string value of `tripName`
        value: activity.tripName, // The actual value stored in the DB
      },
      activityName: activity.activityName,
      activityDescription: activity.activityDescription,
      pricePerHead: activity.pricePerHead,
    };

    // Send the formatted activity details
    return res.status(200).json(formattedActivity);

  } catch (error) {
    console.error("Error fetching activity:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};


export const updateActivity = async (req, res) => {
  try {
    const { activityId } = req.params;  // Get activityId from request params
    const { activityName,pricePerHead,activityDescription } = req.body;  // Get pricePerHead from request body

    // Basic validation to ensure the pricePerHead is valid
    if (pricePerHead <= 0) {
      return res.status(400).json({ message: "Price per head must be a positive value." });
    }

    // Find and update the activity by ID
    const updatedActivity = await Activity.findByIdAndUpdate(
      activityId,
      { activityName,pricePerHead, activityDescription},  // Only update the pricePerHead
      { new: true, useFindAndModify: false } // Return the updated document and prevent deprecation warnings
    );

    if (!updatedActivity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    return res.status(200).json({
      message: "Activity updated successfully!",
      activity: updatedActivity,
    });
  } catch (error) {
    console.error("Error updating activity:", error);
    return res.status(500).json({ message: "An error occurred while updating the activity." });
  }
};




//____________FIXED TOUR ___________//
export const getArticleNumbers = async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    // Find all fixed tours that match the companyId
    const tours = await FixedTour.find({ companyId }, "articleNumber");

    // Use a Set to filter out duplicate article numbers
    const uniqueArticleNumbers = [...new Set(
      tours
        .filter((tour) => tour.articleNumber) // Only include tours with an article number
        .map((tour) => tour.articleNumber)
    )];

    // Map the unique article numbers to objects with `value` and `label` fields
    const articleNumbers = uniqueArticleNumbers.map((articleNumber) => ({
      value: articleNumber,
      label: articleNumber,
    }));

    res.status(200).json(articleNumbers);
  } catch (error) {
    console.error("Error fetching article numbers:", error);
    res.status(500).json({ message: "Failed to fetch article numbers" });
  }
};

export const createFixedTour = async (req, res) => {
  try {
    const {
      destination,
      tourName,
      articleNumber,
      day,
      night,
      totalPax,
      mrp,
      category,
      startDates,
      tourStartFrom,
      inclusionsList,
      exclusionsList,
      itineraryText,
      purchaserId, // Get purchaserId from request
    } = req.body;

    // Find the purchaser by purchaserId
    const purchaser = await Purchase.findById(purchaserId);
    if (!purchaser) {
      return res.status(404).json({ message: "Purchaser not found" });
    }

    // Retrieve companyId from the purchaser document
    const companyId = purchaser.companyId;

    // Create a new FixedTour instance with purchaserId and companyId
    const fixedTour = new FixedTour({
      destination,
      tourName,
      articleNumber,
      day,
      night,
      totalPax,
      mrp,
      category,
      startDates: startDates.map((date) => ({ date, totalPax })), // Add totalPax to each start date
      tourStartFrom,
      inclusionsList,
      exclusionsList,
      itineraryText,
      companyId,    // Set companyId obtained from purchaser
      purchaserId,  // Set purchaserId directly from the request
    });

    // Save to the database
    const savedTour = await fixedTour.save();

    // Respond with success message and data
    res.status(201).json({ message: "Fixed tour created successfully", data: savedTour });
  } catch (error) {
    console.error("Error creating fixed tour:", error);
    res.status(500).json({ message: "An error occurred while creating the fixed tour" });
  }
};


export const getFixedTripsByPurchaser = async (req, res) => {
  try {
    const { purchaserId, page = 1, limit = 5, search = "" } = req.query;

    if (!purchaserId) {
      return res.status(400).json({ message: "purchaserId is required" });
    }

    // Create a filter object based on purchaserId and search query
    const filter = { purchaserId };
     // Add articleNumber search condition if search query is provided
     if (search) {
      filter.articleNumber = { $regex: search, $options: "i" }; // Case-insensitive search
    }

    // Fetch fixed trips based on the filter, pagination, and limit
    const fixedTrips = await FixedTour.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Count total fixed trips that match the filter
    const totalFixedTrips = await FixedTour.countDocuments(filter);

    res.status(200).json({
      data: fixedTrips,
      totalPages: Math.ceil(totalFixedTrips / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("Failed to fetch fixed trips:", error);
    res.status(500).json({
      message: "Failed to fetch fixed trips",
      error: error.message,
    });
  }
};



export const getFixedTourById = async (req, res) => {
  try {
    const { fixedTourId } = req.params;

    // Fetch fixed tour details by ID
    const fixedTour = await FixedTour.findById(fixedTourId);

    if (!fixedTour) {
      return res.status(404).json({ message: "Fixed tour not found" });
    }

    // Convert startDates to Date objects if they are ISO strings
    const fixedTourWithDates = {
      ...fixedTour.toObject(),
      startDates: fixedTour.startDates.map((startDate) => new Date(startDate.date)),
    };

    res.status(200).json(fixedTourWithDates);
  } catch (error) {
    console.error("Error fetching fixed tour details:", error);
    res.status(500).json({ message: "Failed to fetch fixed tour details" });
  }
};

export const updateFixedTour = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      destination,
      tourName,
      articleNumber,
      day,
      night,
      totalPax,
      mrp,
      category,
      startDates, // Array of new start dates from frontend
      tourStartFrom,
      inclusionsList,
      exclusionsList,
      itineraryText,
      purchaserId,
    } = req.body;

    

    // Fetch the current FixedTour from the database
    const existingTour = await FixedTour.findById(id);
    if (!existingTour) {
      return res.status(404).json({ message: "Fixed tour not found" });
    }

    

    // Convert existing startDates to an array of ISO date strings
    const existingDates = existingTour.startDates.map((entry) => entry.date.toISOString());

    // Convert new startDates from frontend to ISO date strings
    const newDatesFromFrontend = startDates.map((date) => new Date(date).toISOString());

    // Identify dates that should be **removed**
    const filteredStartDates = existingTour.startDates.filter((entry) =>
      newDatesFromFrontend.includes(entry.date.toISOString()) // Keep only dates present in frontend
    );

    

    // Identify **new dates** that should be added
    const newStartDates = startDates
      .filter((date) => !existingDates.includes(new Date(date).toISOString())) // Only keep new ones
      .map((date) => ({ date: new Date(date), totalPax })); // Add `totalPax`

    console.log("New startDates to be added:", newStartDates);

    // Combine filtered existing dates with new ones
    const updatedStartDates = [...filteredStartDates, ...newStartDates];

    

    // Find the purchaser by purchaserId
    const purchaser = await Purchase.findById(purchaserId);
    if (!purchaser) {
      return res.status(404).json({ message: "Purchaser not found" });
    }

    // Retrieve companyId from the purchaser document
    const companyId = purchaser.companyId;

    // Update FixedTour in the database
    const updatedTour = await FixedTour.findByIdAndUpdate(
      id,
      {
        destination,
        tourName,
        articleNumber,
        day,
        night,
        totalPax,
        mrp,
        category,
        startDates: updatedStartDates, // Use the final list of startDates
        tourStartFrom,
        inclusionsList,
        exclusionsList,
        itineraryText,
        companyId,
        purchaserId,
      },
      { new: true, runValidators: true }
    );

    if (!updatedTour) {
      return res.status(404).json({ message: "Fixed tour not found" });
    }

    res.status(200).json({ message: "Fixed tour updated successfully", data: updatedTour });
  } catch (error) {
    console.error("Error updating fixed tour:", error);
    res.status(500).json({ message: "An error occurred while updating the fixed tour" });
  }
};


export const createSpecialTour = async (req, res) => {
  try {
    const {
      destination,
      tourName,
      articleNumber,
      day,
      night,
      category,
      validStartDate,
      validEndDate,
      tourStartFrom,
      inclusionsList,
      exclusionsList,
      itineraryText,
      purchaserId,
      ...dynamicFields
    } = req.body;

    // Convert validStartDate and validEndDate to Date objects
    const startDate = new Date(validStartDate);
    const endDate = new Date(validEndDate);

    if (startDate >= endDate) {
      return res
        .status(400)
        .json({ message: "Valid start date must be before valid end date" });
    }

    // Find purchaser to get companyId
    const purchaser = await Purchase.findById(purchaserId);
    if (!purchaser) {
      return res.status(404).json({ message: "Purchaser not found" });
    }
    const companyId = purchaser.companyId;

    // **Check for existing tours with same companyId & articleNumber**
    const overlappingTour = await SpecialTour.findOne({
      companyId,
      articleNumber,
      $or: [
        {
          validStartDate: { $lte: endDate }, // Existing tour starts before or during the new tour
          validEndDate: { $gte: startDate }, // Existing tour ends after or during the new tour
        },
      ],
    });

    if (overlappingTour) {
      return res.status(400).json({
        message: `A tour with the same article number and same date range already exists.`,
        existingTour: overlappingTour,
      });
    }

    // Create a new SpecialTour instance
    const specialTour = new SpecialTour({
      destination,
      tourName,
      articleNumber,
      day,
      night,
      category,
      validStartDate: startDate,
      validEndDate: endDate,
      tourStartFrom,
      inclusionsList,
      exclusionsList,
      itineraryText,
      companyId,
      purchaserId,
      ...dynamicFields,
    });

    // Save to the database
    const savedTour = await specialTour.save();

    res.status(201).json({
      message: "Special tour created successfully",
      data: savedTour,
    });
  } catch (error) {
    console.error("Error creating special tour:", error);
    res
      .status(500)
      .json({ message: "An error occurred while creating the special tour" });
  }
};

export const getSpecialTripsByPurchaser = async (req, res) => {
  try {
    const { purchaserId, page = 1, limit = 5, search = "" } = req.query;

    if (!purchaserId) {
      return res.status(400).json({ message: "purchaserId is required" });
    }

    // Create a filter object based on purchaserId and search query
    const filter = { purchaserId };
     // Add articleNumber search condition if search query is provided
     if (search) {
      filter.articleNumber = { $regex: search, $options: "i" }; // Case-insensitive search
    }

    // Fetch fixed trips based on the filter, pagination, and limit
    const specialTrips = await SpecialTour.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Count total fixed trips that match the filter
    const totalSpecialTrips = await SpecialTour.countDocuments(filter);

    res.status(200).json({
      data: specialTrips,
      totalPages: Math.ceil(totalSpecialTrips / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("Failed to fetch special trips:", error);
    res.status(500).json({
      message: "Failed to fetch special trips",
      error: error.message,
    });
  }
};

const formatDateToDDMMYYYY = (isoDate) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

export const getSpecialTourById = async (req, res) => {
  try {
    const { specialTourId } = req.params;

    // Fetch fixed tour details by ID
    const specialTour = await SpecialTour.findById(specialTourId);

    if (!specialTour) {
      return res.status(404).json({ message: "Fixed tour not found" });
    }
     // Format validStartDate and validEndDate
     const formattedTour = {
      ...specialTour._doc, // Spread the existing tour data
      validStartDate: formatDateToDDMMYYYY(specialTour.validStartDate),
      validEndDate: formatDateToDDMMYYYY(specialTour.validEndDate),
    };

    res.status(200).json(formattedTour);
  } catch (error) {
    console.error("Error fetching fixed tour details:", error);
    res.status(500).json({ message: "Failed to fetch fixed tour details" });
  }
};


export const getArticleNumbersSpecialTour = async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    // Find all fixed tours that match the companyId
    const tours = await SpecialTour.find({ companyId }, "articleNumber");

    // Use a Set to filter out duplicate article numbers
    const uniqueArticleNumbers = [...new Set(
      tours
        .filter((tour) => tour.articleNumber) // Only include tours with an article number
        .map((tour) => tour.articleNumber)
    )];

    // Map the unique article numbers to objects with `value` and `label` fields
    const articleNumbers = uniqueArticleNumbers.map((articleNumber) => ({
      value: articleNumber,
      label: articleNumber,
    }));

    res.status(200).json(articleNumbers);
  } catch (error) {
    console.error("Error fetching article numbers:", error);
    res.status(500).json({ message: "Failed to fetch article numbers" });
  }
};


export const updateSpecialTour = async (req, res) => {
  try {
    const { id } = req.params; // Get tour ID from URL
    const {
      destination,
      tourName,
      articleNumber,
      day,
      night,
      category,
      validStartDate,
      validEndDate,
      tourStartFrom,
      inclusionsList,
      exclusionsList,
      itineraryText,
      purchaserId, // To check if purchaser is being changed
      ...dynamicFields // Handles dynamic keys (1, 2, 3, etc.)
    } = req.body;

    // Find the existing special tour
    const existingTour = await SpecialTour.findById(id);
    if (!existingTour) {
      return res.status(404).json({ message: "Special tour not found" });
    }

    let companyId = existingTour.companyId; // Default to existing companyId

    // Update special tour fields
    const updatedTour = await SpecialTour.findByIdAndUpdate(
      id,
      {
        destination,
        tourName,
        articleNumber,
        day,
        night,
        category,
        validStartDate: validStartDate ? new Date(validStartDate) : existingTour.validStartDate,
        validEndDate: validEndDate ? new Date(validEndDate) : existingTour.validEndDate,
        tourStartFrom,
        inclusionsList,
        exclusionsList,
        itineraryText,
        companyId, // Update companyId if purchaser changed
        purchaserId, // Update purchaserId if changed
        ...dynamicFields, // Spread dynamic fields
      },
      { new: true, runValidators: true } // Return updated document & apply validation
    );

    res.status(200).json({
      message: "Special tour updated successfully",
      tour: updatedTour,
    });
  } catch (error) {
    console.error("Error updating special tour:", error);
    res.status(500).json({ message: "An error occurred while updating the special tour" });
  }
};