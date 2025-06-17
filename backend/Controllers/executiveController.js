import Executive from "../models/Executive.js";
import Client from "../models/Client.js";
import mongoose from "mongoose";
import Destination from "../models/Destination.js";
import Trip from "../models/Trip.js";
import AddOnTrip from "../models/AddOnTrip.js";
import Activity from "../models/Activity.js";
import Accommodation from "../models/Accommodation.js";
import FixedTour from "../models/FixedTour.js";
import SpecialTour from '../models/SpecialTour.js'
import CustomItinerary from "../models/CustomItinerary.js";
import PDFDocument from "pdfkit";
import https from "https";
import http from "http";
import { URL } from "url";
import Agency from "../models/Agency.js";
import { format,subDays } from 'date-fns';
// ______________USED IN THE EXECUTIVE PROFILE FOR SHOWING CURRENT EXECUTIVE DETAIL_____________
export const getexecutiveDetails = async (req, res) => {
  const { executiveId } = req.params;

  try {
    const executive = await Executive.findById(executiveId);

    if (!executive) {
      return res.status(404).json({ message: "not found" });
    }

    res.status(200).json(executive);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getNewClientsByExecutive = async (req, res) => {
  try {
    const { executiveId, clientId, page = 1, limit = 4 } = req.query;

    const filters = {
      //executiveId,
      executiveId: new mongoose.Types.ObjectId(executiveId),
      executiveVisitedStatus: false,
      confirmedStatus: false,
      bookedStatus: false,
      ongoingStatus: false,
      completedStatus: false,
    };

    // Only add clientId to filters if provided
    if (clientId) filters.clientId = clientId;

    const skip = (page - 1) * limit;

    const clients = await Client.find(filters)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalClients = await Client.countDocuments(filters);
    const totalPages = Math.ceil(totalClients / limit);

    res.status(200).json({
      clients,
      totalPages,
      currentPage: Number(page),
      totalClients,
    });
  } catch (error) {
    console.error("Error fetching new clients:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching new clients" });
  }
};

export const getClientDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving client details", error });
  }
};

export const updateClient = async (req, res) => {
  const { clientId } = req.params; // Get the client ID from the route parameters
  const {
    name,
    mobileNumber,
    whatsappNumber,
    additionalNumber,
    primaryTourName,
    tourName,
    groupType,
    numberOfPersons,
    startDate,
    endDate,
    numberOfDays,
    pincode,
    district,
    state,
    clientContactOption,
    clientType,
    clientCurrentLocation,
    connectedThrough,
    behavior,
    additionalRequirments,
    status,
    scheduleDate,
    response,
  } = req.body;

  try {
    // Find the client by ID
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found." });
    }

    // Update fields with new data, pushing status, scheduleDate, and response into their respective arrays
    client.name = name || client.name; // Update if new value provided
    client.mobileNumber = mobileNumber || client.mobileNumber;
    client.whatsappNumber = whatsappNumber || client.whatsappNumber;
    client.additionalNumber = additionalNumber || client.additionalNumber;
    client.primaryTourName = primaryTourName || client.primaryTourName;
    client.tourName = tourName.length ? tourName : client.tourName;
    client.groupType = groupType || client.groupType;
    client.numberOfPersons = numberOfPersons || client.numberOfPersons;
    client.startDate = startDate || client.startDate;
    client.endDate = endDate || client.endDate;
    client.numberOfDays = numberOfDays || client.numberOfDays;
    client.pincode = pincode || client.pincode;
    client.district = district || client.district;
    client.state = state || client.state;
    client.clientContactOption =
      clientContactOption || client.clientContactOption;
    client.clientType = clientType || client.clientType;
    client.clientCurrentLocation =
      clientCurrentLocation || client.clientCurrentLocation;
    client.connectedThrough = connectedThrough || client.connectedThrough;
    client.behavior = behavior || client.behavior;
    client.additionalRequirments =
      additionalRequirments || client.additionalRequirments;

    // Push new data into their respective arrays
    if (status) client.status.push(status);
    if (scheduleDate) client.scheduleDate.push(scheduleDate);
    if (response) client.response.push(response);

    // Set executiveVisitedStatus to true
    client.executiveVisitedStatus = true;

    // Save the updated client
    await client.save();

    // Respond with the updated client data
    res.status(200).json(client);
  } catch (error) {
    console.error("Error updating client:", error);
    res
      .status(500)
      .json({ message: "An error occurred while updating the client." });
  }
};

