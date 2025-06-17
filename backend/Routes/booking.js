import express from "express";
import { getBookerDetails } from "../Controllers/bookingController.js";

const router = express.Router();
router.get("/bookingEmployeeDetails/:bookerId", getBookerDetails);




export default router;
