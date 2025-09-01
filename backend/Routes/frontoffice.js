import express from "express";
import {
  getfrontofficeDetails,
  getAllClientsToCreate,
  registerClient,
  downloadClientsData,
  searchClientByMobileAndCompany,
  fetchClientById,
  updateClient,
  getAllClients,
  getTakenCount
} from "../Controllers/frontofficeController.js";

const router = express.Router();

router.get("/frontofficeDetails/:frontofficeId", getfrontofficeDetails);
router.get("/allClientsToCreate", getAllClientsToCreate);
router.post("/registerClient", registerClient);
router.post('/searchClient', searchClientByMobileAndCompany);
router.get('/fetchClient/:id', fetchClientById);
router.put('/updateClient/:clientId', updateClient);
router.post('/downloadClientsData', downloadClientsData);
router.get("/all-clients", getAllClients);
router.get("/taken-today", getTakenCount);


export default router;