export const getPendingClientsByExecutive = async (req, res) => {
  try {
    const {
      executiveId,
      clientId,
      mobileNumber,
      page = 1,
      limit = 4,
    } = req.query;

    const matchFilters = {
      executiveId: new mongoose.Types.ObjectId(executiveId),
      executiveVisitedStatus: true,
      confirmedStatus: false,
      bookedStatus: false,
      ongoingStatus: false,
      completedStatus: false,
    };

    // Add optional filters
    if (clientId) matchFilters.clientId = clientId;
    if (mobileNumber) matchFilters.mobileNumber = mobileNumber;

    const skip = (page - 1) * limit;

    // Aggregate pipeline to fetch clients
    const clients = await Client.aggregate([
      { $match: matchFilters },
      {
        $match: {
          $expr: { $eq: [{ $size: "$itinerary" }, 0] }, // Check if itenary array is empty
        },
      },
      { $sort: { createdAt: -1, _id: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
    ]);

    // Count total documents matching the conditions for pagination
    const totalClientsResult = await Client.aggregate([
      { $match: matchFilters },
      {
        $match: {
          $expr: { $eq: [{ $size: "$itinerary" }, 0] }, // Check if itenary array is empty
        },
      },
      { $count: "total" },
    ]);

    const totalClients = totalClientsResult[0]?.total || 0;
    const totalPages = Math.ceil(totalClients / limit);

    res.status(200).json({
      clients,
      totalPages,
      currentPage: Number(page),
      totalClients,
    });
  } catch (error) {
    console.error("Error fetching pending clients:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching pending clients" });
  }
};

export const getTodoClientsByExecutive = async (req, res) => {
  try {
    const {
      executiveId,
      clientId,
      mobileNumber,
      page = 1,
      limit = 4,
    } = req.query;

    // Set up date range for today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0); // Start of today

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999); // End of today

    // Build the match filters
    const matchFilters = {
      executiveId: new mongoose.Types.ObjectId(executiveId),
      executiveVisitedStatus: true,
      confirmedStatus: false,
      bookedStatus: false,
      ongoingStatus: false,
      completedStatus: false,
    };

    if (clientId) matchFilters.clientId = clientId;
    if (mobileNumber) matchFilters.mobileNumber = mobileNumber;

    const skip = (page - 1) * limit;

    // Fetch clients with matching schedule date and status condition, and apply pagination
    const clients = await Client.aggregate([
      { $match: matchFilters },
      {
        $addFields: {
          lastScheduleDate: { $arrayElemAt: ["$scheduleDate", -1] },
        },
      },
      {
        $match: {
          lastScheduleDate: { $gte: startOfToday, $lte: endOfToday },
        },
      },
      { $sort: { createdAt: -1, _id: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
      { $project: { lastScheduleDate: 0 } }, // Exclude the added field from the result
    ]);

    // Count total documents matching the conditions for pagination
    const totalClientsResult = await Client.aggregate([
      { $match: matchFilters },
      {
        $addFields: {
          lastScheduleDate: { $arrayElemAt: ["$scheduleDate", -1] },
        },
      },
      {
        $match: {
          lastScheduleDate: { $gte: startOfToday, $lte: endOfToday },
        },
      },
      { $count: "total" },
    ]);

    const totalClients = totalClientsResult[0]?.total || 0;
    const totalPages = Math.ceil(totalClients / limit);

    res.status(200).json({
      clients,
      totalPages,
      currentPage: Number(page),
      totalClients,
    });
  } catch (error) {
    console.error("Error fetching todo clients:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching todo clients" });
  }
};
export const getInterestedClientsByExecutive = async (req, res) => {
  try {
    const {
      executiveId,
      clientId,
      mobileNumber,
      page = 1,
      limit = 4,
    } = req.query;

    const matchFilters = {
      executiveId: new mongoose.Types.ObjectId(executiveId),
      executiveVisitedStatus: true,
      confirmedStatus: false,
      bookedStatus: false,
      ongoingStatus: false,
      completedStatus: false,
    };

    // Add optional filters
    if (clientId) matchFilters.clientId = clientId;
    if (mobileNumber) matchFilters.mobileNumber = mobileNumber;

    const skip = (page - 1) * limit;

    // Aggregate pipeline to fetch clients
    const clients = await Client.aggregate([
      { $match: matchFilters },
      {
        $match: {
          $expr: { $gt: [{ $size: "$itinerary" }, 0] }, // Check if itinerary array length > 0
        },
      },
      { $sort: { createdAt: -1, _id: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
    ]);

    // Count total documents matching the conditions for pagination
    const totalClientsResult = await Client.aggregate([
      { $match: matchFilters },
      {
        $match: {
          $expr: { $gt: [{ $size: "$itinerary" }, 0] }, // Check if itinerary array length > 0
        },
      },
      { $count: "total" },
    ]);

    const totalClients = totalClientsResult[0]?.total || 0;
    const totalPages = Math.ceil(totalClients / limit);

    res.status(200).json({
      clients,
      totalPages,
      currentPage: Number(page),
      totalClients,
    });
  } catch (error) {
    console.error("Error fetching interested clients:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching interested clients" });
  }
};

export const getConfirmedClientsByExecutive = async (req, res) => {
  try {
    const {
      executiveId,
      clientId,
      mobileNumber,
      page = 1,
      limit = 4,
    } = req.query;

    const matchFilters = {
      executiveId: new mongoose.Types.ObjectId(executiveId),
      executiveVisitedStatus: true,
      confirmedStatus: true,
      bookedStatus: false,
      ongoingStatus: false,
      completedStatus: false,
    };

    // Add optional filters
    if (clientId) matchFilters.clientId = clientId;
    if (mobileNumber) matchFilters.mobileNumber = mobileNumber;

    const skip = (page - 1) * limit;

    // Aggregate pipeline to fetch clients
    const clients = await Client.aggregate([
      { $match: matchFilters },
      {
        $match: {
          $expr: { $gt: [{ $size: "$itinerary" }, 0] }, // Check if itinerary array length > 0
        },
      },
      { $sort: { createdAt: -1, _id: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
    ]);

    // Count total documents matching the conditions for pagination
    const totalClientsResult = await Client.aggregate([
      { $match: matchFilters },
      {
        $match: {
          $expr: { $gt: [{ $size: "$itinerary" }, 0] }, // Check if itinerary array length > 0
        },
      },
      { $count: "total" },
    ]);

    const totalClients = totalClientsResult[0]?.total || 0;
    const totalPages = Math.ceil(totalClients / limit);

    res.status(200).json({
      clients,
      totalPages,
      currentPage: Number(page),
      totalClients,
    });
  } catch (error) {
    console.error("Error fetching interested clients:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching interested clients" });
  }
};

export const getFixedTours = async (req, res) => {
  try {
    const { primaryTourNameId, clientId, page = 1, limit = 4 } = req.query;

    // Validate required parameters
    if (!primaryTourNameId) {
      return res
        .status(400)
        .json({ message: "Primary Tour Name ID is required." });
    }
    if (!clientId) {
      return res.status(400).json({ message: "Client ID is required." });
    }

    // Fetch the client document
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found." });
    }

    // Extract the companyId from the client document
    const companyId = client.companyId;
    if (!companyId) {
      return res
        .status(400)
        .json({ message: "Company ID is missing in the client document." });
    }

    // Query to filter tours based on primaryTourNameId and companyId
    const query = {
      "destination._id": primaryTourNameId,
      companyId: companyId,
    };

    // Pagination settings
    const skip = (page - 1) * limit;

    // Fetch tours with pagination
    const tours = await FixedTour.find(query)
      .skip(skip)
      .limit(Number(limit))
      .lean(); // Use lean() for faster read operations

    // Count total matching documents
    const totalTours = await FixedTour.countDocuments(query);

    // Respond with tours and pagination data
    res.status(200).json({
      tours,
      currentPage: Number(page),
      totalPages: Math.ceil(totalTours / limit),
      totalTours,
    });
  } catch (error) {
    console.error("Error fetching fixed tours:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching fixed tours." });
  }
};

export const getFixedTourById = async (req, res) => {
  try {
    const { fixedTourId } = req.params;

    // Fetch fixed tour details by ID
    const fixedTour = await FixedTour.findById(fixedTourId);

    if (!fixedTour) {
      return res.status(404).json({ message: "Fixed tour not found" });
    }

    // Convert startDates to Date objects if they are ISO strings
    const fixedTourWithDates = {
      ...fixedTour.toObject(),
      startDates: fixedTour.startDates.map((startDate) => ({
        date: new Date(startDate.date), // Ensure the date is a Date object
        available: startDate.available, // Include the available field
        id: startDate._id,
      })),
    };
    res.status(200).json(fixedTourWithDates);
  } catch (error) {
    console.error("Error fetching fixed tour details:", error);
    res.status(500).json({ message: "Failed to fetch fixed tour details" });
  }
};

export const downloadReferralItinerary = async (req, res) => {
  try {
    const { clientId, fixedTripId, date } = req.body;
    

    // Validate required fields
    if (!clientId || !fixedTripId || !date) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Find the FixedTour document by ID
    const fixedTour = await FixedTour.findById(fixedTripId);
    if (!fixedTour) {
      return res.status(404).json({ message: "FixedTour not found." });
    }

    // Extract itineraryText and other details
    const {
      itineraryText,
      tourName,
      articleNumber,
      destination,
      day,
      night,
      inclusionsList,
      exclusionsList,
      mrp,
    } = fixedTour;

    if (!itineraryText) {
      return res
        .status(404)
        .json({ message: "Itinerary text not found in FixedTour." });
    }
    // Find the Client document by clientId
    const client = await Client.findById(clientId).populate("companyId");
    if (!client) {
      return res.status(404).json({ message: "Client not found." });
    }

    const { name, numberOfPersons, mobileNumber, companyId, executiveId } =
      client; // Extract the necessary detail
    const company = client.companyId; // The populated Company (Agency) document

    // Ensure company exists
    if (!company) {
      return res
        .status(404)
        .json({ message: "Company not found for this client." });
    }

    // Extract company information from the populated Agency document
    const {
      name: companyName,
      email: companyEmail,
      mobileNumber: companyMobile,
      pincode: companyPincode,
      district: companyDistrict,
      state: companyState,
    } = company;

    const totalCost = mrp * numberOfPersons;

    // Update the Client's itinerary field
    const newItinerary = {
      itineraryId: fixedTripId,
      itineraryType: "fixed",
      dateId: date.id,
      status: "referral",
      time: new Date(), // Capture the exact current time
    };

    // Ensure only one object exists in the `itinerary` array
    if (client.itinerary.length > 0) {
      // Replace the existing object
      client.itinerary[0] = newItinerary;
    } else {
      // Push the new object if the array is empty
      client.itinerary.push(newItinerary);
    }
    await client.save();

    // Format the date for the header
    const formattedDate = new Date(date.date).toLocaleDateString("en-GB");

    const doc = new PDFDocument({ margin: 50 });

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=referral_itinerary_${tourName}.pdf`
    );

    // Pipe the PDF into the response
    doc.pipe(res);

    // Function to add border around the page
    function addBorder() {
      const margin = 40; // Set margin value to match your existing margin
      doc.lineWidth(5); // This sets a thick border line

      // Draw a rectangle (border) around the page
      doc
        .rect(
          margin,
          margin,
          doc.page.width - 2 * margin,
          doc.page.height - 2 * margin
        ) // Define the rectangle dimensions
        .strokeColor("black") // Set the border color to black
        .stroke(); // Apply the stroke
    }

    // Add the border to the first page
    addBorder();

    // Event listener to add the border to subsequent pages
    doc.on("pageAdded", () => {
      addBorder(); // Draw the border on new pages
    });

    // Add Header Section
    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("REFERRAL ITINERARY", { align: "center", underline: true })
      .moveDown(0.3);
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("GROUP TOUR", { align: "center", underline: true })
      .moveDown(0.5);
    // Add Subheadings
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text(tourName ? tourName.toUpperCase() : "N/A", { align: "center" })
      .moveDown(0.2);

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(destination?.label?.toUpperCase() || "N/A", { align: "center" })
      .moveDown(0.2);

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(` ${day} Day / ${night} Night`, { align: "center" })
      .moveDown(0.1);

    // Add Note
    doc
      .fillColor("red")
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("NOTE:", { underline: true })
      .moveDown(0.5);

    doc
      .fillColor("red")
      .fontSize(8)
      .font("Helvetica")
      .text(
        "THIS IS JUST A REFERRAL ITINERARY. AFTER CONFIRMATION, PLEASE CONTACT OUR EXECUTIVE AND ASK FOR YOUR CONFIRMED ITINERARY. THE ITINERARY HERE IS NOT VALID FOR YOUR TOUR.",
        { align: "justify" }
      )
      .moveDown(1);

    // Add Itinerary Text
    doc
      .fontSize(18)
      .fillColor("black")
      .font("Helvetica-Bold")
      .text("TOUR ITINERARY:", { underline: true })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .fillColor("black")
      .font("Helvetica")
      .text(itineraryText, { align: "justify" })
      .moveDown(1);

    // Add Inclusions
    if (inclusionsList.length) {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("INCLUSIONS:", { underline: true })
        .moveDown(0.5);

      inclusionsList.forEach((item) => {
        doc
          .fontSize(10)
          .font("Helvetica")
          .text(`• ${item.toUpperCase()}`, { align: "left" }); // Use a dot (•) symbol
      });

      doc.moveDown(1);
    }

    // Add Exclusions
    if (exclusionsList.length) {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("EXCLUSIONS:", { underline: true })
        .moveDown(0.5);

      exclusionsList.forEach((item) => {
        doc
          .fontSize(10)
          .font("Helvetica")
          .text(`• ${item.toUpperCase()}`, { align: "left" }); // Use a dot (•) symbol
      });

      doc.moveDown(1);
    }

    // Customer Section
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("CUSTOMER", { underline: true }); // Add heading
    //.moveDown(0.5); // Add space below the heading

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`CLIENT NAME: ${name?.toUpperCase() || "N/A"}`)
      .moveDown(0.1)
      .text(`CLIENT ID: ${client?.clientId || "N/A"}`) // Client ID
      .moveDown(0.1)
      .text(`TOTAL PAX: ${numberOfPersons || "N/A"}`)
      .moveDown(1);

    // Tour Section
    doc.fontSize(12).font("Helvetica-Bold").text("TOUR", { underline: true }); // Add heading
    //.moveDown(0.5); // Add space below the heading

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`TOUR DATE: ${formattedDate || "N/A"}`)
      .moveDown(0.1)
      .text(`ARTICLE NO: ${articleNumber || "N/A"}`)
      .moveDown(0.1)
      .text(`PRICE PER HEAD: ${mrp ? `${mrp}` : "N/A"}`)
      .moveDown(0.1)
      .text(`TOTAL COST: ${totalCost || "N/A"}`)
      .moveDown(1); // Add space after Tour section

    const executiveDetails = await Executive.findById(executiveId);
    if (executiveDetails) {
      doc
        .moveDown(0.3) // Add space before executive details
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("EXECUTIVE:", { underline: true, align: "left" });

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`EXECUTIVE NAME: ${executiveDetails.name.toUpperCase()}`, {
          align: "left",
        })
        .text(`EXECUTIVE PHONE: ${executiveDetails.mobileNumber}`, {
          align: "left",
        })
        .moveDown(1);
    }
    // Add Payment Policy Section
doc
.fontSize(12)
.font("Helvetica-Bold")
.text("PAYMENT POLICY", { underline: true })
.moveDown(0.5);

// Payment policy array
const paymentPolicy = [
". A minimum payment is required for booking a tour - Non refundable(The minimum payment will vary depending on the tour).",
". 21-35 Days before date of departure : 50% of Cost .",
". 20 Days before date of departure : 100% of Total cost.",
];

// Cancellation and refund policy array
const cancellationPolicy = [
". 60 Days & Prior to Arrival - 25% of the Tour/Service Cost.",
". 59 Days to 30 Days Prior To Arrival - 50% of the Tour/Service Cost.",
". 29 Days to 15 Days Prior To Arrival - 75% of the Tour/Service Cost.",
". 14 Days and less Prior To Arrival – No refund.",
". Transportation and accommodation are as per itinerary only; if you have to change any of them, we will not be responsible for any kind of refund.",
". There will be no refund for add-ons.",
];

// Loop through payment policy and display each one
paymentPolicy.forEach((policy) => {
doc.fontSize(8).text(policy, { align: "left" }).moveDown(0.2);
});

// Add Cancellation and Refund Policy Section
doc
.fontSize(12)
.font("Helvetica-Bold")
.text("CANCELLATION AND REFUND POLICY", { underline: true })
.moveDown(0.5);

cancellationPolicy.forEach((policy) => {
doc.fontSize(8).text(policy, { align: "left" }).moveDown(0.2);
});

    // Add Terms and Conditions Section Below Customer and Tour Section
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("TERMS AND CONDITIONS", { underline: true })
      .moveDown(0.5);

    // Terms array
    const terms = [
      "1. If you're not able to reach out the destination on time. That is not our responsibility.",
      "2. For international hotels, the standard check-in time is 2:30 PM, and check-out is at 12:30 PM. For domestic hotels, check-in begins at 12:30 PM, with check-out scheduled for 10:00 AM.",
      "3. The booking stands liable to be cancelled if 100% payment is not received less than 20 days before date of departure. If the trip is cancelled due to this reason advance will not be refundable. If you are not pay the amount that in mentioned in payment policy then tour will be cancelled.",
      "4. There is no refund option in case you cancel the tour yourself.",
      "5. There is no refund available for group or scheduled tours.",
      "6. All activities which are not mentioned in the above itinerary such as visiting additional spots or involving in paid activities, if arranging separate cab etc. is not included in this.",
      "7. In case of using additional transport will be chargeable.",
      "8. All transport on the tour will be grouped together. Anyone who deviates from it will be excluded from this package.",
      "9. The company has the right for expelling persons who disagree with passengers or misrepresent the company during the trip.",
      "10. The company does not allow passengers to give tips to the driver for going additional spots.",
      "11. In case of cancellation due to any reason such as Covid, strike, problems on the part of railways, malfunctions, natural calamities etc., package amount will not be refunded.",
      "12. The Company will not be liable for any confirmation of train tickets, flight tickets, other transportation or any other related items not included in the package.",
      "13. In Case of Events And Circumstances Beyond Our Control, We Reserve The Right To Change All Or Parts Of The Contents Of The Itinerary For Safety And Well Being Of Our Esteemed Passengers.",
      "14. Bathroom Facility | Indian or European.",
      "15. In season rooms will not be the same as per itinerary but category will be the same (Budget economy).",
      "16. Charge will be the same from the age of 5 years.",
      "17. We are not providing tourist guide, if you are taking their service in your own cost we will not be responsible for the same.",
      "18. You Should reach to departing place on time, also you should keep the time management or you will not be able to cover all the place.",
      "19. If the climate condition affects the sightseeing that mentioned in itinerary, then we won’t provide you the additional spots apart from the itinerary.",
      "20. Transportation timing 8 am to 6 pm, if use vehicle after that then cost will be extra.",
      "21. Will visit places as per itinerary only, if you visit other than this then cost will be extra.",
      "22. If any customers misbehave with our staffs improperly then we will cancel his tour immediately and after that he can't continue with this tour.",
      "23. If the trip is not fully booked or cancelled due to any special circumstances, we will postpone the trip to another day. Otherwise, if the journey is to be done on the pre-arranged day, the customers will have to bear the extra money themselves.",
      "24. If you have any problems with the tour, please notify us as soon as possible so that we can resolve the problem. If you raise the issue after the tour, we will not be able to help you.",
      "25. Our company does not provide specific seats on the Volvo bus, if you need a seat particularly, please let the executive know during the confirmation of your reservation. (requires additional payment).",
      "26. If there are any changes to your tour, such as a date modification or postponement, you must notify us and obtain confirmation from our official email ID trippensholidays@gmail.com to your personal or official email. We will not acknowledge any proof of changes from the client unless confirmed through this official channel.",
    ];

    // Loop through terms and display each one
    terms.forEach((term) => {
      doc.fontSize(8).text(term, { align: "left" }).moveDown(0.2);
    });

    // Add company name with underline in the center
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(companyName, { underline: true, align: "center" });

    // Add spacing after the company name
    // doc.moveDown(0.5);

    // Add company details explicitly and center-align them
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Address: ${companyDistrict}, ${companyState}`, { align: "center" }) // Updated line for address
      .text(`Pincode: ${companyPincode}`, { align: "center" })
      .text(`Contact No: ${companyMobile}`, { align: "center" })
      .text(`Email: ${companyEmail}`, { align: "center" });

    // Finalize the PDF and end the stream
    doc.end();
  } catch (error) {
    console.error("Error in downloadReferralItinerary:", error);
    res
      .status(500)
      .json({ message: "An error occurred while generating the PDF." });
  }
};
const fetchImageBuffer = (url) => {
  return new Promise((resolve, reject) => {
    const { protocol } = new URL(url); // Get the protocol from the URL
    const module = protocol === "https:" ? https : http;

    module
      .get(url, (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", (error) => reject(error));
  });
};
export const downloadConfirmItinerary = async (req, res) => {
  try {
    const { clientId, fixedTripId, date } = req.body;

    // Validate required fields
    if (!clientId || !fixedTripId || !date) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Find the FixedTour document by ID
    const fixedTour = await FixedTour.findById(fixedTripId);
    if (!fixedTour) {
      return res.status(404).json({ message: "FixedTour not found." });
    }
    // Format the date for the header
    const formattedDate = new Date(date.date).toLocaleDateString("en-GB");

    // Extract itineraryText and other details
    const {
      itineraryText,
      tourName,
      articleNumber,
      destination,
      day,
      night,
      inclusionsList,
      exclusionsList,
      mrp,
    } = fixedTour;

    if (!itineraryText) {
      return res
        .status(404)
        .json({ message: "Itinerary text not found in FixedTour." });
    }
    // Find the Client document by clientId
    const client = await Client.findById(clientId).populate("companyId");
    if (!client) {
      return res.status(404).json({ message: "Client not found." });
    }

    const { name, numberOfPersons, mobileNumber, companyId, executiveId } =
      client; // Extract the necessary detail
    const company = client.companyId; // The populated Company (Agency) document

    // Ensure company exists
    if (!company) {
      return res
        .status(404)
        .json({ message: "Company not found for this client." });
    }

    // Extract company information from the populated Agency document
    const {
      name: companyName,
      email: companyEmail,
      mobileNumber: companyMobile,
      pincode: companyPincode,
      district: companyDistrict,
      state: companyState,
      bankDetails: companyBankDetails,
      cgstPercentage = 0,  // Default to 0 if not provided
      sgstPercentage = 0   // Default to 0 if not provided
    } = company;
    

    const totalCost = mrp * numberOfPersons;
    // Calculate SGST and CGST (2.5% each)
    const cgstRate = cgstPercentage ? cgstPercentage / 100 : 0;
    const sgstRate = sgstPercentage ? sgstPercentage / 100 : 0;
    const sgst = (totalCost * sgstRate).toFixed(2);
    const cgst = (totalCost * cgstRate).toFixed(2);

   // Update `amountToBePaid`
   const amountToBePaid = (totalCost + parseFloat(sgst) + parseFloat(cgst)).toFixed(2);

    // Find the specific start date object in FixedTour
    const startDate = fixedTour.startDates.find(
      (start) => start._id.toString() === date.id
    );

    if (!startDate) {
      return res
        .status(404)
        .json({ message: "Start date not found in FixedTour." });
    }

    // Check if there is enough availability for the number of persons
    if (startDate.available < numberOfPersons) {
      return res
        .status(400)
        .json({ message: "Not enough availability for the selected date." });
    }

    // Update booked and available counts in FixedTour
    startDate.booked += numberOfPersons;
    startDate.available = startDate.totalPax - startDate.booked;

    await fixedTour.save();

    // Update the Client's itinerary field
    const newItinerary = {
      itineraryId: fixedTripId,
      itineraryType: "fixed",
      dateId: date.id,
      status: "confirm",
      time: new Date(), // Capture the exact current time
    };

    // Ensure only one object exists in the `itinerary` array
    if (client.itinerary.length > 0) {
      // Replace the existing object
      client.itinerary[0] = newItinerary;
    } else {
      // Push the new object if the array is empty
      client.itinerary.push(newItinerary);
    }
    client.confirmedStatus = true;
    const exactDate = new Date(date.date);
    const finalizedTourDate = exactDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    client.finalizedTourDate = finalizedTourDate;
    client.finalizedTourDateAt = new Date(date.date)
    const finalizedTourEndDate = new Date(date.date);
    finalizedTourEndDate.setDate(finalizedTourEndDate.getDate() + day - 1);
    client.finalizedTourEndDateAt = finalizedTourEndDate;
    // Calculate the due date (10 days before finalizedTourDate)
    exactDate.setDate(exactDate.getDate() - 10);

    const dueDate = exactDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    client.dueDate = dueDate;
    client.dueDateAt = exactDate;
    client.totalCost = totalCost;
    client.totalCostWithAdditionalAmount = totalCost;
    client.amountToBePaid = amountToBePaid;
    client.balance = amountToBePaid;
    client.sgst = sgst;
    client.cgst = cgst;
    const downloadDate = new Date().toLocaleDateString("en-GB");
    const confirmedDate = new Date();
    confirmedDate.setUTCHours(0, 0, 0, 0);
    const itineraryData = {
      heading: "GROUP TOUR",
      clientName: name?.toUpperCase() || "N/A",
      destination: destination?.label?.toUpperCase() || "N/A",
      tourName: tourName || "N/A",
      articleNumber: articleNumber || "N/A",
      duration: `${day} Day / ${night} Night`,
      date: formattedDate,
      pricePerHead: mrp || 0,
      totalCost: totalCost || 0,
      itineraryText: itineraryText || "N/A",
      inclusionsList: inclusionsList.map((item) => item.toUpperCase()),
      exclusionsList: exclusionsList.map((item) => item.toUpperCase()),
      //finalizedTourDate: finalizedTourDate,
      //amountToBePaid: amountToBePaid,
      downloadDate: downloadDate,
    };
    client.itineraryDetails = itineraryData;
    client.confirmedDateAt = confirmedDate;
     client.confirmedDestination = {
      id: destination._id,
      name: destination.label, // or destination.value, since both are same
    };

    await client.save();

    const doc = new PDFDocument({ margin: 50 });

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=referral_itinerary_${tourName}.pdf`
    );

    // Pipe the PDF into the response
    doc.pipe(res);

    // Function to add border around the page
    function addBorder() {
      const margin = 40; // Set margin value to match your existing margin
      doc.lineWidth(5); // This sets a thick border line

      // Draw a rectangle (border) around the page
      doc
        .rect(
          margin,
          margin,
          doc.page.width - 2 * margin,
          doc.page.height - 2 * margin
        ) // Define the rectangle dimensions
        .strokeColor("black") // Set the border color to black
        .stroke(); // Apply the stroke
    }

    // Add the border to the first page
    addBorder();

    // Event listener to add the border to subsequent pages
    doc.on("pageAdded", () => {
      addBorder(); // Draw the border on new pages
    });

    // Add Header Section
    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("CONFIRM ITINERARY", { align: "center", underline: true })
      .moveDown(0.3);
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("GROUP TOUR", { align: "center", underline: true });

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Confirm Date: ${downloadDate}`, { align: "right" });

    doc.moveDown(0.1); // Add spacing before next section

    // Add Subheadings
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text(tourName ? tourName.toUpperCase() : "N/A", { align: "center" })
      .moveDown(0.2);

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(destination?.label?.toUpperCase() || "N/A", { align: "center" })
      .moveDown(0.2);

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(` ${day} Day / ${night} Night`, { align: "center" })
      .moveDown(0.3);

    // Add Itinerary Text
    doc
      .fontSize(18)
      .fillColor("black")
      .font("Helvetica-Bold")
      .text("TOUR ITINERARY:", { underline: true })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .fillColor("black")
      .font("Helvetica")
      .text(itineraryText, { align: "justify" })
      .moveDown(1);

    // Add Inclusions
    if (inclusionsList.length) {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("INCLUSIONS:", { underline: true })
        .moveDown(0.5);

      inclusionsList.forEach((item) => {
        doc
          .fontSize(10)
          .font("Helvetica")
          .text(`• ${item.toUpperCase()}`, { align: "left" }); // Use a dot (•) symbol
      });

      doc.moveDown(1);
    }

    // Add Exclusions
    if (exclusionsList.length) {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("EXCLUSIONS:", { underline: true })
        .moveDown(0.5);

      exclusionsList.forEach((item) => {
        doc
          .fontSize(10)
          .font("Helvetica")
          .text(`• ${item.toUpperCase()}`, { align: "left" }); // Use a dot (•) symbol
      });

      doc.moveDown(1);
    }

    // Customer Section
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("CUSTOMER", { underline: true }); // Add heading
    //.moveDown(0.5); // Add space below the heading

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`CLIENT NAME: ${name?.toUpperCase() || "N/A"}`)
      .moveDown(0.1)
      .text(`CLIENT ID: ${client?.clientId || "N/A"}`) // Client ID
      .moveDown(0.1)
      .text(`TOTAL PAX: ${numberOfPersons || "N/A"}`)
      .moveDown(1);

    // Tour Section
    doc.fontSize(12).font("Helvetica-Bold").text("TOUR", { underline: true }); // Add heading
    //.moveDown(0.5); // Add space below the heading

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`TOUR DATE: ${formattedDate || "N/A"}`)
      .moveDown(0.1)
      .text(`ARTICLE NO: ${articleNumber || "N/A"}`)
      .moveDown(0.1)
      .text(`PRICE PER HEAD: ${mrp ? `${mrp}` : "N/A"}`)
      .moveDown(0.1)
      .text(`TOTAL COST: ${totalCost || "N/A"}`)
      .moveDown(1); // Add space after Tour section

    const executiveDetails = await Executive.findById(executiveId);
    if (executiveDetails) {
      doc
        .moveDown() // Add space before executive details
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("EXECUTIVE:", { underline: true, align: "left" });

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`EXECUTIVE NAME: ${executiveDetails.name.toUpperCase()}`, {
          align: "left",
        })
        .text(`EXECUTIVE PHONE: ${executiveDetails.mobileNumber}`, {
          align: "left",
        });
    }
    // Add Bank Details Section
    if (companyBankDetails.length) {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("BANK DETAILS", { align: "center", underline: true })
        .moveDown(0.5);

      for (const [index, bank] of companyBankDetails.entries()) {
        // Center the bank name
        doc
          .fontSize(10)
          .font("Helvetica-Bold")
          .text(`BANK ${index + 1}: ${bank.bankName.toUpperCase()}`, {
            align: "center",
          })
          .moveDown(0.2);

        // Center the bank details
        doc
          .font("Helvetica")
          .text(`Branch: ${bank.bankBranch}`, { align: "center" })
          .moveDown(0.1)
          .text(`IFSC Code: ${bank.bankIfscCode}`, { align: "center" })
          .moveDown(0.1)
          .text(`Account Number: ${bank.bankAccountNumber}`, {
            align: "center",
          })
          .moveDown(0.3);

        // Add QR Code Image if available and center it
        if (bank.bankQrCode) {
          try {
            const qrCodeBuffer = await fetchImageBuffer(bank.bankQrCode);

            // Center QR Code below the bank details
            const pageWidth = doc.page.width;
            const qrCodeWidth = 80; // QR code width
            const xPos = (pageWidth - qrCodeWidth) / 2; // Center horizontally

            doc
              .image(qrCodeBuffer, xPos, doc.y, {
                width: qrCodeWidth, // Adjust QR code size
              })
              .moveDown(0.9);
          } catch (error) {
            console.error(
              `Error loading QR Code for Bank ${index + 1}:`,
              error.message
            );
          }
        }

        doc.moveDown(12); // Space between banks
      }
    }
        // Add Payment Policy Section
doc
.fontSize(12)
.font("Helvetica-Bold")
.text("PAYMENT POLICY", { underline: true })
.moveDown(0.5);

// Payment policy array
const paymentPolicy = [
". A minimum payment is required for booking a tour - Non refundable(The minimum payment will vary depending on the tour).",
". 21-35 Days before date of departure : 50% of Cost .",
". 20 Days before date of departure : 100% of Total cost.",
];

// Cancellation and refund policy array
const cancellationPolicy = [
". 60 Days & Prior to Arrival - 25% of the Tour/Service Cost.",
". 59 Days to 30 Days Prior To Arrival - 50% of the Tour/Service Cost.",
". 29 Days to 15 Days Prior To Arrival - 75% of the Tour/Service Cost.",
". 14 Days and less Prior To Arrival – No refund.",
". Transportation and accommodation are as per itinerary only; if you have to change any of them, we will not be responsible for any kind of refund.",
". There will be no refund for add-ons.",
];

// Loop through payment policy and display each one
paymentPolicy.forEach((policy) => {
doc.fontSize(8).text(policy, { align: "left" }).moveDown(0.2);
});

// Add Cancellation and Refund Policy Section
doc
.fontSize(12)
.font("Helvetica-Bold")
.text("CANCELLATION AND REFUND POLICY", { underline: true })
.moveDown(0.5);

