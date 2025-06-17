import express from "express";
import {
  getCompanyDetails,
  updateProfile,
  employeeRegistration,
  getDestinationsName,
  addBankDetails,
  getBankList,
  fetchBankDetails,
  updateBankDetails,
  deleteBank,
  getCompanyExecutives,
  getExecutiveDestinations,
  deleteExecutiveDestination,
  addExecutiveDestination,
   getCompanyCustomerCares,
  getCustomerCareDestinations,
  addCustomerCareDestination,
  deleteCustomerCareDestination,
  getFrontOfficerDestinationCount,
} from "../Controllers/companyController.js";

const router = express.Router();
router.get("/companyDetails/:companyId", getCompanyDetails);
router.post("/updateProfile/:id", updateProfile);
router.get("/getDestinationsName", getDestinationsName);
router.post("/employeeRegistration/:id", employeeRegistration);
router.post("/addBankDetails/:agencyId", addBankDetails);
router.get("/banksList", getBankList);
router.get("/fetchBankDetails/:companyId/:bankId", fetchBankDetails);
router.put("/updateBankDetails/:companyId/:bankId", updateBankDetails);
router.delete("/deleteBank/:id", deleteBank);
router.get("/executivesList", getCompanyExecutives);
router.get("/executiveDestinations/:executiveId", getExecutiveDestinations);
router.delete("/deleteExecutiveDestinations/:executiveId/:destinationId", deleteExecutiveDestination);
router.post("/addExecutiveDestination/:executiveId", addExecutiveDestination);
router.get("/customerCaresList", getCompanyCustomerCares);
router.get("/customercareDestinations/:customercareId", getCustomerCareDestinations);
router.post("/addCustomerCareDestination/:customercareId", addCustomerCareDestination);
router.delete("/deleteCustomerCareDestinations/:customercareId/:destinationId", deleteCustomerCareDestination);
router.post("/front-officer-destination-count", getFrontOfficerDestinationCount);
export default router;
