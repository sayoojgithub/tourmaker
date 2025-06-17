import express from "express";
import {
  getPurchaserDetails,
  createDestination,
  getDestinationsName,
  createAccommodation,
  getAccommodationsByPurchaser,
  getAccommodationById,
  updateAccommodation,
  createTravelAgency,
  getTravelAgenciesByPurchaser,
  getTravelAgencyById,
  updateTravelAgency,
  getTravelAgencyByIdForVehicle,
  createVehicle,
  getVehiclesByPurchaser,
  deleteVehicle,
  getTravelAgenciesByPurchaserIdForTrip,
  getVehicleCategories,
  fetchVehicles,
  addTrip,
  getTripsByPurchaser,
  getTripById,
  updateTrip,
  getTripsByDestinationAndPurchaser,
  addAddOnTrip,
  getAddOnTripsByPurchaser,
  getAddOnTripById,
  updateAddOnTrip,
  addActivity,
  getActivitiesByPurchaser,
  deleteActivity,
  getActivityById,
  updateActivity,
  createFixedTour,
  getFixedTripsByPurchaser,
  getFixedTourById,
  updateFixedTour,
  getArticleNumbers,
  createSpecialTour,
  getSpecialTripsByPurchaser,
  getSpecialTourById,
  getArticleNumbersSpecialTour,
  updateSpecialTour

  
} from "../Controllers/purchaserController.js";

const router = express.Router();
router.get("/purchaserDetails/:purchaserId", getPurchaserDetails);
router.post("/createDestination", createDestination);
router.get("/getDestinationsName", getDestinationsName);
//____________Accommodation____________//
router.post("/createAccommodation", createAccommodation);
router.get("/accommodations", getAccommodationsByPurchaser);
router.get("/accommodation/:accommodationId", getAccommodationById);
router.put("/updateAccommodation/:accommodationId", updateAccommodation);

// _____________TravelAgency__________//
router.post("/createTravelAgency", createTravelAgency);
router.get("/travelAgencies", getTravelAgenciesByPurchaser);
router.get("/travelAgency/:travelAgencyId", getTravelAgencyById);
router.put("/updateTravelAgency/:travelAgencyId", updateTravelAgency);

//_____________Vehicle______________//
router.get('/getTravelAgency/:travelAgencyId',getTravelAgencyByIdForVehicle );
router.post("/createVehicle", createVehicle);
router.get("/vehicles", getVehiclesByPurchaser);
router.delete('/Deletevehicle/:vehicleId',deleteVehicle );

//____________Trip___________//
router.get('/getTravelAgenciesName', getTravelAgenciesByPurchaserIdForTrip);
router.get('/getVehicleCategories', getVehicleCategories);
router.get('/getVehicles', fetchVehicles);
router.post('/addTrip', addTrip);
router.get("/trips",getTripsByPurchaser)
router.get("/trip/:tripId",getTripById)
router.put('/updateTrip/:tripId', updateTrip);

//_____________ADDON TRIP____________//
router.get("/tripsName", getTripsByDestinationAndPurchaser);
router.post('/addAddOnTrip', addAddOnTrip);
router.get("/addOnTrips",getAddOnTripsByPurchaser)
router.get("/addOnTrip/:tripId",getAddOnTripById)
router.put('/updateAddOnTrip/:tripId', updateAddOnTrip);


//____________ADD ACTIVITY ____________//
router.post('/addActivity', addActivity);
router.get("/activities",getActivitiesByPurchaser)
router.delete("/deleteActivity/:id", deleteActivity);
router.get("/activity/:activityId",getActivityById)
router.put('/updateActivity/:activityId', updateActivity);


//_____________ADD FIXED TOUR_____________//
router.get('/getArticleNumbers', getArticleNumbers);
router.post("/createFixedTour", createFixedTour);
router.get('/fixedTrips', getFixedTripsByPurchaser);
router.get("/fixedTour/:fixedTourId", getFixedTourById);
router.put("/updateFixedTour/:id", updateFixedTour);

//______________ADD SPECIAL TOUR_____________//
router.post("/createSpecialTour", createSpecialTour);
router.get('/specialTrips', getSpecialTripsByPurchaser);
router.get("/specialTour/:specialTourId", getSpecialTourById);
router.get('/getArticleNumbersSpecialTour', getArticleNumbersSpecialTour);
router.put("/updateSpecialTour/:id", updateSpecialTour);




export default router;