cancellationPolicy.forEach((policy) => {
doc.fontSize(8).text(policy, { align: "left" }).moveDown(0.2);
});

    // Add Terms and Conditions Section Below Customer and Tour Section
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("TERMS AND CONDITIONS", { underline: true })
      .moveDown(0.5);

    // Terms array
    const terms = [
      "1. If you're not able to reach out the destination on time. That is not our responsibility.",
      "2. For international hotels, the standard check-in time is 2:30 PM, and check-out is at 12:30 PM. For domestic hotels, check-in begins at 12:30 PM, with check-out scheduled for 10:00 AM.",
      "3. The booking stands liable to be cancelled if 100% payment is not received less than 20 days before date of departure. If the trip is cancelled due to this reason advance will not be refundable. If you are not pay the amount that in mentioned in payment policy then tour will be cancelled.",
      "4. There is no refund option in case you cancel the tour yourself.",
      "5. There is no refund available for group or scheduled tours.",
      "6. All activities which are not mentioned in the above itinerary such as visiting additional spots or involving in paid activities, if arranging separate cab etc. is not included in this.",
      "7. In case of using additional transport will be chargeable.",
      "8. All transport on the tour will be grouped together. Anyone who deviates from it will be excluded from this package.",
      "9. The company has the right for expelling persons who disagree with passengers or misrepresent the company during the trip.",
      "10. The company does not allow passengers to give tips to the driver for going additional spots.",
      "11. In case of cancellation due to any reason such as Covid, strike, problems on the part of railways, malfunctions, natural calamities etc., package amount will not be refunded.",
      "12. The Company will not be liable for any confirmation of train tickets, flight tickets, other transportation or any other related items not included in the package.",
      "13. In Case of Events And Circumstances Beyond Our Control, We Reserve The Right To Change All Or Parts Of The Contents Of The Itinerary For Safety And Well Being Of Our Esteemed Passengers.",
      "14. Bathroom Facility | Indian or European.",
      "15. In season rooms will not be the same as per itinerary but category will be the same (Budget economy).",
      "16. Charge will be the same from the age of 5 years.",
      "17. We are not providing tourist guide, if you are taking their service in your own cost we will not be responsible for the same.",
      "18. You Should reach to departing place on time, also you should keep the time management or you will not be able to cover all the place.",
      "19. If the climate condition affects the sightseeing that mentioned in itinerary, then we won’t provide you the additional spots apart from the itinerary.",
      "20. Transportation timing 8 am to 6 pm, if use vehicle after that then cost will be extra.",
      "21. Will visit places as per itinerary only, if you visit other than this then cost will be extra.",
      "22. If any customers misbehave with our staffs improperly then we will cancel his tour immediately and after that he can't continue with this tour.",
      "23. If the trip is not fully booked or cancelled due to any special circumstances, we will postpone the trip to another day. Otherwise, if the journey is to be done on the pre-arranged day, the customers will have to bear the extra money themselves.",
      "24. If you have any problems with the tour, please notify us as soon as possible so that we can resolve the problem. If you raise the issue after the tour, we will not be able to help you.",
      "25. Our company does not provide specific seats on the Volvo bus, if you need a seat particularly, please let the executive know during the confirmation of your reservation. (requires additional payment).",
      "26. If there are any changes to your tour, such as a date modification or postponement, you must notify us and obtain confirmation from our official email ID trippensholidays@gmail.com to your personal or official email. We will not acknowledge any proof of changes from the client unless confirmed through this official channel.",
    ];

    // Loop through terms and display each one
    terms.forEach((term) => {
      doc.fontSize(8).text(term, { align: "left" }).moveDown(0.2);
    });

    // Add company name with underline in the center
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(companyName, { underline: true, align: "center" });

    // Add spacing after the company name
    // doc.moveDown(0.5);

    // Add company details explicitly and center-align them
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Address: ${companyDistrict}, ${companyState}`, { align: "center" }) // Updated line for address
      .text(`Pincode: ${companyPincode}`, { align: "center" })
      .text(`Contact No: ${companyMobile}`, { align: "center" })
      .text(`Email: ${companyEmail}`, { align: "center" });

    // Finalize the PDF and end the stream
    doc.end();
  } catch (error) {
    console.error("Error in downloadConfirmItinerary:", error);
    res
      .status(500)
      .json({ message: "An error occurred while generating the PDF." });
  }
};

export const downloadFixedTrackSheet = async (req, res) => {
  try {
    const { clientId, fixedTripId, date } = req.body;

    if (!clientId || !fixedTripId || !date) {
      return res.status(400).json({ message: "Missing required parameters" });
    }
    // Convert the string date to a Date object
    const startDate = new Date(date.date);

    // Format to dd/mm/yyyy
    const formattedStartDate = `${startDate
      .getDate()
      .toString()
      .padStart(2, "0")}/${(startDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${startDate.getFullYear()}`;

    // Find client details from the database
    const client = await Client.findOne({ _id: clientId });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const { name, numberOfPersons, executiveId, companyId } = client;
    // Find Executive details from the database
    const executive = await Executive.findOne({ _id: executiveId });

    if (!executive) {
      return res.status(404).json({ message: "Executive not found" });
    }

    const { name: executiveName, mobileNumber: executiveNumber } = executive;

    // Find FixedTour details from the database
    const fixedTour = await FixedTour.findOne({ _id: fixedTripId });

    if (!fixedTour) {
      return res.status(404).json({ message: "Fixed Tour not found" });
    }

    const { tourName, articleNumber, category, day, mrp } = fixedTour;

    const totalAmount = mrp * numberOfPersons;

    // **🔹 Find Company details using companyId**
    const company = await Agency.findOne({ _id: companyId });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const { logo: companyLogo } = company; // Extract company logo URL

    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, "0")}/${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${today.getFullYear()}`;
    
        // Get the max trackSheetNumber for the company
    const maxClient = await Client.findOne({ companyId })
    .sort({ trackSheetNumber: -1 })
    .select("trackSheetNumber");

  const maxTrackSheetNumber = maxClient ? maxClient.trackSheetNumber : 0;

  // Update trackSheetNumber for the client if it doesn't exist
  if (!client.trackSheetNumber) {
    client.trackSheetNumber = maxTrackSheetNumber + 1 || 1;
    await client.save();
  }

    // Create a new PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=custom_tracksheet.pdf`
    );

    // Pipe the PDF into the response
    doc.pipe(res);

    // Draw a border around the page
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    doc
      .rect(20, 20, pageWidth - 40, pageHeight - 40)
      .strokeColor("#000")
      .lineWidth(2)
      .stroke();

    // **🔹 Add Company Logo (Top-Left)**
    if (companyLogo) {
      try {
        const imageBuffer = await fetchImageBuffer(companyLogo);
        doc.image(imageBuffer, 30, 30, { width: 80 });
      } catch (error) {
        console.error("Error loading logo:", error.message);
      }
    }

   // **🔹 Add Main Heading "TRACK SHEET" (Centered)**
   doc
   .font("Helvetica-Bold")
   .fontSize(20)
   .fillColor("#000")
   .text("TRACK SHEET", {
     align: "center",
     baseline: "middle",
     underline: "true",
   });
 // **🔹 Add "GROUP TOUR" Below "TRACK SHEET"**
 doc
   .font("Helvetica-Bold")
   .fontSize(16) // Slightly smaller than "TRACK SHEET"
   .fillColor("#FF0000")
   .text("GROUP TOUR", { align: "center" });
 // **🔹 Add "NO:" on the Top-Right**
 doc
   .font("Helvetica-Bold")
   .fontSize(12)
   .fillColor("#000")
   .text(`NO: ${client.trackSheetNumber}`, pageWidth - 100, 40, { align: "right" });
   doc.moveDown(2); // Add space before sections

 // **🔹 Add Section Headings on the Same Line**
 const sectionY = doc.y + 20; // Adjust Y position after headings
 doc.font("Helvetica-Bold").fontSize(14);

 // Positioning for alignment
 const customerX = 30;
 const executiveX = pageWidth / 2 - 50;
 const salesManagerX = pageWidth - 145;

 // **🔹 Section Headings**
 doc.text("Customer", customerX, sectionY, { underline: true });
 doc.text("Executive", executiveX, sectionY, { underline: true });
 doc.text("Manager", salesManagerX, sectionY, { underline: true });

 doc.moveDown(1); // Add space for fields

 // **🔹 Add Fields Below Each Section**
 doc.font("Helvetica").fontSize(12);

 const lineSpacing = 18; // Consistent spacing

 // **Customer Fields (Left)**
 let fieldY = sectionY + 20;
 doc.text("Name:", customerX, fieldY);
 doc.text(name, customerX + 40, fieldY);

 doc.text("ID      :", customerX, (fieldY += lineSpacing));
 doc.text(client.clientId, customerX + 40, fieldY);

 doc.text("Pax    :", customerX, (fieldY += lineSpacing));
 doc.text(numberOfPersons.toString(), customerX + 40, fieldY);

 // **Executive Fields (Centered)**
 fieldY = sectionY + 20;
 doc.text("Name           :", executiveX, fieldY);
 doc.text(executiveName, executiveX + 75, fieldY);

 doc.text("No                :", executiveX, (fieldY += lineSpacing));
 doc.text(executiveNumber, executiveX + 75, fieldY);

 doc.text("Date Confirm:", executiveX, (fieldY += lineSpacing));
 doc.text(formattedDate, executiveX + 75, fieldY);

 // **Sales Manager Fields (Right)**
 fieldY = sectionY + 20;
 doc.text("Name:", salesManagerX, fieldY);
 doc.text("Sign  :", salesManagerX, (fieldY += lineSpacing));
 doc.text("Date  :", salesManagerX, (fieldY += lineSpacing));
 doc.moveDown(1);

 // **🔹 Separation Line**
 doc
   .moveTo(30, doc.y)
   .lineTo(pageWidth - 30, doc.y)
   .lineWidth(1)
   .stroke();

 doc.moveDown(1);
 const sectionYY = doc.y + 20;

 // **🔹 Second Section (Tour, Date, Payment)**
 doc.font("Helvetica-Bold").fontSize(14);

 const tourX = 30;
 const dateX = pageWidth / 2 - 50;
 const paymentX = pageWidth - 145;

 doc.text("Tour", tourX, sectionYY, { underline: true });
 doc.text("Date", dateX, sectionYY, { underline: true });
 doc.text("Payment", paymentX, sectionYY, { underline: true });

 doc.moveDown(1);
 doc.font("Helvetica").fontSize(12);

 fieldY = sectionYY + 20;
 doc.text("Name      :", tourX, fieldY);
 doc.text(tourName, tourX + 60, fieldY);

 doc.text("ArtNo      :", tourX, (fieldY += lineSpacing));
 doc.text(articleNumber, tourX + 60, fieldY);

 doc.text("Category :", tourX, (fieldY += lineSpacing));
 doc.text(category.value, tourX + 60, fieldY);

 // **Date Fields**
 fieldY = sectionYY + 20; // Align with Tour fields
 doc.text("Start :", dateX, fieldY);
 doc.text(formattedStartDate, dateX + 35, fieldY);

 doc.text("End  :", dateX, (fieldY += lineSpacing));
 // doc.text(endDate, dateX + 35, fieldY);

 doc.text("Days :", dateX, (fieldY += lineSpacing));
 doc.text(day.toString(), dateX + 35, fieldY);

 // **Payment Fields**
 fieldY = sectionYY + 20; // Align with Date fields
 doc.text("PP   :", paymentX, fieldY);
 doc.text(mrp.toString(), paymentX + 30, fieldY);

 doc.text("Total:", paymentX, (fieldY += lineSpacing));
 doc.text(totalAmount.toString(), paymentX + 30, fieldY);

 doc.text("Advance:", paymentX, (fieldY += lineSpacing));
 // doc.text(advanceAmount.toString(), paymentX + 70, fieldY);
 doc.moveDown(1);

 // **🔹 Separation Line**
 doc
   .moveTo(30, doc.y)
   .lineTo(pageWidth - 30, doc.y)
   .lineWidth(1)
   .stroke();
 // **🔹 Draw Vertical Line in the Center**
 const centerX = pageWidth / 2;
 const startY = doc.y; // Start from the current position
 const endY = pageHeight - 20; // End at bottom margin

 doc.moveTo(centerX, startY).lineTo(centerX, endY).lineWidth(1).stroke();
 // Set starting position for right section content
 let rightSectionX = centerX + 30; // Start a bit to the right of the center line
 let rightSectionY = startY + 20; // Space after the vertical line start

 doc.font("Helvetica-Bold").fontSize(12);

 // **🔹 Pickup Spot**
 doc.text("Pickup Spot:", rightSectionX, rightSectionY, { underline: true });
 rightSectionY += 40; // Move down
 doc
   .moveTo(rightSectionX, rightSectionY)
   .lineTo(pageWidth - 30, rightSectionY)
   .stroke();
 rightSectionY += 30; // Space after line

 // **🔹 Time (for Pickup)**
 doc.text("Time:", rightSectionX, rightSectionY, { underline: true });
 rightSectionY += 40; // Move down
 doc
   .moveTo(rightSectionX, rightSectionY)
   .lineTo(pageWidth - 30, rightSectionY)
   .stroke();
 rightSectionY += 30; // Space after line

 // **🔹 Dropoff Spot**
 doc.text("Dropoff Spot:", rightSectionX, rightSectionY, {
   underline: true,
 });
 rightSectionY += 40; // Move down
 doc
   .moveTo(rightSectionX, rightSectionY)
   .lineTo(pageWidth - 30, rightSectionY)
   .stroke();
 rightSectionY += 30; // Space after line

 // **🔹 Time (for Dropoff)**
 doc.text("Time:", rightSectionX, rightSectionY, { underline: true });
 rightSectionY += 40; // Move down
 doc
   .moveTo(rightSectionX, rightSectionY)
   .lineTo(pageWidth - 30, rightSectionY)
   .stroke();
 rightSectionY += 30; // Space after line

 // **🔹 Customer Extra Needs**
 doc.text("Customer Extra Needs:", rightSectionX, rightSectionY, {
   underline: true,
 });
 rightSectionY += 40; // Move down
 doc
   .moveTo(rightSectionX, rightSectionY)
   .lineTo(pageWidth - 30, rightSectionY)
   .stroke();
 doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Failed to generate track sheet" });
  }
};

//_____________Itenaraty Preparation___________//

export const getDestinationsNameForItenarary = async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }
    // Fetch only the `name` field from the destinations
    const destinations = await Destination.find({companyId}, "name");

    // Map the destinations to an array of objects with `value` and `label`
    const destinationNames = destinations.map((destination) => ({
      value: destination._id,
      label: destination.name,
    }));

    // Send the list of destinations as a response
    res.status(200).json(destinationNames);
  } catch (error) {
    console.error("Error fetching destination names:", error);
    res.status(500).json({ message: "Failed to fetch destination names" });
  }
};

export const getTripsNameForItenarary = async (req, res) => {
  try {
    // Extract the destinationId from the request params
    const { destinationId } = req.params;

    // Fetch trips related to the given destinationId
    const trips = await Trip.find({ destinationId: destinationId });

    // Map trips to the format { value: trip._id, label: trip.name }
    const tripOptions = trips.map((trip) => ({
      value: trip._id, // Trip ID
      label: trip.tripName, // Trip name (adjust field according to your schema)
      description: trip.tripDescription,
    }));

    // Send the trips as a response
    res.status(200).json(tripOptions);
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ message: "Failed to fetch trips" });
  }
};

export const getVehiclesByTripIdForItenarary = async (req, res) => {
  try {
    // Extract tripId from request params
    const { tripId } = req.params;

    // Find the trip by tripId
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Extract travelsDetails (vehicles) from the trip
    const vehicles = trip.travelsDetails.map((vehicle) => ({
      vehicleId: vehicle.vehicleId,
      vehicleCategory: vehicle.vehicleCategory,
      vehicleName: vehicle.vehicleName,
      price: vehicle.price,
    }));

    // Send the vehicles as a response
    res.status(200).json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ message: "Failed to fetch vehicles" });
  }
};

export const getAddOnTripsNameForItenarary = async (req, res) => {
  try {
    // Extract tripId from request params
    const { tripId } = req.params;

    // Find all add-on trips where tripNameId matches the given tripId
    const addOnTrips = await AddOnTrip.find({ tripNameId: tripId });

    if (!addOnTrips || addOnTrips.length === 0) {
      return res
        .status(404)
        .json({ message: "No add-on trips found for the selected trip" });
    }

    // Map the add-on trips to return the desired options format
    const addOnTripOptions = addOnTrips.map((addOnTrip) => ({
      value: addOnTrip._id, // Use _id as the value
      label: addOnTrip.addOnTripName, // Use addOnTripName as the label
      description: addOnTrip.addOnTripDescription,
    }));

    // Send the mapped add-on trips as a response
    res.status(200).json(addOnTripOptions);
  } catch (error) {
    console.error("Error fetching add-on trips:", error);
    res.status(500).json({ message: "Failed to fetch add-on trips" });
  }
};

export const getActivitiesNameForItenarary = async (req, res) => {
  const { tripId } = req.params;

  try {
    // Find activities where tripNameId matches the tripId
    const activities = await Activity.find({ tripNameId: tripId });

    if (!activities) {
      return res
        .status(404)
        .json({ message: "No activities found for this trip" });
    }

    // Return activities with _id and activityName for frontend usage
    const activityOptions = activities.map((activity) => ({
      value: activity._id, // Use activity's ID as value
      label: `${activity.activityName}`,
      displaylabel: `${activity.activityName} - ${activity.pricePerHead}`,
      description: activity.activityDescription,
    }));

    res.status(200).json(activityOptions);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ message: "Failed to fetch activities" });
  }
};

export const getAddOnVehiclesByTripIdForItenarary = async (req, res) => {
  try {
    // Extract addOnTripId from request params
    const { addOnTripId } = req.params;

    // Find the add-on trip by its ID
    const addOnTrip = await AddOnTrip.findById(addOnTripId);

    if (!addOnTrip) {
      return res.status(404).json({ message: "Add-on trip not found" });
    }

    // Extract vehicles (travelsDetails) from the add-on trip
    const vehicles = addOnTrip.travelsDetails.map((vehicle) => ({
      vehicleId: vehicle.vehicleId,
      vehicleCategory: vehicle.vehicleCategory,
      vehicleName: vehicle.vehicleName,
      price: vehicle.price,
    }));

    // Send the vehicles as a response
    res.status(200).json(vehicles);
  } catch (error) {
    console.error("Error fetching add-on vehicles:", error);
    res.status(500).json({ message: "Failed to fetch add-on vehicles" });
  }
};

export const getAccommodationsByCategoryAndDestination = async (req, res) => {
  try {
    const { category, destinationId } = req.query;

    // Find accommodations by room category and destination ID
    const accommodations = await Accommodation.find({
      roomCategory: category,
      destinationId: destinationId,
    });

    if (!accommodations || accommodations.length === 0) {
      return res.status(404).json({ message: "No accommodations found" });
    }

    // Return the accommodations
    res.status(200).json(accommodations);
  } catch (error) {
    console.error("Error fetching accommodations:", error);
    res.status(500).json({ message: "Failed to fetch accommodations" });
  }
};

