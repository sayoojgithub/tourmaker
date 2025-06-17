import CustomerCare from "../models/CustomerCare.js";
import Executive from "../models/Executive.js";
import CustomItinerary from "../models/CustomItinerary.js";
import mongoose from "mongoose";
import Client from "../models/Client.js";
import { parse, isBefore, isAfter } from "date-fns";
import PDFDocument from "pdfkit";
import https from "https";
import http from "http";
import { URL } from "url";

export const getCustomerCareDetails = async (req, res) => {
  const { customercareId } = req.params;

  try {
    const customercare = await CustomerCare.findById(customercareId);

    if (!customercare) {
      return res.status(404).json({ message: "Customercare not found" });
    }

    res.status(200).json(customercare);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// export const getBookedClientsByCustomerCare = async (req, res) => {
//   try {
//     const {
//       clientId,
//       mobileNumber,
//       page = 1,
//       limit = 4,
//       companyId,
//       balanceStatus,
//       filterType,
//     } = req.query;

//     const matchFilters = {
//       companyId: new mongoose.Types.ObjectId(companyId),
//       executiveVisitedStatus: true,
//       confirmedStatus: true,
//       bookedStatus: true,
//       ongoingStatus: false,
//       completedStatus: false,
//     };

//     // Additional filters
//     if (clientId) matchFilters.clientId = clientId;
//     if (mobileNumber) matchFilters.mobileNumber = mobileNumber;
//     if (balanceStatus === "positive") matchFilters.balance = { $gt: 0 };

//     // Handle filterType
//     const today = new Date();
//     if (filterType === "preparation") {
//       matchFilters.dueDateAt = { $lte: today };
//       matchFilters.finalizedTourDateAt = { $gte: today };
//     }

//     if (filterType === "dayAgo") {
//       const tomorrowStart = new Date(today);
//       tomorrowStart.setDate(today.getDate() + 1);
//       tomorrowStart.setHours(0, 0, 0, 0); // Start of the day
    
//       const tomorrowEnd = new Date(tomorrowStart);
//       tomorrowEnd.setDate(tomorrowStart.getDate() + 1); // Start of the day after tomorrow
    
//       matchFilters.finalizedTourDateAt = {
//         $gte: tomorrowStart,
//         $lt: tomorrowEnd
//       };
//     }

//     const skip = (page - 1) * limit;

//     const clients = await Client.aggregate([
//       { $match: matchFilters },
//       {
//         $match: {
//           ...matchFilters,
//           "itinerary.0": { $exists: true },
//         },
//       },
//       { $sort: { dueDateAt: 1, _id: 1 } },
//       { $skip: skip },
//       { $limit: Number(limit) },
//     ]);

//     const totalClientsResult = await Client.aggregate([
//       { $match: matchFilters },
//       {
//         $match: {
//           $expr: { $gt: [{ $size: "$itinerary" }, 0] },
//         },
//       },
//       { $count: "total" },
//     ]);

//     const totalClients = totalClientsResult[0]?.total || 0;
//     const totalPages = Math.ceil(totalClients / limit);

//     res.status(200).json({
//       clients,
//       totalPages,
//       currentPage: Number(page),
//     });
//   } catch (error) {
//     console.error("Error fetching clients:", error);
//     res
//       .status(500)
//       .json({ message: "An error occurred while fetching clients" });
//   }
// };
export const getBookedClientsByCustomerCare = async (req, res) => {
  try {
    const {
      clientId,
      mobileNumber,
      page = 1,
      limit = 5,
      companyId,
      customerCareId,
      balanceStatus,
      status = "", // now only accepts "Booked" or "Preparation"
      tourStatus
    } = req.query;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Set to UTC midnight

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Calculate tomorrow's date

    const statuses = status.split(",");
    const orConditions = [];

    statuses.forEach((stat) => {
      if (stat === "Booked") {
        orConditions.push({
          $or: [
            { finalizedTourDateAt: { $lt: today } },
            { dueDateAt: { $gt: today } },
          ],
        });
      } else if (stat === "Preparation") {
        const twoDaysBeforeFinal = {
          $dateSubtract: { startDate: "$finalizedTourDateAt", unit: "day", amount: 2 },
        };

        orConditions.push({
          $expr: {
            $and: [
              { $lte: ["$dueDateAt", today] },
              { $gte: [twoDaysBeforeFinal, today] },
            ],
          },
        });
      }
    });

    const matchFilters = {
      companyId: new mongoose.Types.ObjectId(companyId),
      customerCareId: new mongoose.Types.ObjectId(customerCareId),
      executiveVisitedStatus: true,
      confirmedStatus: true,
      bookedStatus: true,
      ongoingStatus: false,
      ...(clientId && { clientId }),
      ...(mobileNumber && { mobileNumber }),
      ...(balanceStatus === "positive" && { balance: { $gt: 0 } }),
      finalizedTourDateAt: { $ne: tomorrow }, // Exclude finalizedTourDateAt equal to tomorrow
    };

    const skip = (page - 1) * limit;

    const clients = await Client.aggregate([
      {
        $match: {
          ...matchFilters,
          ...(orConditions.length > 0 ? { $or: orConditions } : {}),
        },
      },
      {
        $addFields: {
          tourStatus: {
            $switch: {
              branches: [
                {
                  case: {
                    $or: [
                      { $lt: ["$finalizedTourDateAt", today] },
                      { $gt: ["$dueDateAt", today] },
                    ],
                  },
                  then: "Booked",
                },
                {
                  case: {
                    $and: [
                      { $lte: ["$dueDateAt", today] },
                      {
                        $gte: [
                          {
                            $dateSubtract: {
                              startDate: "$finalizedTourDateAt",
                              unit: "day",
                              amount: 2,
                            },
                          },
                          today,
                        ],
                      },
                    ],
                  },
                  then: "Preparation",
                },
              ],
              default: "unknown",
            },
          },
        },
      },
      ...(tourStatus
        ? [
            {
              $match: { tourStatus},
            },
          ]
        : []),
      { $sort: { dueDateAt: 1, _id: 1 } },
      { $skip: skip },
      { $limit: Number(limit) },
    ]);

    const totalClientsResult = await Client.aggregate([
      {
        $match: {
          ...matchFilters,
          ...(orConditions.length > 0 ? { $or: orConditions } : {}),
        },
      },
      {
        $addFields: {
          tourStatus: {
            $switch: {
              branches: [
                {
                  case: {
                    $or: [
                      { $lt: ["$finalizedTourDateAt", today] },
                      { $gt: ["$dueDateAt", today] },
                    ],
                  },
                  then: "Booked",
                },
                {
                  case: {
                    $and: [
                      { $lte: ["$dueDateAt", today] },
                      {
                        $gte: [
                          {
                            $dateSubtract: {
                              startDate: "$finalizedTourDateAt",
                              unit: "day",
                              amount: 2,
                            },
                          },
                          today,
                        ],
                      },
                    ],
                  },
                  then: "Preparation",
                },
              ],
              default: "unknown",
            },
          },
        },
      },
      ...(tourStatus ? [{ $match: { tourStatus } }] : []),
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
    console.error("Error fetching clients:", error);
    res.status(500).json({
      message: "An error occurred while fetching clients",
    });
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
// Helper function to fetch image buffer from URL
const fetchImageBuffer = (url) => {
  return new Promise((resolve, reject) => {
    const { protocol } = new URL(url); // Get the protocol from the URL

    // Use the correct module based on the protocol
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
export const downloadItineraryByCustomerCare = async (req, res) => {
  const { clientId } = req.body;

  if (!clientId) {
    return res.status(400).json({ message: "Client ID is required" });
  }

  try {
    // Fetch the client details from the database
    const client = await Client.findById(clientId).populate("companyId");
    if (!client || !client.itineraryDetails) {
      return res
        .status(404)
        .json({ message: "Client or itinerary details not found" });
    }

    const { numberOfPersons, mobileNumber, companyId, executiveId } = client; // Extract the necessary detail
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
    } = company;

    const {
      heading,
      clientName,
      destination,
      tourName,
      articleNumber,
      duration,
      date,
      pricePerHead,
      totalCost,
      itineraryText,
      inclusionsList = [],
      exclusionsList = [],
      downloadDate,
    } = client.itineraryDetails;

    const doc = new PDFDocument({ margin: 50 });

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=confirm_itinerary_${tourName}.pdf`
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
      .text(heading, { align: "center", underline: true });
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
      .text(destination || "N/A", { align: "center" })
      .moveDown(0.2);

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(duration ? duration : "N/A", { align: "center" })
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
        doc.fontSize(10).font("Helvetica").text(`• ${item}`, { align: "left" }); // Use a dot (•) symbol
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
        doc.fontSize(10).font("Helvetica").text(`• ${item}`, { align: "left" }); // Use a dot (•) symbol
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
      .text(`CLIENT NAME: ${clientName?.toUpperCase() || "N/A"}`, {
        align: "left",
      })
      .moveDown(0.1)
      .text(`CLIENT ID: ${client?.clientId || "N/A"}`) // Client ID
      .moveDown(0.1)
      .text(`TOTAL PAX: ${numberOfPersons || "N/A"}`, { align: "left" })
      .moveDown(1); // Add space after Customer section

    // Tour Section
    doc.fontSize(12).font("Helvetica-Bold").text("TOUR", { underline: true }); // Add heading
    //.moveDown(0.5); // Add space below the heading

    // Tour Information (Right-Aligned)
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`TOUR DATE: ${date || "N/A"}`, { align: "left" })
      .moveDown(0.1)
      .text(`ARTICLE NO: ${articleNumber || "N/A"}`)
      .moveDown(0.1)
      .text(`PRICE PER HEAD: ${pricePerHead ? `${pricePerHead}` : "N/A"}`, {
        align: "left",
      })
      .moveDown(0.1)
      .text(`TOTAL COST: ${totalCost || "N/A"}`, { align: "left" })
      .moveDown(1); // Add final space after Tour section
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
      "26. If there are any changes to your tour, such as a date modification or postponement, you must notify us and obtain confirmation from our official email ID trippensholidays@gmail.com to your personal or official email. We will not acknowledge any proof of changes from the client unless confirmed through this official channel."
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
    console.error("Error generating itinerary PDF:", error);
    res.status(500).json({
      message: "An error occurred while generating the PDF.",
    });
  }
};

export const downloadCustomItineraryByCustomCare = async (req, res) => {
  try {
    const { clientId } = req.body;

    if (!clientId) {
      return res.status(400).json({ error: "Client ID required." });
    }

    // Fetch client details
    const client = await Client.findById(clientId).populate("companyId");
    if (!client) {
      return res.status(404).json({ error: "Client not found." });
    }

    const {
      name,
      mobileNumber,
      startDate,
      endDate,
      numberOfPersons,
      companyId,
      totalCost,
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
      bankDetails: companyBankDetails,
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
    const pricePerHead = totalCost / numberOfPersons;
    const itineraries = await CustomItinerary.find({ clientId });
    // Ensure there's at least one itinerary available
const downloadDate = itineraries.length > 0 ? itineraries[0].downloadDate : null;

// Function to format date in dd/mm/yyyy format
const formatToDDMMYYYY = (date) => {
  if (!date) return "N/A";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Format the downloadDate
const formattedDownloadDate = formatToDDMMYYYY(downloadDate);

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

    doc.moveDown(0.5); // Add spacing after heading
    // Add "CUSTOM TOUR" centered below "CONFIRM ITINERARY"
    doc.fontSize(20).font("Helvetica-Bold").text("CUSTOM TOUR", {
      align: "center",
      underline: true,
    });
    doc.moveDown(0.3);
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
      .text(`TOTAL PRICE: ${totalCost.toFixed(2)}`, { align: "left" }); // Added total price

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
      "If there are any changes to your tour, such as a date modification or postponement, you must notify us and obtain confirmation from our official email ID trippensholidays@gmail.com to your personal or official email. We will not acknowledge any proof of changes from the client unless confirmed through this official channel."
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

// export const getTodoClientsByCustomerCare = async (req, res) => {
//   try {
//     const {
//       clientId,
//       mobileNumber,
//       page = 1,
//       limit = 4,
//       companyId,
//       balanceStatus,
//       status,
//     } = req.query;

//     const today = new Date();
//     const formattedToday = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
//     const matchFilters = {
//       companyId: new mongoose.Types.ObjectId(companyId),
//       executiveVisitedStatus: true,
//       confirmedStatus: true,
//       bookedStatus: true,
//     };

//     if (status === "dayAgo") {
//       matchFilters.ongoingStatus = false;
//       matchFilters.completedStatus = false;

//       const tomorrowStart = new Date(today);
//       tomorrowStart.setDate(today.getDate() + 1);
//       tomorrowStart.setHours(0, 0, 0, 0);

//       const tomorrowEnd = new Date(tomorrowStart);
//       tomorrowEnd.setDate(tomorrowStart.getDate() + 1);

//       matchFilters.finalizedTourDateAt = {
//         $gte: tomorrowStart,
//         $lt: tomorrowEnd,
//       };
//     } else if (status === "endDay") {
//       matchFilters.finalizedTourEndDateAt = formattedToday;
//       matchFilters.ongoingStatus = true;
//       matchFilters.completedStatus = false;
//     } else if (status === "ongoing") {
//       matchFilters.ongoingStatus = true;
//       matchFilters.completedStatus = false;
//       matchFilters.finalizedTourDateAt = { $ne: formattedToday };
//       matchFilters.finalizedTourEndDateAt = { $ne: formattedToday };
//     } else {
//       // Default to "startDay"
//       matchFilters.finalizedTourDateAt = formattedToday;
//       matchFilters.ongoingStatus = true;
//       matchFilters.completedStatus = false;
//     }

//     if (clientId) matchFilters.clientId = clientId;
//     if (mobileNumber) matchFilters.mobileNumber = mobileNumber;
//     if (balanceStatus === "positive") matchFilters.balance = { $gt: 0 };

//     const skip = (page - 1) * limit;

//     const baseMatchPipeline = [
//       { $match: matchFilters },
//       {
//         $match: {
//           $expr: { $gt: [{ $size: "$itinerary" }, 0] },
//         },
//       },
//     ];

//     const clients = await Client.aggregate([
//       ...baseMatchPipeline,
//       { $sort: { dueDateAt: 1, _id: 1 } },
//       { $skip: skip },
//       { $limit: Number(limit) },
//     ]);

//     const totalClientsResult = await Client.aggregate([
//       ...baseMatchPipeline,
//       { $count: "total" },
//     ]);

//     const totalClients = totalClientsResult[0]?.total || 0;
//     const totalPages = Math.ceil(totalClients / limit);

//     res.status(200).json({
//       clients,
//       totalPages,
//       currentPage: Number(page),
//     });
//   } catch (error) {
//     console.error("Error fetching interested clients:", error);
//     res.status(500).json({
//       message: "An error occurred while fetching interested clients",
//     });
//   }
// };

export const getTodoClientsByCustomerCare = async (req, res) => {
  try {
    const {
      clientId,
      mobileNumber,
      page = 1,
      limit = 5,
      companyId,
      customerCareId,
      balanceStatus,
      status = "", // e.g., "dayAgo,endDay"
      tourStatus,
    } = req.query;

    const today = new Date();
    const formattedToday = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
console.log(formattedToday)
    const statuses = status.split(",");
    const orConditions = [];

    statuses.forEach((stat) => {
    
   
    if (stat === "Day Ago") {
        const tomorrowStart = new Date(today);
        tomorrowStart.setDate(today.getDate() + 1);
        tomorrowStart.setHours(0, 0, 0, 0);
        const tomorrowEnd = new Date(tomorrowStart);
        tomorrowEnd.setDate(tomorrowStart.getDate() + 1);

        orConditions.push({
          ongoingStatus: false,
          completedStatus: false,
          finalizedTourDateAt: { $gte: tomorrowStart, $lt: tomorrowEnd },
        });
      } else if (stat === "End Day") {
        orConditions.push({
          finalizedTourEndDateAt: formattedToday,
          ongoingStatus: true,
          completedStatus: false,
        });
      } else if (stat === "Ongoing") {
        orConditions.push({
          ongoingStatus: true,
          completedStatus: false,
          finalizedTourDateAt: { $ne: formattedToday },
          finalizedTourEndDateAt: { $ne: formattedToday },
        });
      } else if (stat === "Start Day") {
        orConditions.push({
          finalizedTourDateAt: formattedToday,
          ongoingStatus: true,
          completedStatus: false,
        });
      }else if (stat === "Scheduled") {
        orConditions.push({
          feedbacks: {
            $elemMatch: {
              scheduleDate: formattedToday,
            },
          },
        });
      }
    });
 
    const matchFilters = {
      companyId: new mongoose.Types.ObjectId(companyId),
      customerCareId: new mongoose.Types.ObjectId(customerCareId),
      executiveVisitedStatus: true,
      confirmedStatus: true,
      bookedStatus: true,
      ...(clientId && { clientId }),
      ...(mobileNumber && { mobileNumber }),
      ...(balanceStatus === "positive" && { balance: { $gt: 0 } }),
    };

    const skip = (page - 1) * limit;

    const baseMatchPipeline = [
      {
        $match: {
          ...matchFilters,
          $or: orConditions,
        },
      },
      {
        $match: {
          $expr: { $gt: [{ $size: "$itinerary" }, 0] },
        },
      },
    ];

    const clients = await Client.aggregate([
      ...baseMatchPipeline,
      {
        $addFields: {
          tourStatus: {
            $switch: {
              branches: [
                // {
                //   case: {
                //     $eq: [
                //       {
                //         $dateToString: { format: "%Y-%m-%d", date: {
                //           $arrayElemAt: ["$feedbacks.scheduleDate", -1] // last feedback's scheduleDate
                //         }},
                //       },
                //       {
                //         $dateToString: { format: "%Y-%m-%d", date: formattedToday },
                //       },
                //     ],
                //   },
                  
                //   then: "Scheduled",
                // },
                // {
                //   case: {
                //     $eq: [
                //       {
                //         $dateToString: {
                //           format: "%Y-%m-%d",
                //           date: {
                //             $ifNull: [
                //               {
                //                 $arrayElemAt: ["$feedbacks.scheduleDate", -1],
                //               },
                //               null,
                //             ],
                //           },
                //         },
                //       },
                //       {
                //         $dateToString: {
                //           format: "%Y-%m-%d",
                //           date: formattedToday,
                //         },
                //       },
                //     ],
                //   },
                //   then: "Scheduled",
                // },
                {
                  case: {
                    $and: [
                      { $eq: ["$ongoingStatus", false] },
                      { $eq: ["$completedStatus", false] },
                      {
                        $gte: [
                          "$finalizedTourDateAt",
                          new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
                        ],
                      },
                      {
                        $lt: [
                          "$finalizedTourDateAt",
                          new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
                        ],
                      },
                    ],
                  },
                  then: "Day Ago",
                },
                {
                  case: {
                    $and: [
                      { $eq: ["$finalizedTourEndDateAt", formattedToday] },
                      { $eq: ["$ongoingStatus", true] },
                      { $eq: ["$completedStatus", false] },
                    ],
                  },
                  then: "End Day",
                },
                {
                  case: {
                    $and: [
                      { $eq: ["$ongoingStatus", true] },
                      { $eq: ["$completedStatus", false] },
                      { $ne: ["$finalizedTourDateAt", formattedToday] },
                      { $ne: ["$finalizedTourEndDateAt", formattedToday] },
                    ],
                  },
                  then: "Ongoing",
                },
                {
                  case: {
                    $and: [
                      { $eq: ["$finalizedTourDateAt", formattedToday] },
                      { $eq: ["$ongoingStatus", true] },
                      { $eq: ["$completedStatus", false] },
                    ],
                  },
                  then: "Start Day",
                },
                {
                  case: {
                    $eq: [
                      {
                        $dateToString: { format: "%Y-%m-%d", date: {
                          $arrayElemAt: ["$feedbacks.scheduleDate", -1] // last feedback's scheduleDate
                        }},
                      },
                      {
                        $dateToString: { format: "%Y-%m-%d", date: formattedToday },
                      },
                    ],
                  },
                  
                  then: "Scheduled",
                },
              ],
              default: "unknown",
            },
          },
        },
      },
      ...(tourStatus
        ? [
            {
              $match: { tourStatus},
            },
          ]
        : []),
      { $sort: { dueDateAt: 1, _id: 1 } },
      { $skip: skip },
      { $limit: Number(limit) },
    ]);

    const totalClientsResult = await Client.aggregate([
      ...baseMatchPipeline,
      {
        $addFields: {
          tourStatus: {
            $switch: {
              branches: [
              
                
                {
                  case: {
                    $and: [
                      { $eq: ["$ongoingStatus", false] },
                      { $eq: ["$completedStatus", false] },
                      {
                        $gte: [
                          "$finalizedTourDateAt",
                          new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 1)),
                        ],
                      },
                      {
                        $lt: [
                          "$finalizedTourDateAt",
                          new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 2)),
                        ],
                      },
                    ],
                  },
                  then: "Day Ago",
                },
                {
                  case: {
                    $and: [
                      { $eq: ["$finalizedTourEndDateAt", formattedToday] },
                      { $eq: ["$ongoingStatus", true] },
                      { $eq: ["$completedStatus", false] },
                    ],
                  },
                  then: "End Day",
                },
                {
                  case: {
                    $and: [
                      { $eq: ["$ongoingStatus", true] },
                      { $eq: ["$completedStatus", false] },
                      { $ne: ["$finalizedTourDateAt", formattedToday] },
                      { $ne: ["$finalizedTourEndDateAt", formattedToday] },
                    ],
                  },
                  then: "Ongoing",
                },
                {
                  case: {
                    $and: [
                      { $eq: ["$finalizedTourDateAt", formattedToday] },
                      { $eq: ["$ongoingStatus", true] },
                      { $eq: ["$completedStatus", false] },
                    ],
                  },
                  then: "Start Day",
                },
                {
                  case: {
                    $eq: [
                      {
                        $dateToString: { format: "%Y-%m-%d", date: {
                          $arrayElemAt: ["$feedbacks.scheduleDate", -1]
                        }},
                      },
                      {
                        $dateToString: { format: "%Y-%m-%d", date: formattedToday },
                      },
                    ],
                  },
                  then: "Scheduled",
                },
              ],
              default: "unknown",
            },
          },
        },
      },
      ...(tourStatus ? [{ $match: { tourStatus } }] : []),
      { $count: "total" },
    ]);
    
    console.log(clients)
    const totalClients = totalClientsResult[0]?.total || 0;
    const totalPages = Math.ceil(totalClients / limit);
    res.status(200).json({
      clients,
      totalPages,
      currentPage: Number(page),
      totalClients
    });
  } catch (error) {
    console.error("Error fetching interested clients:", error);
    res.status(500).json({
      message: "An error occurred while fetching interested clients",
    });
  }
};
export const changeToOngoing = async (req, res) => {
  const { clientId } = req.body;

  if (!clientId) {
    return res.status(400).json({ message: "ClientId is required." });
  }

  try {
    // Find the client by clientId
    const client = await Client.findOne({ _id: clientId });

    if (!client) {
      return res.status(404).json({ message: "Client not found." });
    }
      // Check if already ongoing
      if (client.ongoingStatus === true) {
        return res
          .status(400)
          .json({ message: "Client is already marked as ongoing." });
      }
    // Check the balance amount
    if (client.balance > 0) {
      return res
        .status(400)
        .json({
          message: "Cannot mark as ongoing. Outstanding balance exists.",
        });
    }

    // Validate finalizedTourDate
    const currentDate = new Date();
    currentDate.setHours(6, 0, 0, 0);
    console.log(client.finalizedTourDate);
    const finalizedTourDate = parse(
      client.finalizedTourDate,
      "dd/MM/yyyy",
      new Date()
    );
    finalizedTourDate.setHours(6, 0, 0, 0);
    console.log(currentDate);
    console.log(finalizedTourDate);

    if (currentDate < finalizedTourDate) {
      return res
        .status(400)
        .json({ message: "Cannot mark as ongoing before tour date." });
    }

    // Update the ongoingStatus field
    client.ongoingStatus = true;
    await client.save();

    res.status(200).json({
      message: "Client status updated to Ongoing successfully.",
    });
  } catch (error) {
    console.error("Error updating client status:", error.message);
    res.status(500).json({
      message: "An error occurred while updating the client status.",
    });
  }
};

export const getOngoingClientsByCustomerCare = async (req, res) => {
  try {
    const {
      clientId,
      mobileNumber,
      page = 1,
      limit = 4,
      companyId,
      balanceStatus,
    } = req.query;

    const matchFilters = {
      companyId: new mongoose.Types.ObjectId(companyId),
      executiveVisitedStatus: true,
      confirmedStatus: true,
      bookedStatus: true,
      ongoingStatus: true,
      completedStatus: false,
    };

    // Add optional filters
    if (clientId) matchFilters.clientId = clientId;
    if (mobileNumber) matchFilters.mobileNumber = mobileNumber;
    if (balanceStatus === "positive") matchFilters.balance = { $gt: 0 };

    const skip = (page - 1) * limit;

    // Aggregate pipeline to fetch clients
    const clients = await Client.aggregate([
      { $match: matchFilters },
      {
        $match: {
          ...matchFilters,
          "itinerary.0": { $exists: true }, // Ensure itinerary has at least one element
        },
      },
      { $sort: { dueDateAt: 1, _id: 1 } }, // Sort by dueDate in ascending order
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
    });
  } catch (error) {
    console.error("Error fetching interested clients:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching interested clients" });
  }
};

export const getPendingClientsByCustomerCare = async (req, res) => {
  try {
    const {
      clientId,
      mobileNumber,
      page = 1,
      limit = 4,
      companyId,
      customerCareId,
      balanceStatus,
    } = req.query;

    const matchFilters = {
      companyId: new mongoose.Types.ObjectId(companyId),
      customerCareId: new mongoose.Types.ObjectId(customerCareId),
      executiveVisitedStatus: true,
      confirmedStatus: true,
      bookedStatus: true,
      ongoingStatus: false,
      completedStatus: false,
    };

    // Add optional filters
    if (clientId) matchFilters.clientId = clientId;
    if (mobileNumber) matchFilters.mobileNumber = mobileNumber;
    if (balanceStatus === "positive") matchFilters.balance = { $gt: 0 };

    const skip = (page - 1) * limit;
    const currentDate = new Date();

    // Aggregation pipeline
    const clients = await Client.aggregate([
      // Match the filters based on query params
      { $match: matchFilters },

      // Convert finalizedTourDate from string to Date for comparison
      {
        $addFields: {
          finalizedTourDate: {
            $dateFromString: {
              dateString: "$finalizedTourDate",
              format: "%d/%m/%Y", // Format for DD/MM/YYYY
            },
          },
        },
      },

      // Filter clients where finalizedTourDate is in the past
      {
        $match: {
          finalizedTourDate: { $lte: currentDate },
        },
      },

      // Ensure itinerary has at least one element
      {
        $match: {
          "itinerary.0": { $exists: true },
        },
      },

      // Sort clients by dueDateAt, then by _id
      { $sort: { dueDateAt: 1, _id: 1 } },

      // Skip for pagination
      { $skip: skip },

      // Limit the number of documents
      { $limit: Number(limit) },
    ]);

    // Count the total documents matching the conditions for pagination
    const totalClientsResult = await Client.aggregate([
      { $match: matchFilters },

      // Convert finalizedTourDate from string to Date for comparison
      {
        $addFields: {
          finalizedTourDate: {
            $dateFromString: {
              dateString: "$finalizedTourDate",
              format: "%d/%m/%Y", // Format for DD/MM/YYYY
            },
          },
        },
      },

      // Filter clients where finalizedTourDate is in the past
      {
        $match: {
          finalizedTourDate: { $lte: currentDate },
        },
      },

      // Ensure itinerary has at least one element
      {
        $match: {
          "itinerary.0": { $exists: true },
        },
      },

      { $count: "total" }, // Count the total matching clients
    ]);

    const totalClients = totalClientsResult[0]?.total || 0;
    const totalPages = Math.ceil(totalClients / limit);

    res.status(200).json({
      clients,
      totalPages,
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("Error fetching pending clients:", error);
    res.status(500).json({
      message: "An error occurred while fetching pending clients",
    });
  }
};

export const changeToCompleted = async (req, res) => {
  const { clientId } = req.body;

  if (!clientId) {
    return res.status(400).json({ message: "ClientId is required" });
  }

  try {
    // Find the client by clientId
    const client = await Client.findOne({ _id: clientId });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
     // Check if already ongoing
     if (client.completedStatus === true) {
      return res
        .status(400)
        .json({ message: "Client is already marked as completed." });
    }

    // Check if the client is marked as ongoing
    if (!client.ongoingStatus) {
      return res.status(400).json({ message: "Client's tour is not ongoing" });
    }
    // Ensure finalizedTourEndDateAt exists
    if (!client.finalizedTourEndDateAt) {
      return res.status(400).json({ message: "finalizedTourEndDateAt is missing" });
    }

    const today = new Date();
    const tourEndDate = new Date(client.finalizedTourEndDateAt);

    // Create a date representing the next day after the tour end date
    const nextDayAfterTourEnd = new Date(tourEndDate);
    nextDayAfterTourEnd.setDate(tourEndDate.getDate() + 1);

    // Only allow marking as completed if today is AFTER nextDayAfterTourEnd
    if (today < nextDayAfterTourEnd) {
      return res.status(400).json({
        message: "Status can be changed to Completed only after one day of the tour end date.",
      });
    }

    // Update the completedStatus field
    client.completedStatus = true;

    // Save the updated client
    await client.save();

    res.status(200).json({ message: "Client status updated to Completed." });
  } catch (error) {
    console.error("Error updating client status:", error.message);
    res
      .status(500)
      .json({ message: "An error occurred while updating the client status" });
  }
};

export const getCompletedClientsByCustomerCare = async (req, res) => {
  try {
    const {
      clientId,
      mobileNumber,
      page = 1,
      limit = 5,
      companyId,
      customerCareId,
      balanceStatus,
      status = "",
      tourStatus
    } = req.query;

    const statuses = status.split(",");
    const orConditions = [];

    statuses.forEach((stat) => {
      if (stat === "Review Pending") {
        orConditions.push({
          homeReachedStatus: true,
          reviewStatus: false,
        });
      } else if (stat === "Home Reached Pending") {
        orConditions.push({
          homeReachedStatus: false,
          reviewStatus: true,
        });
      }else if (stat === "Both Are Pending") {
        orConditions.push({
          homeReachedStatus: false,
          reviewStatus: false,
        });
      }
      else if (stat === "Both Are Done") {
        orConditions.push({
          homeReachedStatus: true,
          reviewStatus: true,
        });
      }
    });

    const matchFilters = { 
      companyId: new mongoose.Types.ObjectId(companyId),
      customerCareId: new mongoose.Types.ObjectId(customerCareId), 
      executiveVisitedStatus: true,
      confirmedStatus: true,
      bookedStatus: true,
      ongoingStatus: true,
      completedStatus: true,
      ...(clientId && { clientId }),
      ...(mobileNumber && { mobileNumber }),
      ...(balanceStatus === "positive" && { balance: { $gt: 0 } }),
    };

    const skip = (page - 1) * limit;

    const aggregationPipeline = [
      {
        $match: {
          ...matchFilters,
          ...(orConditions.length > 0 ? { $or: orConditions } : {}),
        },
      },
      {
        $addFields: {
          tourStatus: {
            $switch: {
              branches: [
                {
                  case: {
                    $and: [
                      { $eq: ["$homeReachedStatus", true] },
                      { $eq: ["$reviewStatus", false] },
                    ],
                  },
                  then: "Review Pending",
                },
                {
                  case: {
                    $and: [
                      { $eq: ["$homeReachedStatus", false] },
                      { $eq: ["$reviewStatus", true] },
                    ],
                  },
                  then: "Home Reached Pending",
                },
                {
                  case: {
                    $and: [
                      { $eq: ["$homeReachedStatus", false] },
                      { $eq: ["$reviewStatus", false] },
                    ],
                  },
                  then: "Both Are Pending",
                },
                {
                  case: {
                    $and: [
                      { $eq: ["$homeReachedStatus", true] },
                      { $eq: ["$reviewStatus", true] },
                    ],
                  },
                  then: "Both Are Done",
                },
              ],
              default: "Completed",
            },
          },
        },
      },
      ...(tourStatus ? [{ $match: { tourStatus } }] : []),
      { $sort: { dueDateAt: 1, _id: 1 } },
      { $skip: skip },
      { $limit: Number(limit) },
    ];

    const clients = await Client.aggregate(aggregationPipeline);

    const totalClientsResult = await Client.aggregate([
      ...aggregationPipeline.slice(0, -2), // remove skip & limit
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
    console.error("Error fetching clients:", error);
    res.status(500).json({
      message: "An error occurred while fetching clients",
    });
  }
};


export const addFeedback = async (req, res) => {
  try {
    const {
      clientId,
      status,
      conditions,
      scheduleDate,
      scheduleTime,
      comment,
      submittedDate,
      submittedTime,
      submittedBy,
    } = req.body;

    if (!clientId || !submittedBy) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    const formattedScheduleDate = new Date(scheduleDate);
     // Convert submittedDate from "dd/mm/yyyy" to ISO Date
     const [day, month, year] = submittedDate.split("/");
     const submittedDateAt = new Date(`${year}-${month}-${day}`); // creates ISO date
    client.feedbacks.push({
      status,
      conditions,
      scheduleDate: formattedScheduleDate,
      scheduleTime,
      comment,
      submittedDate,
      submittedTime,
      submittedDateAt,
      submittedBy,
    });

    await client.save();

    return res.status(200).json({
      message: "Feedback added successfully",
      feedbacks: client.feedbacks,
    });

  } catch (error) {
    console.error("Error adding feedback:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getClientHistory = async (req, res) => {
  const { clientId } = req.params;

  try {
    const client = await Client.findById(clientId).populate("feedbacks.submittedBy", "name email mobileNumber");

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json({ feedbacks: client.feedbacks });
  } catch (error) {
    console.error("Error fetching client history:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getClientsWithFeedbacks = async (req, res) => {
  try {
    const {
      companyId,
      customerCareId,
      status = "", 
    } = req.query;

    const today = new Date();
    const formattedToday = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

    const statuses = status.split(",");
    const orConditions = [];

    statuses.forEach((stat) => {
     if (stat === "Day Ago") {
        const tomorrowStart = new Date(today);
        tomorrowStart.setDate(today.getDate() + 1);
        tomorrowStart.setHours(0, 0, 0, 0);
        const tomorrowEnd = new Date(tomorrowStart);
        tomorrowEnd.setDate(tomorrowStart.getDate() + 1);

        orConditions.push({
          ongoingStatus: false,
          completedStatus: false,
          finalizedTourDateAt: { $gte: tomorrowStart, $lt: tomorrowEnd },
        });
      } else if (stat === "End Day") {
        orConditions.push({
          finalizedTourEndDateAt: formattedToday,
          ongoingStatus: true,
          completedStatus: false,
        });
      } else if (stat === "Ongoing") {
        orConditions.push({
          ongoingStatus: true,
          completedStatus: false,
          finalizedTourDateAt: { $ne: formattedToday },
          finalizedTourEndDateAt: { $ne: formattedToday },
        });
      } else if (stat === "Start Day") {
        orConditions.push({
          finalizedTourDateAt: formattedToday,
          ongoingStatus: true,
          completedStatus: false,
        });
      }else if (stat === "Scheduled") {
        orConditions.push({
          feedbacks: {
            $elemMatch: {
              scheduleDate: formattedToday,
            },
          },
        });
      }
    });

    const matchFilters = {
      companyId: new mongoose.Types.ObjectId(companyId),
      customerCareId: new mongoose.Types.ObjectId(customerCareId),
      executiveVisitedStatus: true,
      confirmedStatus: true,
      bookedStatus: true,
    };

    

    const baseMatchPipeline = [
      {
        $match: {
          ...matchFilters,
          $or: orConditions,
        },
      },
      {
        $match: {
          $expr: { $gt: [{ $size: "$itinerary" }, 0] },
        },
      },
    ];

    const addTourStatusStage = {
      $addFields: {
        tourStatus: {
          $switch: {
            branches: [
              {
                case: {
                  $and: [
                    { $eq: ["$ongoingStatus", false] },
                    { $eq: ["$completedStatus", false] },
                    {
                      $gte: [
                        "$finalizedTourDateAt",
                        new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
                      ],
                    },
                    {
                      $lt: [
                        "$finalizedTourDateAt",
                        new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
                      ],
                    },
                  ],
                },
                then: "Day Ago",
              },
              {
                case: {
                  $and: [
                    { $eq: ["$finalizedTourEndDateAt", formattedToday] },
                    { $eq: ["$ongoingStatus", true] },
                    { $eq: ["$completedStatus", false] },
                  ],
                },
                then: "End Day",
              },
              {
                case: {
                  $and: [
                    { $eq: ["$ongoingStatus", true] },
                    { $eq: ["$completedStatus", false] },
                    { $ne: ["$finalizedTourDateAt", formattedToday] },
                    { $ne: ["$finalizedTourEndDateAt", formattedToday] },
                  ],
                },
                then: "Ongoing",
              },
              {
                case: {
                  $and: [
                    { $eq: ["$finalizedTourDateAt", formattedToday] },
                    { $eq: ["$ongoingStatus", true] },
                    { $eq: ["$completedStatus", false] },
                  ],
                },
                then: "Start Day",
              },
              {
                case: {
                  $eq: [
                    {
                      $dateToString: {
                        format: "%Y-%m-%d",
                        date: { $arrayElemAt: ["$feedbacks.scheduleDate", -1] },
                      },
                    },
                    {
                      $dateToString: {
                        format: "%Y-%m-%d",
                        date: formattedToday,
                      },
                    },
                  ],
                },
                then: "Scheduled",
              },
            ],
            default: "unknown",
          },
        },
      },
    };

    const filterFeedbacksStage = {
      $addFields: {
        feedbacks: {
          $filter: {
            input: "$feedbacks",
            as: "fb",
            cond: {
              $eq: [
                {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$$fb.submittedDateAt",
                  },
                },
                {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: formattedToday,
                  },
                },
              ],
            },
          },
        },
      },
    };

    const clients = await Client.aggregate([
      ...baseMatchPipeline,
      addTourStatusStage,
    
      filterFeedbacksStage,
      { $sort: { dueDateAt: 1, _id: 1 } },
    ]);

   

    

    res.status(200).json({
      clients,
    });
  } catch (error) {
    console.error("Error fetching interested clients:", error);
    res.status(500).json({
      message: "An error occurred while fetching interested clients",
    });
  }
};

export const changeToHomeReached = async (req, res) => {
  try {
    const { clientId } = req.body;

    if (!clientId) {
      return res.status(400).json({ message: "Client ID is required" });
    }

    // Ensure clientId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ message: "Invalid Client ID" });
    }

    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    if (client.homeReachedStatus === true) {
      return res.status(400).json({ message: "Already marked as Home Reached" });
    }

    const allStatusesTrue =
      client.executiveVisitedStatus &&
      client.confirmedStatus &&
      client.bookedStatus &&
      client.ongoingStatus &&
      client.completedStatus;

    if (!allStatusesTrue) {
      return res.status(400).json({
        message: "Cannot mark as Home Reached. All tour statuses must be true.",
      });
    }

    client.homeReachedStatus = true;
    await client.save();

    res.status(200).json({ message: "Client status updated to Home Reached" });
  } catch (error) {
    console.error("Error updating homeReachedStatus:", error);
    res.status(500).json({ message: "Server error while updating status" });
  }
};
export const changeToReviewGiven = async (req, res) => {
  try {
    const { clientId } = req.body;

    if (!clientId) {
      return res.status(400).json({ message: "Client ID is required" });
    }

    // Ensure clientId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ message: "Invalid Client ID" });
    }

    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    if (client.reviewStatus === true) {
      return res.status(400).json({ message: "Already marked as Review Given" });
    }

    const allStatusesTrue =
      client.executiveVisitedStatus &&
      client.confirmedStatus &&
      client.bookedStatus &&
      client.ongoingStatus &&
      client.completedStatus;

    if (!allStatusesTrue) {
      return res.status(400).json({
        message: "Cannot mark as Review Given. All tour statuses must be true.",
      });
    }

    client.reviewStatus = true;
    await client.save();

    res.status(200).json({ message: "Client status updated to Review Given" });
  } catch (error) {
    console.error("Error updating reviewGivenStatus:", error);
    res.status(500).json({ message: "Server error while updating status" });
  }
};

export const downloadClientReport = async (req, res) => {
  try {
    const { clients } = req.body;

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=clients_report.pdf");
    doc.pipe(res);

    const drawPageBorder = () => {
      doc
        .rect(25, 25, doc.page.width - 50, doc.page.height - 50)
        .strokeColor("black")
        .lineWidth(2)
        .stroke();
    };

    const formatDate = (isoDateStr) => {
      const date = new Date(isoDateStr);
      if (isNaN(date)) return "N/A";
      return date.toLocaleDateString("en-GB");
    };

    const drawHeader = () => {
      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("CUSTOMER CARE REPORT", { align: "center" });
      doc.moveDown(1);
    };

    const drawFooter = () => {
      const date = new Date();
      const formattedDate = date.toLocaleDateString("en-GB");
      const formattedTime = date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      doc
        .fontSize(10)
        .fillColor("gray")
        .text(`Generated on: ${formattedDate}, ${formattedTime}`, {
          align: "center",
        });
    };

    drawPageBorder();
    drawHeader();

    clients.forEach((client, i) => {
      const name = client.name || "Unnamed";
      const id = client.clientId || "N/A";
      const status = client.tourStatus || "N/A";
      const startDate = formatDate(client.finalizedTourDateAt);
      const endDate = formatDate(client.finalizedTourEndDateAt);

      const beforeBlockY = doc.y;

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(`${i + 1}. ${name} (ID: ${id})`);

      doc
        .font("Helvetica")
        .fontSize(11)
        .text(`Status: ${status} | Tour Start Date: ${startDate} | Tour End Date: ${endDate}`);

      if (client.feedbacks?.length) {
        client.feedbacks.forEach((fb, idx) => {
          doc
            .font("Helvetica")
            .fontSize(11)
            .text(`   - Feedback ${idx + 1}: ${fb.status} (${fb.submittedTime})`, {
              indent: 20,
            });
        });
      } else {
        doc
          .font("Helvetica")
          .fontSize(11)
          .text("   - No feedback available", { indent: 20 });
      }

      doc.moveDown(0.75);

      const afterBlockY = doc.y;
      const blockHeight = afterBlockY - beforeBlockY;
      const bottomMargin = 60;

      // Prepare next page if content will overflow
      if (afterBlockY + blockHeight > doc.page.height - bottomMargin) {
        doc.addPage();
        drawPageBorder();
        drawHeader();
      }
    });

    // Final footer on the last page only
    drawFooter();

    doc.end();
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).json({ message: "Failed to generate client report" });
  }
};
