import Billing from "../models/Billing.js";
import Client from "../models/Client.js";
import Executive from "../models/Executive.js";
import Voucher from "../models/Voucher.js";
import Agency from "../models/Agency.js";
import CustomItinerary from "../models/CustomItinerary.js";
import FrontOffice from "../models/FrontOffice.js";
import CustomerCare from "../models/CustomerCare.js"
import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import https from "https";
import http from "http";
import { URL } from "url";

export const getBillerDetails = async (req, res) => {
  const { billerId } = req.params;

  try {
    const biller = await Billing.findById(billerId);

    if (!biller) {
      return res.status(404).json({ message: "not found" });
    }

    res.status(200).json(biller);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getConfirmedClientsByBilling = async (req, res) => {
  try {
    const {
      clientId,
      mobileNumber,
      page = 1,
      limit = 5,
      companyId,
    } = req.query;

    const matchFilters = {
      companyId: new mongoose.Types.ObjectId(companyId),
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

export const addAdditionalItems = async (req, res) => {
  try {
    const { clientId, items, totalAmount } = req.body;
    
    
    

    if (!clientId || !items || items.length === 0) {
      return res.status(400).json({ message: "Invalid data provided" });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    const company = await Agency.findById(client.companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    // Fetch SGST and CGST percentages from the company and default to 0 if not available
    const sgstRate = company.sgstPercentage ? company.sgstPercentage / 100 : 0;
    const cgstRate = company.cgstPercentage ? company.cgstPercentage / 100 : 0;
     // Clear existing additionalItems
     client.additionalItems = [];
     
    // Add new items to the client's additionalItems field
    client.additionalItems.push(...items);
     // Calculate total cost with additional amount and fix to 2 decimal places
    const totalCostWithAdditionalAmount = parseFloat(
      (client.totalCost + totalAmount).toFixed(2)
    );
    
    const sgst = parseFloat((totalCostWithAdditionalAmount * sgstRate).toFixed(2));
    const cgst = parseFloat((totalCostWithAdditionalAmount * cgstRate).toFixed(2));
    

    // Update `amountToBePaid`
    const amountToBePaid = parseFloat(
      (totalCostWithAdditionalAmount + sgst + cgst).toFixed(2)
    );
    

    // Update client details
    client.totalCostWithAdditionalAmount = totalCostWithAdditionalAmount;
    client.amountToBePaid = amountToBePaid;
    client.balance = amountToBePaid;
    client.sgst = sgst;
    client.cgst = cgst;

    await client.save();

    res.status(200).json({ message: "Additional items added successfully", client });
  } catch (error) {
    console.error("Error adding additional items:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getAdditionalItems = async (req, res) => {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res.status(400).json({ message: "Client ID is required" });
    }

    // Find client and select only additionalItems field
    const client = await Client.findById(clientId).select("additionalItems");

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    if (!client.additionalItems || client.additionalItems.length === 0) {
      return res.status(404).json({ message: "No additional items added for this client" });
    }

    res.status(200).json({ success: true, additionalItems: client.additionalItems });
  } catch (error) {
    console.error("Error fetching additional items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const deleteAllAdditionalItems = async (req, res) => {
  try {
    const { clientId } = req.body;

    if (!clientId) {
      return res.status(400).json({ message: "Client ID is required" });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    // Fetch the company separately using the companyId from the client
    const company = await Agency.findById(client.companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

   // Fetch SGST and CGST percentages from the company and default to 0 if not available
   const sgstRate = company.sgstPercentage ? company.sgstPercentage / 100 : 0;
   const cgstRate = company.cgstPercentage ? company.cgstPercentage / 100 : 0;

    // Clear existing additional items
    client.additionalItems = [];

    // Keep `client.totalCost` unchanged
    const totalCostWithAdditionalAmount = parseFloat(client.totalCost.toFixed(2));
    const sgst = parseFloat((totalCostWithAdditionalAmount * sgstRate).toFixed(2));
    const cgst = parseFloat((totalCostWithAdditionalAmount * cgstRate).toFixed(2));

    // Recalculate amount to be paid
    const amountToBePaid = parseFloat(
      (totalCostWithAdditionalAmount + sgst + cgst).toFixed(2)
    );

    // Update client details
    client.totalCostWithAdditionalAmount = totalCostWithAdditionalAmount;
    client.amountToBePaid = amountToBePaid;
    client.balance = amountToBePaid;
    client.sgst = sgst;
    client.cgst = cgst;

    await client.save();

    res.status(200).json({ message: "All additional items deleted successfully", client });
  } catch (error) {
    console.error("Error deleting additional items:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const downloadItineraryByBilling = async (req, res) => {
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
export const downloadCustomItineraryByBilling = async (req, res) => {
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
    const downloadDate =
      itineraries.length > 0 ? itineraries[0].downloadDate : null;
    

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

export const downloadInvoiceByBilling = async (req, res) => {
  const { clientId, amount, paymentMode, transactionId, senderName, discount } =
    req.body;

  if (!clientId) {
    return res.status(400).json({ message: "Client ID is required" });
  }

  try {
    // Step 1: Find the current client using the clientId
    const currentClient = await Client.findById(clientId).populate("companyId");
    if (!currentClient) {
      return res.status(404).json({ message: "Client not found" });
    }
    const company = currentClient.companyId;
    console.log(company, "company in billing with discount");
    const validAmount =
      (Number(amount) > 0 &&
        paymentMode &&
        (paymentMode === "Cash" ||
          (transactionId && transactionId.trim() !== "")) &&
        senderName &&
        senderName.trim() !== "") ||
      currentClient.amountPaid > 0;
    if (!validAmount) {
      return res
        .status(400)
        .json({ message: "Cannot download invoice without advance payment." });
    }
    if (discount && discount > 0) {
      currentClient.discount = discount;

      // Calculate total cost after applying discount
      const totalCostWithAdditionalAmount =
        currentClient.totalCostWithAdditionalAmount || 0;
      const totalCostWithAdditionalAmountWithDiscount = Math.max(
        totalCostWithAdditionalAmount - discount,
        0
      );

      console.log(
        "Total after discount:",
        totalCostWithAdditionalAmountWithDiscount
      );

      // Calculate SGST and CGST (2.5% each)
      const sgstRate = company.sgstPercentage
        ? company.sgstPercentage / 100
        : 0;
      const cgstRate = company.cgstPercentage
        ? company.cgstPercentage / 100
        : 0;
      const sgst = parseFloat(
        (totalCostWithAdditionalAmountWithDiscount * sgstRate).toFixed(2)
      );
      const cgst = parseFloat(
        (totalCostWithAdditionalAmountWithDiscount * cgstRate).toFixed(2)
      );

      console.log("SGST:", sgst, "CGST:", cgst);

      // Update `amountToBePaid`
      const amountToBePaid = parseFloat(
        (totalCostWithAdditionalAmountWithDiscount + sgst + cgst).toFixed(2)
      );

      console.log("Amount to be paid:", amountToBePaid);

      currentClient.amountToBePaid = amountToBePaid;
      currentClient.balance = amountToBePaid;
      currentClient.sgst = sgst;
      currentClient.cgst = cgst;
      await currentClient.save();
    }

    const companyId = currentClient.companyId._id;

    // Step 2: Find all clients associated with the same companyId
    const companyClients = await Client.find({ companyId });

    // Step 3: Determine the maximum invoice number in the company
    const maxInvoiceNumber = companyClients.reduce((max, client) => {
      return client.invoiceNumber > max ? client.invoiceNumber : max;
    }, 0);

    // Step 4: Assign invoice number to the current client if not already assigned
    if (!currentClient.invoiceNumber) {
      currentClient.invoiceNumber = maxInvoiceNumber + 1 || 1;
      await currentClient.save();
    }
    if (!currentClient.invoiceDate) {
      const currentDate = new Date();
      currentDate.setUTCHours(0, 0, 0, 0);
      const formattedDate = `${String(currentDate.getDate()).padStart(
        2,
        "0"
      )}/${String(currentDate.getMonth() + 1).padStart(
        2,
        "0"
      )}/${currentDate.getFullYear()}`;

      currentClient.invoiceDate = formattedDate;
      currentClient.invoiceDateAt = currentDate;
      await currentClient.save();
    }
    ///////
    const frontOfficerId = currentClient.frontOfficerId;
    if (frontOfficerId) {
      const frontOfficer = await FrontOffice.findById(frontOfficerId);

      if (frontOfficer) {
        // Check if salesPoints array exists
        if (!frontOfficer.salesPoints) {
          frontOfficer.salesPoints = [];
        }

        // Check if this clientId is already present
        const alreadyAdded = frontOfficer.salesPoints.some(
          (point) => point.clientId.toString() === clientId.toString()
        );

        if (!alreadyAdded) {
          frontOfficer.salesPoints.push({
            clientId: currentClient._id,
            date: new Date().setUTCHours(0, 0, 0, 0), // Current date
            awardedPoint: 1, // 1 point
          });

          await frontOfficer.save();
        }
      }
    }
    if (!currentClient.totalCostWithAdditionalAmount) {
      return res
        .status(400)
        .json({
          message:
            "Invoice cannot be generated: total cost information is missing for this client.",
        });
    }

    // Step 5: Generate the PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice_${currentClient.invoiceNumber}.pdf`
    );

    // Pipe the PDF into the response
    doc.pipe(res);
    // Add a black border around the page
    const borderMargin = 15; // Margin inside the page for the border
    doc
      .rect(
        borderMargin,
        borderMargin,
        doc.page.width - borderMargin * 2,
        doc.page.height - borderMargin * 2
      ) // Adjust border position
      .strokeColor("#000") // Black color for border
      .lineWidth(2) // Border thickness
      .stroke(); // Draw the border

    // Draw a light blue top line with a thin gap from the border
    const gap = 2; // Thin gap size
    const topLineHeight = 30; // Height of the light blue line
    const lightBlueY = borderMargin + gap; // Y-coordinate for the light blue line

    // Draw a light blue top line with a thin gap from the border
    doc
      .rect(
        borderMargin + gap, // Shift right to create a gap from the left border
        lightBlueY, // Y-coordinate for the top line
        doc.page.width - (borderMargin + gap) * 2, // Adjust width to account for gaps on both sides
        topLineHeight // Height of the light blue line
      )
      .fill("#D6EDF7") // Light blue color
      .stroke();

    // Add "INVOICE" text inside the light blue area
    const invoiceTextX = borderMargin + gap + 230; // X-coordinate for the text, slightly offset from the left
    const invoiceTextY = lightBlueY + topLineHeight / 2 - 10; // Y-coordinate to center the text vertically

    doc
      .fontSize(28) // Font size for the heading
      .font("Helvetica-Bold") // Bold font for the heading
      .fillColor("#6CA0DC") // Light blue color for the text
      .text("INVOICE", invoiceTextX, invoiceTextY); // Place the text inside the top blue area

    // Add Company Details (Left Side)
    //const company = currentClient.companyId;
    const leftX = 30; // Left section starting X-coordinate
    const topY = 60; // Top margin for text

    // Company Name in Light Blue
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .fillColor("#6CA0DC") // Light blue color
      .text(company.name.toUpperCase(), leftX, topY);

    // Remaining Company Details in Normal Style
    doc
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#000") // Black text
      .text(`Email:  ${company.email}`, leftX, topY + 23)
      .text(`Phone: ${company.mobileNumber}`, leftX, topY + 43)
      .text(
        `Address: ${company.district}, ${company.state},${company.pincode}`,
        leftX,
        topY + 63
      );
    // Conditionally add GST Number only if it exists
    if (company.gstNumber) {
      doc.text(`GST No: ${company.gstNumber}`, leftX, topY + 83);
    }

    const rightX = doc.page.width - borderMargin - 250; // Right section starting X-coordinate

    // Attempt to fetch and add the company logo
    try {
      const imageBuffer = await fetchImageBuffer(company.logo);
      // Add company logo at the position where 'INVOICE' was previously placed
      doc.image(imageBuffer, doc.page.width - 280, topY - 30, { width: 150 });
    } catch (error) {
      console.error("Error loading logo:", error.message);
    }

    doc
      .fontSize(12)
      .font("Helvetica")
      .fillColor("#000") // Black text
      .text(`No: ${currentClient.invoiceNumber}`, rightX, topY + 60)
      .text(`Date: ${currentClient.invoiceDate}`, rightX, topY + 80);

    // Draw a light blue line below both sections
    doc
      .rect(borderMargin, topY + 98, doc.page.width - borderMargin * 2, 15) // Adjust width to fit within border
      .fill("#EFF7FB") // Light blue color
      .fill(); // Fill only, no stroke

    // Draw the border rectangle on top
    doc
      .rect(borderMargin, topY + 98, doc.page.width - borderMargin * 2, 15) // Same positioning
      .strokeColor("#000") // Black border color
      .lineWidth(1.5) // Very thin border
      .stroke(); // Stroke only, no fill

    // Add "Customer" Section on Left
    const customerY = topY + 120; // Starting position for the customer section
    const customerText = "CUSTOMER";

    // Draw "CUSTOMER" heading with underline
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#6CA0DC")
      .text(customerText, leftX, customerY, { underline: false }); // Draw text without underline

    // Calculate the width of the text to match the underline length
    const customerTextWidth = doc.widthOfString(customerText);

    // Draw underline immediately below the text
    doc
      .moveTo(leftX, customerY + doc.currentLineHeight()) // Start underline at text bottom
      .lineTo(leftX + customerTextWidth, customerY + doc.currentLineHeight()) // Match text width
      .stroke("#6CA0DC"); // Apply light blue color to the underline

    // Add Customer Details
    // Add "ID" with text and underline
    const underlineLength = 200;
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#000") // Black text color
      .text(`ID: ${currentClient.clientId}`, leftX, customerY + 30); // Render the text
    doc
      .moveTo(leftX, customerY + 30 + doc.currentLineHeight()) // Start underline at text bottom
      .lineTo(leftX + underlineLength, customerY + 30 + doc.currentLineHeight()) // Match text width
      .lineWidth(1)
      .stroke("#000"); // Light blue underline

    // Add "Name" with text and underline
    doc.text(
      `Name: ${currentClient.name.toUpperCase()}`,
      leftX,
      customerY + 50
    ); // Render the text
    doc
      .moveTo(leftX, customerY + 50 + doc.currentLineHeight())
      .lineTo(leftX + underlineLength, customerY + 50 + doc.currentLineHeight())
      .lineWidth(1)
      .stroke("#000");

    // Add "Address" with text and underline
    doc.text(
      `Address: ${currentClient.district.toUpperCase()}, ${currentClient.state.toUpperCase()}`,
      leftX,
      customerY + 70
    ); // Render the text
    doc
      .lineWidth(1)
      .moveTo(leftX, customerY + 70 + doc.currentLineHeight())
      .lineTo(leftX + underlineLength, customerY + 70 + doc.currentLineHeight())
      .stroke("#000");

    // Add "Pincode" with text and underline
    doc.text(`Pincode: ${currentClient.pincode}`, leftX, customerY + 90); // Render the text
    doc
      .moveTo(leftX, customerY + 90 + doc.currentLineHeight())
      .lineTo(leftX + underlineLength, customerY + 90 + doc.currentLineHeight())
      .stroke("#000");

    // Check if GST Number exists before displaying
    const gstNumberText = currentClient.gstNumber
      ? `GST No: ${currentClient.gstNumber}`
      : "GST No: N/A"; // Show "N/A" if GST Number is not available

    // Add GST Number with underline
    doc.text(gstNumberText, leftX, customerY + 110);
    doc
      .moveTo(leftX, customerY + 110 + doc.currentLineHeight())
      .lineTo(
        leftX + underlineLength,
        customerY + 110 + doc.currentLineHeight()
      )
      .stroke("#000");
    // Add "Tour" Section on Right
    const tourX = rightX; // Starting X-coordinate for the tour section
    const tourText = "TOUR";

    // Draw "TOUR" heading with underline
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#6CA0DC")
      .text(tourText, tourX, customerY, { underline: false }); // Draw text without underline

    // Calculate the width of the text to match the underline length
    const tourTextWidth = doc.widthOfString(tourText);

    // Draw underline immediately below the text
    doc
      .moveTo(tourX, customerY + doc.currentLineHeight()) // Start underline at text bottom
      .lineTo(tourX + tourTextWidth, customerY + doc.currentLineHeight()) // Match text width
      .stroke("#6CA0DC"); // Apply light blue color to the underline

    if (currentClient.itineraryDetails.clientName) {
      const itinerary = currentClient.itineraryDetails;

      // Render Fixed Tour Details with underline
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#000")
        .text(`Destination: ${itinerary.destination}`, tourX, customerY + 30);
      doc
        .moveTo(tourX, customerY + 30 + doc.currentLineHeight())
        .lineTo(
          tourX + underlineLength,
          customerY + 30 + doc.currentLineHeight()
        )
        .stroke("#000");

      doc.text(`Tour Type: ${itinerary.heading}`, tourX, customerY + 50);
      doc
        .moveTo(tourX, customerY + 50 + doc.currentLineHeight())
        .lineTo(
          tourX + underlineLength,
          customerY + 50 + doc.currentLineHeight()
        )
        .stroke("#000");

      doc.text(
        `Article No: ${itinerary.articleNumber.toUpperCase()}`,
        tourX,
        customerY + 70
      );
      doc
        .moveTo(tourX, customerY + 70 + doc.currentLineHeight())
        .lineTo(
          tourX + underlineLength,
          customerY + 70 + doc.currentLineHeight()
        )
        .stroke("#000");

      doc.text(`Duration: ${itinerary.duration}`, tourX, customerY + 90);
      doc
        .moveTo(tourX, customerY + 90 + doc.currentLineHeight())
        .lineTo(
          tourX + underlineLength,
          customerY + 90 + doc.currentLineHeight()
        )
        .stroke("#000");

      doc.text(`Tour Date: ${itinerary.date}`, tourX, customerY + 110);
      doc
        .moveTo(tourX, customerY + 110 + doc.currentLineHeight())
        .lineTo(
          tourX + underlineLength,
          customerY + 110 + doc.currentLineHeight()
        )
        .stroke("#000");
    } else {
      // const destination = currentClient.primaryTourName.label.toUpperCase();
      const destination = (
        currentClient.confirmedDestination?.name ||
        currentClient.primaryTourName?.label
      )?.toUpperCase();
      const daysAndNights = `${currentClient.numberOfDays} Day/ ${
        currentClient.numberOfDays - 1
      } Night`;

      // Format startDate to "dd-mm-yyyy"
      const formattedStartDate = new Date(
        currentClient.startDate
      ).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      // Render Custom Tour Details with underline
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#000")
        .text(`Destination: ${destination}`, tourX, customerY + 30);
      doc
        .moveTo(tourX, customerY + 30 + doc.currentLineHeight())
        .lineTo(
          tourX + underlineLength,
          customerY + 30 + doc.currentLineHeight()
        )
        .stroke("#000");

      doc.text(`Tour Type: CUSTOM TOUR`, tourX, customerY + 50);
      doc
        .moveTo(tourX, customerY + 50 + doc.currentLineHeight())
        .lineTo(
          tourX + underlineLength,
          customerY + 50 + doc.currentLineHeight()
        )
        .stroke("#000");

      doc.text(`Article No: N/A`, tourX, customerY + 70); // Add default Article No
      doc
        .moveTo(tourX, customerY + 70 + doc.currentLineHeight())
        .lineTo(
          tourX + underlineLength,
          customerY + 70 + doc.currentLineHeight()
        )
        .stroke("#000");

      doc.text(`Duration: ${daysAndNights}`, tourX, customerY + 90);
      doc
        .moveTo(tourX, customerY + 90 + doc.currentLineHeight())
        .lineTo(
          tourX + underlineLength,
          customerY + 90 + doc.currentLineHeight()
        )
        .stroke("#000");

      doc.text(`Tour Date: ${formattedStartDate}`, tourX, customerY + 110);
      doc
        .moveTo(tourX, customerY + 110 + doc.currentLineHeight())
        .lineTo(
          tourX + underlineLength,
          customerY + 110 + doc.currentLineHeight()
        )
        .stroke("#000");
    }

    // Draw a light blue line below both sections
    doc
      .rect(borderMargin, topY + 250, doc.page.width - borderMargin * 2, 15) // Positioning the line below both sections
      .fill("#EFF7FB") // Light blue color
      .fill(); // Fill only, no stroke

    // Draw the border rectangle on top
    doc
      .rect(borderMargin, topY + 250, doc.page.width - borderMargin * 2, 15) // Same positioning
      .strokeColor("#000") // Black border color
      .lineWidth(1.5) // Very thin border
      .stroke(); // Stroke only, no fill

    // After the line below "Customer" and "Tour" sections
    const tableTopY = topY + 290; // Starting Y-coordinate for the table
    const tableLeftX = 20; // Starting X-coordinate for the table
    const columnWidths = [28, 292, 55, 35, 80, 80]; // Define column widths (SL NO, DESCRIPTION, QTY, RATE, AMOUNT)
    const rowHeight = 20; // Height of each row

    // Define helper functions for drawing lines
    const drawHorizontalLine = (y) => {
      doc
        .moveTo(tableLeftX, y)
        .lineTo(tableLeftX + columnWidths.reduce((a, b) => a + b), y)
        .stroke("#000");
    };

    const drawVerticalLine = (xStart, yStart, yEnd) => {
      doc.moveTo(xStart, yStart).lineTo(xStart, yEnd).stroke("#000");
    };

    // Draw the table header

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#6CA0DC") // Black text color for header
      .text("NO", tableLeftX + 5, tableTopY + 5, {
        width: columnWidths[0] - 10,
        align: "center",
      })
      .text("DESCRIPTION", tableLeftX + columnWidths[0] + 5, tableTopY + 5, {
        width: columnWidths[1] - 10,
        align: "center",
      })
      .text(
        "SAC",
        tableLeftX + columnWidths[0] + columnWidths[1] + 5,
        tableTopY + 5,
        { width: columnWidths[2] - 10, align: "center" }
      )
      .text(
        "QTY",
        tableLeftX + columnWidths[0] + columnWidths[1] + columnWidths[2] + 5,
        tableTopY + 5,
        { width: columnWidths[3] - 10, align: "center" }
      )
      .text(
        "RATE",
        tableLeftX +
          columnWidths[0] +
          columnWidths[1] +
          columnWidths[2] +
          columnWidths[3] +
          5,
        tableTopY + 5,
        { width: columnWidths[4] - 10, align: "center" }
      )
      .text(
        "AMOUNT",
        tableLeftX +
          columnWidths[0] +
          columnWidths[1] +
          columnWidths[2] +
          columnWidths[3] +
          columnWidths[4] +
          5,
        tableTopY + 5,
        { width: columnWidths[5] - 10, align: "center" }
      );

    // Draw horizontal line below the header
    drawHorizontalLine(tableTopY + rowHeight);

    // Draw the table row
    const secondRowY = tableTopY + rowHeight; // Y-coordinate for the second row
    doc
      .fontSize(12)
      .font("Helvetica")
      .fillColor("#000") // Black text for data
      .text("1", tableLeftX + 5, secondRowY + 8, {
        width: columnWidths[0] - 10,
        align: "center",
      })
      .text(
        currentClient.itineraryDetails.clientName
          ? currentClient.itineraryDetails.tourName
          : "CUSTOM TOUR",
        // : currentClient.primaryTourName.label.toUpperCase(),

        tableLeftX + columnWidths[0] + 5,
        secondRowY + 5,
        { width: columnWidths[1] - 10, align: "center" }
      )
      .text(
        company.sacNumber || "N/A", // SAC value
        tableLeftX + columnWidths[0] + columnWidths[1] + 5,
        secondRowY + 5,
        { width: columnWidths[2] - 10, align: "center" }
      )
      .text(
        currentClient.numberOfPersons.toString(),
        tableLeftX + columnWidths[0] + columnWidths[1] + columnWidths[2] + 5,
        secondRowY + 5,
        { width: columnWidths[3] - 10, align: "center" }
      )
      .text(
        currentClient.itineraryDetails.clientName
          ? currentClient.itineraryDetails.pricePerHead.toFixed(2)
          : (currentClient.totalCost / currentClient.numberOfPersons).toFixed(
              2
            ),
        tableLeftX +
          columnWidths[0] +
          columnWidths[1] +
          columnWidths[2] +
          columnWidths[3] +
          5,
        secondRowY + 5,
        { width: columnWidths[4] - 10, align: "center" }
      )
      .text(
        currentClient.itineraryDetails.clientName
          ? currentClient.itineraryDetails.totalCost.toFixed(2)
          : currentClient.totalCost.toFixed(2),
        tableLeftX +
          columnWidths[0] +
          columnWidths[1] +
          columnWidths[2] +
          columnWidths[3] +
          columnWidths[4] +
          5,
        secondRowY + 5,
        { width: columnWidths[5] - 10, align: "center" }
      );

    // Draw horizontal line below the row
    drawHorizontalLine(secondRowY + rowHeight);

    // Draw vertical lines for the table columns
    let currentX = tableLeftX;
    columnWidths.forEach((width) => {
      drawVerticalLine(currentX, tableTopY, secondRowY + rowHeight); // Draw vertical line for each column
      currentX += width;
    });

    // Draw rightmost vertical line to close the table
    drawVerticalLine(currentX, tableTopY, secondRowY + rowHeight);

    // Draw outer borders for the table
    drawHorizontalLine(tableTopY); // Top border
    drawHorizontalLine(secondRowY + rowHeight); // Bottom border

    // Position for additional rows below the first row
    let additionalRowY = secondRowY + rowHeight;

    // Loop through additionalItems and add them dynamically
    currentClient.additionalItems.forEach((item, index) => {
      doc
        .fontSize(12)
        .font("Helvetica")
        .fillColor("#000") // Black text for data
        // .text((index + 2).toString(), tableLeftX + 5, additionalRowY + 5, {
        //   width: columnWidths[0] - 10,
        //   align: "center",
        // })
        // .text(item.description, tableLeftX + columnWidths[0] + 5, additionalRowY + 5, {
        //   width: columnWidths[1] - 10,
        //   align: "center",
        // })

        // .text(item.qty.toString(), tableLeftX + columnWidths[0] + columnWidths[1] + 5, additionalRowY + 5, {
        //   width: columnWidths[2] - 10,
        //   align: "center",
        // })
        // .text(item.rate.toFixed(2), tableLeftX + columnWidths[0] + columnWidths[1] + columnWidths[2] + 5, additionalRowY + 5, {
        //   width: columnWidths[3] - 10,
        //   align: "center",
        // })
        // .text(item.amount.toFixed(2), tableLeftX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3] + 5, additionalRowY + 5, {
        //   width: columnWidths[4] - 10,
        //   align: "center",
        // });
        .text((index + 2).toString(), tableLeftX + 5, additionalRowY + 5, {
          width: columnWidths[0] - 10,
          align: "center",
        })
        .text(
          item.description,
          tableLeftX + columnWidths[0] + 5,
          additionalRowY + 5,
          {
            width: columnWidths[1] - 10,
            align: "center",
          }
        )
        .text(
          company.sacNumber || "N/A",
          tableLeftX + columnWidths[0] + columnWidths[1] + 5,
          additionalRowY + 5,
          {
            width: columnWidths[2] - 10,
            align: "center",
          }
        )

        .text(
          item.qty.toString(),
          tableLeftX + columnWidths[0] + columnWidths[1] + columnWidths[2] + 5,
          additionalRowY + 5,
          {
            width: columnWidths[3] - 10,
            align: "center",
          }
        )
        .text(
          item.rate.toFixed(2),
          tableLeftX +
            columnWidths[0] +
            columnWidths[1] +
            columnWidths[2] +
            columnWidths[3] +
            5,
          additionalRowY + 5,
          {
            width: columnWidths[4] - 10,
            align: "center",
          }
        )
        .text(
          item.amount.toFixed(2),
          tableLeftX +
            columnWidths[0] +
            columnWidths[1] +
            columnWidths[2] +
            columnWidths[3] +
            columnWidths[4] +
            5,
          additionalRowY + 5,
          {
            width: columnWidths[5] - 10,
            align: "center",
          }
        );

      // Draw vertical lines for each additional row
      let currentX = tableLeftX;
      columnWidths.forEach((width) => {
        drawVerticalLine(currentX, additionalRowY, additionalRowY + rowHeight);
        currentX += width;
      });

      // Draw rightmost vertical line to close the row
      drawVerticalLine(currentX, additionalRowY, additionalRowY + rowHeight);

      // Draw horizontal line below the row
      drawHorizontalLine(additionalRowY + rowHeight);

      // Move Y position for next row
      additionalRowY += rowHeight;
    });

    // Recalculate totalRowY after all additional items
    let totalRowY = additionalRowY + 10; // Add spacing before totals

    // Draw the total and tax rows
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#000")
      .text(
        "TOTAL",
        tableLeftX +
          columnWidths[0] +
          columnWidths[1] +
          columnWidths[2] +
          columnWidths[3] +
          5,
        totalRowY,
        {
          width: columnWidths[4] - 10,
          align: "center",
        }
      )
      .text(
        currentClient.itineraryDetails.clientName
          ? currentClient.totalCostWithAdditionalAmount.toFixed(2)
          : currentClient.totalCostWithAdditionalAmount.toFixed(2),
        tableLeftX +
          columnWidths[0] +
          columnWidths[1] +
          columnWidths[2] +
          columnWidths[3] +
          columnWidths[4] +
          5,
        totalRowY,
        { width: columnWidths[5] - 10, align: "center" }
      );
    // If discount exists and is greater than 0, show the discount row
    if (currentClient.discount && currentClient.discount > 0) {
      doc
        .text(
          "DISCOUNT",
          tableLeftX +
            columnWidths[0] +
            columnWidths[1] +
            columnWidths[2] +
            columnWidths[3] +
            5,
          totalRowY + rowHeight,
          {
            width: columnWidths[4] - 10,
            align: "center",
          }
        )
        .text(
          currentClient.discount.toFixed(2),
          tableLeftX +
            columnWidths[0] +
            columnWidths[1] +
            columnWidths[2] +
            columnWidths[3] +
            columnWidths[4] +
            5,
          totalRowY + rowHeight,
          { width: columnWidths[5] - 10, align: "center" }
        );

      totalRowY += rowHeight; // Shift the next rows down if discount is displayed
    }
    // SGST row
    doc
      .text(
        `SGST ${company.sgstPercentage}%`,
        tableLeftX +
          columnWidths[0] +
          columnWidths[1] +
          columnWidths[2] +
          columnWidths[3] +
          5,
        totalRowY + rowHeight,
        {
          width: columnWidths[4] - 10,
          align: "center",
        }
      )
      .text(
        currentClient.sgst.toFixed(2),
        tableLeftX +
          columnWidths[0] +
          columnWidths[1] +
          columnWidths[2] +
          columnWidths[3] +
          columnWidths[4] +
          5,
        totalRowY + rowHeight,
        {
          width: columnWidths[5] - 10,
          align: "center",
        }
      );

    // CGST row
    doc
      .text(
        `CGST ${company.cgstPercentage}%`,
        tableLeftX +
          columnWidths[0] +
          columnWidths[1] +
          columnWidths[2] +
          columnWidths[3] +
          5,
        totalRowY + 2 * rowHeight,
        {
          width: columnWidths[4] - 10,
          align: "center",
        }
      )
      .text(
        currentClient.cgst.toFixed(2),
        tableLeftX +
          columnWidths[0] +
          columnWidths[1] +
          columnWidths[2] +
          columnWidths[3] +
          columnWidths[4] +
          5,
        totalRowY + 2 * rowHeight,
        {
          width: columnWidths[5] - 10,
          align: "center",
        }
      );

    // Grand Total row
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(
        "G.TOTAL",
        tableLeftX +
          columnWidths[0] +
          columnWidths[1] +
          columnWidths[2] +
          columnWidths[3] +
          5,
        totalRowY + 3 * rowHeight,
        {
          width: columnWidths[4] - 10,
          align: "center",
        }
      )
      .fontSize(14)
      .text(
        Math.ceil(currentClient.amountToBePaid),
        tableLeftX +
          columnWidths[0] +
          columnWidths[1] +
          columnWidths[2] +
          columnWidths[3] +
          columnWidths[4] +
          5,
        totalRowY + 3 * rowHeight,
        {
          width: columnWidths[5] - 10,
          align: "center",
        }
      );

    // Draw a light blue line below both sections
    doc
      .rect(
        borderMargin,
        totalRowY + 5 * rowHeight,
        doc.page.width - borderMargin * 2,
        15
      ) // Positioning the line below the "Grand Total"
      .fill("#EFF7FB") // Light blue color
      .fill(); // Fill only, no strok

    // Draw the border rectangle on top
    doc
      .rect(
        borderMargin,
        totalRowY + 5 * rowHeight,
        doc.page.width - borderMargin * 2,
        15
      ) // Same positioning
      .strokeColor("#000") // Black border color
      .lineWidth(1.5) // Very thin border
      .stroke(); // Stroke only, no fill

    // Set the starting Y-coordinate for the declaration section
    const declarationTopY = totalRowY + 5 * rowHeight + 20;

    // Add declaration text
    const declarationText = [
      "1. I hereby declare that the above-mentioned details are correct and true.",
      "2. A 25% deposit is required for booking a tour, and it is non-refundable.",
      "3. In the event that you need to change the tour date or postpone the tour, you will need to pay an additional fee.",
      "4. It is not possible to reschedule or postpone group tours.",
    ];

    // Set font and color for the declaration
    doc.fontSize(10).font("Helvetica").fillColor("#FF0000"); // Red color

    // Write each declaration point with some spacing
    declarationText.forEach((text, index) => {
      doc.text(text, tableLeftX, declarationTopY + index * 15, {
        width: doc.page.width - 60,
      });
    });

    // Add space for signature and company authorization
    const signatureY = declarationTopY + declarationText.length * 15 + 30; // Space after the declaration text
    const signatureLeftX = doc.page.width - 250; // Position on the right side

    // Add "For {company.name}" text
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#000") // Black text
      .text(`${company.name}`, signatureLeftX, signatureY);

    // Draw a horizontal line for signature
    const signatureLineY = signatureY + 30; // Space for signature
    doc
      .moveTo(signatureLeftX, signatureLineY)
      .lineTo(signatureLeftX + 150, signatureLineY) // Length of the signature line
      .stroke("#000"); // Black line

    // Add "Authorized Signature" below the line
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#000") // Black text
      .text("Authorized Signatory", signatureLeftX + 20, signatureLineY + 5); // Positioned below the signature line

    // Finalize and send the PDF
    doc.end();
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    res.status(500).json({
      message: "An error occurred while generating the invoice PDF.",
    });
  }
};

export const downloadVoucherByBilling = async (req, res) => {
  const {
    clientId,
    amount,
    paymentMode,
    transactionId,
    senderName,
    billingStaffId,
  } = req.body;

  const amountInNumber = parseFloat(amount);

  try {
    // Find the client using clientId
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found." });
    }
    // Check if the client has an invoiceNumber
    if (!client.invoiceNumber) {
      // If invoiceNumber is not found, stop execution and return an appropriate message
      return res.status(400).json({
        message: "Please generate an invoice before downloading the voucher.",
      });
    }

    // Extract companyId from the client
    const companyId = client.companyId;
    if (!companyId) {
      return res
        .status(400)
        .json({ message: "Company ID is missing for the client." });
    }

    // Find all vouchers for the company and calculate the maximum receipt number
    const vouchers = await Voucher.find({ companyId });
    const nextReceiptNumber =
      vouchers.length > 0
        ? Math.max(...vouchers.map((v) => v.receiptNumber)) + 1
        : 1;

    // Create a new voucher entry
    const voucher = new Voucher({
      clientId,
      companyId,
      amount,
      paymentMode,
      transactionId: paymentMode === "Cash" ? null : transactionId,
      senderName,
      receiptNumber: nextReceiptNumber,
    });

    await voucher.save();

    // Update client document
    client.amountPaid = parseFloat(((Number(client.amountPaid) || 0) + amountInNumber).toFixed(2)); // Increment amountPaid
    client.balance = parseFloat(((client.balance || 0) - amountInNumber).toFixed(2)); // Update balance

    client.bookedStatus = true; // Update bookedStatus to true
    await client.save();

    // Find the company using companyId
    const company = await Agency.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }
    // Find billing staff ID using billingStaffId
    const billingStaff = await Billing.findById(billingStaffId);
    if (!billingStaff) {
      return res
        .status(404)
        .json({ message: "Biller not found in the system." });
    }

    // Save the billing staff name in a variable
    const billingStaffName = billingStaff.name;
    // Find the CustomerCare with the least count for the matching tour
    if (!client.customerCareId) {
      const destinationId = client.confirmedDestination?.id;
      let customerCare = await CustomerCare.findOne({
        companyId: companyId,
        tourName: { $elemMatch: { _id: destinationId } },
      })
        .sort({ count: 1, createdAt: 1 }) // Least assigned first
        .exec();

      if (!customerCare) {
        customerCare = await CustomerCare.findOne({ companyId: companyId })
          .sort({ count: 1 }) // Still prefer least assigned
          .exec();

        if (!customerCare) {
          return res.status(400).json({
            message: "No customer care agent found in the company",
          });
        }
      }

      // Increment the count of the selected CustomerCare
      await CustomerCare.findByIdAndUpdate(customerCare._id, {
        $inc: { count: 1 },
      });

      client.customerCareId = customerCare._id;

      await client.save();
    }

    // Generate PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt_voucher_${voucher.receiptNumber}.pdf`
    );

    // Pipe the PDF into the response
    doc.pipe(res);

    // Add the "RECEIPT VOUCHER" heading with a light green background and black border
    const rectX = 30; // Starting X position of the rectangle
    const rectY = 20; // Starting Y position of the rectangle
    const rectWidth = doc.page.width - 60; // Width of the rectangle
    const rectHeight = 40; // Height of the rectangle

    // Draw the green background
    doc
      .rect(rectX, rectY, rectWidth, rectHeight)
      .fill("#A8E0A5") // Light green color
      .stroke(); // Stroke (outline) for the green background

    // Draw a black border around the green background and extend it to the bottom of the page
    const borderBottomY = doc.page.height; // The bottom of the page
    doc
      .rect(rectX, rectY, rectWidth, borderBottomY - rectY) // Extend the border from the green box to the bottom of the page
      .lineWidth(2) // Border width
      .strokeColor("#000") // Black border color
      .stroke(); // Apply the border

    // Add the "RECEIPT VOUCHER" text in the center of the green background
    doc
      .fontSize(20) // Font size for the heading
      .font("Helvetica-Bold") // Bold font
      .fillColor("#000") // Black color for text
      .text("RECEIPT VOUCHER", 0, 30, {
        align: "center", // Center the text
        width: doc.page.width, // Set the width to match the page
      });

      const leftX = 50; // Margin from the left
      const topY = 80; // Start position below the heading
      
      // Set font before measuring width
      doc.font("Helvetica-Bold").fontSize(16);
      
      // Measure the width of the company name
      const companyNameWidth = doc.widthOfString(company.name);
      
      // Measure the height of text (PDFKit default line height factor)
      const companyNameHeight = doc.currentLineHeight();
      
      // Draw a light green background matching the text size
      doc
        .rect(leftX, topY, companyNameWidth + 6, companyNameHeight + 8) // Add slight padding
        .fill("#A8E0A5");
      
      // Add the company name in bold black, centered within the background
      doc
        .fillColor("#000") // Black text color
        .text(company.name.toUpperCase(), leftX + 3, topY + 2); // Adjust padding for alignment
      
    // Add company address (pincode, district, and state) in uppercase below the name
    doc
      .fontSize(12)
      .font("Helvetica")
      .fillColor("#000")
      .text(
        `Address :  ${company.district.toUpperCase()}, ${company.state.toUpperCase()}, ${company.pincode.toUpperCase()}`,
        leftX,
        topY + 70
      );

    // Add company email and phone number below the address
    doc
      .text(`Email      : ${company.email}`, leftX, topY + 30)
      .text(`Phone    : ${company.mobileNumber}`, leftX, topY + 50);
      if (company.gstNumber) {
        doc
          .text(`GST No : ${company.gstNumber}`, leftX, topY + 90);
      }

    // Add company logo from URL
    try {
      const imageBuffer = await fetchImageBuffer(company.logo);
      doc.image(imageBuffer, doc.page.width - 210, topY, { width: 150 });
    } catch (error) {
      console.error("Error loading logo:", error.message);
    }
    // Draw the light green line
    const lineY = topY + 120; // Y position for the line
    const lineHeight = 14; // Height of the rectangle (thicker line)

    // Draw the green line
    doc
      .rect(rectX, lineY, rectWidth, lineHeight) // Full width with padding from left and right
      .fill("#DFFFE2"); // Light green color for the fill

    // Draw the black border around the green line
    doc
      .rect(rectX, lineY, rectWidth, lineHeight) // Same dimensions as the green line
      .lineWidth(2) // Black border thickness
      .strokeColor("#000") // Black color for the border
      .stroke(); // Apply the black border

    // Add two sections: left and right
    const sectionTopY = lineY + 40;
    const sectionGap = 20; // Spacing between lines
    const rightSectionX = doc.page.width / 2 + 80; // Start of the right section

    // Calculate the width of "RECEIVED FROM" for background
    const receivedFromWidth = doc.widthOfString("RECEIVED FROM", {
      fontSize: 14,
      font: "Helvetica-Bold",
    });

    // Draw light green background for "RECEIVED FROM"
    doc
      .rect(leftX - 5, sectionTopY - 5, receivedFromWidth + 30, 20) // Padding for better spacing
      .fill("#A8E0A5"); // Light green background

    // Add heading for the left section
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#000")
      .text("RECEIVED FROM:", leftX, sectionTopY);

    // Fill in client details under the left section
    doc
      .fontSize(12)
      .font("Helvetica")

      .text(`ID         : ${client.clientId}`, leftX, sectionTopY + sectionGap)
      
      .text(`Name   : ${client.name}`, leftX, sectionTopY + sectionGap * 2)
      .text(`PaidBy  : ${senderName}`,leftX, sectionTopY + sectionGap * 3) 
      .text(
        `GST No: ${client.gstNumber ? client.gstNumber.toUpperCase() : "N/A"}`, // Show GST if available, otherwise "N/A"
        leftX,
        sectionTopY + sectionGap * 4
      )
      .text(
        `Address: ${client.pincode.toUpperCase()}, ${client.district.toUpperCase()}`,
        leftX,
        sectionTopY + sectionGap * 5
      )

      
    const todayDate = new Date().toLocaleDateString();
    // Add Date on the right section
    doc
      .fontSize(12)
      .font("Helvetica")
      .fillColor("#000")
      .text(`Date               : ${todayDate}`, rightSectionX-10, sectionTopY + sectionGap * 1);

    // doc.text(
    //     `Paid By          : ${senderName}`,
    //     rightSectionX-10,
    //     sectionTopY + sectionGap
    //   );
    // Add Invoice No.
    doc.text(
      `Invoice No      : ${client.invoiceNumber}`,
      rightSectionX-10,
      sectionTopY + sectionGap * 2
    );
    // Add Receipt No.
    doc.text(
      `Receipt No     : ${nextReceiptNumber}`,
      rightSectionX-10,
      sectionTopY + sectionGap * 3
    );
    doc.text(
      `Transaction ID: ${transactionId || "Cash"}`,
      rightSectionX-10,
      sectionTopY + sectionGap * 4
    );

    // Calculate Y position for the new line below "RECEIVED FROM" section
    const receivedFromLineY = sectionTopY + sectionGap * 5 + 20; // Adjust based on spacing from the last text
    const receivedFromLineHeight = 14; // Height of the rectangle (thicker line)

    // Draw the green line
    doc
      .rect(rectX, receivedFromLineY, rectWidth, receivedFromLineHeight) // Full width with padding from left and right
      .fill("#DFFFE2"); // Light green color for the fill

    // Draw the black border around the green line
    doc
      .rect(rectX, receivedFromLineY, rectWidth, receivedFromLineHeight) // Same dimensions as the green line
      .lineWidth(2) // Black border thickness
      .strokeColor("#000") // Black color for the border
      .stroke(); // Apply the black border

    // Draw a background for the "Amount (Received)" and the amount
    const amountSectionY = receivedFromLineY + 40; // Start below the line
    const amountSectionHeight = 30;

    // Draw the light green background for the amount section
    doc
      .rect(
        leftX,
        amountSectionY,
        doc.page.width - 2 * leftX,
        amountSectionHeight
      )
      .fill("#A8E0A5");

    // Add the label "Amount (Received)" on the left
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#000")
      .text("Amount (Received)", leftX + 10, amountSectionY + 7);

    // Add the amount from req.body on the right side
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#000")
      .text(`${amount}/-`, doc.page.width - leftX - 100, amountSectionY + 7, {
        align: "center",
      });

    // Calculate the Y position for the table
    const tableTopY = amountSectionY + amountSectionHeight + 20; // Start below the amount section

    // Set the table header and data
    const tableHeaders = [
      "Total Due Amount",
      "Total Amount Paid",
      "Balance Due",
    ];
    const tableValues = [
      client.amountToBePaid,
      client.amountPaid,
      client.balance,
    ];

    // Column width (distribute equally across the page)
    const columnWidth = (doc.page.width - 2 * leftX) / 3;

    // Draw the table header (headings)
    tableHeaders.forEach((header, index) => {
      // Draw the header cell
      doc
        .rect(leftX + index * columnWidth, tableTopY, columnWidth, 20) // Rectangle for each header
        .stroke(); // Border for each header cell

      // Add header text
      doc
        .fontSize(12)
        .font("Helvetica")
        .fillColor("#000")
        .text(header, leftX + index * columnWidth + 5, tableTopY + 5); // Add padding for text inside cell
    });

    // Move to the next row (for values)
    const tableRowY = tableTopY + 25; // Add some space below the header row

    // Draw the table values row
    tableValues.forEach((value, index) => {
      // Draw the value cell
      doc
        .rect(leftX + index * columnWidth, tableRowY, columnWidth, 20) // Rectangle for each value
        .stroke(); // Border for each value cell

      // Add value text
      doc
        .fontSize(12)
        .font("Helvetica")
        .fillColor("#000")
        .text(value, leftX + index * columnWidth + 5, tableRowY + 5); // Add padding for text inside cell
    });
    // Calculate the Y position for the light green line below the table
    const tableBottomY = tableRowY + 50; // Adjust spacing if needed
    const tableLineHeight = 14; // Height of the rectangle (thicker line)

    doc
      .rect(rectX, tableBottomY, rectWidth, tableLineHeight) // Full width with padding from left and right
      .fill("#DFFFE2"); // Light green color for the fill

    // Draw the black border around the green line
    doc
      .rect(rectX, tableBottomY, rectWidth, tableLineHeight) // Same dimensions as the green line
      .lineWidth(2) // Black border thickness
      .strokeColor("#000") // Black color for the border
      .stroke(); // Apply the black border

    // Define second table headers and starting position
    const secondTableHeaders = ["UPI", "CASH", "IMPS", "NEFT"];
    const secondTableTopY = tableBottomY + tableLineHeight + 30; // Start below the light green line

    // Column width for the second table (distribute equally across the page)
    const secondColumnWidth =
      (doc.page.width - 2 * leftX) / secondTableHeaders.length;

    // Draw the second table header
    secondTableHeaders.forEach((header, index) => {
      const columnX = leftX + index * secondColumnWidth; // X position for each column

      // Draw the header cell
      doc
        .rect(columnX, secondTableTopY, secondColumnWidth, 20) // Rectangle for the header
        .stroke(); // Draw the border

      // Add the header text
      doc
        .fontSize(12)
        .font("Helvetica")
        .fillColor("#000")
        .text(header, columnX + 5, secondTableTopY + 5, {
          width: secondColumnWidth - 10,
          align: "center",
        }); // Add padding and alignment
    });

    // Draw the single row for payment mode
    const secondTableRowY = secondTableTopY + 25; // Position below the header row

    secondTableHeaders.forEach((header, index) => {
      const columnX = leftX + index * secondColumnWidth; // X position for each column

      // Determine the fill color based on whether the header matches `paymentMode`
      const fillColor =
        header === paymentMode.toUpperCase() ? "#00FF00" : "#FF0000"; // Green for "YES", Red for "NO"

      // Draw the cell
      doc
        .rect(columnX, secondTableRowY, secondColumnWidth, 20) // Rectangle for the cell
        .stroke(); // Draw the border

      // Add the text ("YES" or "NO")
      doc
        .fontSize(12)
        .font("Helvetica")
        .fillColor(fillColor)
        .text(
          header === paymentMode.toUpperCase() ? "YES" : "NO",
          columnX + 5,
          secondTableRowY + 5,
          { width: secondColumnWidth - 10, align: "center" }
        );
    });

    // --- Light Green Line below second table ---
    const tableBottomYY = secondTableRowY + 50;
    const tableLineHeightt = 14;

    doc
      .rect(rectX, tableBottomYY, rectWidth, tableLineHeightt) // Full width with padding from left and right
      .fill("#DFFFE2"); // Light green color for the fill

    // Draw the black border around the green line
    doc
      .rect(rectX, tableBottomYY, rectWidth, tableLineHeightt) // Same dimensions as the green line
      .lineWidth(2) // Black border thickness
      .strokeColor("#000") // Black color for the border
      .stroke(); // Apply the black border

    // --- ACCOUNTS MANAGER Section ---
    const accountsManagerY = tableBottomYY + tableLineHeightt + 30;
    const leftColumnX = leftX;

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#000")
      .text("ACCOUNTS MANAGER", leftColumnX, accountsManagerY);

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#000")
      .text("Name:", leftColumnX, accountsManagerY + 20)
      .text("Sign:", leftColumnX, accountsManagerY + 40);

    // --- CASHIER Section ---
    const cashierY = tableBottomYY + tableLineHeightt + 30;
    const rightColumnX = doc.page.width - leftX - 150; // Adjust for positioning

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#000")
      .text("CASHIER", rightColumnX, cashierY);

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#000")
      .text(`Name: ${billingStaffName}`, rightColumnX, cashierY + 20)
      .text("Sign:", rightColumnX, cashierY + 40);

    // Finalize the PDF and end the stream
    doc.end();
  } catch (error) {
    console.error("Error generating voucher PDF:", error);
    res.status(500).json({
      message: "An error occurred while generating the voucher PDF.",
    });
  }
};

export const getBookedClientsByBilling = async (req, res) => {
  try {
    const {
      clientId,
      mobileNumber,
      page = 1,
      limit = 5,
      companyId,
      balanceStatus,
    } = req.query;

    const matchFilters = {
      companyId: new mongoose.Types.ObjectId(companyId),
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

export const getTransactions = async (req, res) => {
  const { clientId, page = 1 } = req.query; // Get clientId and page from query params
  const pageSize = 4; // Define the number of transactions per page
  const skip = (page - 1) * pageSize; // Calculate how many transactions to skip

  try {
    const clientObjectId = mongoose.Types.ObjectId.isValid(clientId)
      ? new mongoose.Types.ObjectId(clientId)
      : clientId;

    // Fetch paginated transactions for the given clientId
    const transactions = await Voucher.find({ clientId: clientObjectId })
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 }); // Sort by createdAt in descending order

    // Get the total number of transactions
    const totalTransactions = await Voucher.countDocuments({
      clientId: clientObjectId,
    });

    // Calculate the sum of amounts for all transactions with the given clientId
    const totalAmount = await Voucher.aggregate([
      { $match: { clientId: clientObjectId } }, // Match documents with the given clientId
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } }, // Calculate sum of amounts
    ]);

    // Extract the total amount from aggregation result
    const sumOfAmounts =
      totalAmount.length > 0 ? totalAmount[0].totalAmount : 0;

    // Return the response with transactions, pagination info, and sum of amounts
    res.json({
      transactions,
      totalTransactions,
      totalPages: Math.ceil(totalTransactions / pageSize),
      sumOfAmounts,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching transactions" });
  }
};


export const downloadInvoiceBasedData = async (req, res) => {
  try {
    const { startInvoice, endInvoice, userId } = req.body;

    // Fetch the billing user and extract companyId
    const billingUser = await Billing.findById(userId);
    if (!billingUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const companyId = billingUser.companyId;

    // Fetch and sort clients in ascending order of invoiceNumber
    const clients = await Client.find({
      companyId,
      invoiceNumber: { $gte: startInvoice, $lte: endInvoice },
    }).sort({ invoiceNumber: 1 });
    

    // Calculate total sums
    let totalCostSum = 0,
      amountPaidSum = 0,
      balanceSum = 0;

    clients.forEach((client) => {
      totalCostSum += client.amountToBePaid || 0;
      amountPaidSum += client.amountPaid || 0;
      balanceSum += client.balance || 0;
    });

    // Create a new PDF document
    const doc = new PDFDocument({ margin: 40 });

    // Set headers for response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=AcountsReport.pdf");
    doc.pipe(res);

    // Draw Border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();

    // Report Title with Background Color
    doc
      .rect(40, 40, doc.page.width - 80, 30)
      .fill("#5D4037") // Dark Brown
      .stroke();

    doc
      .fill("#FFFFFF") // White Text
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("REPORT BASED ON INVOICE NUMBER", 40, 50, {
        align: "center",
        width: doc.page.width - 80,
      })
      .fill("#000000") // Reset text color to black
      .moveDown(1);

    // Add the downloaded date and time below the heading on the left side
    const downloadDate = new Date().toLocaleString();
    doc
      .fontSize(10)
      .font("Helvetica")
      .fill("#000000")
      .text(`Downloaded on: ${downloadDate}`, 40, 80);
    doc.text(`Invoice Range: ${startInvoice} - ${endInvoice}`, 40, 95);
    // Table Header
    const startY = 110;
    const rowHeight = 20;
    const leftMargin = 40;

    // Table Header
const drawTableHeader = () => {
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("InvoiceNo.", leftMargin, startY, { width: 60, align: "left" })
    .text("InvoiceDate", leftMargin + 70, startY, { width: 80, align: "left" }) // New Column
    .text("DueDate", leftMargin + 150, startY, { width: 70, align: "left" })
    .text("TourDate", leftMargin + 220, startY, { width: 70, align: "left" })
    .text("ClientID", leftMargin + 290, startY, { width: 60, align: "left" })
    .text("GrandTotal", leftMargin + 310, startY, { width: 80, align: "right" }) 
    .text("Paid", leftMargin + 360, startY, { width: 80, align: "right" }) 
    .text("Balance", leftMargin + 450, startY, { width: 80, align: "right" }) 
    .moveDown(0.5);

  // Header separator line
  doc.moveTo(leftMargin - 20, startY + 15).lineTo(leftMargin + 550, startY + 15).stroke();
};

drawTableHeader();

let y = startY + rowHeight;

// Table Rows
const drawTableRow = (client, y) => {
  doc
    .fontSize(9)
    .font("Helvetica")
    .text(client.invoiceNumber?.toString() || "N/A", leftMargin, y, { width: 60, align: "left" })
    .text(client.invoiceDate || "N/A", leftMargin + 70, y, { width: 80, align: "left" }) // New Column
    .text(client.dueDate || "N/A", leftMargin + 150, y, { width: 70, align: "left" })
    .text(client.finalizedTourDate || "N/A", leftMargin + 220, y, { width: 70, align: "left" })
    .text(client.clientId || "N/A", leftMargin + 290, y, { width: 60, align: "left" })
    .text(client.amountToBePaid?.toFixed(2) || "0.00", leftMargin + 305, y, { width: 80, align: "right" })
    .text(client.amountPaid?.toFixed(2) || "0.00", leftMargin + 370, y, { width: 80, align: "right" })
    .text(client.balance !== undefined ? client.balance.toFixed(2) : "0.00", leftMargin + 455, y, { width: 80, align: "right" })
    .moveDown();

  // Row separator line
  doc.moveTo(leftMargin - 20, y + 15).lineTo(leftMargin + 550, y + 15).stroke();
};


    clients.forEach((client) => {
      if (y + rowHeight > doc.page.height - 50) {
        doc.addPage();
        y = 50;
        doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
      }

      drawTableRow(client, y);
      y += rowHeight;
    });

    // Display Total Summary in Red
    if (y + 30 > doc.page.height - 50) {
      doc.addPage();
      y = 50;
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();

    }

    doc
      .fontSize(10)
      .fill("#FF0000") // Red color
      .font("Helvetica-Bold")
      .text("TOTAL:", leftMargin + 220, y + 10, { width: 60, align: "left" })
      .text(totalCostSum.toFixed(2), leftMargin + 305, y + 10, { width: 80, align: "right" })
      .text(amountPaidSum.toFixed(2), leftMargin + 370, y + 10, { width: 80, align: "right" })
      .text(balanceSum.toFixed(2), leftMargin + 455, y + 10, { width: 80, align: "right" });

    // Finalize and send the PDF
    doc.end();
  } catch (error) {
    console.error("Error generating invoice report:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const downloadDueDateBasedData = async (req, res) => {
  try {
    const { startDueDate, endDueDate, userId } = req.body;
    

    // Fetch the billing user and extract companyId
    const billingUser = await Billing.findById(userId);
    if (!billingUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const companyId = billingUser.companyId;

    // Fetch and sort clients based on due date range
    const clients = await Client.find({
      companyId,
      dueDateAt: { $gte: new Date(startDueDate), $lte: new Date(endDueDate) },
      invoiceNumber: { $exists: true, $ne: null },
    }).sort({ dueDateAt: 1 });

    // Calculate total sums
    let totalCostSum = 0,
      amountPaidSum = 0,
      balanceSum = 0;

    clients.forEach((client) => {
      totalCostSum += client.amountToBePaid || 0;
      amountPaidSum += client.amountPaid || 0;
      balanceSum += client.balance || 0;
    });

    // Create a new PDF document
    const doc = new PDFDocument({ margin: 40 });

    // Set headers for response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=DueDateReport.pdf");
    doc.pipe(res);

    // Draw Border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();

    // Report Title with Background Color
    doc
      .rect(40, 40, doc.page.width - 80, 30)
      .fill("#5D4037") // Dark Brown
      .stroke();

    doc
      .fill("#FFFFFF") // White Text
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("REPORT BASED ON DUE DATE", 40, 50, {
        align: "center",
        width: doc.page.width - 80,
      })
      .fill("#000000") // Reset text color to black
      .moveDown(1);

    // Add the downloaded date and time below the heading on the left side
    const downloadDate = new Date().toLocaleString();
    const formattedStartDueDate = new Date(startDueDate).toLocaleDateString("en-GB");
    const formattedEndDueDate = new Date(endDueDate).toLocaleDateString("en-GB");
    doc
      .fontSize(10)
      .font("Helvetica")
      .fill("#000000")
      .text(`Downloaded on: ${downloadDate}`, 40, 80);
    doc.text(`Due Date Range: ${formattedStartDueDate} - ${formattedEndDueDate}`, 40, 95);

    // Table Header
    const startY = 110;
    const rowHeight = 20;
    const leftMargin = 40;

        // Table Header
const drawTableHeader = () => {
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("InvoiceNo.", leftMargin, startY, { width: 60, align: "left" })
    .text("InvoiceDate", leftMargin + 70, startY, { width: 80, align: "left" }) // New Column
    .text("DueDate", leftMargin + 150, startY, { width: 70, align: "left" })
    .text("TourDate", leftMargin + 220, startY, { width: 70, align: "left" })
    .text("ClientID", leftMargin + 290, startY, { width: 60, align: "left" })
    .text("GrandTotal", leftMargin + 310, startY, { width: 80, align: "right" }) 
    .text("Paid", leftMargin + 360, startY, { width: 80, align: "right" }) 
    .text("Balance", leftMargin + 450, startY, { width: 80, align: "right" }) 
    .moveDown(0.5);

  // Header separator line
  doc.moveTo(leftMargin - 20, startY + 15).lineTo(leftMargin + 550, startY + 15).stroke();
};

drawTableHeader();

let y = startY + rowHeight;

// Table Rows
const drawTableRow = (client, y) => {
  doc
    .fontSize(9)
    .font("Helvetica")
    .text(client.invoiceNumber?.toString() || "N/A", leftMargin, y, { width: 60, align: "left" })
    .text(client.invoiceDate || "N/A", leftMargin + 70, y, { width: 80, align: "left" }) // New Column
    .text(client.dueDate || "N/A", leftMargin + 150, y, { width: 70, align: "left" })
    .text(client.finalizedTourDate || "N/A", leftMargin + 220, y, { width: 70, align: "left" })
    .text(client.clientId || "N/A", leftMargin + 290, y, { width: 60, align: "left" })
    .text(client.amountToBePaid?.toFixed(2) || "0.00", leftMargin + 305, y, { width: 80, align: "right" })
    .text(client.amountPaid?.toFixed(2) || "0.00", leftMargin + 370, y, { width: 80, align: "right" })
    .text(client.balance !== undefined ? client.balance.toFixed(2) : "0.00", leftMargin + 455, y, { width: 80, align: "right" })
    .moveDown();

  // Row separator line
  doc.moveTo(leftMargin - 20, y + 15).lineTo(leftMargin + 550, y + 15).stroke();
};


    clients.forEach((client) => {
      if (y + rowHeight > doc.page.height - 50) {
        doc.addPage();
        y = 50;
        doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
      }

      drawTableRow(client, y);
      y += rowHeight;
    });

    // Display Total Summary in Red
    if (y + 30 > doc.page.height - 50) {
      doc.addPage();
      y = 50;
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
    }

    doc
      .fontSize(10)
      .fill("#FF0000") // Red color
      .font("Helvetica-Bold")
      .text("TOTAL:", leftMargin + 220, y + 10, { width: 60, align: "left" })
      .text(totalCostSum.toFixed(2), leftMargin + 305, y + 10, { width: 80, align: "right" })
      .text(amountPaidSum.toFixed(2), leftMargin + 370, y + 10, { width: 80, align: "right" })
      .text(balanceSum.toFixed(2), leftMargin + 455, y + 10, { width: 80, align: "right" });

    // Finalize and send the PDF
    doc.end();
  } catch (error) {
    console.error("Error generating due date report:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const downloadTourDateBasedData = async (req, res) => {
  try {
    const { startTourDate, endTourDate, userId } = req.body;
    

    // Validate inputs
    if (!startTourDate || !endTourDate || !userId) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    // Get companyId
    const billingUser = await Billing.findById(userId);
    if (!billingUser) return res.status(404).json({ message: "User not found" });

    const companyId = billingUser.companyId;

    const clients = await Client.find({
      companyId,
      finalizedTourDateAt: { $gte: new Date(startTourDate), $lte: new Date(endTourDate) },
      invoiceNumber: { $exists: true, $ne: null },
    }).sort({ finalizedTourDateAt: 1 });
    // Calculate total sums
    let totalCostSum = 0,
      amountPaidSum = 0,
      balanceSum = 0;

    clients.forEach((client) => {
      totalCostSum += client.amountToBePaid || 0;
      amountPaidSum += client.amountPaid || 0;
      balanceSum += client.balance || 0;
    });

    // Create a new PDF document
    const doc = new PDFDocument({ margin: 40 });

    // Set headers for response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=DueDateReport.pdf");
    doc.pipe(res);

    // Draw Border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();

    // Report Title with Background Color
    doc
      .rect(40, 40, doc.page.width - 80, 30)
      .fill("#5D4037") // Dark Brown
      .stroke();

    doc
      .fill("#FFFFFF") // White Text
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("REPORT BASED ON TOUR DATE", 40, 50, {
        align: "center",
        width: doc.page.width - 80,
      })
      .fill("#000000") // Reset text color to black
      .moveDown(1);

    // Add the downloaded date and time below the heading on the left side
    const downloadDate = new Date().toLocaleString();
    const formattedStartTourDate = new Date(startTourDate).toLocaleDateString("en-GB");
    const formattedEndTourDate = new Date(endTourDate).toLocaleDateString("en-GB");
    doc
      .fontSize(10)
      .font("Helvetica")
      .fill("#000000")
      .text(`Downloaded on: ${downloadDate}`, 40, 80);
    doc.text(`Tour Date Range: ${formattedStartTourDate} - ${formattedEndTourDate}`, 40, 95);

    // Table Header
    const startY = 110;
    const rowHeight = 20;
    const leftMargin = 40;

        // Table Header
const drawTableHeader = () => {
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("InvoiceNo.", leftMargin, startY, { width: 60, align: "left" })
    .text("InvoiceDate", leftMargin + 70, startY, { width: 80, align: "left" }) // New Column
    .text("DueDate", leftMargin + 150, startY, { width: 70, align: "left" })
    .text("TourDate", leftMargin + 220, startY, { width: 70, align: "left" })
    .text("ClientID", leftMargin + 290, startY, { width: 60, align: "left" })
    .text("GrandTotal", leftMargin + 310, startY, { width: 80, align: "right" }) 
    .text("Paid", leftMargin + 360, startY, { width: 80, align: "right" }) 
    .text("Balance", leftMargin + 450, startY, { width: 80, align: "right" }) 
    .moveDown(0.5);

  // Header separator line
  doc.moveTo(leftMargin - 20, startY + 15).lineTo(leftMargin + 550, startY + 15).stroke();
};

drawTableHeader();

let y = startY + rowHeight;

// Table Rows
const drawTableRow = (client, y) => {
  doc
    .fontSize(9)
    .font("Helvetica")
    .text(client.invoiceNumber?.toString() || "N/A", leftMargin, y, { width: 60, align: "left" })
    .text(client.invoiceDate || "N/A", leftMargin + 70, y, { width: 80, align: "left" }) // New Column
    .text(client.dueDate || "N/A", leftMargin + 150, y, { width: 70, align: "left" })
    .text(client.finalizedTourDate || "N/A", leftMargin + 220, y, { width: 70, align: "left" })
    .text(client.clientId || "N/A", leftMargin + 290, y, { width: 60, align: "left" })
    .text(client.amountToBePaid?.toFixed(2) || "0.00", leftMargin + 305, y, { width: 80, align: "right" })
    .text(client.amountPaid?.toFixed(2) || "0.00", leftMargin + 370, y, { width: 80, align: "right" })
    .text(client.balance !== undefined ? client.balance.toFixed(2) : "0.00", leftMargin + 455, y, { width: 80, align: "right" })
    .moveDown();

  // Row separator line
  doc.moveTo(leftMargin - 20, y + 15).lineTo(leftMargin + 550, y + 15).stroke();
};


    clients.forEach((client) => {
      if (y + rowHeight > doc.page.height - 50) {
        doc.addPage();
        y = 50;
        doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
      }

      drawTableRow(client, y);
      y += rowHeight;
    });

    // Display Total Summary in Red
    if (y + 30 > doc.page.height - 50) {
      doc.addPage();
      y = 50;
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
    }

    doc
      .fontSize(10)
      .fill("#FF0000") // Red color
      .font("Helvetica-Bold")
      .text("TOTAL:", leftMargin + 220, y + 10, { width: 60, align: "left" })
      .text(totalCostSum.toFixed(2), leftMargin + 305, y + 10, { width: 80, align: "right" })
      .text(amountPaidSum.toFixed(2), leftMargin + 370, y + 10, { width: 80, align: "right" })
      .text(balanceSum.toFixed(2), leftMargin + 455, y + 10, { width: 80, align: "right" });

    // Finalize and send the PDF
    doc.end();
  } catch (error) {
    console.error("Error generating due date report:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const downloadInvoiceDateBasedData = async (req, res) => {
  try {
    const { startInvoiceDate, endInvoiceDate, userId } = req.body;

    // Validate inputs
    if (!startInvoiceDate || !endInvoiceDate || !userId) {
      return res.status(400).json({ message: "Missing required parameters" });
    }


    // Get companyId
    const billingUser = await Billing.findById(userId);
    if (!billingUser) return res.status(404).json({ message: "User not found" });

    const companyId = billingUser.companyId;

    const clients = await Client.find({
      companyId,
      invoiceDateAt: { $gte: new Date(startInvoiceDate), $lte: new Date(endInvoiceDate) },
    }).sort({ invoiceDateAt: 1 });
    // Calculate total sums
    let totalCostSum = 0,
      amountPaidSum = 0,
      balanceSum = 0;

    clients.forEach((client) => {
      totalCostSum += client.amountToBePaid || 0;
      amountPaidSum += client.amountPaid || 0;
      balanceSum += client.balance || 0;
    });

    // Create a new PDF document
    const doc = new PDFDocument({ margin: 40 });

    // Set headers for response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=DueDateReport.pdf");
    doc.pipe(res);

    // Draw Border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();

    // Report Title with Background Color
    doc
      .rect(40, 40, doc.page.width - 80, 30)
      .fill("#5D4037") // Dark Brown
      .stroke();

    doc
      .fill("#FFFFFF") // White Text
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("REPORT BASED ON INVOICE DATE", 40, 50, {
        align: "center",
        width: doc.page.width - 80,
      })
      .fill("#000000") // Reset text color to black
      .moveDown(1);

    // Add the downloaded date and time below the heading on the left side
    const downloadDate = new Date().toLocaleString();
    const formattedStartInvoiceDate = new Date(startInvoiceDate).toLocaleDateString("en-GB");
    const formattedEndInvoiceDate = new Date(endInvoiceDate).toLocaleDateString("en-GB");
    doc
      .fontSize(10)
      .font("Helvetica")
      .fill("#000000")
      .text(`Downloaded on: ${downloadDate}`, 40, 80);
    doc.text(`Invoice Date Range: ${formattedStartInvoiceDate} - ${formattedEndInvoiceDate}`, 40, 95);


    // Table Header
    const startY = 110;
    const rowHeight = 20;
    const leftMargin = 40;

        // Table Header
const drawTableHeader = () => {
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("InvoiceNo.", leftMargin, startY, { width: 60, align: "left" })
    .text("InvoiceDate", leftMargin + 70, startY, { width: 80, align: "left" }) // New Column
    .text("DueDate", leftMargin + 150, startY, { width: 70, align: "left" })
    .text("TourDate", leftMargin + 220, startY, { width: 70, align: "left" })
    .text("ClientID", leftMargin + 290, startY, { width: 60, align: "left" })
    .text("GrandTotal", leftMargin + 310, startY, { width: 80, align: "right" }) 
    .text("Paid", leftMargin + 360, startY, { width: 80, align: "right" }) 
    .text("Balance", leftMargin + 450, startY, { width: 80, align: "right" }) 
    .moveDown(0.5);

  // Header separator line
  doc.moveTo(leftMargin - 20, startY + 15).lineTo(leftMargin + 550, startY + 15).stroke();
};

drawTableHeader();

let y = startY + rowHeight;

// Table Rows
const drawTableRow = (client, y) => {
  doc
    .fontSize(9)
    .font("Helvetica")
    .text(client.invoiceNumber?.toString() || "N/A", leftMargin, y, { width: 60, align: "left" })
    .text(client.invoiceDate || "N/A", leftMargin + 70, y, { width: 80, align: "left" }) // New Column
    .text(client.dueDate || "N/A", leftMargin + 150, y, { width: 70, align: "left" })
    .text(client.finalizedTourDate || "N/A", leftMargin + 220, y, { width: 70, align: "left" })
    .text(client.clientId || "N/A", leftMargin + 290, y, { width: 60, align: "left" })
    .text(client.amountToBePaid?.toFixed(2) || "0.00", leftMargin + 305, y, { width: 80, align: "right" })
    .text(client.amountPaid?.toFixed(2) || "0.00", leftMargin + 370, y, { width: 80, align: "right" })
    .text(client.balance !== undefined ? client.balance.toFixed(2) : "0.00", leftMargin + 455, y, { width: 80, align: "right" })
    .moveDown();

  // Row separator line
  doc.moveTo(leftMargin - 20, y + 15).lineTo(leftMargin + 550, y + 15).stroke();
};


    clients.forEach((client) => {
      if (y + rowHeight > doc.page.height - 50) {
        doc.addPage();
        y = 50;
        doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
      }

      drawTableRow(client, y);
      y += rowHeight;
    });

    // Display Total Summary in Red
    if (y + 30 > doc.page.height - 50) {
      doc.addPage();
      y = 50;
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
    }

    doc
      .fontSize(10)
      .fill("#FF0000") // Red color
      .font("Helvetica-Bold")
      .text("TOTAL:", leftMargin + 220, y + 10, { width: 60, align: "left" })
      .text(totalCostSum.toFixed(2), leftMargin + 305, y + 10, { width: 80, align: "right" })
      .text(amountPaidSum.toFixed(2), leftMargin + 370, y + 10, { width: 80, align: "right" })
      .text(balanceSum.toFixed(2), leftMargin + 455, y + 10, { width: 80, align: "right" });

    // Finalize and send the PDF
    doc.end();
  } catch (error) {
    console.error("Error generating due date report:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const downloadConfirmedClientsWithoutAnyPayments = async (req, res) => {
  try {
    const { userId } = req.body;
    // Get companyId
    const billingUser = await Billing.findById(userId);
    if (!billingUser) return res.status(404).json({ message: "User not found" });

    const companyId = billingUser.companyId;

    const clients = await Client.find({
      companyId,
      confirmedStatus: true,
      amountPaid: 0,
    }).populate("executiveId", "name") // Populate executive name
      .sort({ confirmedDateAt: 1 });
    // Calculate total sums
    let totalCostSum = 0,
      amountPaidSum = 0,
      balanceSum = 0;

    clients.forEach((client) => {
      totalCostSum += client.amountToBePaid || 0;
      amountPaidSum += client.amountPaid || 0;
      balanceSum += client.balance || 0;
    });

    // Create a new PDF document
    const doc = new PDFDocument({ margin: 40 });

    // Set headers for response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=DueDateReport.pdf");
    doc.pipe(res);

    // Draw Border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();

    // Report Title with Background Color
    doc
      .rect(40, 40, doc.page.width - 80, 30)
      .fill("#5D4037") // Dark Brown
      .stroke();

    doc
      .fill("#FFFFFF") // White Text
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("REPORT BASED ON CONFIRMED CLIENTS WITH ZERO PAYMENT", 40, 50, {
        align: "center",
        width: doc.page.width - 80,
      })
      .fill("#000000") // Reset text color to black
      .moveDown(1);

    // Add the downloaded date and time below the heading on the left side
    const downloadDate = new Date().toLocaleString();
    doc
      .fontSize(10)
      .font("Helvetica")
      .fill("#000000")
      .text(`Downloaded on: ${downloadDate}`, 40, 80)
    // Table Header
    const startY = 110;
    const rowHeight = 20;
    const leftMargin = 40;

        // Table Header
const drawTableHeader = () => {
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("Executive", leftMargin, startY, { width: 60, align: "left" })
    .text("ConfirmDate", leftMargin + 70, startY, { width: 80, align: "left" }) // New Column
    .text("DueDate", leftMargin + 150, startY, { width: 70, align: "left" })
    .text("TourDate", leftMargin + 220, startY, { width: 70, align: "left" })
    .text("ClientID", leftMargin + 290, startY, { width: 60, align: "left" })
    .text("GrandTotal", leftMargin + 310, startY, { width: 80, align: "right" }) 
    .text("Paid", leftMargin + 370, startY, { width: 80, align: "right" }) 
    .text("Balance", leftMargin + 450, startY, { width: 80, align: "right" }) 
    .moveDown(0.5);

  // Header separator line
  doc.moveTo(leftMargin - 20, startY + 15).lineTo(leftMargin + 550, startY + 15).stroke();
};

drawTableHeader();

let y = startY + rowHeight;

// Table Rows
const drawTableRow = (client, y) => {
  const formattedConfirmDate = client.confirmedDateAt 
    ? new Date(client.confirmedDateAt).toLocaleDateString("en-GB") 
    : "N/A";
  doc
    .fontSize(9)
    .font("Helvetica")
    .text(client.executiveId?.name ? client.executiveId.name.slice(0, 8) : "N/A", leftMargin, y, { width: 60, align: "left" })
    .text(formattedConfirmDate, leftMargin + 70, y, { width: 80, align: "left" }) // Replaced invoiceDate with confirmDateAt
    .text(client.dueDate || "N/A", leftMargin + 150, y, { width: 70, align: "left" })
    .text(client.finalizedTourDate || "N/A", leftMargin + 220, y, { width: 70, align: "left" })
    .text(client.clientId || "N/A", leftMargin + 290, y, { width: 60, align: "left" })
    .text(client.amountToBePaid?.toFixed(2) || "0.00", leftMargin + 305, y, { width: 80, align: "right" })
    .text(client.amountPaid?.toFixed(2) || "0.00", leftMargin + 370, y, { width: 80, align: "right" })
    .text(client.balance !== undefined ? client.balance.toFixed(2) : "0.00", leftMargin + 455, y, { width: 80, align: "right" })
    .moveDown();

  // Row separator line
  doc.moveTo(leftMargin - 20, y + 15).lineTo(leftMargin + 550, y + 15).stroke();
};


    clients.forEach((client) => {
      if (y + rowHeight > doc.page.height - 50) {
        doc.addPage();
        y = 50;
        doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
      }

      drawTableRow(client, y);
      y += rowHeight;
    });

    // Display Total Summary in Red
    if (y + 30 > doc.page.height - 50) {
      doc.addPage();
      y = 50;
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
    }

    doc
      .fontSize(10)
      .fill("#FF0000") // Red color
      .font("Helvetica-Bold")
      .text("TOTAL:", leftMargin + 220, y + 10, { width: 60, align: "left" })
      .text(totalCostSum.toFixed(2), leftMargin + 305, y + 10, { width: 80, align: "right" })
      .text(amountPaidSum.toFixed(2), leftMargin + 370, y + 10, { width: 80, align: "right" })
      .text(balanceSum.toFixed(2), leftMargin + 455, y + 10, { width: 80, align: "right" });

    // Finalize and send the PDF
    doc.end();
  } catch (error) {
    console.error("Error generating due date report:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};