export const getSelectedAccommodationDetailsForItenarary = async (req, res) => {
  const { id } = req.params; // Extract the ID from the request parameters

  try {
    const accommodationDetails = await Accommodation.findById(id); // Fetch accommodation details by ID

    if (!accommodationDetails) {
      return res.status(404).json({ message: "Accommodation not found" });
    }

    return res.status(200).json(accommodationDetails); // Return the accommodation details
  } catch (error) {
    console.error("Error fetching accommodation details:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const getAllClientsByExecutive = async (req, res) => {
  try {
    const {
      executiveId,
      clientId,
      mobileNumber,
      page = 1,
      limit = 4,
    } = req.query;

    if (!executiveId) {
      return res.status(400).json({ message: "Executive ID is required" });
    }

    const matchFilters = {
      executiveId: new mongoose.Types.ObjectId(executiveId),
    };
    // Add optional filters
    if (clientId) matchFilters.clientId = clientId;
    if (mobileNumber) matchFilters.mobileNumber = mobileNumber;

    const skip = (page - 1) * limit;

    // Fetch clients and dynamically calculate status
    const clients = await Client.aggregate([
      { $match: matchFilters },
      {
        $addFields: {
          status: {
            $switch: {
              branches: [
                {
                  case: {
                    $and: [
                      { $eq: ["$executiveVisitedStatus", false] },
                      { $eq: ["$confirmedStatus", false] },
                      { $eq: ["$bookedStatus", false] },
                      { $eq: ["$ongoingStatus", false] },
                      { $eq: ["$completedStatus", false] },
                    ],
                  },
                  then: "New Client",
                },
                {
                  case: {
                    $and: [
                      { $eq: ["$executiveVisitedStatus", true] },
                      { $eq: ["$confirmedStatus", false] },
                      { $eq: ["$bookedStatus", false] },
                      { $eq: ["$ongoingStatus", false] },
                      { $eq: ["$completedStatus", false] },
                      { $lte: [{ $size: "$itinerary" }, 0] }, // Modified to remove $expr
                    ],
                  },
                  then: "Pending",
                },
                {
                  case: {
                    $and: [
                      { $eq: ["$executiveVisitedStatus", true] },
                      { $eq: ["$confirmedStatus", false] },
                      { $eq: ["$bookedStatus", false] },
                      { $eq: ["$ongoingStatus", false] },
                      { $eq: ["$completedStatus", false] },
                      { $gt: [{ $size: "$itinerary" }, 0] }, // Modified to remove $expr
                    ],
                  },
                  then: "Interested",
                },
                {
                  case: {
                    $and: [
                      { $eq: ["$executiveVisitedStatus", true] },
                      { $eq: ["$confirmedStatus", true] },
                      { $eq: ["$bookedStatus", false] },
                      { $eq: ["$ongoingStatus", false] },
                      { $eq: ["$completedStatus", false] },
                    ],
                  },
                  then: "Confirmed",
                },
                {
                  case: {
                    $and: [
                      { $eq: ["$executiveVisitedStatus", true] },
                      { $eq: ["$confirmedStatus", true] },
                      { $eq: ["$bookedStatus", true] },
                      { $eq: ["$ongoingStatus", false] },
                      { $eq: ["$completedStatus", false] },
                    ],
                  },
                  then: "Booked",
                },
                {
                  case: {
                    $and: [
                      { $eq: ["$executiveVisitedStatus", true] },
                      { $eq: ["$confirmedStatus", true] },
                      { $eq: ["$bookedStatus", true] },
                      { $eq: ["$ongoingStatus", true] },
                      { $eq: ["$completedStatus", false] },
                    ],
                  },
                  then: "Ongoing",
                },
                {
                  case: {
                    $and: [
                      { $eq: ["$executiveVisitedStatus", true] },
                      { $eq: ["$confirmedStatus", true] },
                      { $eq: ["$bookedStatus", true] },
                      { $eq: ["$ongoingStatus", true] },
                      { $eq: ["$completedStatus", true] },
                    ],
                  },
                  then: "Completed",
                },
              ],
              default: "Unknown",
            },
          },
        },
      },
      { $sort: { createdAt: -1, _id: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
    ]);

    // Count total documents for pagination
    const totalClients = await Client.countDocuments(matchFilters);
    const totalPages = Math.ceil(totalClients / limit);

    res.status(200).json({
      clients,
      totalPages,
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching clients" });
  }
};

export const downloadReferralCustomItinerary = async (req, res) => {
  try {
    const { clientId, formData, executiveIdd } = req.body;

    if (!clientId || !formData) {
      return res
        .status(400)
        .json({ error: "Client ID and form data are required." });
    }

    const { tripsWithVehicles, totalPrice } = formData;
    // Find the executive using the provided executiveId
    const executive = await Executive.findById(executiveIdd);

    if (!executive) {
      return res.status(404).json({ error: "Executive not found." });
    }
    // Remove duplicate trips based on 'day.value'
    const uniqueTrips = Array.from(
      new Map(tripsWithVehicles.map(trip => [trip.day.value, trip])).values()
    );
    // Delete existing itineraries for the client
    await CustomItinerary.deleteMany({ clientId });

    // Prepare the data to be saved, including clientId and totalPrice
    const itinerariesToSave =  uniqueTrips.map((trip) => ({
      clientId: clientId, // Attach the clientId
      totalPrice: totalPrice, // Attach the totalPrice
      tripName: trip.tripName,
      vehicles: trip.vehicles,
      addOnTrips: trip.addOnTrips,
      activities: trip.activities,
      hotels: trip.hotels,
      day: trip.day,
      destination: trip.destination,
      executiveId: executive._id, // Store the executive's _id
      executiveName: executive.name, // Store the executive's name
      executivePhoneNumber: executive.mobileNumber, // Store the executive's phone number
      companyId: executive.companyId, // Store the executive's companyId
    }));

    // Insert multiple itineraries into the database
    //await CustomItinerary.insertMany(itinerariesToSave);

    // Fetch client details
    const client = await Client.findById(clientId).populate("companyId");
    if (!client) {
      return res.status(404).json({ error: "Client not found." });
    }
    // Update the Client's itinerary field
    const newItinerary = {
      itineraryId: clientId,
      itineraryType: "custom",
      dateId: clientId,
      status: "referral",
      time: new Date(), // Capture the exact current time
    };
    // Ensure only one object exists in the `itinerary` array
    if (client.itinerary.length > 0) {
      // Replace the existing object
      client.itinerary[0] = newItinerary;
    } else {
      // Push the new object if the array is empty
      client.itinerary.push(newItinerary);
    }
    await client.save();

    const {
      name,
      mobileNumber,
      startDate,
      endDate,
      numberOfPersons,
      companyId,
      executiveId,
    } = client;
    const company = client.companyId; // The populated Company (Agency) document
    // Ensure company exists
    if (!company) {
      return res
        .status(404)
        .json({ message: "Company not found for this client." });
    }

    // Extract company information from the populated Agency document
    const {
      name: companyName,
      email: companyEmail,
      mobileNumber: companyMobile,
      pincode: companyPincode,
      district: companyDistrict,
      state: companyState,
    } = company;

    const formatDate = (date) => {
      if (!date) return "N/A";
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    };

    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);
    const pricePerHead = totalPrice / numberOfPersons;
    //const itineraries = await CustomItinerary.find({ clientId });

    // Create PDF document
    const doc = new PDFDocument({ margin: 40 });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Custom_Referral_Itinerary.pdf"
    );

    // Stream the PDF to the response
    doc.pipe(res);

    // Function to draw a border around the page with customizable margins
    function addBorder(doc, margin = 30, lineWidth = 5, color = "black") {
      doc.lineWidth(lineWidth); // Set border line thickness

      // Draw a rectangle (border) around the page
      doc
        .rect(
          margin, // X position of the top-left corner
          margin, // Y position of the top-left corner
          doc.page.width - 2 * margin, // Width of the rectangle
          doc.page.height - 2 * margin // Height of the rectangle
        )
        .strokeColor(color) // Set the border color
        .stroke(); // Apply the border stroke
    }

    // Draw the border on the first page
    addBorder(doc);

    // Event listener to ensure borders are added to subsequent pages
    doc.on("pageAdded", () => {
      addBorder(doc); // Add the border to the new page
    });

    // Add main heading
    doc.fontSize(22).font("Helvetica-Bold").text("REFERRAL ITINERARY", {
      align: "center",
      underline: true,
    });

    // doc.moveDown(); // Add spacing after heading
    doc.moveDown(0.5); // Small spacing after heading

    // Add "CUSTOM TOUR" centered below "CONFIRM ITINERARY"
    doc.fontSize(20).font("Helvetica-Bold").text("CUSTOM TOUR", {
      align: "center",
      underline: true,
    });
    doc.moveDown(0.3); // Small spacing after "CUSTOM TOUR"
    doc
      .fillColor("red")
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("NOTE:", { underline: true })
      .moveDown(0.5);

    doc
      .fillColor("red")
      .fontSize(8)
      .font("Helvetica")
      .text(
        "THIS IS JUST A REFERRAL ITINERARY. AFTER CONFIRMATION, PLEASE CONTACT OUR EXECUTIVE AND ASK FOR YOUR CONFIRMED ITINERARY. THE ITINERARY HERE IS NOT VALID FOR YOUR TOUR.",
        { align: "justify" }
      )
      .moveDown(1);

    doc
      .fontSize(18)
      .fillColor("black")
      .font("Helvetica-Bold")
      .text("TOUR ITINERARY:", { underline: true });

    itinerariesToSave.forEach((itinerary) => {
      const day = itinerary.day.label || "N/A";
      const destination = itinerary.destination.label || "N/A";
      const tripName = itinerary.tripName.label || "N/A";
      const tripDescription = itinerary.tripName.description || "N/A";
      const vehicles = itinerary.vehicles || [];
      const addOnTrips = itinerary.addOnTrips || [];
      const activities = itinerary.activities || [];
      const hotels = itinerary.hotels || [];

      doc.moveDown(); // Add spacing between itinerary items
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .fillColor("red")
        .text(`${day.toUpperCase()} - ${destination.toUpperCase()}`, {
          align: "left",
        });

      // Reset color for subsequent text
      doc.fillColor("black");

      // Trip Name and Description
      doc
        // .moveDown()
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(`${tripName.toUpperCase()}`, { align: "left" });
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`${tripDescription}`, { align: "left" });

      // Add Vehicles Heading
      doc.moveDown(); // Spacing before vehicles heading

      // List each vehicle and its count
      vehicles.forEach((vehicle) => {
        const vehicleLabel = vehicle.label
          .split(" - ") // Split by " - "
          .slice(0, 2) // Take only the first two parts ("2 Wheeler" and "scooty")
          .map((part) => part.toLowerCase().replace(/\s+/g, "-")) // Convert to lowercase and replace spaces with hyphens
          .join("-"); // Join the parts with a hyphen // Extracting the part after " - "
        const vehicleCount = vehicle.count || "N/A";
        doc
          // .moveDown()
          .fontSize(10)
          .font("Helvetica")
          .text(`${vehicleLabel.toUpperCase()} - QTY: ${vehicleCount}`, {
            align: "left",
          });
      });

      // Add On Trip Heading
      if (addOnTrips.length > 0) {
        // Loop through each addOnTrip
        addOnTrips.forEach((addOnTrip) => {
          const addOnTripName = addOnTrip.addOnTripName.label || "N/A";
          const addOnTripDescription =
            addOnTrip.addOnTripName.description || "N/A";
          const addOnTripVehicles = addOnTrip.vehicles || [];

          doc
            .moveDown()
            .fontSize(12)
            .font("Helvetica-Bold")
            .text(`${addOnTripName.toUpperCase()}`, {
              align: "left",
            });
          doc
            .fontSize(10)
            .font("Helvetica")
            .text(`${addOnTripDescription}`, { align: "left" });

          // List each vehicle for the addOnTrip and its count
          addOnTripVehicles.forEach((vehicle) => {
            const vehicleLabel = vehicle.label
              .split(" - ") // Split by " - "
              .slice(0, 2) // Take only the first two parts ("2 Wheeler" and "scooty")
              .map((part) => part.toLowerCase().replace(/\s+/g, "-")) // Convert to lowercase and replace spaces with hyphens
              .join("-"); // Join the parts with a hyphen
            const vehicleCount = vehicle.count || "N/A";
            doc
              .moveDown()
              .fontSize(10)
              .font("Helvetica")
              .text(`${vehicleLabel.toUpperCase()} - QTY: ${vehicleCount}`, {
                align: "left",
              });
          });
        });
      }

      // Activities Heading
      if (activities.length > 0) {
        doc.moveDown(); // Add spacing before activities heading
        doc
          .fontSize(12)
          .font("Helvetica-Bold")
          .text("ACTIVITY:", { underline: true, align: "left" });

        // Loop through each activity
        activities.forEach((activity) => {
          const activityName = activity.label.split(" - ")[0] || "N/A";
          const activityDescription = activity.description || "N/A";
          const activityCount = activity.count || "N/A"; // Get the count of the activity

          doc
            // .moveDown()
            .fontSize(12)
            .font("Helvetica-Bold")
            .text(`${activityName.toUpperCase()}`, { align: "left" });
          doc
            .fontSize(10)
            .font("Helvetica")
            .text(`${activityDescription}`, { align: "left" });
          doc
            .font("Helvetica")
            .text(`QTY: ${activityCount}`, { align: "left" });
        });
      }

      // Hotels Heading
      if (hotels.length > 0) {
        doc.moveDown(); // Add spacing before hotels heading
        doc
          .fontSize(12)
          .font("Helvetica-Bold")
          .text("HOTELS:", { underline: true, align: "left" });

        // Loop through each hotel
        hotels.forEach((hotel) => {
          const roomCategory = hotel.roomCategory.label || "N/A";
          const roomName = hotel.roomName.label || "N/A";
          const roomPriceType = hotel.roomPriceType.label
            ? hotel.roomPriceType.label.split(" - ")[0] // Take the part before " - "
            : "N/A";
          const count = hotel.count || "N/A";

          doc
            // .moveDown()
            .fontSize(10)
            .font("Helvetica")
            .text(`Hotel Category: ${roomCategory.toUpperCase()}`, {
              align: "left",
            });
          doc
            .font("Helvetica")
            .text(`Hotel Name: ${roomName.toUpperCase()}`, { align: "left" });
          doc
            .font("Helvetica")
            .text(`Room Category: ${roomPriceType.toUpperCase()}`, {
              align: "left",
            });
          doc.font("Helvetica").text(`QTY: ${count}`, { align: "left" });
        });
      }
    });
    doc.moveDown(); // Add spacing before the customer heading
    // Add inclusions and exclusions section above the customer details
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("INCLUSIONS:", { align: "left", underline: true })
      .font("Helvetica")
      .fontSize(10)
      .list(
        ["Pickup and drop off", "Accommodation", "Sightseeing", "Transfers"],
        { align: "left", bulletRadius: 2 }
      )
      .moveDown()
      .font("Helvetica-Bold")
      .text("EXCLUSIONS:", { align: "left", underline: true })
      .font("Helvetica")
      .fontSize(10)
      .list(
        [
          "Food not mentioned in the itinerary",
          "Things not mentioned in inclusion/itinerary",
          "Personal expenses",
          "Entry tickets not mentioned in itinerary",
          "GST",
          "Train/Flight Tickets"
        ],
        { align: "left", bulletRadius: 2 }
      )
      .moveDown();
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("CUSTOMER:", { underline: true, align: "left" });

    // Add client details on the left side
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`CLIENT NAME: ${name.toUpperCase()}`, { align: "left" })
      .text(`CLIENT ID: ${client.clientId}`, { align: "left" }) // Added line for Client ID
      .text(`START DATE: ${startDateStr.toUpperCase()}`, { align: "left" })
      .text(`END DATE: ${endDateStr.toUpperCase()}`, { align: "left" })
      .text(`NUMBER OF PERSONS: ${numberOfPersons.toString().toUpperCase()}`, {
        align: "left",
      })
      .text(`PRICE PER HEAD: ${pricePerHead.toFixed(2)}`, { align: "left" }) // Added price per head
      .text(`TOTAL PRICE: ${totalPrice.toFixed(2)}`, { align: "left" }); // Added total price

    // Add a TERMS AND CONDITIONS heading and points before doc.end
    doc.moveDown(0.1); // Add spacing before the terms and conditions section
    // Executive Details Section
    const executiveDetails = await Executive.findById(executiveId);
    if (executiveDetails) {
      doc
        .moveDown() // Add space before executive details
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("EXECUTIVE:", { underline: true, align: "left" });

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`EXECUTIVE NAME: ${executiveDetails.name.toUpperCase()}`, {
          align: "left",
        })
        .text(`EXECUTIVE PHONE: ${executiveDetails.mobileNumber}`, {
          align: "left",
        });
    }

    // Add a TERMS AND CONDITIONS heading and points before doc.end
    doc.moveDown(); // Add spacing before the terms and conditions section
        // Add Payment Policy Section
doc
.fontSize(12)
.font("Helvetica-Bold")
.text("PAYMENT POLICY", { underline: true })
.moveDown(0.5);

// Payment policy array
const paymentPolicy = [
". A minimum payment is required for booking a tour - Non refundable(The minimum payment will vary depending on the tour).",
". 21-35 Days before date of departure : 50% of Cost .",
". 20 Days before date of departure : 100% of Total cost.",
];

// Cancellation and refund policy array
const cancellationPolicy = [
". 60 Days & Prior to Arrival - 25% of the Tour/Service Cost.",
". 59 Days to 30 Days Prior To Arrival - 50% of the Tour/Service Cost.",
". 29 Days to 15 Days Prior To Arrival - 75% of the Tour/Service Cost.",
". 14 Days and less Prior To Arrival – No refund.",
". Transportation and accommodation are as per itinerary only; if you have to change any of them, we will not be responsible for any kind of refund.",
". There will be no refund for add-ons.",
];

// Loop through payment policy and display each one
paymentPolicy.forEach((policy) => {
doc.fontSize(8).text(policy, { align: "left" }).moveDown(0.2);
});

// Add Cancellation and Refund Policy Section
doc
.fontSize(12)
.font("Helvetica-Bold")
.text("CANCELLATION AND REFUND POLICY", { underline: true })
.moveDown(0.5);

cancellationPolicy.forEach((policy) => {
doc.fontSize(8).text(policy, { align: "left" }).moveDown(0.2);
});
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("TERMS AND CONDITIONS:", { underline: true, align: "left" });

    // Terms and conditions points
    const termsAndConditions = [
      "If you're not able to reach the destination on time, that is not our responsibility.",
      "For international hotels, the standard check-in time is 2:30 PM, and check-out is at 12:30 PM. For domestic hotels, check-in begins at 12:30 PM, with check-out scheduled for 10:00 AM.",
      "The booking stands liable to be cancelled if 100% payment is not received less than 20 days before the date of departure. If the trip is cancelled due to this reason, the advance will not be refundable. If you do not pay the amount mentioned in the payment policy, the tour will be cancelled.",
      "There is no refund option in case you cancel the tour yourself.",
      "There is no refund available for group or scheduled tours.",
      "All activities not mentioned in the above itinerary, such as visiting additional spots or involving in paid activities, arranging a separate cab, etc., are not included.",
      "In case of using additional transport, it will be chargeable.",
      "All transport on the tour will be grouped together. Anyone who deviates from it will be excluded from this package.",
      "The company has the right to expel persons who disagree with passengers or misrepresent the company during the trip.",
      "The company does not allow passengers to give tips to the driver for going to additional spots.",
      "In case of cancellation due to any reason, such as Covid, strike, problems on the part of railways, malfunctions, natural calamities, etc., the package amount will not be refunded.",
      "The company will not be liable for any confirmation of train tickets, flight tickets, other transportation, or any other related items not included in the package.",
      "In case of events and circumstances beyond our control, we reserve the right to change all or parts of the contents of the itinerary for the safety and well-being of our esteemed passengers.",
      "Bathroom Facility | Indian or European.",
      "In the season, rooms will not be the same as per itinerary but the category will be the same (Budget Economy).",
      "Charges will be the same for children aged 5 years and above.",
      "We are not providing a tourist guide. If you avail their services at your own cost, we will not be responsible for the same.",
      "You should reach the departure place on time and manage your time effectively; otherwise, you may not be able to cover all the places.",
      "If the climate condition affects the sightseeing mentioned in the itinerary, we will not provide additional spots apart from the itinerary.",
      "Transportation timing is from 8 a.m. to 6 p.m. If you use the vehicle after that, an additional cost will be charged.",
      "Will visit places as per the itinerary only. If you visit other places, an additional cost will be charged.",
      "If any customer misbehaves with our staff, their tour will be cancelled immediately, and they will not be able to continue with the tour.",
      "If the trip is not fully booked or cancelled due to any special circumstances, we will postpone the trip to another day. Otherwise, if the journey is to be done on the pre-arranged day, the customers will have to bear the extra cost themselves.",
      "If you have any problems with the tour, please notify us as soon as possible so that we can resolve the problem. If you raise the issue after the tour, we will not be able to help you.",
      "Our company does not provide specific seats on the Volvo bus. If you need a specific seat, please inform the executive during the reservation confirmation (requires additional payment).",
      "If there are any changes to your tour, such as a date modification or postponement, you must notify us and obtain confirmation from our official email ID trippensholidays@gmail.com to your personal or official email. We will not acknowledge any proof of changes from the client unless confirmed through this official channel.",
    ];

    // Loop through terms and add them to the PDF
    termsAndConditions.forEach((term, index) => {
      doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .text(`${index + 1}. ${term}`, { align: "left" });
    });

    // Add spacing before the company information section
    doc.moveDown();

    // Add company name with underline in the center
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(companyName, { underline: true, align: "center" });

    // Add spacing after the company name
    // doc.moveDown(0.5);

    // Add company details explicitly and center-align them
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Address: ${companyDistrict}, ${companyState}`, { align: "center" }) // Updated line for address
      .text(`Pincode: ${companyPincode}`, { align: "center" })
      .text(`Contact No: ${companyMobile}`, { align: "center" })
      .text(`Email: ${companyEmail}`, { align: "center" });

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error("Error saving itinerary or generating PDF:", error.message);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
};

export const downloadConfirmCustomItinerary = async (req, res) => {
  try {
    const { clientId, formData, executiveIdd } = req.body;
    

    if (!clientId || !formData || !executiveIdd) {
      return res.status(400).json({
        error: "Client ID, form data, and executive ID are required.",
      });
    }

    const { tripsWithVehicles, totalPrice } = formData;
   
    // Find the executive using the provided executiveId
    const executive = await Executive.findById(executiveIdd);

    if (!executive) {
      return res.status(404).json({ error: "Executive not found." });
    }
    // Remove duplicate trips based on 'day.value'
    const uniqueTrips = Array.from(
      new Map(tripsWithVehicles.map(trip => [trip.day.value, trip])).values()
    );
    // Delete existing itineraries for the client
    await CustomItinerary.deleteMany({ clientId });

    // Format the download date as "dd/mm/yyyy"
    const today = new Date();
    const utcDate = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );
    const formattedDownloadDate = utcDate
      .toISOString()
      .split("T")[0]
      .split("-")
      .reverse()
      .join("/");

    

    // Prepare the data to be saved, including clientId and totalPrice
    const itinerariesToSave =  uniqueTrips.map((trip) => ({
      clientId: clientId, // Attach the clientId
      totalPrice: totalPrice, // Attach the totalPrice
      tripName: trip.tripName,
      vehicles: trip.vehicles,
      addOnTrips: trip.addOnTrips,
      activities: trip.activities,
      hotels: trip.hotels,
      day: trip.day,
      destination: trip.destination,
      downloadDate: utcDate.toISOString(),
      executiveId: executive._id, // Store the executive's _id
      executiveName: executive.name, // Store the executive's name
      executivePhoneNumber: executive.mobileNumber, // Store the executive's phone number
      companyId: executive.companyId, // Store the executive's companyId
    }));
    
    // Insert multiple itineraries into the database
    await CustomItinerary.insertMany(itinerariesToSave);
   
    // Fetch client details
    const client = await Client.findById(clientId).populate("companyId");
    if (!client) {
      return res.status(404).json({ error: "Client not found." });
    }
   
    const company = client.companyId; // The populated Company (Agency) document
    // Ensure company exists
    if (!company) {
      return res
        .status(404)
        .json({ message: "Company not found for this client." });
    }

    // Extract company information from the populated Agency document
    const {
      name: companyName,
      email: companyEmail,
      mobileNumber: companyMobile,
      pincode: companyPincode,
      district: companyDistrict,
      state: companyState,
      bankDetails: companyBankDetails,
      cgstPercentage = 0,  // Default to 0 if not provided
      sgstPercentage = 0   // Default to 0 if not provided
    } = company;
    // Update the Client's itinerary field
    const newItinerary = {
      itineraryId: clientId,
      itineraryType: "custom",
      dateId: clientId,
      status: "confirm",
      time: new Date(), // Capture the exact current time
    };
   
    // Ensure only one object exists in the `itinerary` array
    if (client.itinerary.length > 0) {
      // Replace the existing object
      client.itinerary[0] = newItinerary;
    } else {
      // Push the new object if the array is empty
      client.itinerary.push(newItinerary);
    }
   
    client.confirmedStatus = true;
    const startDateOfClient = client.startDate;
    const endDateOfClient = client.endDate;
    const finalizedTourDate = startDateOfClient.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    client.finalizedTourDate = finalizedTourDate;
    client.finalizedTourDateAt = startDateOfClient;
    client.finalizedTourEndDateAt = endDateOfClient;
    const dueDateObject = new Date(startDateOfClient);
    dueDateObject.setDate(dueDateObject.getDate() - 10);

    const dueDate = dueDateObject.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    client.dueDate = dueDate;
    client.dueDateAt = dueDateObject;
    client.totalCost = totalPrice;
    client.totalCostWithAdditionalAmount = totalPrice;
    const cgstRate = cgstPercentage ? cgstPercentage / 100 : 0;
    const sgstRate = sgstPercentage ? sgstPercentage / 100 : 0;
    const sgst = parseFloat((totalPrice * sgstRate).toFixed(2));
    const cgst = parseFloat((totalPrice * cgstRate).toFixed(2));
    client.sgst = sgst;
    client.cgst = cgst;
    const realtotalprice = parseFloat((totalPrice + sgst + cgst).toFixed(2));
    client.amountToBePaid = realtotalprice;
    client.balance = realtotalprice;
    const confirmedDate = new Date();
    confirmedDate.setUTCHours(0, 0, 0, 0);
    client.confirmedDateAt = confirmedDate;
    if (tripsWithVehicles.length > 0 && tripsWithVehicles[0].destination) {
  client.confirmedDestination = {
    id: tripsWithVehicles[0].destination.value,
    name: tripsWithVehicles[0].destination.label,
  };
}
    await client.save();

    const {
      name,
      mobileNumber,
      startDate,
      endDate,
      numberOfPersons,
      companyId,
      executiveId,
    } = client;

    // const company = client.companyId; // The populated Company (Agency) document
    // // Ensure company exists
    // if (!company) {
    //   return res
    //     .status(404)
    //     .json({ message: "Company not found for this client." });
    // }

    // // Extract company information from the populated Agency document
    // const {
    //   name: companyName,
    //   email: companyEmail,
    //   mobileNumber: companyMobile,
    //   pincode: companyPincode,
    //   district: companyDistrict,
    //   state: companyState,
    //   bankDetails: companyBankDetails,
    // } = company;

    const formatDate = (date) => {
      if (!date) return "N/A";
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    };

    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);
    const pricePerHead = totalPrice / numberOfPersons;
    const itineraries = await CustomItinerary.find({ clientId });
    console.log(itineraries,'itineraries')
    // Create PDF document
    const doc = new PDFDocument({ margin: 40 });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Custom_Confirm_Itinerary.pdf"
    );

    // Stream the PDF to the response
    doc.pipe(res);

    // Function to draw a border around the page with customizable margins
    function addBorder(doc, margin = 30, lineWidth = 5, color = "black") {
      doc.lineWidth(lineWidth); // Set border line thickness

      // Draw a rectangle (border) around the page
      doc
        .rect(
          margin, // X position of the top-left corner
          margin, // Y position of the top-left corner
          doc.page.width - 2 * margin, // Width of the rectangle
          doc.page.height - 2 * margin // Height of the rectangle
        )
        .strokeColor(color) // Set the border color
        .stroke(); // Apply the border stroke
    }

    // Draw the border on the first page
    addBorder(doc);

    // Event listener to ensure borders are added to subsequent pages
    doc.on("pageAdded", () => {
      addBorder(doc); // Add the border to the new page
    });

    // Add main heading
    doc.fontSize(22).font("Helvetica-Bold").text("CONFIRM ITINERARY", {
      align: "center",
      underline: true,
    });
    // doc.moveDown(); // Add spacing after heading
    doc.moveDown(0.5); // Small spacing after heading

    // Add "CUSTOM TOUR" centered below "CONFIRM ITINERARY"
    doc.fontSize(20).font("Helvetica-Bold").text("CUSTOM TOUR", {
      align: "center",
      underline: true,
    });
    doc.moveDown(0.3); // Small spacing after "CUSTOM TOUR"

    // Add "Confirm Date" aligned to the right below "CUSTOM TOUR"
    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Confirm Date: ${formattedDownloadDate}`, { align: "right" });

    doc.moveDown(1); // Spacing before next section

    doc
      .fontSize(18)
      .fillColor("black")
      .font("Helvetica-Bold")
      .text("TOUR ITINERARY:", { underline: true });

    itineraries.forEach((itinerary) => {
      const day = itinerary.day.label || "N/A";
      const destination = itinerary.destination.label || "N/A";
      const tripName = itinerary.tripName.label || "N/A";
      const tripDescription = itinerary.tripName.description || "N/A";
      const vehicles = itinerary.vehicles || [];
      const addOnTrips = itinerary.addOnTrips || [];
      const activities = itinerary.activities || [];
      const hotels = itinerary.hotels || [];

      doc.moveDown(); // Add spacing between itinerary items
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .fillColor("red")
        .text(`${day.toUpperCase()} - ${destination.toUpperCase()}`, {
          align: "left",
        });

      // Reset color for subsequent text
      doc.fillColor("black");

      // Trip Name and Description
      doc
        // .moveDown()
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(`${tripName.toUpperCase()}`, { align: "left" });
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`${tripDescription}`, { align: "left" });

      // Add Vehicles Heading
      doc.moveDown(); // Spacing before vehicles heading

      // List each vehicle and its count
      vehicles.forEach((vehicle) => {
        const vehicleLabel = vehicle.label
          .split(" - ") // Split by " - "
          .slice(0, 2) // Take only the first two parts ("2 Wheeler" and "scooty")
          .map((part) => part.toLowerCase().replace(/\s+/g, "-")) // Convert to lowercase and replace spaces with hyphens
          .join("-"); // Join the parts with a hyphen // Extracting the part after " - "
        const vehicleCount = vehicle.count || "N/A";
        doc
          // .moveDown()
          .fontSize(10)
          .font("Helvetica")
          .text(`${vehicleLabel.toUpperCase()} - QTY: ${vehicleCount}`, {
            align: "left",
          });
      });

      // Add On Trip Heading
      if (addOnTrips.length > 0) {
        // Loop through each addOnTrip
        addOnTrips.forEach((addOnTrip) => {
          const addOnTripName = addOnTrip.addOnTripName.label || "N/A";
          const addOnTripDescription =
            addOnTrip.addOnTripName.description || "N/A";
          const addOnTripVehicles = addOnTrip.vehicles || [];

          doc
            .moveDown()
            .fontSize(12)
            .font("Helvetica-Bold")
            .text(`${addOnTripName.toUpperCase()}`, {
              align: "left",
            });
          doc
            .fontSize(10)
            .font("Helvetica")
            .text(`${addOnTripDescription}`, { align: "left" });

          // List each vehicle for the addOnTrip and its count
          addOnTripVehicles.forEach((vehicle) => {
            const vehicleLabel = vehicle.label
              .split(" - ") // Split by " - "
              .slice(0, 2) // Take only the first two parts ("2 Wheeler" and "scooty")
              .map((part) => part.toLowerCase().replace(/\s+/g, "-")) // Convert to lowercase and replace spaces with hyphens
              .join("-"); // Join the parts with a hyphen
            const vehicleCount = vehicle.count || "N/A";
            doc
              .moveDown()
              .fontSize(10)
              .font("Helvetica")
              .text(`${vehicleLabel.toUpperCase()} - QTY: ${vehicleCount}`, {
                align: "left",
              });
          });
        });
      }

      // Activities Heading
      if (activities.length > 0) {
        doc.moveDown(); // Add spacing before activities heading
        doc
          .fontSize(12)
          .font("Helvetica-Bold")
          .text("ACTIVITY:", { underline: true, align: "left" });

        // Loop through each activity
        activities.forEach((activity) => {
          const activityName = activity.label.split(" - ")[0] || "N/A";
          const activityDescription = activity.description || "N/A";
          const activityCount = activity.count || "N/A"; // Get the count of the activity

          doc
            // .moveDown()
            .fontSize(12)
            .font("Helvetica-Bold")
            .text(`${activityName.toUpperCase()}`, { align: "left" });
          doc
            .fontSize(10)
            .font("Helvetica")
            .text(`${activityDescription}`, { align: "left" });
          doc
            .font("Helvetica")
            .text(`QTY: ${activityCount}`, { align: "left" });
        });
      }

      // Hotels Heading
      if (hotels.length > 0) {
        doc.moveDown(); // Add spacing before hotels heading
        doc
          .fontSize(12)
          .font("Helvetica-Bold")
          .text("HOTELS:", { underline: true, align: "left" });

        // Loop through each hotel
        hotels.forEach((hotel) => {
          const roomCategory = hotel.roomCategory.label || "N/A";
          const roomName = hotel.roomName.label || "N/A";
          const roomPriceType = hotel.roomPriceType.label
            ? hotel.roomPriceType.label.split(" - ")[0] // Take the part before " - "
            : "N/A";
          const count = hotel.count || "N/A";

          doc
            // .moveDown()
            .fontSize(10)
            .font("Helvetica")
            .text(`Hotel Category: ${roomCategory.toUpperCase()}`, {
              align: "left",
            });
          doc
            .font("Helvetica")
            .text(`Hotel Name: ${roomName.toUpperCase()}`, { align: "left" });
          doc
            .font("Helvetica")
            .text(`Room Category: ${roomPriceType.toUpperCase()}`, {
              align: "left",
            });
          doc.font("Helvetica").text(`QTY: ${count}`, { align: "left" });
        });
      }
    });
    doc.moveDown(); // Add spacing before the customer heading
    // Add inclusions and exclusions section above the customer details
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("INCLUSIONS:", { align: "left", underline: true })
      .font("Helvetica")
      .fontSize(10)
      .list(
        ["Pickup and drop off", "Accommodation", "Sightseeing", "Transfers"],
        { align: "left", bulletRadius: 2 }
      )
      .moveDown()
      .font("Helvetica-Bold")
      .text("EXCLUSIONS:", { align: "left", underline: true })
      .font("Helvetica")
      .fontSize(10)
      .list(
        [
          "Food not mentioned in the itinerary",
          "Things not mentioned in inclusion/itinerary",
          "Personal expenses",
          "Entry tickets not mentioned in itinerary",
          "GST",
          "Train/Flight Tickets",
        ],
        { align: "left", bulletRadius: 2 }
      )
      .moveDown();
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("CUSTOMER:", { underline: true, align: "left" });

    // Add client details on the left side
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`CLIENT NAME: ${name.toUpperCase()}`, { align: "left" })
      .text(`CLIENT ID: ${client.clientId}`, { align: "left" }) // Added line for Client ID
      .text(`START DATE: ${startDateStr.toUpperCase()}`, { align: "left" })
      .text(`END DATE: ${endDateStr.toUpperCase()}`, { align: "left" })
      .text(`NUMBER OF PERSONS: ${numberOfPersons.toString().toUpperCase()}`, {
        align: "left",
      })
      .text(`PRICE PER HEAD: ${pricePerHead.toFixed(2)}`, { align: "left" }) // Added price per head
      .text(`TOTAL PRICE: ${totalPrice.toFixed(2)}`, { align: "left" }); // Added total price

    // Add a TERMS AND CONDITIONS heading and points before doc.end
    doc.moveDown(0.1); // Add spacing before the terms and conditions section
    // Executive Details Section
    const executiveDetails = await Executive.findById(executiveId);
    if (executiveDetails) {
      doc
        .moveDown() // Add space before executive details
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("EXECUTIVE:", { underline: true, align: "left" });

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`EXECUTIVE NAME: ${executiveDetails.name.toUpperCase()}`, {
          align: "left",
        })
        .text(`EXECUTIVE PHONE: ${executiveDetails.mobileNumber}`, {
          align: "left",
        });
    }

    if (companyBankDetails.length) {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("BANK DETAILS", { align: "center", underline: true })
        .moveDown(0.5);

      for (const [index, bank] of companyBankDetails.entries()) {
        // Center the bank name
        doc
          .fontSize(10)
          .font("Helvetica-Bold")
          .text(`BANK ${index + 1}: ${bank.bankName.toUpperCase()}`, {
            align: "center",
          })
          .moveDown(0.2);

        // Center the bank details
        doc
          .font("Helvetica")
          .text(`Branch: ${bank.bankBranch}`, { align: "center" })
          .moveDown(0.1)
          .text(`IFSC Code: ${bank.bankIfscCode}`, { align: "center" })
          .moveDown(0.1)
          .text(`Account Number: ${bank.bankAccountNumber}`, {
            align: "center",
          })
          .moveDown(0.3);

        // Add QR Code Image if available and center it
        if (bank.bankQrCode) {
          try {
            const qrCodeBuffer = await fetchImageBuffer(bank.bankQrCode);

            // Center QR Code below the bank details
            const pageWidth = doc.page.width;
            const qrCodeWidth = 80; // QR code width
            const xPos = (pageWidth - qrCodeWidth) / 2; // Center horizontally

            doc
              .image(qrCodeBuffer, xPos, doc.y, {
                width: qrCodeWidth, // Adjust QR code size
              })
              .moveDown(0.9);
          } catch (error) {
            console.error(
              `Error loading QR Code for Bank ${index + 1}:`,
              error.message
            );
          }
        }

        doc.moveDown(12); // Space between banks
      }
    }
        // Add Payment Policy Section
