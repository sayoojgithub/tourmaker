import express from "express";
import {
  getexecutiveDetails,
  getNewClientsByExecutive,
  getClientDetails,
  updateClient,
  getPendingClientsByExecutive,
  getTodoClientsByExecutive,
  getInterestedClientsByExecutive,
  getConfirmedClientsByExecutive,
  getFixedTours,
  getFixedTourById,
  getAllClientsByExecutive,

  getDestinationsNameForItenarary,
  getTripsNameForItenarary,
  getVehiclesByTripIdForItenarary,
  getAddOnTripsNameForItenarary,
  getActivitiesNameForItenarary,
  getAddOnVehiclesByTripIdForItenarary,
  getAccommodationsByCategoryAndDestination,
  getSelectedAccommodationDetailsForItenarary,
  downloadReferralItinerary,
  downloadConfirmItinerary,
  downloadReferralCustomItinerary,
  downloadConfirmCustomItinerary,
  downloadFixedTrackSheet,
  downloadCustomTracksheet,
  getSpecialTours,
  getSpecialTourById,
  downloadReferralSpecialItinerary,
  downloadConfirmSpecialItinerary,
  downloadSpecialTrackSheet



} from "../Controllers/executiveController.js";
const router = express.Router();
router.get("/executiveDetails/:executiveId", getexecutiveDetails);//used in the executive profile page
router.get('/new-clients', getNewClientsByExecutive);
router.get("/newClientDetailsFetch/:id", getClientDetails);
router.put("/updateClient/:clientId", updateClient);
router.get('/pending-clients',getPendingClientsByExecutive)
router.get('/todo-clients',getTodoClientsByExecutive)
router.get('/interested-clients',getInterestedClientsByExecutive)
router.get('/confirmed-clients',getConfirmedClientsByExecutive)
router.get('/all-clients',getAllClientsByExecutive)
//GROUP TOURS STRAT//
router.get('/fixed-itineraries', getFixedTours);
router.get("/fixedTour/:fixedTourId", getFixedTourById);
router.post("/fixedTour/downloadReferralItinerary", downloadReferralItinerary);
router.post("/fixedTour/downloadConfirmItinerary", downloadConfirmItinerary);
router.post("/fixedTour/downloadFixedTrackSheet", downloadFixedTrackSheet);
//GROUP TOURS END//
router.post("/customTour/downloadReferralItinerary", downloadReferralCustomItinerary);
router.post("/customTour/downloadConfirmItinerary", downloadConfirmCustomItinerary);
router.post("/customTour/downloadCustomTracksheet", downloadCustomTracksheet);
//FIXED TOURS START//
router.get('/special-itineraries', getSpecialTours);
router.get("/specialTour/:specialTourId", getSpecialTourById);
router.post("/specialTour/downloadReferralItinerary", downloadReferralSpecialItinerary);
router.post("/specialTour/downloadConfirmItinerary", downloadConfirmSpecialItinerary);
router.post("/specialTour/downloadTrackSheet", downloadSpecialTrackSheet);










//____________Itenary section ___________//
router.get("/getDestinationsName", getDestinationsNameForItenarary);
router.get('/getTripsName/:destinationId', getTripsNameForItenarary);
router.get('/getVehicles/:tripId', getVehiclesByTripIdForItenarary);
router.get('/getAddOnTrips/:tripId', getAddOnTripsNameForItenarary);
router.get('/getActivities/:tripId', getActivitiesNameForItenarary);
router.get('/getAddOnVehicles/:addOnTripId', getAddOnVehiclesByTripIdForItenarary);
router.get('/accommodations', getAccommodationsByCategoryAndDestination);
router.get('/selectedAccommodation/:id', getSelectedAccommodationDetailsForItenarary);

export default router;
