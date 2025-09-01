import express from "express";

import { getEntryDetails,createClientByEntry,searchClientsByEntry, downloadClientsReport } from "../Controllers/entryController.js";

const router = express.Router();
router.get("/entryEmployeeDetails/:entryId", getEntryDetails);
router.post("/client-by-entry", createClientByEntry)
router.get("/search-clients", searchClientsByEntry);
router.post("/download-report", downloadClientsReport);



export default router;
