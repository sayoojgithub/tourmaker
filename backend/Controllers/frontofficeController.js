import FrontOffice from "../models/FrontOffice.js";
import Client from "../models/Client.js";
import mongoose from "mongoose";
import Executive from "../models/Executive.js";
import Agency from "../models/Agency.js";
import PointSchema from "../models/PointSchema.js";
import ClientByEntry from "../models/ClientByEntry.js";
import PDFDocument from "pdfkit";
// ______________Used in profile of Frontoffice_____________
export const getfrontofficeDetails = async (req, res) => {
  const { frontofficeId } = req.params;

  try {
    const frontoffice = await FrontOffice.findById(frontofficeId);

    if (!frontoffice) {
      return res.status(404).json({ message: "not found" });
    }

    res.status(200).json(frontoffice);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// export const getAllClientsToCreate = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 5,
//       search = "",
//       companyId, // required to scope by company
//     } = req.query;

//     if (!companyId) {
//       return res.status(400).json({ message: "companyId is required" });
//     }
//     const pageNum = Math.max(parseInt(page, 10) || 1, 1);
//     const pageSize = Math.max(parseInt(limit, 10) || 5, 1);

//     const filters = {
//       companyId: new mongoose.Types.ObjectId(companyId),
//       frontOfficeCreatedStatus: false,
//     };

//     // search by name or mobileNumber
//     if (search && search.trim()) {
//       const s = search.trim();
//       // if digits, also try exact/startsWith match on mobile
//       const isDigits = /^\d+$/.test(s);
//       filters.$or = [
//         { name: { $regex: s, $options: "i" } },
//         ...(isDigits ? [{ mobileNumber: { $regex: `^${s}`, $options: "i" } }] : [
//           { mobileNumber: { $regex: s, $options: "i" } },
//         ]),
//       ];
//     }

//     const [clients, totalClients] = await Promise.all([
//       ClientByEntry.find(filters)
//         .sort({ createdAtByEntry: -1 })
//         .skip((pageNum - 1) * pageSize)
//         .limit(pageSize)
//         .lean(),
//       ClientByEntry.countDocuments(filters),
//     ]);

//     const totalPages = Math.max(Math.ceil(totalClients / pageSize), 1);

//     return res.status(200).json({
//       clients,
//       totalClients,
//       totalPages,
//       page: pageNum,
//       limit: pageSize,
//     });
//   } catch (err) {
//     console.error("getAllClientsToCreate error:", err);
//     return res
//       .status(500)
//       .json({ message: err.message || "Internal Server Error" });
//   }
// };
export const getAllClientsToCreate = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 5,
      search = "",
      companyId,
    } = req.query;

    if (!companyId) {
      return res.status(400).json({ message: "companyId is required" });
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.max(parseInt(limit, 10) || 5, 1);
    const skip = (pageNum - 1) * pageSize;

    const match = {
      companyId: new mongoose.Types.ObjectId(companyId),
      frontOfficeCreatedStatus: false,
    };

    if (search && search.trim()) {
      const s = search.trim();
      const isDigits = /^\d+$/.test(s);
      match.$or = [
        { name: { $regex: s, $options: "i" } },
        ...(isDigits
          ? [{ mobileNumber: { $regex: `^${s}`, $options: "i" } }]
          : [{ mobileNumber: { $regex: s, $options: "i" } }]),
      ];
    }

    const [clients, totalClients] = await Promise.all([
      ClientByEntry.aggregate([
        { $match: match },
        {
          $addFields: {
            urgentFlag: {
              $cond: [{ $eq: ["$clientType.value", "Urgent Contact"] }, 0, 1],
            },
          },
        },
        { $sort: { urgentFlag: 1, createdAtByEntry: -1 } },
        { $skip: skip },
        { $limit: pageSize },
        { $project: { urgentFlag: 0 } },
      ]).exec(),
      ClientByEntry.countDocuments(match),
    ]);

    const totalPages = Math.max(Math.ceil(totalClients / pageSize), 1);

    return res.status(200).json({
      clients,
      totalClients,
      totalPages,
      page: pageNum,
      limit: pageSize,
    });
  } catch (err) {
    console.error("getAllClientsToCreate error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Internal Server Error" });
  }
};
// ______________client registration by front officer______________//
export const registerClient = async (req, res) => {
  try {
    const { mobileNumber, tourName, primaryTourName, startDate, companyId,clientContactOption } =
      req.body;

    // Check for existing client with the same mobileNumber, tourName, startDate, and companyId
    const existingClient = await Client.findOne({
      mobileNumber: mobileNumber,
      "primaryTourName._id": primaryTourName._id,
      //"tourName.value": { $in: tourName.map((tour) => tour.value) },
      startDate: startDate,
      companyId: companyId,
    });

    if (existingClient) {
      return res
        .status(400)
        .json({ message: "Client with the same details already exists" });
    }

    // Check for existing clientId by mobileNumber and companyId
    let clientId;
    const existingClientWithId = await Client.findOne({
      mobileNumber: mobileNumber,
      companyId: companyId,
    });

    if (existingClientWithId) {
      // If client exists with the same mobile number and company, return the existing clientId
      clientId = existingClientWithId.clientId;
    } else {
      // Find the company and create a prefix from the company's name
      const company = await Agency.findById(companyId);
      if (!company) {
        return res.status(400).json({ message: "Company not found" });
      }
      const agencyNamePrefix = company.name.substring(0, 3).toUpperCase();

      // Find all clients within the company with matching prefix
      const clientsInCompany = await Client.find({
        clientId: { $regex: `^${agencyNamePrefix}\\d+` },
        companyId: companyId,
      });

      if (clientsInCompany.length > 0) {
        // Extract the numeric part from each clientId and find the maximum
        const maxClientIdNum = Math.max(
          ...clientsInCompany.map((client) => {
            const numMatch = client.clientId.match(/(\d+)$/);
            return numMatch ? parseInt(numMatch[0], 10) : 0;
          })
        );

        // Generate new clientId by incrementing the highest existing number
        clientId = `${agencyNamePrefix}${maxClientIdNum + 1}`;
      } else {
        clientId = `${agencyNamePrefix}1`; // Start with "PREFIX1" if no clients exist
      }
    }
    // Find an executive for the client based on primaryTourName and minimum count
    // const executive = await Executive.findOne({
    //   companyId: companyId,
    //   tourName: { $elemMatch: { _id: primaryTourName._id } },
    // })
    //   .sort({ count: 1, createdAt: 1 }) // Sort by count in ascending order to get the executive with the least count
    //   .exec();

    // if (!executive) {
    //   return res
    //     .status(400)
    //     .json({ message: "No suitable executive found for this tour" });
    // }
       const contactValue =
      clientContactOption?.value;

    let executive = null;

    if (typeof contactValue === "string" && contactValue.toLowerCase() === "whatsapp") {
      executive = await Executive.findOne({
        companyId: companyId,
        name: "PRAJEESH K R",
      }).exec();
      // If not found, we'll proceed to the original selection logic below.
    }

    // Original executive selection (kept exactly the same) — only used if
    // (a) not a WhatsApp contact, or (b) WhatsApp target exec wasn't found.
    if (!executive) {
      executive = await Executive.findOne({
        companyId: companyId,
        tourName: { $elemMatch: { _id: primaryTourName._id } },
      })
        .sort({ count: 1, createdAt: 1 }) // least count, then oldest
        .exec();
    }

    if (!executive) {
      return res
        .status(400)
        .json({ message: "No suitable executive found for this tour" });
    }

    // Create a new client with the generated or existing clientId
    const newClient = new Client({
      ...req.body,
      clientId: clientId, // Use the clientId we found or generated
      executiveId: executive._id,
      status: [], // Initialize status as an empty array
      scheduleDate: [], // Initialize scheduleDate as an empty array
      response: [], // Initialize response as an empty array
    });

    await newClient.save();
    // Increment the executive's count field after assigning the client
    await Executive.findByIdAndUpdate(executive._id, { $inc: { count: 1 } });
    const clientByEntryId =
      req.body.clientByEntryId || req.body.clientByentry || req.body.clientByEntry;

    if (clientByEntryId && mongoose.Types.ObjectId.isValid(clientByEntryId)) {
      // fetch the source entry's createdAtByEntry AND mark FO created = true
      const [entryDoc] = await Promise.all([
        ClientByEntry.findOne({ _id: clientByEntryId, companyId })
          .select("createdAtByEntry")
          .lean(),
        ClientByEntry.findOneAndUpdate(
          { _id: clientByEntryId, companyId },
          { $set: { frontOfficeCreatedStatus: true } },
          { new: true }
        ),
      ]);

      // 🔴 NEW: persist linkage + timestamp on the Client doc
      if (entryDoc?.createdAtByEntry) {
        newClient.clientByEntryId = clientByEntryId;
        newClient.createdAtByEntry = entryDoc.createdAtByEntry;
      } else {
        // still save the linkage even if timestamp was not found
        newClient.clientByEntryId = clientByEntryId;
      }

      // save again with the new fields
      await newClient.save();
    }

    res
      .status(201)
      .json({ message: "Client registered successfully", client: newClient });
  } catch (error) {
    console.error("Error registering client:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const searchClientByMobileAndCompany = async (req, res) => {
  try {
    // const { mobileNumber, companyId } = req.body;
    

    // // Find all client documents matching mobile number, company ID, and enquiryStatus true
    // const clients = await Client.find({
    //   mobileNumber,
    //   companyId,
    // });
     const { query, companyId } = req.body;

    if (!query || !companyId) {
      return res.status(400).json({ message: "Query and Company ID are required." });
    }

    let searchCondition = { companyId };

    // If query is all digits => mobileNumber, else clientId
    if (/^\d+$/.test(query)) {
      searchCondition.mobileNumber = query;
    } else {
      searchCondition.clientId = query;
    }

    const clients = await Client.find(searchCondition);

    // If no clients are found, return 404
    if (clients.length === 0) {
      return res.status(404).json({ message: "No clients found" });
    }

    // Initialize an array to hold the fetched destinations from all clients
    let fetchedDestinations = [];

    // Loop through all the clients and extract their destinations and start date
    clients.forEach((client) => {
      // Extract day, month, and year from the start date
      const startDate = new Date(client.startDate);
      const day = String(startDate.getDate()).padStart(2, "0"); // Pad with zero if day < 10
      const month = String(startDate.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed, so add 1
      const year = startDate.getFullYear();

      // Format the start date as "DD-MM-YYYY"
      const formattedStartDate = `${day}-${month}-${year}`;

      if (client.tourName && client.tourName.length > 0) {
        client.tourName.forEach((tour) => {
          fetchedDestinations.push({
            documentId: client._id,
            primaryTourName: client.primaryTourName.label, // Primary tour name label
            destination: tour.label, // Destination from tour's label
            startDate: formattedStartDate, // Formatted start date
            confirmedStatus: client.confirmedStatus, // Add confirmedStatus
          });
        });
      } else {
        // If no tourName, still add primaryTourName
        fetchedDestinations.push({
          documentId: client._id,
          primaryTourName: client.primaryTourName.label,
          destination: null, // No additional destination
          startDate: formattedStartDate,
          confirmedStatus: client.confirmedStatus, // Add confirmedStatus
        });
      }
    });

    // Log fetched destinations (optional for debugging)
   

    // Return the formatted destinations array
    return res.status(200).json(fetchedDestinations);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const fetchClientById = async (req, res) => {
  const { id } = req.params; // Extract _id from route parameter

  try {
    // Find the client document by ID
    const clientData = await Client.findById(id);

    // Check if the client exists
    if (!clientData) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Respond with client data
    res.status(200).json(clientData);
  } catch (error) {
    console.error("Error fetching client:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching client data" });
  }
};

export const updateClient = async (req, res) => {
  const { clientId } = req.params; // Extract client ID from URL
  const { note, ...updatedClientData } = req.body; // Separate note from the rest of the update data
  updatedClientData.executiveVisitedStatus = false;
  
  try {
    // Find the client by ID and update with new data, push new note to notes array
    const updatedClient = await Client.findByIdAndUpdate(
      clientId,
      {
        ...updatedClientData,
        ...(note && { $push: { notes: note } }), // Only push if note is provided
      },
      {
        new: true, // Return the updated document
        runValidators: true, // Ensure the updated data is validated
      }
    );

    if (!updatedClient) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json({
      message: "Client updated successfully",
      data: updatedClient,
    });
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({ message: "Server error while updating client" });
  }
};
const IST_TZ = "Asia/Kolkata";

const fmtDate = new Intl.DateTimeFormat("en-GB", {
  timeZone: IST_TZ,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const fmtTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: IST_TZ,
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

const fmtDateTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: IST_TZ,
  dateStyle: "short",
  timeStyle: "medium",
});

export const downloadClientsData = async (req, res) => {
  const { startDate, endDate, userId,taken } = req.body;

  try {
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Start date and end date are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const frontOfficer = await FrontOffice.findById(userId);
    if (!frontOfficer) {
      return res.status(404).json({ message: "Front officer not found" });
    }

    const clients = await Client.find({
      frontOfficerId: new mongoose.Types.ObjectId(userId),
      createdAt: { $gte: start, $lte: end },
      createdAtByEntry: { $gte: start, $lte: end}
    });

    if (!clients.length) {
      return res.status(404).json({ message: "No clients found" });
    }
    if (clients.length > taken) {
      return res.status(400).json({ message: "Registered clients more than the taken " });
    }
    const percentage = Math.round((clients.length / taken) * 100);
    console.log(percentage)
    const pointsDoc = await PointSchema.findOne({
      companyId: frontOfficer.companyId,
      role: "Front Office"
    });

    if (!pointsDoc) {
      return res.status(404).json({ message: "Points settings not found for company" });
    }
    let awardedPoint = 0;
    const pointsMap = pointsDoc.points; // Map field

    // Find the point corresponding to the percentage
    for (const [range, point] of pointsMap.entries()) {
      const [min, max] = range.split("-").map(Number);
      if (percentage >= min && percentage <= max) {
        awardedPoint = point;
        break;
      }
    }
    console.log(awardedPoint)
    console.log(start)
    const creationDates = new Set(
      frontOfficer.creationPoints.map(point => new Date(point.date).toISOString().split("T")[0])
    );
    
    // Now, simply check if today's date exists
    const todayDate = start.toISOString().split("T")[0];
    
    if (creationDates.has(todayDate)) {
      return res.status(400).json({ message: "Download allowed once in a day" });
    }

    // Add the new points to the creationPoints array
    frontOfficer.creationPoints.push({
      date: start,
      percentage,
      awardedPoint,
    });

    // Save the front officer document with updated points
    await frontOfficer.save();
/////////
    const currentDate = new Date();
    const downloadTimestamp = currentDate.toLocaleString();
    const formattedStartDate = start.toLocaleDateString("en-GB");
    const formattedEndDate = end.toLocaleDateString("en-GB");
    currentDate.setUTCHours(0, 0, 0, 0); // Important: set to 00:00 UTC for clean date matching

// 1. Find creationPoint for today
const creationPointToday = frontOfficer.creationPoints.find(point => {
  const pointDate = new Date(point.date);
  pointDate.setUTCHours(0, 0, 0, 0);
  return pointDate.getTime() === currentDate.getTime();
});

const creationAwardedPoint = creationPointToday ? creationPointToday.awardedPoint : 0;

// 2. Sum salesPoints for today
const totalSalesPointsToday = frontOfficer.salesPoints
  .filter(point => {
    const pointDate = new Date(point.date);
    pointDate.setUTCHours(0, 0, 0, 0);
    return pointDate.getTime() === currentDate.getTime();
  })
  .reduce((sum, point) => sum + point.awardedPoint, 0);

// 3. Calculate total points
const totalPointsToday = creationAwardedPoint + totalSalesPointsToday;

console.log("Creation Point Awarded:", creationAwardedPoint);
console.log("Total Sales Points:", totalSalesPointsToday);
console.log("Total Points Today:", totalPointsToday);



    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=clients.pdf");
    doc.pipe(res);

    const drawPageBorder = () => {
      doc
        .rect(25, 25, doc.page.width - 50, doc.page.height - 50)
        .strokeColor("black")
        .lineWidth(2)
        .stroke();
    };

    drawPageBorder();

    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text(`FRONT OFFICE: ${frontOfficer.name.toUpperCase()}`, { align: "center" });
    doc.moveDown(0.3);
doc
  .fontSize(13)
  .font("Helvetica")
  .fillColor("black")
  .text(`Company: ${frontOfficer.companyName}`, { align: "center" });
   // Move down a little
doc.moveDown(0.5);

// Start Date in Center below Front Officer Name
doc
  .fontSize(12)
  .font("Helvetica")
  .text(`Date: ${formattedStartDate} (Taken: ${taken})`, { align: "center" })
  .fillColor("red");
  doc.moveDown(0.5);

  // Start Date in Center below Front Officer Name
  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`Convertion Rate: ${percentage}%`, { align: "center" })
    .fillColor("red");
  doc.moveDown(1);

  // Setup page dimensions
  const pageWidth = doc.page.width;
  const margin = 50; // Adjust margin to fit more content
  const usableWidth = pageWidth - 2 * margin;
  
  // Set font styles
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor("black");
  
  // Capture fixed Y position
  const startY = doc.y;
  
  // LEFT: Creation Point
  doc.text(`Creation Point: ${creationAwardedPoint}`, margin, startY, {
    lineBreak: false, // IMPORTANT: Don't break the line automatically
  });
  
  // CENTER: Sales Points
  const salesText = `Sales Points: ${totalSalesPointsToday}`;
  const salesTextWidth = doc.widthOfString(salesText);
  doc.text(
    salesText,
    margin + usableWidth / 2 - salesTextWidth / 2,
    startY,
    {
      lineBreak: false,
    }
  );
  
  // RIGHT: Total Points
  const totalPointsText = `Total Points: ${totalPointsToday}`;
  const totalPointsTextWidth = doc.widthOfString(totalPointsText);
  doc.text(
    totalPointsText,
    pageWidth - margin - totalPointsTextWidth,
    startY,
    {
      lineBreak: false,
    }
  );
  
  // Manually move down after all three texts
  doc.moveDown(1);
  
  // Table Drawing Function
  const drawTableHeader = (doc, y) => {
    const headers = ["No", "ClientId", "Name", "Tour Name", "Created Date", "Time"];
    const colWidths = [30, 80, 120, 120, 100, 50]; // Adjust column width for the new "Created Time" column
    let x = 50;
  
    // Set Header Styles
    doc.fillColor("black").fontSize(10).font("Helvetica-Bold");
  
    // Draw Headers
    headers.forEach((header, index) => {
      doc.text(header, x + 5, y + 5, {
        width: colWidths[index],
        align: "left",
      });
      x += colWidths[index];
    });
  
    // Draw cell borders after headers
    x = 50;
    headers.forEach((header, index) => {
      doc.lineWidth(1).rect(x, y, colWidths[index], 17).stroke("black");
      x += colWidths[index];
    });
  };
  
  const drawTableRow = (doc, client, y, index) => {
    // const createdDate = new Date(client.createdAt).toLocaleDateString("en-GB");
    // const createdTime = new Date(client.createdAt).toLocaleTimeString("en-US", {
    //   hour: "2-digit",
    //   minute: "2-digit",
    //   hour12: true, // 12-hour format (AM/PM)
    // });
    const created = new Date(client.createdAt);
      const createdDate = fmtDate.format(created);
      const createdTime = fmtTime.format(created);
    // Truncate client name and tour name to 20 characters
    const truncatedName = client.name ? client.name.substring(0, 23) : "";
    const truncatedTourName = client.primaryTourName?.label
      ? client.primaryTourName.label.substring(0, 20)
      : "";
  
    const rowData = [
      index + 1,
      client.clientId || "",
      truncatedName,
      truncatedTourName,
      createdDate, // Date only
      createdTime, // Time only
    ];
  
    const colWidths = [30, 80, 120, 120, 100, 50]; // Adjust width for new "Created Time" column
    let x = 50;
  
    // Set Row Styles
    doc.font("Helvetica").fontSize(10).fillColor("black");
  
    // Draw Cells
    rowData.forEach((data, i) => {
      doc.text(data, x + 5, y + 3, {
        width: colWidths[i],
        align: "left",
      });
      doc.lineWidth(1).rect(x, y, colWidths[i], 13).stroke("black"); // Reduce height of each row
      x += colWidths[i];
    });
  };
  
  
  // Table content starts
  let y = doc.y + 14;
  const firstPageLimit = 42; // Max clients for the first page (increased to 40)
  const otherPagesLimit = 42; // Max clients for subsequent pages
  
  drawTableHeader(doc, y); // Draw the table header
  y += 20; // Move Y after header
  
  clients.forEach((client, index) => {
    const isFirstPage = index < firstPageLimit;
    const limit = isFirstPage ? firstPageLimit : otherPagesLimit;
    const isNewPage = isFirstPage
      ? index > 0 && index % firstPageLimit === 0
      : (index - firstPageLimit) % otherPagesLimit === 0;
  
    // Check if new page is needed
    if (isNewPage) {
      doc.addPage();
      drawPageBorder();
      y = 50; // Reset Y to top for new page
      drawTableHeader(doc, y); // Draw header on new page
      y += 25; // Adjust Y for table row
    }
  
    // Draw table rows
    drawTableRow(doc, client, y, index);
    y += 13; // Adjust row height to fit more rows
  });
  // Move down a little after table
doc.moveDown(1);

// Add Executive and Manager fields inline
doc
  .fontSize(12)
  .font("Helvetica")
  .fillColor("black")
  .text("Executive: __________________", margin, y+3, { continued: true }) // Executive field
  .text(" Manager: __________________", { continued: true }); // Manager field
  
  doc.end();
  
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while generating the PDF" });
  }
};

// export const getAllClients = async (req, res) => {
//   try {
//     const { frontOfficerId, mobileNumber, page = 1, limit = 4 } = req.query;

//     if (!frontOfficerId) {
//       return res.status(400).json({ message: "Front Officer ID is required" });
//     }

//     if (!mobileNumber) {
//       return res.status(400).json({ message: "Mobile Number is required" });
//     }

//     // Find the front officer and retrieve companyId
//     const frontOfficer = await FrontOffice.findById(frontOfficerId);
//     if (!frontOfficer) {
//       return res.status(404).json({ message: "Front Officer not found" });
//     }

//     const companyId = frontOfficer.companyId; // Get company ID from front officer


//     const skip = (page - 1) * limit;

//     // Match filter based on front officer and mobile number
//     const matchFilters = {
//       companyId: new mongoose.Types.ObjectId(companyId),
//       mobileNumber,
//     };

//     const clients = await Client.aggregate([
//       { $match: matchFilters },
//       {
//         $lookup: {
//           from: "executives", // Executives collection name
//           localField: "executiveId",
//           foreignField: "_id",
//           as: "executiveDetails",
//         },
//       },
//       {
//         $addFields: {
//           executiveName: { $arrayElemAt: ["$executiveDetails.name", 0] },
//           status: {
//             $switch: {
//               branches: [
//                 {
//                   case: {
//                     $and: [
//                       { $eq: ["$executiveVisitedStatus", false] },
//                       { $eq: ["$confirmedStatus", false] },
//                       { $eq: ["$bookedStatus", false] },
//                       { $eq: ["$ongoingStatus", false] },
//                       { $eq: ["$completedStatus", false] },
//                     ],
//                   },
//                   then: "New Client",
//                 },
//                 {
//                   case: {
//                     $and: [
//                       { $eq: ["$executiveVisitedStatus", true] },
//                       { $eq: ["$confirmedStatus", false] },
//                       { $eq: ["$bookedStatus", false] },
//                       { $eq: ["$ongoingStatus", false] },
//                       { $eq: ["$completedStatus", false] },
//                       { $lte: [{ $size: "$itinerary" }, 0] },
//                     ],
//                   },
//                   then: "Pending",
//                 },
//                 {
//                   case: {
//                     $and: [
//                       { $eq: ["$executiveVisitedStatus", true] },
//                       { $eq: ["$confirmedStatus", false] },
//                       { $eq: ["$bookedStatus", false] },
//                       { $eq: ["$ongoingStatus", false] },
//                       { $eq: ["$completedStatus", false] },
//                       { $gt: [{ $size: "$itinerary" }, 0] },
//                     ],
//                   },
//                   then: "Interested",
//                 },
//                 {
//                   case: {
//                     $and: [
//                       { $eq: ["$executiveVisitedStatus", true] },
//                       { $eq: ["$confirmedStatus", true] },
//                       { $eq: ["$bookedStatus", false] },
//                       { $eq: ["$ongoingStatus", false] },
//                       { $eq: ["$completedStatus", false] },
//                     ],
//                   },
//                   then: "Confirmed",
//                 },
//                 {
//                   case: {
//                     $and: [
//                       { $eq: ["$executiveVisitedStatus", true] },
//                       { $eq: ["$confirmedStatus", true] },
//                       { $eq: ["$bookedStatus", true] },
//                       { $eq: ["$ongoingStatus", false] },
//                       { $eq: ["$completedStatus", false] },
//                     ],
//                   },
//                   then: "Booked",
//                 },
//                 {
//                   case: {
//                     $and: [
//                       { $eq: ["$executiveVisitedStatus", true] },
//                       { $eq: ["$confirmedStatus", true] },
//                       { $eq: ["$bookedStatus", true] },
//                       { $eq: ["$ongoingStatus", true] },
//                       { $eq: ["$completedStatus", false] },
//                     ],
//                   },
//                   then: "Ongoing",
//                 },
//                 {
//                   case: {
//                     $and: [
//                       { $eq: ["$executiveVisitedStatus", true] },
//                       { $eq: ["$confirmedStatus", true] },
//                       { $eq: ["$bookedStatus", true] },
//                       { $eq: ["$ongoingStatus", true] },
//                       { $eq: ["$completedStatus", true] },
//                     ],
//                   },
//                   then: "Completed",
//                 },
//               ],
//               default: "Unknown",
//             },
//           },
//         },
//       },
//       { $skip: skip },
//       { $limit: parseInt(limit, 10) },
//       {
//         $project: {
//           clientId: 1,
//           mobileNumber: 1,
//           executiveName: 1,
//           startDate: 1,
//           primaryTourName: 1,
//           status: 1,
//         },
//       },
//     ]);

//     const totalClients = await Client.countDocuments(matchFilters);
//     const totalPages = Math.ceil(totalClients / limit);

//     res.status(200).json({ clients, totalPages });
//   } catch (error) {
//     console.error("Error fetching clients:", error);
//     res.status(500).json({ message: "Failed to fetch clients" });
//   }
// };

export const getAllClients = async (req, res) => {
  try {
    const { frontOfficerId, mobileNumber, clientId, page = 1, limit = 4 } = req.query;

    if (!frontOfficerId) {
      return res.status(400).json({ message: "Front Officer ID is required" });
    }

    if (!mobileNumber && !clientId) {
      return res.status(400).json({ message: "Please provide either Mobile Number or Client ID." });
    }

    // Get the companyId using the front officer ID
    const frontOfficer = await FrontOffice.findById(frontOfficerId);
    if (!frontOfficer) {
      return res.status(404).json({ message: "Front Officer not found" });
    }

    const companyId = frontOfficer.companyId;
    const skip = (page - 1) * limit;

    // Build match filters with OR condition
    const matchFilters = {
      companyId: new mongoose.Types.ObjectId(companyId),
      $or: [],
    };

    if (mobileNumber) {
      matchFilters.$or.push({ mobileNumber });
    }

    if (clientId) {
  matchFilters.$or.push({ clientId: clientId.toUpperCase() });
}
console.log(matchFilters)
    const clients = await Client.aggregate([
      { $match: matchFilters },
      {
        $lookup: {
          from: "executives",
          localField: "executiveId",
          foreignField: "_id",
          as: "executiveDetails",
        },
      },
      {
        $addFields: {
          executiveName: { $arrayElemAt: ["$executiveDetails.name", 0] },
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
                      { $lte: [{ $size: "$itinerary" }, 0] },
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
                      { $gt: [{ $size: "$itinerary" }, 0] },
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
      { $skip: skip },
      { $limit: parseInt(limit, 10) },
      {
        $project: {
          clientId: 1,
          mobileNumber: 1,
          executiveName: 1,
          startDate: 1,
          primaryTourName: 1,
          status: 1,
        },
      },
    ]);

    const totalClients = await Client.countDocuments(matchFilters);
    const totalPages = Math.ceil(totalClients / limit);

    res.status(200).json({ clients, totalPages });
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ message: "Failed to fetch clients" });
  }
};
export const getTakenCount = async (req, res) => {
  try {
    const { companyId, startDate, endDate } = req.query;

    if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ message: "Valid companyId is required" });
    }

    // Default to "today" if not provided
    const todayStr = new Date().toISOString().split("T")[0];
    const start = new Date(startDate || todayStr);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate || todayStr);
    end.setHours(23, 59, 59, 999);

    const match = {
      companyId: new mongoose.Types.ObjectId(companyId),   // ← switched to companyId
      createdAtByEntry: { $gte: start, $lte: end },
    };

    const taken = await ClientByEntry.countDocuments(match);
    return res.json({
      taken,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    });
  } catch (err) {
    console.error("getTakenCount error:", err);
    return res.status(500).json({ message: "Failed to fetch taken count" });
  }
};