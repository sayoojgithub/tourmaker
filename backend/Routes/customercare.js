import express from "express";
import {
  getCustomerCareDetails,
  getBookedClientsByCustomerCare,
  getClientDetails,
  downloadItineraryByCustomerCare,
  getTodoClientsByCustomerCare,
  changeToOngoing,
  getOngoingClientsByCustomerCare,
  getPendingClientsByCustomerCare,
  changeToCompleted,
  getCompletedClientsByCustomerCare,
  downloadCustomItineraryByCustomCare,
  addFeedback,
  getClientHistory,
  getClientsWithFeedbacks,
  changeToHomeReached,
  changeToReviewGiven,
  downloadClientReport
} from "../Controllers/customercareController.js";
const router = express.Router();
router.get("/customerCareDetails/:customercareId", getCustomerCareDetails);
router.get("/booked-clients", getBookedClientsByCustomerCare);
router.get("/ClientDetailsFetch/:id", getClientDetails);
router.post("/downloadItineraryByCustomerCare",downloadItineraryByCustomerCare);
router.post("/downloadCustomItineraryByCustomCare", downloadCustomItineraryByCustomCare);
router.get("/todo-clients", getTodoClientsByCustomerCare);
router.post("/changeToOngoing", changeToOngoing);
router.get("/ongoing-clients", getOngoingClientsByCustomerCare);
router.get("/pending-clients", getPendingClientsByCustomerCare);
router.post("/changeToCompleted", changeToCompleted);
router.get("/completed-clients", getCompletedClientsByCustomerCare);
router.post("/addFeedback", addFeedback);
router.get("/client-history/:clientId", getClientHistory);
router.get("/todo-clients-with-feedback", getClientsWithFeedbacks);
router.post("/changeToHomeReached", changeToHomeReached);
router.post("/changeToReviewGiven", changeToReviewGiven);
router.post("/download-client-report", downloadClientReport);

export default router;
