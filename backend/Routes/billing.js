import express from "express";
import {
  getBillerDetails,
  getConfirmedClientsByBilling,
  getClientDetails,
  addAdditionalItems,
  getAdditionalItems,
  deleteAllAdditionalItems,
  downloadItineraryByBilling,
  downloadInvoiceByBilling,
  downloadVoucherByBilling,
  getBookedClientsByBilling,
  getTransactions,
  downloadCustomItineraryByBilling,
  downloadInvoiceBasedData,
  downloadDueDateBasedData,
  downloadTourDateBasedData,
  downloadInvoiceDateBasedData,
  downloadConfirmedClientsWithoutAnyPayments
} from "../Controllers/billingController.js";

const router = express.Router();
router.get("/billingEmployeeDetails/:billerId", getBillerDetails);
router.get("/confirmed-clients", getConfirmedClientsByBilling);
router.get("/booked-clients", getBookedClientsByBilling);
router.get("/ClientDetailsFetch/:id", getClientDetails);
router.post("/addAdditionalItems", addAdditionalItems);
router.get("/getAdditionalItems/:clientId", getAdditionalItems);
router.delete("/deleteAllAdditionalItems", deleteAllAdditionalItems);
router.post("/downloadItineraryByBilling", downloadItineraryByBilling);
router.post("/downloadCustomItineraryByBilling", downloadCustomItineraryByBilling);
router.post("/downloadInvoiceByBilling", downloadInvoiceByBilling);
router.post("/downloadVoucherByBilling", downloadVoucherByBilling);
router.get("/transactions", getTransactions);
router.post("/downloadInvoiceBasedData", downloadInvoiceBasedData);
router.post('/downloadDueDateBasedData', downloadDueDateBasedData);
router.post('/downloadTourDateBasedData', downloadTourDateBasedData);
router.post('/downloadInvoiceDateBasedData', downloadInvoiceDateBasedData);
router.post('/downloadConfirmedClientsWithoutAnyPayments', downloadConfirmedClientsWithoutAnyPayments);





export default router;
