import express from "express";
import {
  getfrontofficeDetails,
  registerClient,
  downloadClientsData,
  searchClientByMobileAndCompany,
  fetchClientById,
  updateClient,
  getAllClients
} from "../Controllers/frontofficeController.js";

const router = express.Router();

router.get("/frontofficeDetails/:frontofficeId", getfrontofficeDetails);
router.post("/registerClient", registerClient);
router.post('/searchClient', searchClientByMobileAndCompany);
router.get('/fetchClient/:id', fetchClientById);
router.put('/updateClient/:clientId', updateClient);
router.post('/downloadClientsData', downloadClientsData);
router.get("/all-clients", getAllClients);


export default router;