doc
.fontSize(12)
.font("Helvetica-Bold")
.text("PAYMENT POLICY", { underline: true })
.moveDown(0.5);

// Payment policy array
const paymentPolicy = [
". A minimum payment is required for booking a tour - Non refundable(The minimum payment will vary depending on the tour).",
". 21-35 Days before date of departure : 50% of Cost .",
". 20 Days before date of departure : 100% of Total cost.",
];

// Cancellation and refund policy array
const cancellationPolicy = [
". 60 Days & Prior to Arrival - 25% of the Tour/Service Cost.",
". 59 Days to 30 Days Prior To Arrival - 50% of the Tour/Service Cost.",
". 29 Days to 15 Days Prior To Arrival - 75% of the Tour/Service Cost.",
". 14 Days and less Prior To Arrival – No refund.",
". Transportation and accommodation are as per itinerary only; if you have to change any of them, we will not be responsible for any kind of refund.",
". There will be no refund for add-ons.",
];

// Loop through payment policy and display each one
paymentPolicy.forEach((policy) => {
doc.fontSize(8).text(policy, { align: "left" }).moveDown(0.2);
});

// Add Cancellation and Refund Policy Section
doc
.fontSize(12)
.font("Helvetica-Bold")
.text("CANCELLATION AND REFUND POLICY", { underline: true })
.moveDown(0.5);

