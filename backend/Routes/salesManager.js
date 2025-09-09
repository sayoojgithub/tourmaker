import express from "express";
import {
  getsalesManagerDetails,
  getAllClients,
  getExecutivesWithClientCounts,
  getAllExecutives,
  changeExecutive,
  getClientStatusCounts,
  getExecutivesByName,
  getClientStatusCountsOfExecutive,
  getAllClientsOfExecutive,
  downloadClientsData,
  getExecutivesBySalesManager,
  getFrontOfficersBySalesManager,
  downloadClientsDataOfExecutive,
  createPoints,
  getPoints,
  updateSinglePoint,
  downloadClientsDataOfFrontOfficer,
  downloadExecutiveRemarksReport,
  getDestinationsBySalesManager,
  downloadDestinationBasedClientReport,
  downloadFrontOfficerMonthlyReport
  
} from "../Controllers/salesManagerController.js";

const router = express.Router();
router.get("/salesManagerDetails/:salesManagerId", getsalesManagerDetails);
router.get('/all-clients', getAllClients);
router.get('/all-executives', getExecutivesWithClientCounts);
router.get("/all-executives-for-select", getAllExecutives);
router.post('/change-executive', changeExecutive);
router.get("/client-status-counts", getClientStatusCounts);
router.get("/all-executives-status", getExecutivesByName);
router.get("/client-status-counts-of-executive", getClientStatusCountsOfExecutive);
router.get('/all-clients-of-executive', getAllClientsOfExecutive);
router.post('/downloadClientsData', downloadClientsData);
router.get("/executives/:userId", getExecutivesBySalesManager);
router.get("/frontofficers/:userId", getFrontOfficersBySalesManager);
router.post('/downloadClientsDataOfExecutive', downloadClientsDataOfExecutive);
router.post("/pointsCreate", createPoints);
router.get("/getPoints", getPoints);
router.patch("/updateSinglePoint", updateSinglePoint);
router.post("/downloadClientsDataOfFrontOfficer", downloadClientsDataOfFrontOfficer);
router.post("/downloadExecutiveRemarksReport", downloadExecutiveRemarksReport);
router.get("/destinations/:userId", getDestinationsBySalesManager);
router.post("/downloadDestinationBasedClientReport", downloadDestinationBasedClientReport);
router.post("/downloadFrontOfficerMonthlyReport", downloadFrontOfficerMonthlyReport);




export default router;