cancellationPolicy.forEach((policy) => {
doc.fontSize(8).text(policy, { align: "left" }).moveDown(0.2);
});

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("TERMS AND CONDITIONS:", { underline: true, align: "left" });

    // Terms and conditions points
    const termsAndConditions = [
      "If you're not able to reach the destination on time, that is not our responsibility.",
      "For international hotels, the standard check-in time is 2:30 PM, and check-out is at 12:30 PM. For domestic hotels, check-in begins at 12:30 PM, with check-out scheduled for 10:00 AM.",
      "The booking stands liable to be cancelled if 100% payment is not received less than 20 days before the date of departure. If the trip is cancelled due to this reason, the advance will not be refundable. If you do not pay the amount mentioned in the payment policy, the tour will be cancelled.",
      "There is no refund option in case you cancel the tour yourself.",
      "There is no refund available for group or scheduled tours.",
      "All activities not mentioned in the above itinerary, such as visiting additional spots or involving in paid activities, arranging a separate cab, etc., are not included.",
      "In case of using additional transport, it will be chargeable.",
      "All transport on the tour will be grouped together. Anyone who deviates from it will be excluded from this package.",
      "The company has the right to expel persons who disagree with passengers or misrepresent the company during the trip.",
      "The company does not allow passengers to give tips to the driver for going to additional spots.",
      "In case of cancellation due to any reason, such as Covid, strike, problems on the part of railways, malfunctions, natural calamities, etc., the package amount will not be refunded.",
      "The company will not be liable for any confirmation of train tickets, flight tickets, other transportation, or any other related items not included in the package.",
      "In case of events and circumstances beyond our control, we reserve the right to change all or parts of the contents of the itinerary for the safety and well-being of our esteemed passengers.",
      "Bathroom Facility | Indian or European.",
      "In the season, rooms will not be the same as per itinerary but the category will be the same (Budget Economy).",
      "Charges will be the same for children aged 5 years and above.",
      "We are not providing a tourist guide. If you avail their services at your own cost, we will not be responsible for the same.",
      "You should reach the departure place on time and manage your time effectively; otherwise, you may not be able to cover all the places.",
      "If the climate condition affects the sightseeing mentioned in the itinerary, we will not provide additional spots apart from the itinerary.",
      "Transportation timing is from 8 a.m. to 6 p.m. If you use the vehicle after that, an additional cost will be charged.",
      "Will visit places as per the itinerary only. If you visit other places, an additional cost will be charged.",
      "If any customer misbehaves with our staff, their tour will be cancelled immediately, and they will not be able to continue with the tour.",
      "If the trip is not fully booked or cancelled due to any special circumstances, we will postpone the trip to another day. Otherwise, if the journey is to be done on the pre-arranged day, the customers will have to bear the extra cost themselves.",
      "If you have any problems with the tour, please notify us as soon as possible so that we can resolve the problem. If you raise the issue after the tour, we will not be able to help you.",
      "Our company does not provide specific seats on the Volvo bus. If you need a specific seat, please inform the executive during the reservation confirmation (requires additional payment).",
      "If there are any changes to your tour, such as a date modification or postponement, you must notify us and obtain confirmation from our official email ID trippensholidays@gmail.com to your personal or official email. We will not acknowledge any proof of changes from the client unless confirmed through this official channel.",
    ];

    // Loop through terms and add them to the PDF
    termsAndConditions.forEach((term, index) => {
      doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .text(`${index + 1}. ${term}`, { align: "left" });
    });

    // Add spacing before the company information section
    doc.moveDown();

    // Add company name with underline in the center
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(companyName, { underline: true, align: "center" });

    // Add spacing after the company name
    // doc.moveDown(0.5);

    // Add company details explicitly and center-align them
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Address: ${companyDistrict}, ${companyState}`, { align: "center" }) // Updated line for address
      .text(`Pincode: ${companyPincode}`, { align: "center" })
      .text(`Contact No: ${companyMobile}`, { align: "center" })
      .text(`Email: ${companyEmail}`, { align: "center" });

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error("Error saving itinerary or generating PDF:", error.message);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
};

export const downloadCustomTracksheet = async (req, res) => {
  try {
    const { clientId, formData } = req.body;

    if (!clientId || !formData) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    let totalAmount = parseFloat(formData.totalPrice);
    totalAmount = totalAmount % 1 === 0 ? totalAmount : totalAmount.toFixed(2);

    // Find client details from the database
    const client = await Client.findOne({ _id: clientId });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const {
      name,
      numberOfPersons,
      executiveId,
      companyId,
      startDate,
      endDate,
      numberOfDays,
    } = client;
    const formatDate = (isoString) => {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-GB"); // Formats as dd/mm/yyyy
    };

    // Store formatted dates in variables
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    let pricePerHead = parseFloat(totalAmount) / numberOfPersons;
    pricePerHead =
      pricePerHead % 1 === 0 ? pricePerHead : pricePerHead.toFixed(2);

    // Find Executive details from the database
    const executive = await Executive.findOne({ _id: executiveId });

    if (!executive) {
      return res.status(404).json({ message: "Executive not found" });
    }

    const { name: executiveName, mobileNumber: executiveNumber } = executive;

    // **🔹 Find Company details using companyId**
    const company = await Agency.findOne({ _id: companyId });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const { logo: companyLogo } = company; // Extract company logo URL

    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, "0")}/${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${today.getFullYear()}`;
    const itineraries = await CustomItinerary.find({ clientId });
      // Get the max trackSheetNumber for the company
      const maxClient = await Client.findOne({ companyId })
      .sort({ trackSheetNumber: -1 })
      .select("trackSheetNumber");
  
    const maxTrackSheetNumber = maxClient ? maxClient.trackSheetNumber : 0;
  
    // Update trackSheetNumber for the client if it doesn't exist
    if (!client.trackSheetNumber) {
      client.trackSheetNumber = maxTrackSheetNumber + 1 || 1;
      await client.save();
    }

    // Create a new PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=custom_tracksheet.pdf`
    );

    // Pipe the PDF into the response
    doc.pipe(res);

    // Draw a border around the page
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    doc
      .rect(20, 20, pageWidth - 40, pageHeight - 40)
      .strokeColor("#000")
      .lineWidth(2)
      .stroke();

    // **🔹 Add Company Logo (Top-Left)**
    if (companyLogo) {
      try {
        const imageBuffer = await fetchImageBuffer(companyLogo);
        doc.image(imageBuffer, 30, 30, { width: 80 });
      } catch (error) {
        console.error("Error loading logo:", error.message);
      }
    }

    // **🔹 Add Main Heading "TRACK SHEET" (Centered)**
    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .fillColor("#000")
      .text("TRACK SHEET", {
        align: "center",
        baseline: "middle",
        underline: "true",
      });
    // **🔹 Add "GROUP TOUR" Below "TRACK SHEET"**
    doc
      .font("Helvetica-Bold")
      .fontSize(16) // Slightly smaller than "TRACK SHEET"
      .fillColor("#FF0000")
      .text("CUSTOM TOUR", { align: "center" });
    // **🔹 Add "NO:" on the Top-Right**
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("#000")
      .text(`NO: ${client.trackSheetNumber}`, pageWidth - 100, 40, { align: "right" });
    doc.moveDown(2); // Add space before sections
    // **🔹 Add Section Headings on the Same Line**
    const sectionY = doc.y + 20; // Adjust Y position after headings
    doc.font("Helvetica-Bold").fontSize(14);

    // Positioning for alignment
    const customerX = 30;
    const executiveX = pageWidth / 2 - 50;
    const salesManagerX = pageWidth - 145;

    // **🔹 Section Headings**
    doc.text("Customer", customerX, sectionY, { underline: true });
    doc.text("Executive", executiveX, sectionY, { underline: true });
    doc.text("Manager", salesManagerX, sectionY, { underline: true });

    doc.moveDown(1); // Add space for fields

    // **🔹 Add Fields Below Each Section**
    doc.font("Helvetica").fontSize(12);

    const lineSpacing = 18; // Consistent spacing

    // **Customer Fields (Left)**
    let fieldY = sectionY + 20;
    doc.text("Name:", customerX, fieldY);
    doc.text(name, customerX + 40, fieldY);

    doc.text("ID      :", customerX, (fieldY += lineSpacing));
    doc.text(client.clientId, customerX + 40, fieldY);

    doc.text("Pax    :", customerX, (fieldY += lineSpacing));
    doc.text(numberOfPersons.toString(), customerX + 40, fieldY);

    // **Executive Fields (Centered)**
    fieldY = sectionY + 20;
    doc.text("Name           :", executiveX, fieldY);
    doc.text(executiveName, executiveX + 75, fieldY);

    doc.text("No                :", executiveX, (fieldY += lineSpacing));
    doc.text(executiveNumber, executiveX + 75, fieldY);

    doc.text("Date Confirm:", executiveX, (fieldY += lineSpacing));
    doc.text(formattedDate, executiveX + 75, fieldY);

    // **Sales Manager Fields (Right)**
    fieldY = sectionY + 20;
    doc.text("Name:", salesManagerX, fieldY);
    doc.text("Sign  :", salesManagerX, (fieldY += lineSpacing));
    doc.text("Date  :", salesManagerX, (fieldY += lineSpacing));
    doc.moveDown(0.1);

    // **🔹 Separation Line**
    doc
      .moveTo(30, doc.y)
      .lineTo(pageWidth - 30, doc.y)
      .lineWidth(1)
      .stroke();
    doc.moveDown(1);
    const sectionYY = doc.y + 1;

    // **🔹 Second Section (Tour, Date, Payment)**
    doc.font("Helvetica-Bold").fontSize(14);

    const tourX = 30;
    const dateX = pageWidth / 2 - 50;
    const paymentX = pageWidth - 145;

    doc.text("Tour", tourX, sectionYY, { underline: true });
    doc.text("Date", dateX, sectionYY, { underline: true });
    doc.text("Payment", paymentX, sectionYY, { underline: true });

    doc.moveDown(1);
    doc.font("Helvetica").fontSize(12);

    fieldY = sectionYY + 20;
    doc.text("Name      :", tourX, fieldY);
    //  doc.text(tourName, tourX + 60, fieldY);

    doc.text("ArtNo      :", tourX, (fieldY += lineSpacing));
    //  doc.text(articleNumber, tourX + 60, fieldY);

    doc.text("Category :", tourX, (fieldY += lineSpacing));
    //  doc.text(category.value, tourX + 60, fieldY);

    // **Date Fields**
    fieldY = sectionYY + 20; // Align with Tour fields
    doc.text("Start :", dateX, fieldY);
    doc.text(formattedStartDate, dateX + 35, fieldY);

    doc.text("End  :", dateX, (fieldY += lineSpacing));
    doc.text(formattedEndDate, dateX + 35, fieldY);

    doc.text("Days :", dateX, (fieldY += lineSpacing));
    doc.text(numberOfDays.toString(), dateX + 35, fieldY);

    // **Payment Fields**
    fieldY = sectionYY + 20; // Align with Date fields
    doc.text("PP   :", paymentX, fieldY);
    doc.text(pricePerHead.toString(), paymentX + 30, fieldY);

    doc.text("Total:", paymentX, (fieldY += lineSpacing));
    doc.text(totalAmount.toString(), paymentX + 30, fieldY);

    doc.text("Advance:", paymentX, (fieldY += lineSpacing));
    // doc.text(advanceAmount.toString(), paymentX + 70, fieldY);
    doc.moveDown(0.1);

    // **🔹 Separation Line**
    doc
      .moveTo(30, doc.y)
      .lineTo(pageWidth - 30, doc.y)
      .lineWidth(1)
      .stroke();
    // **🔹 Draw Vertical Line in the Center**
    const centerX = (2 / 3) * pageWidth;
    const startY = doc.y; // Start from the current position
    const endY = pageHeight - 20; // End at bottom margin

    // Draw center line (always present)
    doc.moveTo(centerX, startY).lineTo(centerX, endY).lineWidth(1).stroke();

    doc.font("Helvetica").fontSize(10);
    let leftSectionX = 30;
    let leftSectionY = startY + 10;

    let isFirstPage = true; // Track whether we are on the first page

    itineraries.forEach((itinerary, index) => {
      let pageHeight = doc.page.height; // Always update page height dynamically

      if (leftSectionY + 50 > pageHeight - 50) {
        // Ensure content fits properly before adding a new page
        doc.addPage(); // Only add a new page when necessary
        // Update page dimensions after adding a new page
        pageHeight = doc.page.height;
        const centerX = (2 / 3) * doc.page.width;
        const startY = 20; // Reset to top margin
        const endY = pageHeight - 20; // Bottom margin

        // Draw border for the new page
        doc
          .rect(20, 20, doc.page.width - 40, pageHeight - 40)
          .strokeColor("#000")
          .lineWidth(2)
          .stroke();

        // Draw vertical center line
        doc.moveTo(centerX, startY).lineTo(centerX, endY).lineWidth(1).stroke();

        // Reset the Y position for new page
        leftSectionY = 30;

        isFirstPage = false; // Ensure right section isn't drawn again
      }

      // **Day & Destination Title**
      doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .fillColor("red")
        .text(
          `${itinerary.day.label.toUpperCase()} - ${itinerary.destination.label.toUpperCase()} - ${itinerary.tripName.label.toUpperCase()}`,
          leftSectionX,
          leftSectionY
        );
      leftSectionY += 8;

      // **Vehicles Section**
      if (itinerary.vehicles.length > 0) {
        itinerary.vehicles.forEach((vehicle) => {
          doc
            .fontSize(7)
            .font("Helvetica")
            .fillColor("black")
            .text(
              `${vehicle.label
                .split(" - ")
                .slice(0, 2)
                .join("-")
                .toUpperCase()} - QTY: ${vehicle.count || "N/A"}`,
              leftSectionX,
              leftSectionY
            );
          leftSectionY += 8;
        });
      }

      // **Add-On Trips**
      if (itinerary.addOnTrips.length > 0) {
        leftSectionY += 5;
        doc
          .fontSize(7)
          .font("Helvetica-Bold")
          .fillColor("black")
          .text("ADD-ON TRIP:", leftSectionX, leftSectionY, {
            continued: true,
          });

        itinerary.addOnTrips.forEach((addOnTrip, idx) => {
          doc.text(` ${addOnTrip.addOnTripName.label.toUpperCase()}`, {
            continued: idx !== itinerary.addOnTrips.length - 1,
          });
        });

        leftSectionY += 7;
        itinerary.addOnTrips.forEach((addOnTrip) => {
          addOnTrip.vehicles.forEach((vehicle) => {
            doc
              .fontSize(7)
              .font("Helvetica")
              .fillColor("black")
              .text(
                `${vehicle.label
                  .split(" - ")
                  .slice(0, 2)
                  .join("-")
                  .toUpperCase()} - QTY: ${vehicle.count || "N/A"}`,
                leftSectionX,
                leftSectionY
              );
            leftSectionY += 8;
          });
        });
      }
      // **Activity Section**
      if (itinerary.activities.length > 0) {
        leftSectionY += 5;
        doc
          .fontSize(7)
          .font("Helvetica-Bold")
          .fillColor("black")
          .text("ACTIVITY:", leftSectionX, leftSectionY, { continued: true });

        itinerary.activities.forEach((activity, idx) => {
          doc
            .fontSize(7)
            .font("Helvetica")
            .fillColor("black")
            .text(
              ` ${activity.label.split(" - ")[0].toUpperCase()} - QTY: ${
                activity.count || "N/A"
              }`,
              {
                continued: idx !== itinerary.activities.length - 1,
              }
            );
        });

        leftSectionY += 8;
      }

      // **Hotels**
      // **Hotels**
      if (itinerary.hotels.length > 0) {
        leftSectionY += 5;

        // Ensure entire hotel section header fits
        if (leftSectionY + 16 > pageHeight - 50) {
          doc.addPage();
          // Update page dimensions after adding a new page
          pageHeight = doc.page.height;
          const centerX = (2 / 3) * doc.page.width;
          const startY = 20; // Reset to top margin
          const endY = pageHeight - 20; // Bottom margin

          // Draw border for the new page
          doc
            .rect(20, 20, doc.page.width - 40, pageHeight - 40)
            .strokeColor("#000")
            .lineWidth(2)
            .stroke();

          // Draw vertical center line
          doc
            .moveTo(centerX, startY)
            .lineTo(centerX, endY)
            .lineWidth(1)
            .stroke();
          leftSectionY = 30;
        }

        doc
          .fontSize(7)
          .font("Helvetica-Bold")
          .fillColor("black")
          .text("HOTELS:", leftSectionX, leftSectionY, { underline: true });
        leftSectionY += 8;

        itinerary.hotels.forEach((hotel) => {
          let requiredHeight = 32; // Estimated height needed for each hotel

          // Check if hotel details fit, otherwise, start a new page
          if (leftSectionY + requiredHeight > pageHeight - 50) {
            doc.addPage(); // Only add a new page when necessary
            // Update page dimensions after adding a new page
            pageHeight = doc.page.height;
            const centerX = (2 / 3) * doc.page.width;
            const startY = 20; // Reset to top margin
            const endY = pageHeight - 20; // Bottom margin

            // Draw border for the new page
            doc
              .rect(20, 20, doc.page.width - 40, pageHeight - 40)
              .strokeColor("#000")
              .lineWidth(2)
              .stroke();

            // Draw vertical center line
            doc
              .moveTo(centerX, startY)
              .lineTo(centerX, endY)
              .lineWidth(1)
              .stroke();

            // Reset the Y position for new page
            leftSectionY = 30;
          }

          doc
            .fontSize(7)
            .font("Helvetica")
            .fillColor("black")
            .text(
              `Category: ${hotel.roomCategory.label.toUpperCase()}`,
              leftSectionX,
              leftSectionY
            );
          leftSectionY += 8;
          doc
            .fontSize(7)
            .font("Helvetica")
            .fillColor("black")
            .text(
              `Name: ${hotel.roomName.label.toUpperCase()}`,
              leftSectionX,
              leftSectionY
            );
          leftSectionY += 8;
          doc
            .fontSize(7)
            .font("Helvetica")
            .fillColor("black")
            .text(
              `Room: ${hotel.roomPriceType.label
                .split(" - ")[0]
                .toUpperCase()}`,
              leftSectionX,
              leftSectionY
            );
          leftSectionY += 8;
          doc
            .fontSize(7)
            .font("Helvetica")
            .fillColor("black")
            .text(`QTY: ${hotel.count || "N/A"}`, leftSectionX, leftSectionY);
          leftSectionY += 8;
        });
      }

      // **Ensure right section appears only on the first page**
      if (isFirstPage && index === 0) {
        let rightSectionX = centerX + 10;
        let rightSectionY = startY + 20;
        doc.font("Helvetica-Bold").fontSize(12);

        doc.text("Pickup Spot:", rightSectionX, rightSectionY, {
          underline: true,
        });
        rightSectionY += 40;
        doc
          .moveTo(rightSectionX, rightSectionY)
          .lineTo(pageWidth - 30, rightSectionY)
          .stroke();
        rightSectionY += 30;

        doc.text("Time:", rightSectionX, rightSectionY, { underline: true });
        rightSectionY += 40;
        doc
          .moveTo(rightSectionX, rightSectionY)
          .lineTo(pageWidth - 30, rightSectionY)
          .stroke();
        rightSectionY += 30;

        doc.text("Dropoff Spot:", rightSectionX, rightSectionY, {
          underline: true,
        });
        rightSectionY += 40;
        doc
          .moveTo(rightSectionX, rightSectionY)
          .lineTo(pageWidth - 30, rightSectionY)
          .stroke();
        rightSectionY += 30;

        doc.text("Time:", rightSectionX, rightSectionY, { underline: true });
        rightSectionY += 40;
        doc
          .moveTo(rightSectionX, rightSectionY)
          .lineTo(pageWidth - 30, rightSectionY)
          .stroke();
        rightSectionY += 30;

        doc.text("Customer Extra Needs:", rightSectionX, rightSectionY, {
          underline: true,
        });
        rightSectionY += 40;
        doc
          .moveTo(rightSectionX, rightSectionY)
          .lineTo(pageWidth - 30, rightSectionY)
          .stroke();

        isFirstPage = false; // Ensure it doesn't get drawn again
      }
    });
    doc.end();
  } catch (error) {
    console.error("Error generating tracksheet PDF:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
};


export const getSpecialTours = async (req, res) => {
  try {
    const { primaryTourNameId, clientId, page = 1, limit = 4 } = req.query;

    // Validate required parameters
    if (!primaryTourNameId) {
      return res
        .status(400)
        .json({ message: "Primary Tour Name ID is required." });
    }
    if (!clientId) {
      return res.status(400).json({ message: "Client ID is required." });
    }

    // Fetch the client document
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found." });
    }

    // Extract the companyId from the client document
    const companyId = client.companyId;
    if (!companyId) {
      return res
        .status(400)
        .json({ message: "Company ID is missing in the client document." });
    }

    // Query to filter tours based on primaryTourNameId and companyId
    const query = {
      "destination._id": primaryTourNameId,
      companyId: companyId,
    };

    // Pagination settings
    const skip = (page - 1) * limit;

    // Fetch tours with pagination
    const tours = await SpecialTour.find(query)
      .skip(skip)
      .limit(Number(limit))
      .lean(); // Use lean() for faster read operations

    // Count total matching documents
    const totalTours = await SpecialTour.countDocuments(query);

    // Respond with tours and pagination data
    res.status(200).json({
      tours,
      currentPage: Number(page),
      totalPages: Math.ceil(totalTours / limit),
      totalTours,
    });
  } catch (error) {
    console.error("Error fetching fixed tours:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching fixed tours." });
  }
};
const formatDateToDDMMYYYY = (isoDate) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};
export const getSpecialTourById = async (req, res) => {
  try {
    const { specialTourId } = req.params;

    // Fetch fixed tour details by ID
    const specialTour = await SpecialTour.findById(specialTourId);

    if (!specialTour) {
      return res.status(404).json({ message: "Fixed tour not found" });
    }
     // Format validStartDate and validEndDate
     const formattedTour = {
      ...specialTour._doc, // Spread the existing tour data
      validStartDate: formatDateToDDMMYYYY(specialTour.validStartDate),
      validEndDate: formatDateToDDMMYYYY(specialTour.validEndDate),
    };

    res.status(200).json(formattedTour);
  } catch (error) {
    console.error("Error fetching fixed tour details:", error);
    res.status(500).json({ message: "Failed to fetch fixed tour details" });
  }
};


export const downloadReferralSpecialItinerary = async (req, res) => {
  try {
    const { clientId, specialTripId, date } = req.body;
    

    // Validate required fields
    if (!clientId || !specialTripId || !date) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const formattedDate = format(new Date(date), 'dd/MM/yyyy');
    


    // Find the FixedTour document by ID
    const specialTour = await SpecialTour.findById(specialTripId);
    if (!specialTour) {
      return res.status(404).json({ message: "FixedTour not found." });
    }

    // Extract itineraryText and other details
    const {
      itineraryText,
      tourName,
      articleNumber,
      destination,
      day,
      night,
      inclusionsList,
      exclusionsList,
    } = specialTour;

    
    // Find the Client document by clientId
    const client = await Client.findById(clientId).populate("companyId");
    if (!client) {
      return res.status(404).json({ message: "Client not found." });
    }

    const { name, numberOfPersons, mobileNumber, companyId, executiveId } =
      client; // Extract the necessary detail
       // Get the MRP value from the key that matches numberOfPersons
    const mrpKey = numberOfPersons.toString(); // Convert to string since schema keys are string numbers
    const mrp = specialTour[mrpKey]; // Retrieve MRP value

    // Check if MRP is missing or empty
if (!mrp || mrp === "") {
  return res.status(400).json({ message: "MRP not found for given number of persons." });
}

    // Calculate total cost
    const totalCost = Number(mrp) * numberOfPersons;
    const company = client.companyId; // The populated Company (Agency) document

    // Ensure company exists
    if (!company) {
      return res
        .status(404)
        .json({ message: "Company not found for this client." });
    }

    // Extract company information from the populated Agency document
    const {
      name: companyName,
      email: companyEmail,
      mobileNumber: companyMobile,
      pincode: companyPincode,
      district: companyDistrict,
      state: companyState,
    } = company;

    //const totalCost = mrp * numberOfPersons;

    // Update the Client's itinerary field
    const newItinerary = {
      itineraryId: specialTripId,
      itineraryType: "special",
      dateId: specialTripId,
      status: "referral",
      time: new Date(), // Capture the exact current time
    };

    // Ensure only one object exists in the `itinerary` array
    if (client.itinerary.length > 0) {
      // Replace the existing object
      client.itinerary[0] = newItinerary;
    } else {
      // Push the new object if the array is empty
      client.itinerary.push(newItinerary);
    }
    await client.save();
    const doc = new PDFDocument({ margin: 50 });

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=referral_itinerary_${tourName}.pdf`
    );

    // Pipe the PDF into the response
    doc.pipe(res);

    // Function to add border around the page
    function addBorder() {
      const margin = 40; // Set margin value to match your existing margin
      doc.lineWidth(5); // This sets a thick border line

      // Draw a rectangle (border) around the page
      doc
        .rect(
          margin,
          margin,
          doc.page.width - 2 * margin,
          doc.page.height - 2 * margin
        ) // Define the rectangle dimensions
        .strokeColor("black") // Set the border color to black
        .stroke(); // Apply the stroke
    }

    // Add the border to the first page
    addBorder();

    // Event listener to add the border to subsequent pages
    doc.on("pageAdded", () => {
      addBorder(); // Draw the border on new pages
    });

    // Add Header Section
    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("REFERRAL ITINERARY", { align: "center", underline: true })
      .moveDown(0.3);
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("FIXED TOUR", { align: "center", underline: true })
      .moveDown(0.5);
    // Add Subheadings
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text(tourName ? tourName.toUpperCase() : "N/A", { align: "center" })
      .moveDown(0.2);

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(destination?.label?.toUpperCase() || "N/A", { align: "center" })
      .moveDown(0.2);

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(` ${day} Day / ${night} Night`, { align: "center" })
      .moveDown(0.1);

    // Add Note
    doc
      .fillColor("red")
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("NOTE:", { underline: true })
      .moveDown(0.5);

    doc
      .fillColor("red")
      .fontSize(8)
      .font("Helvetica")
      .text(
        "THIS IS JUST A REFERRAL ITINERARY. AFTER CONFIRMATION, PLEASE CONTACT OUR EXECUTIVE AND ASK FOR YOUR CONFIRMED ITINERARY. THE ITINERARY HERE IS NOT VALID FOR YOUR TOUR.",
        { align: "justify" }
      )
      .moveDown(1);

    // Add Itinerary Text
    doc
      .fontSize(18)
      .fillColor("black")
      .font("Helvetica-Bold")
      .text("TOUR ITINERARY:", { underline: true })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .fillColor("black")
      .font("Helvetica")
      .text(itineraryText, { align: "justify" })
      .moveDown(1);

    // Add Inclusions
    if (inclusionsList.length) {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("INCLUSIONS:", { underline: true })
        .moveDown(0.5);

      inclusionsList.forEach((item) => {
        doc
          .fontSize(10)
          .font("Helvetica")
          .text(`• ${item.toUpperCase()}`, { align: "left" }); // Use a dot (•) symbol
      });

      doc.moveDown(1);
    }

    // Add Exclusions
    if (exclusionsList.length) {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("EXCLUSIONS:", { underline: true })
        .moveDown(0.5);

      exclusionsList.forEach((item) => {
        doc
          .fontSize(10)
          .font("Helvetica")
          .text(`• ${item.toUpperCase()}`, { align: "left" }); // Use a dot (•) symbol
      });

      doc.moveDown(1);
    }

    // Customer Section
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("CUSTOMER", { underline: true }); // Add heading
    //.moveDown(0.5); // Add space below the heading

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`CLIENT NAME: ${name?.toUpperCase() || "N/A"}`)
      .moveDown(0.1)
      .text(`CLIENT ID: ${client?.clientId || "N/A"}`) // Client ID
      .moveDown(0.1)
      .text(`TOTAL PAX: ${numberOfPersons || "N/A"}`)
      .moveDown(1);

    // Tour Section
    doc.fontSize(12).font("Helvetica-Bold").text("TOUR", { underline: true }); // Add heading
    //.moveDown(0.5); // Add space below the heading

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`TOUR DATE: ${formattedDate || "N/A"}`)
      .moveDown(0.1)
      .text(`ARTICLE NO: ${articleNumber || "N/A"}`)
      .moveDown(0.1)
      .text(`PRICE PER HEAD: ${mrp ? `${mrp}` : "N/A"}`)
      .moveDown(0.1)
      .text(`TOTAL COST: ${totalCost || "N/A"}`)
      .moveDown(1); // Add space after Tour section

    const executiveDetails = await Executive.findById(executiveId);
    if (executiveDetails) {
      doc
        .moveDown(0.3) // Add space before executive details
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("EXECUTIVE:", { underline: true, align: "left" });

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`EXECUTIVE NAME: ${executiveDetails.name.toUpperCase()}`, {
          align: "left",
        })
        .text(`EXECUTIVE PHONE: ${executiveDetails.mobileNumber}`, {
          align: "left",
        })
        .moveDown(1);
    }
            // Add Payment Policy Section
doc
.fontSize(12)
.font("Helvetica-Bold")
.text("PAYMENT POLICY", { underline: true })
.moveDown(0.5);

// Payment policy array
const paymentPolicy = [
". A minimum payment is required for booking a tour - Non refundable(The minimum payment will vary depending on the tour).",
". 21-35 Days before date of departure : 50% of Cost .",
". 20 Days before date of departure : 100% of Total cost.",
];

// Cancellation and refund policy array
const cancellationPolicy = [
". 60 Days & Prior to Arrival - 25% of the Tour/Service Cost.",
". 59 Days to 30 Days Prior To Arrival - 50% of the Tour/Service Cost.",
". 29 Days to 15 Days Prior To Arrival - 75% of the Tour/Service Cost.",
". 14 Days and less Prior To Arrival – No refund.",
". Transportation and accommodation are as per itinerary only; if you have to change any of them, we will not be responsible for any kind of refund.",
". There will be no refund for add-ons.",
];

// Loop through payment policy and display each one
paymentPolicy.forEach((policy) => {
doc.fontSize(8).text(policy, { align: "left" }).moveDown(0.2);
});

// Add Cancellation and Refund Policy Section
doc
.fontSize(12)
.font("Helvetica-Bold")
.text("CANCELLATION AND REFUND POLICY", { underline: true })
.moveDown(0.5);

cancellationPolicy.forEach((policy) => {
doc.fontSize(8).text(policy, { align: "left" }).moveDown(0.2);
});

    // Add Terms and Conditions Section Below Customer and Tour Section
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("TERMS AND CONDITIONS", { underline: true })
      .moveDown(0.5);

    // Terms array
    const terms = [
      "1. If you're not able to reach out the destination on time. That is not our responsibility.",
      "2. For international hotels, the standard check-in time is 2:30 PM, and check-out is at 12:30 PM. For domestic hotels, check-in begins at 12:30 PM, with check-out scheduled for 10:00 AM.",
      "3. The booking stands liable to be cancelled if 100% payment is not received less than 20 days before date of departure. If the trip is cancelled due to this reason advance will not be refundable. If you are not pay the amount that in mentioned in payment policy then tour will be cancelled.",
      "4. There is no refund option in case you cancel the tour yourself.",
      "5. There is no refund available for group or scheduled tours.",
      "6. All activities which are not mentioned in the above itinerary such as visiting additional spots or involving in paid activities, if arranging separate cab etc. is not included in this.",
      "7. In case of using additional transport will be chargeable.",
      "8. All transport on the tour will be grouped together. Anyone who deviates from it will be excluded from this package.",
      "9. The company has the right for expelling persons who disagree with passengers or misrepresent the company during the trip.",
      "10. The company does not allow passengers to give tips to the driver for going additional spots.",
      "11. In case of cancellation due to any reason such as Covid, strike, problems on the part of railways, malfunctions, natural calamities etc., package amount will not be refunded.",
      "12. The Company will not be liable for any confirmation of train tickets, flight tickets, other transportation or any other related items not included in the package.",
      "13. In Case of Events And Circumstances Beyond Our Control, We Reserve The Right To Change All Or Parts Of The Contents Of The Itinerary For Safety And Well Being Of Our Esteemed Passengers.",
      "14. Bathroom Facility | Indian or European.",
      "15. In season rooms will not be the same as per itinerary but category will be the same (Budget economy).",
      "16. Charge will be the same from the age of 5 years.",
      "17. We are not providing tourist guide, if you are taking their service in your own cost we will not be responsible for the same.",
      "18. You Should reach to departing place on time, also you should keep the time management or you will not be able to cover all the place.",
      "19. If the climate condition affects the sightseeing that mentioned in itinerary, then we won’t provide you the additional spots apart from the itinerary.",
      "20. Transportation timing 8 am to 6 pm, if use vehicle after that then cost will be extra.",
      "21. Will visit places as per itinerary only, if you visit other than this then cost will be extra.",
      "22. If any customers misbehave with our staffs improperly then we will cancel his tour immediately and after that he can't continue with this tour.",
      "23. If the trip is not fully booked or cancelled due to any special circumstances, we will postpone the trip to another day. Otherwise, if the journey is to be done on the pre-arranged day, the customers will have to bear the extra money themselves.",
      "24. If you have any problems with the tour, please notify us as soon as possible so that we can resolve the problem. If you raise the issue after the tour, we will not be able to help you.",
      "25. Our company does not provide specific seats on the Volvo bus, if you need a seat particularly, please let the executive know during the confirmation of your reservation. (requires additional payment).",
      "26. If there are any changes to your tour, such as a date modification or postponement, you must notify us and obtain confirmation from our official email ID trippensholidays@gmail.com to your personal or official email. We will not acknowledge any proof of changes from the client unless confirmed through this official channel.",
    ];

    // Loop through terms and display each one
    terms.forEach((term) => {
      doc.fontSize(8).text(term, { align: "left" }).moveDown(0.2);
    });

    // Add company name with underline in the center
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(companyName, { underline: true, align: "center" });

    // Add spacing after the company name
    // doc.moveDown(0.5);

    // Add company details explicitly and center-align them
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Address: ${companyDistrict}, ${companyState}`, { align: "center" }) // Updated line for address
      .text(`Pincode: ${companyPincode}`, { align: "center" })
      .text(`Contact No: ${companyMobile}`, { align: "center" })
      .text(`Email: ${companyEmail}`, { align: "center" });

    // Finalize the PDF and end the stream
    doc.end();
  }catch (error) {
    console.error("Error in downloadReferralItinerary:", error);
    res
      .status(500)
      .json({ message: "An error occurred while generating the PDF." });
  }
}


export const downloadConfirmSpecialItinerary = async (req, res) => {
  try {
    const { clientId, specialTripId, date } = req.body;
    console.log(date);

    // Validate required fields
    if (!clientId || !specialTripId || !date) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const formattedDate = format(new Date(date), 'dd/MM/yyyy');
    
    const downloadDate = new Date().toLocaleDateString("en-GB");
    const confirmedDate = new Date();
    confirmedDate.setUTCHours(0, 0, 0, 0);

    // Calculate dueDate (10 days before formattedDate)
    const dueDateObj = subDays(new Date(date), 10);
    const dueDate = format(dueDateObj, 'dd/MM/yyyy'); // String format
    const dueDateAt = dueDateObj.toISOString(); // ISO forma
    


    // Find the FixedTour document by ID
    const specialTour = await SpecialTour.findById(specialTripId);
    if (!specialTour) {
      return res.status(404).json({ message: "FixedTour not found." });
    }

    // Extract itineraryText and other details
    const {
      itineraryText,
      tourName,
      articleNumber,
      destination,
      day,
      night,
      inclusionsList,
      exclusionsList,
    } = specialTour;

    
    // Find the Client document by clientId
    const client = await Client.findById(clientId).populate("companyId");
    if (!client) {
      return res.status(404).json({ message: "Client not found." });
    }

    const { name, numberOfPersons, mobileNumber, companyId, executiveId } =
      client; // Extract the necessary detail
       // Get the MRP value from the key that matches numberOfPersons
    const mrpKey = numberOfPersons.toString(); // Convert to string since schema keys are string numbers
    const mrp = specialTour[mrpKey]; // Retrieve MRP value

    // Check if MRP is missing or empty
if (!mrp || mrp === "") {
  return res.status(400).json({ message: "MRP not found for given number of persons." });
}

    // Calculate total cost
    const totalCost = Number(mrp) * numberOfPersons;
     // Calculate SGST and CGST (2.5% each)
     const company = client.companyId; // The populated Company (Agency) document

     // Ensure company exists
     if (!company) {
       return res
         .status(404)
         .json({ message: "Company not found for this client." });
     }
 
     // Extract company information from the populated Agency document
     const {
       name: companyName,
       email: companyEmail,
       mobileNumber: companyMobile,
       pincode: companyPincode,
       district: companyDistrict,
       state: companyState,
       bankDetails: companyBankDetails,
       cgstPercentage = 0,  // Default to 0 if not provided
       sgstPercentage = 0   // Default to 0 if not provided
     } = company;
     const cgstRate = cgstPercentage ? cgstPercentage / 100 : 0;
     const sgstRate = sgstPercentage ? sgstPercentage / 100 : 0;
    const sgst = parseFloat((totalCost * sgstRate).toFixed(2));
    const cgst = parseFloat((totalCost * cgstRate).toFixed(2));

   // Update `amountToBePaid`
    const amountToBePaid = parseFloat((totalCost + sgst + cgst).toFixed(2))
    // const company = client.companyId; // The populated Company (Agency) document

    // // Ensure company exists
    // if (!company) {
    //   return res
    //     .status(404)
    //     .json({ message: "Company not found for this client." });
    // }

    // // Extract company information from the populated Agency document
    // const {
    //   name: companyName,
    //   email: companyEmail,
    //   mobileNumber: companyMobile,
    //   pincode: companyPincode,
    //   district: companyDistrict,
    //   state: companyState,
    //   bankDetails: companyBankDetails,
    // } = company;

    //const totalCost = mrp * numberOfPersons;

    // Update the Client's itinerary field
     const finalizedTourEndDate = new Date(date);
    finalizedTourEndDate.setDate(finalizedTourEndDate.getDate() + day - 1);
    const newItinerary = {
      itineraryId: specialTripId,
      itineraryType: "special",
      dateId: specialTripId,
      status: "confirm",
      time: new Date(), // Capture the exact current time
    };

    // Ensure only one object exists in the `itinerary` array
    if (client.itinerary.length > 0) {
      // Replace the existing object
      client.itinerary[0] = newItinerary;
    } else {
      // Push the new object if the array is empty
      client.itinerary.push(newItinerary);
    }
    client.confirmedStatus = true;
    client.finalizedTourDate = formattedDate;
    client.finalizedTourDateAt = date;
     client.finalizedTourEndDateAt = finalizedTourEndDate;
    client.dueDate = dueDate;
    client.dueDateAt = dueDateAt;
    client.totalCost = totalCost;
    client.totalCostWithAdditionalAmount = totalCost;
    client.amountToBePaid = amountToBePaid;
    client.balance = amountToBePaid;
    client.sgst = sgst;
    client.cgst = cgst;
    
    const itineraryData = {
      heading:"FIXED TOUR",
      clientName: name?.toUpperCase() || "N/A",
      destination: destination?.label?.toUpperCase() || "N/A",
      tourName: tourName || "N/A",
      articleNumber: articleNumber || "N/A",
      duration: `${day} Day / ${night} Night`,
      date: formattedDate,
      pricePerHead: mrp || 0,
      totalCost: totalCost || 0,
      itineraryText: itineraryText || "N/A",
      inclusionsList: inclusionsList.map((item) => item.toUpperCase()),
      exclusionsList: exclusionsList.map((item) => item.toUpperCase()),
      //finalizedTourDate: finalizedTourDate,
      //amountToBePaid: amountToBePaid,
      downloadDate: downloadDate,
    };
    client.itineraryDetails = itineraryData;
    client.confirmedDateAt = confirmedDate
    client.confirmedDestination = {
      id: destination._id,
      name: destination.label, // or destination.value, since both are same
    };
    
    await client.save();
    const doc = new PDFDocument({ margin: 50 });

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=referral_itinerary_${tourName}.pdf`
    );

    // Pipe the PDF into the response
    doc.pipe(res);

    // Function to add border around the page
    function addBorder() {
      const margin = 40; // Set margin value to match your existing margin
      doc.lineWidth(5); // This sets a thick border line

      // Draw a rectangle (border) around the page
      doc
        .rect(
          margin,
          margin,
          doc.page.width - 2 * margin,
          doc.page.height - 2 * margin
        ) // Define the rectangle dimensions
        .strokeColor("black") // Set the border color to black
        .stroke(); // Apply the stroke
    }

    // Add the border to the first page
    addBorder();

    // Event listener to add the border to subsequent pages
    doc.on("pageAdded", () => {
      addBorder(); // Draw the border on new pages
    });

    // Add Header Section
    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("CONFIRM ITINERARY", { align: "center", underline: true })
      .moveDown(0.3);
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("FIXED TOUR", { align: "center", underline: true })
      doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Confirm Date: ${downloadDate}`, { align: "right" });

    doc.moveDown(0.1);
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text(tourName ? tourName.toUpperCase() : "N/A", { align: "center" })
      .moveDown(0.2);

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(destination?.label?.toUpperCase() || "N/A", { align: "center" })
      .moveDown(0.2);

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(` ${day} Day / ${night} Night`, { align: "center" })
      .moveDown(0.3);

    // Add Itinerary Text
    doc
      .fontSize(18)
      .fillColor("black")
      .font("Helvetica-Bold")
      .text("TOUR ITINERARY:", { underline: true })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .fillColor("black")
      .font("Helvetica")
      .text(itineraryText, { align: "justify" })
      .moveDown(1);

    // Add Inclusions
    if (inclusionsList.length) {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("INCLUSIONS:", { underline: true })
        .moveDown(0.5);

      inclusionsList.forEach((item) => {
        doc
          .fontSize(10)
          .font("Helvetica")
          .text(`• ${item.toUpperCase()}`, { align: "left" }); // Use a dot (•) symbol
      });

      doc.moveDown(1);
    }

    // Add Exclusions
    if (exclusionsList.length) {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("EXCLUSIONS:", { underline: true })
        .moveDown(0.5);

      exclusionsList.forEach((item) => {
        doc
          .fontSize(10)
          .font("Helvetica")
          .text(`• ${item.toUpperCase()}`, { align: "left" }); // Use a dot (•) symbol
      });

      doc.moveDown(1);
    }

    // Customer Section
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("CUSTOMER", { underline: true }); // Add heading
    //.moveDown(0.5); // Add space below the heading

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`CLIENT NAME: ${name?.toUpperCase() || "N/A"}`)
      .moveDown(0.1)
      .text(`CLIENT ID: ${client?.clientId || "N/A"}`) // Client ID
      .moveDown(0.1)
      .text(`TOTAL PAX: ${numberOfPersons || "N/A"}`)
      .moveDown(1);

    // Tour Section
    doc.fontSize(12).font("Helvetica-Bold").text("TOUR", { underline: true }); // Add heading
    //.moveDown(0.5); // Add space below the heading

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`TOUR DATE: ${formattedDate || "N/A"}`)
      .moveDown(0.1)
      .text(`ARTICLE NO: ${articleNumber || "N/A"}`)
      .moveDown(0.1)
      .text(`PRICE PER HEAD: ${mrp ? `${mrp}` : "N/A"}`)
      .moveDown(0.1)
      .text(`TOTAL COST: ${totalCost || "N/A"}`)
      .moveDown(1); // Add space after Tour section

    const executiveDetails = await Executive.findById(executiveId);
    if (executiveDetails) {
      doc
        .moveDown(0.3) // Add space before executive details
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("EXECUTIVE:", { underline: true, align: "left" });

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`EXECUTIVE NAME: ${executiveDetails.name.toUpperCase()}`, {
          align: "left",
        })
        .text(`EXECUTIVE PHONE: ${executiveDetails.mobileNumber}`, {
          align: "left",
        })
        
    }
    // Add Bank Details Section
    if (companyBankDetails.length) {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("BANK DETAILS", { align: "center", underline: true })
        .moveDown(0.5);

      for (const [index, bank] of companyBankDetails.entries()) {
        // Center the bank name
        doc
          .fontSize(10)
          .font("Helvetica-Bold")
          .text(`BANK ${index + 1}: ${bank.bankName.toUpperCase()}`, {
            align: "center",
          })
          .moveDown(0.2);

        // Center the bank details
        doc
          .font("Helvetica")
          .text(`Branch: ${bank.bankBranch}`, { align: "center" })
          .moveDown(0.1)
          .text(`IFSC Code: ${bank.bankIfscCode}`, { align: "center" })
          .moveDown(0.1)
          .text(`Account Number: ${bank.bankAccountNumber}`, {
            align: "center",
          })
          .moveDown(0.3);

        // Add QR Code Image if available and center it
        if (bank.bankQrCode) {
          try {
            const qrCodeBuffer = await fetchImageBuffer(bank.bankQrCode);

            // Center QR Code below the bank details
            const pageWidth = doc.page.width;
            const qrCodeWidth = 80; // QR code width
            const xPos = (pageWidth - qrCodeWidth) / 2; // Center horizontally

            doc
              .image(qrCodeBuffer, xPos, doc.y, {
                width: qrCodeWidth, // Adjust QR code size
              })
              .moveDown(0.9);
          } catch (error) {
            console.error(
              `Error loading QR Code for Bank ${index + 1}:`,
              error.message
            );
          }
        }

        doc.moveDown(12); // Space between banks
      }
    }
            // Add Payment Policy Section
doc
.fontSize(12)
.font("Helvetica-Bold")
.text("PAYMENT POLICY", { underline: true })
.moveDown(0.5);

// Payment policy array
const paymentPolicy = [
". A minimum payment is required for booking a tour - Non refundable(The minimum payment will vary depending on the tour).",
". 21-35 Days before date of departure : 50% of Cost .",
". 20 Days before date of departure : 100% of Total cost.",
];

// Cancellation and refund policy array
const cancellationPolicy = [
". 60 Days & Prior to Arrival - 25% of the Tour/Service Cost.",
". 59 Days to 30 Days Prior To Arrival - 50% of the Tour/Service Cost.",
". 29 Days to 15 Days Prior To Arrival - 75% of the Tour/Service Cost.",
". 14 Days and less Prior To Arrival – No refund.",
". Transportation and accommodation are as per itinerary only; if you have to change any of them, we will not be responsible for any kind of refund.",
". There will be no refund for add-ons.",
];

// Loop through payment policy and display each one
paymentPolicy.forEach((policy) => {
doc.fontSize(8).text(policy, { align: "left" }).moveDown(0.2);
});

// Add Cancellation and Refund Policy Section
doc
.fontSize(12)
.font("Helvetica-Bold")
.text("CANCELLATION AND REFUND POLICY", { underline: true })
.moveDown(0.5);

cancellationPolicy.forEach((policy) => {
doc.fontSize(8).text(policy, { align: "left" }).moveDown(0.2);
});


    // Add Terms and Conditions Section Below Customer and Tour Section
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("TERMS AND CONDITIONS", { underline: true })
      .moveDown(0.5);

    // Terms array
    const terms = [
      "1. If you're not able to reach out the destination on time. That is not our responsibility.",
      "2. For international hotels, the standard check-in time is 2:30 PM, and check-out is at 12:30 PM. For domestic hotels, check-in begins at 12:30 PM, with check-out scheduled for 10:00 AM.",
      "3. The booking stands liable to be cancelled if 100% payment is not received less than 20 days before date of departure. If the trip is cancelled due to this reason advance will not be refundable. If you are not pay the amount that in mentioned in payment policy then tour will be cancelled.",
      "4. There is no refund option in case you cancel the tour yourself.",
      "5. There is no refund available for group or scheduled tours.",
      "6. All activities which are not mentioned in the above itinerary such as visiting additional spots or involving in paid activities, if arranging separate cab etc. is not included in this.",
      "7. In case of using additional transport will be chargeable.",
      "8. All transport on the tour will be grouped together. Anyone who deviates from it will be excluded from this package.",
      "9. The company has the right for expelling persons who disagree with passengers or misrepresent the company during the trip.",
      "10. The company does not allow passengers to give tips to the driver for going additional spots.",
      "11. In case of cancellation due to any reason such as Covid, strike, problems on the part of railways, malfunctions, natural calamities etc., package amount will not be refunded.",
      "12. The Company will not be liable for any confirmation of train tickets, flight tickets, other transportation or any other related items not included in the package.",
      "13. In Case of Events And Circumstances Beyond Our Control, We Reserve The Right To Change All Or Parts Of The Contents Of The Itinerary For Safety And Well Being Of Our Esteemed Passengers.",
      "14. Bathroom Facility | Indian or European.",
      "15. In season rooms will not be the same as per itinerary but category will be the same (Budget economy).",
      "16. Charge will be the same from the age of 5 years.",
      "17. We are not providing tourist guide, if you are taking their service in your own cost we will not be responsible for the same.",
      "18. You Should reach to departing place on time, also you should keep the time management or you will not be able to cover all the place.",
      "19. If the climate condition affects the sightseeing that mentioned in itinerary, then we won’t provide you the additional spots apart from the itinerary.",
      "20. Transportation timing 8 am to 6 pm, if use vehicle after that then cost will be extra.",
      "21. Will visit places as per itinerary only, if you visit other than this then cost will be extra.",
      "22. If any customers misbehave with our staffs improperly then we will cancel his tour immediately and after that he can't continue with this tour.",
      "23. If the trip is not fully booked or cancelled due to any special circumstances, we will postpone the trip to another day. Otherwise, if the journey is to be done on the pre-arranged day, the customers will have to bear the extra money themselves.",
      "24. If you have any problems with the tour, please notify us as soon as possible so that we can resolve the problem. If you raise the issue after the tour, we will not be able to help you.",
      "25. Our company does not provide specific seats on the Volvo bus, if you need a seat particularly, please let the executive know during the confirmation of your reservation. (requires additional payment).",
      "26. If there are any changes to your tour, such as a date modification or postponement, you must notify us and obtain confirmation from our official email ID trippensholidays@gmail.com to your personal or official email. We will not acknowledge any proof of changes from the client unless confirmed through this official channel.",
    ];

    // Loop through terms and display each one
    terms.forEach((term) => {
      doc.fontSize(8).text(term, { align: "left" }).moveDown(0.2);
    });

    // Add company name with underline in the center
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(companyName, { underline: true, align: "center" });

    // Add spacing after the company name
    // doc.moveDown(0.5);

    // Add company details explicitly and center-align them
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Address: ${companyDistrict}, ${companyState}`, { align: "center" }) // Updated line for address
      .text(`Pincode: ${companyPincode}`, { align: "center" })
      .text(`Contact No: ${companyMobile}`, { align: "center" })
      .text(`Email: ${companyEmail}`, { align: "center" });

    // Finalize the PDF and end the stream
    doc.end();
  }catch (error) {
    console.error("Error in downloadReferralItinerary:", error);
    res
      .status(500)
      .json({ message: "An error occurred while generating the PDF." });
  }
}


export const downloadSpecialTrackSheet = async (req, res) => {
  try {
    const { clientId, specialTripId, date } = req.body;

    if (!clientId || !specialTripId || !date) {
      return res.status(400).json({ message: "Missing required parameters" });
    }
    // Convert the string date to a Date object
    const formattedStartDate = format(new Date(date), 'dd/MM/yyyy');

    // Format to dd/mm/yyyy
    // const formattedStartDate = `${startDate
    //   .getDate()
    //   .toString()
    //   .padStart(2, "0")}/${(startDate.getMonth() + 1)
    //   .toString()
    //   .padStart(2, "0")}/${startDate.getFullYear()}`;

    // Find client details from the database
    const client = await Client.findOne({ _id: clientId });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const { name, numberOfPersons, executiveId, companyId } = client;
    // Find Executive details from the database
    const executive = await Executive.findOne({ _id: executiveId });

    if (!executive) {
      return res.status(404).json({ message: "Executive not found" });
    }

    const { name: executiveName, mobileNumber: executiveNumber } = executive;

    // Find FixedTour details from the database
    const specialTour = await SpecialTour.findOne({ _id: specialTripId });

    if (!specialTour) {
      return res.status(404).json({ message: "Tour not found" });
    }

    const { tourName, articleNumber, category, day } = specialTour;
    const mrpKey = numberOfPersons.toString(); // Convert to string since schema keys are string numbers
    const mrp = specialTour[mrpKey];

    const totalAmount = mrp * numberOfPersons;

    // **🔹 Find Company details using companyId**
    const company = await Agency.findOne({ _id: companyId });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const { logo: companyLogo } = company; // Extract company logo URL

    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, "0")}/${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${today.getFullYear()}`;
      // Get the max trackSheetNumber for the company
      const maxClient = await Client.findOne({ companyId })
      .sort({ trackSheetNumber: -1 })
      .select("trackSheetNumber");
  
    const maxTrackSheetNumber = maxClient ? maxClient.trackSheetNumber : 0;
  
    // Update trackSheetNumber for the client if it doesn't exist
    if (!client.trackSheetNumber) {
      client.trackSheetNumber = maxTrackSheetNumber + 1 || 1;
      await client.save();
    }

    // Create a new PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=custom_tracksheet.pdf`
    );

    // Pipe the PDF into the response
    doc.pipe(res);

    // Draw a border around the page
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    doc
      .rect(20, 20, pageWidth - 40, pageHeight - 40)
      .strokeColor("#000")
      .lineWidth(2)
      .stroke();

    // **🔹 Add Company Logo (Top-Left)**
    if (companyLogo) {
      try {
        const imageBuffer = await fetchImageBuffer(companyLogo);
        doc.image(imageBuffer, 30, 30, { width: 80 });
      } catch (error) {
        console.error("Error loading logo:", error.message);
      }
    }

    // **🔹 Add Main Heading "TRACK SHEET" (Centered)**
    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .fillColor("#000")
      .text("TRACK SHEET", {
        align: "center",
        baseline: "middle",
        underline: "true",
      });
    // **🔹 Add "GROUP TOUR" Below "TRACK SHEET"**
    doc
      .font("Helvetica-Bold")
      .fontSize(16) // Slightly smaller than "TRACK SHEET"
      .fillColor("#FF0000")
      .text("FIXED TOUR", { align: "center" });
    // **🔹 Add "NO:" on the Top-Right**
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("#000")
      .text(`NO: ${client.trackSheetNumber}`, pageWidth - 100, 40, { align: "right" });
    doc.moveDown(2); // Add space before sections

    // **🔹 Add Section Headings on the Same Line**
    const sectionY = doc.y + 20; // Adjust Y position after headings
    doc.font("Helvetica-Bold").fontSize(14);

    // Positioning for alignment
    const customerX = 30;
    const executiveX = pageWidth / 2 - 50;
    const salesManagerX = pageWidth - 145;

    // **🔹 Section Headings**
    doc.text("Customer", customerX, sectionY, { underline: true });
    doc.text("Executive", executiveX, sectionY, { underline: true });
    doc.text("Manager", salesManagerX, sectionY, { underline: true });

    doc.moveDown(1); // Add space for fields

    // **🔹 Add Fields Below Each Section**
    doc.font("Helvetica").fontSize(12);

    const lineSpacing = 18; // Consistent spacing

    // **Customer Fields (Left)**
    let fieldY = sectionY + 20;
    doc.text("Name:", customerX, fieldY);
    doc.text(name, customerX + 40, fieldY);

    doc.text("ID      :", customerX, (fieldY += lineSpacing));
    doc.text(client.clientId, customerX + 40, fieldY);

    doc.text("Pax    :", customerX, (fieldY += lineSpacing));
    doc.text(numberOfPersons.toString(), customerX + 40, fieldY);

    // **Executive Fields (Centered)**
    fieldY = sectionY + 20;
    doc.text("Name           :", executiveX, fieldY);
    doc.text(executiveName, executiveX + 75, fieldY);

    doc.text("No                :", executiveX, (fieldY += lineSpacing));
    doc.text(executiveNumber, executiveX + 75, fieldY);

    doc.text("Date Confirm:", executiveX, (fieldY += lineSpacing));
    doc.text(formattedDate, executiveX + 75, fieldY);

    // **Sales Manager Fields (Right)**
    fieldY = sectionY + 20;
    doc.text("Name:", salesManagerX, fieldY);
    doc.text("Sign  :", salesManagerX, (fieldY += lineSpacing));
    doc.text("Date  :", salesManagerX, (fieldY += lineSpacing));
    doc.moveDown(1);

    // **🔹 Separation Line**
    doc
      .moveTo(30, doc.y)
      .lineTo(pageWidth - 30, doc.y)
      .lineWidth(1)
      .stroke();

    doc.moveDown(1);
    const sectionYY = doc.y + 20;

    // **🔹 Second Section (Tour, Date, Payment)**
    doc.font("Helvetica-Bold").fontSize(14);

    const tourX = 30;
    const dateX = pageWidth / 2 - 50;
    const paymentX = pageWidth - 145;

    doc.text("Tour", tourX, sectionYY, { underline: true });
    doc.text("Date", dateX, sectionYY, { underline: true });
    doc.text("Payment", paymentX, sectionYY, { underline: true });

    doc.moveDown(1);
    doc.font("Helvetica").fontSize(12);

    fieldY = sectionYY + 20;
    doc.text("Name      :", tourX, fieldY);
    doc.text(tourName, tourX + 60, fieldY);

    doc.text("ArtNo      :", tourX, (fieldY += lineSpacing));
    doc.text(articleNumber, tourX + 60, fieldY);

    doc.text("Category :", tourX, (fieldY += lineSpacing));
    doc.text(category.value, tourX + 60, fieldY);

    // **Date Fields**
    fieldY = sectionYY + 20; // Align with Tour fields
    doc.text("Start :", dateX, fieldY);
    doc.text(formattedStartDate, dateX + 35, fieldY);

    doc.text("End  :", dateX, (fieldY += lineSpacing));
    // doc.text(endDate, dateX + 35, fieldY);

    doc.text("Days :", dateX, (fieldY += lineSpacing));
    doc.text(day.toString(), dateX + 35, fieldY);

    // **Payment Fields**
    fieldY = sectionYY + 20; // Align with Date fields
    doc.text("PP   :", paymentX, fieldY);
    doc.text(mrp.toString(), paymentX + 30, fieldY);

    doc.text("Total:", paymentX, (fieldY += lineSpacing));
    doc.text(totalAmount.toString(), paymentX + 30, fieldY);

    doc.text("Advance:", paymentX, (fieldY += lineSpacing));
    // doc.text(advanceAmount.toString(), paymentX + 70, fieldY);
    doc.moveDown(1);

    // **🔹 Separation Line**
    doc
      .moveTo(30, doc.y)
      .lineTo(pageWidth - 30, doc.y)
      .lineWidth(1)
      .stroke();
    // **🔹 Draw Vertical Line in the Center**
    const centerX = pageWidth / 2;
    const startY = doc.y; // Start from the current position
    const endY = pageHeight - 20; // End at bottom margin

    doc.moveTo(centerX, startY).lineTo(centerX, endY).lineWidth(1).stroke();
    // Set starting position for right section content
    let rightSectionX = centerX + 30; // Start a bit to the right of the center line
    let rightSectionY = startY + 20; // Space after the vertical line start

    doc.font("Helvetica-Bold").fontSize(12);

    // **🔹 Pickup Spot**
    doc.text("Pickup Spot:", rightSectionX, rightSectionY, { underline: true });
    rightSectionY += 40; // Move down
    doc
      .moveTo(rightSectionX, rightSectionY)
      .lineTo(pageWidth - 30, rightSectionY)
      .stroke();
    rightSectionY += 30; // Space after line

    // **🔹 Time (for Pickup)**
    doc.text("Time:", rightSectionX, rightSectionY, { underline: true });
    rightSectionY += 40; // Move down
    doc
      .moveTo(rightSectionX, rightSectionY)
      .lineTo(pageWidth - 30, rightSectionY)
      .stroke();
    rightSectionY += 30; // Space after line

    // **🔹 Dropoff Spot**
    doc.text("Dropoff Spot:", rightSectionX, rightSectionY, {
      underline: true,
    });
    rightSectionY += 40; // Move down
    doc
      .moveTo(rightSectionX, rightSectionY)
      .lineTo(pageWidth - 30, rightSectionY)
      .stroke();
    rightSectionY += 30; // Space after line

    // **🔹 Time (for Dropoff)**
    doc.text("Time:", rightSectionX, rightSectionY, { underline: true });
    rightSectionY += 40; // Move down
    doc
      .moveTo(rightSectionX, rightSectionY)
      .lineTo(pageWidth - 30, rightSectionY)
      .stroke();
    rightSectionY += 30; // Space after line

    // **🔹 Customer Extra Needs**
    doc.text("Customer Extra Needs:", rightSectionX, rightSectionY, {
      underline: true,
    });
    rightSectionY += 40; // Move down
    doc
      .moveTo(rightSectionX, rightSectionY)
      .lineTo(pageWidth - 30, rightSectionY)
      .stroke();
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Failed to generate track sheet" });
  }
};