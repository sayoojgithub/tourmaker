import Salesmanager from "../models/Salesmanager.js";
import Executive from "../models/Executive.js";
import Client from "../models/Client.js";
import PointSchema from "../models/PointSchema.js";
import FrontOffice from "../models/FrontOffice.js";
import Destination from "../models/Destination.js"
import mongoose from "mongoose";
import PDFDocument from "pdfkit";

export const getsalesManagerDetails = async (req, res) => {
  const { salesManagerId } = req.params;

  try {
    const salesManager = await Salesmanager.findById(salesManagerId);

    if (!salesManager) {
      return res.status(404).json({ message: "not found" });
    }

    res.status(200).json(salesManager);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllClients = async (req, res) => {
  try {
    const {
      companyId,
      clientId,
      mobileNumber,
      page = 1,
      limit = 4,
    } = req.query;

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const matchFilters = {
      companyId: new mongoose.Types.ObjectId(companyId),
    };
    // Add optional filters
    if (clientId) matchFilters.clientId = clientId;
    if (mobileNumber) matchFilters.mobileNumber = mobileNumber;

    const skip = (page - 1) * limit;

    // Fetch clients and dynamically calculate status
    const clients = await Client.aggregate([
      { $match: matchFilters },
      {
        $lookup: {
          from: "executives", // Collection name of executives
          localField: "executiveId",
          foreignField: "_id",
          as: "executiveDetails",
        },
      },
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
      {
        $project: {
          clientId: 1,
          primaryTourName: 1,
          startDate: 1,
          status: 1,
          executiveName: {
            $arrayElemAt: ["$executiveDetails.name", 0], // Extract executive name from the lookup
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

export const getExecutivesWithClientCounts = async (req, res) => {
  try {
    const { companyId, search = "", page = 1, limit = 5 } = req.query;
    const skip = (page - 1) * limit;

    // Define the current date range for "todo" clients scheduled for today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Basic match filters
    const matchFilters = {
      companyId: new mongoose.Types.ObjectId(companyId),
    };

    // Search filter for executive name
    if (search) {
      matchFilters.name = { $regex: search, $options: "i" }; // Case-insensitive search
    }

    const executives = await Executive.aggregate([
      { $match: matchFilters },
      {
        // Lookup clients associated with each executive
        $lookup: {
          from: "clients",
          localField: "_id",
          foreignField: "executiveId",
          as: "clients",
        },
      },
      {
        // Filter clients within the "clients" array for "todo", "pending", and "new" criteria
        $addFields: {
          todoClients: {
            $filter: {
              input: "$clients",
              as: "client",
              cond: {
                $and: [
                  { $eq: ["$$client.enquiryStatus", true] },
                  { $eq: ["$$client.executiveVisitedStatus", true] },
                  {
                    $gte: [
                      { $arrayElemAt: ["$$client.scheduleDate", -1] },
                      startOfToday,
                    ],
                  },
                  {
                    $lte: [
                      { $arrayElemAt: ["$$client.scheduleDate", -1] },
                      endOfToday,
                    ],
                  },
                  {
                    $ne: [
                      { $arrayElemAt: ["$$client.status.value", -1] },
                      "Booked",
                    ],
                  },
                ],
              },
            },
          },
          pendingClients: {
            $filter: {
              input: "$clients",
              as: "client",
              cond: {
                $and: [
                  { $eq: ["$$client.enquiryStatus", true] },
                  { $eq: ["$$client.executiveVisitedStatus", true] },
                  {
                    $ne: [
                      { $arrayElemAt: ["$$client.status.value", -1] },
                      "Booked",
                    ],
                  },
                ],
              },
            },
          },
          newClients: {
            $filter: {
              input: "$clients",
              as: "client",
              cond: {
                $and: [
                  { $eq: ["$$client.enquiryStatus", true] },
                  { $eq: ["$$client.executiveVisitedStatus", false] },
                ],
              },
            },
          },
        },
      },
      {
        // Project the executive name and the counts for todo, pending, and new clients
        $project: {
          name: 1,
          todoClientCount: { $size: "$todoClients" },
          pendingClientCount: { $size: "$pendingClients" },
          newClientCount: { $size: "$newClients" },
        },
      },
      { $skip: skip },
      { $limit: Number(limit) },
    ]);

    const totalExecutives = await Executive.countDocuments(matchFilters);
    const totalPages = Math.ceil(totalExecutives / limit);

    res.status(200).json({
      executives,
      totalPages,
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("Error fetching executives with client counts:", error);
    res.status(500).json({ message: "An error occurred while fetching data" });
  }
};

export const getAllExecutives = async (req, res) => {
  try {
    // Get the companyId from the query parameters
    const { companyId } = req.query;

    // Ensure the companyId is provided
    if (!companyId) {
      return res.status(400).json({ error: "Company ID is required" });
    }

    // Fetch all executives associated with the companyId
    const executives = await Executive.find({ companyId: companyId });

    // If no executives are found
    if (executives.length === 0) {
      return res
        .status(404)
        .json({ message: "No executives found for the specified company" });
    }

    // Send the filtered list of executives as JSON
    res.status(200).json(executives);
  } catch (error) {
    console.error("Error fetching executives:", error);
    res.status(500).json({ error: "Failed to fetch executives" });
  }
};

export const changeExecutive = async (req, res) => {
  const { clientId, executiveId, primaryTourName, tourName } = req.body;

  // Check if both clientId and executiveId are provided
  if (!clientId || !executiveId) {
    return res
      .status(400)
      .json({ error: "clientId and executiveId are required" });
  }

  try {
    // Find the client by clientId
    const client = await Client.findById(clientId);

    // If client is not found, send an error response
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Update the client's executiveId and set executiveVisitedStatus to false
    client.primaryTourName = primaryTourName;
    client.tourName = tourName;
    client.executiveId = executiveId;
    client.executiveVisitedStatus = false;

    // Save the updated client data to the database
    await client.save();

    // Respond with a success message
    res.status(200).json({ message: "Executive changed successfully" });
  } catch (error) {
    console.error("Error updating executive:", error);
    res
      .status(500)
      .json({ error: "An error occurred while changing the executive" });
  }
};

export const getClientStatusCounts = async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const matchFilters = {
      companyId: new mongoose.Types.ObjectId(companyId),
    };

    // Aggregate query to group by status and count clients
    const statusCounts = await Client.aggregate([
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
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({ statusCounts });
  } catch (error) {
    console.error("Error fetching client status counts:", error);
    res.status(500).json({
      message: "An error occurred while fetching client status counts",
    });
  }
};

export const getExecutivesByName = async (req, res) => {
  const { companyId, page = 1, name = "" } = req.query;
  const itemsPerPage = 4; // Define how many items per page you want to show

  try {
    // Ensure companyId is converted to an ObjectId
    const companyObjectId = new mongoose.Types.ObjectId(companyId);

    const query = {
      companyId: companyObjectId, // Correctly use the ObjectId
      ...(name && { name: { $regex: name, $options: "i" } }), // Case-insensitive search for name
    };

    // Get the executives from the database
    const executives = await Executive.find(query)
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage);

    // Count the total number of executives for pagination
    const totalExecutives = await Executive.countDocuments(query);
    const totalPages = Math.ceil(totalExecutives / itemsPerPage);

    return res.json({
      executives,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching executives." });
  }
};

export const getClientStatusCountsOfExecutive = async (req, res) => {
  try {
    const { companyId, executiveId } = req.query;

    if (!executiveId) {
      return res.status(400).json({ message: " Executive ID are required" });
    }

    const matchFilters = {
      executiveId: new mongoose.Types.ObjectId(executiveId),
    };

    // Aggregate query to group by status and count clients
    const statusCounts = await Client.aggregate([
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
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({ statusCounts });
  } catch (error) {
    console.error("Error fetching client status counts:", error);
    res.status(500).json({
      message: "An error occurred while fetching client status counts",
    });
  }
};

export const getAllClientsOfExecutive = async (req, res) => {
  try {
    const { executiveId, status, page = 1, limit = 4 } = req.query;

    if (!executiveId) {
      return res.status(400).json({ message: "Executive ID is required" });
    }

    const matchFilters = {
      executiveId: new mongoose.Types.ObjectId(executiveId),
    };

    const skip = (page - 1) * limit;

    // Fetch clients and dynamically calculate status
    const clients = await Client.aggregate([
      { $match: matchFilters },
      {
        $lookup: {
          from: "executives", // Collection name of executives
          localField: "executiveId",
          foreignField: "_id",
          as: "executiveDetails",
        },
      },
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
      ...(status
        ? [
            {
              $match: { status },
            },
          ]
        : []),
      {
        $project: {
          clientId: 1,
          primaryTourName: 1,
          startDate: 1,
          status: 1,
          executiveName: {
            $arrayElemAt: ["$executiveDetails.name", 0], // Extract executive name from the lookup
          },
        },
      },
      { $sort: { createdAt: -1, _id: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
    ]);

    // Count total documents for pagination
    const totalClients = await Client.aggregate([
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
      ...(status
        ? [
            {
              $match: { status },
            },
          ]
        : []),
      { $count: "total" },
    ]);

    const totalPages = Math.ceil((totalClients[0]?.total || 0) / limit);

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
export const downloadClientsData = async (req, res) => {
  const { startDate, endDate, userId } = req.body;

  try {
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Start date and end date are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const salesManagerDoc = await Salesmanager.findById(userId);
    if (!salesManagerDoc) {
      return res.status(404).json({ message: "Sales manager not found" });
    }

    const salesManager = salesManagerDoc.name;
    const companyId = salesManagerDoc.companyId;

    const clients = await Client.find({
      companyId: new mongoose.Types.ObjectId(companyId),
      createdAt: { $gte: start, $lte: end },
    }).populate("frontOfficerId", "name");

    if (!clients.length) {
      return res.status(404).json({ message: "No clients found" });
    }

    const currentDate = new Date();
    const downloadTimestamp = currentDate.toLocaleString();
    const formattedStartDate = start.toLocaleDateString("en-GB");
    const formattedEndDate = end.toLocaleDateString("en-GB");

    const doc = new PDFDocument({ margin: 25, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=clients.pdf");
    doc.pipe(res);

    const drawPageBorder = () => {
      doc
        .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
        .strokeColor("black")
        .lineWidth(1)
        .stroke();
    };

    const truncate = (text, maxLength = 11) => {
      if (!text) return "";
      return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
    };

    const colWidths = [30, 60, 80, 80, 80, 40, 50, 70, 80];
    const colX = colWidths.reduce((acc, width, i) => {
      acc.push(i === 0 ? 40 : acc[i - 1] + colWidths[i - 1]);
      return acc;
    }, []);

    const drawTableHeader = (doc, y) => {
      const headers = [
        "No",
        "ID",
        "Name",
        "Contact No",
        "Tour Name",
        "Pax",
        "Pincode",
        "Create Date",
        "FO",
      ];
      doc.font("Helvetica-Bold").fontSize(9).fillColor("red");

      headers.forEach((header, index) => {
        doc.text(header, colX[index] + 2, y + 3, {
          width: colWidths[index],
          align: "left",
        });

        if (index > 0) {
          doc
            .moveTo(colX[index], y)
            .lineTo(colX[index], y + 14)
            .stroke("black");
        }
      });

      doc
        .moveTo(40, y + 14)
        .lineTo(570, y + 14)
        .stroke("black");
    };

    const drawTableRow = (doc, client, y, index) => {
      const createdDate = new Date(client.createdAt).toLocaleDateString(
        "en-GB"
      );
      const frontOfficerName = client.frontOfficerId?.name || "";
      const rowData = [
        index + 1,
        client.clientId || "",
        truncate(client.name),
        client.mobileNumber || "",
        truncate(client.primaryTourName?.label),
        client.numberOfPersons || "",
        client.pincode || "",
        createdDate,
        truncate(frontOfficerName, 6),
      ];

      doc.font("Helvetica").fontSize(8).fillColor("black");

      rowData.forEach((data, i) => {
        doc.text(data, colX[i] + 2, y + 2, {
          width: colWidths[i],
          align: "left",
        });

        if (i > 0) {
          doc
            .moveTo(colX[i], y)
            .lineTo(colX[i], y + 14)
            .stroke("black");
        }
      });

      doc
        .moveTo(40, y + 14)
        .lineTo(570, y + 14)
        .stroke("black");
    };

    const renderPageHeader = () => {
      drawPageBorder();

      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text(`SALES MANAGER: ${salesManager.toUpperCase()}`, {
          align: "center",
        });

      doc.moveDown(1);

      const dateLineY = doc.y;
      doc.fontSize(9).font("Helvetica");
      doc.text(`Start Date: ${formattedStartDate}`, 40, dateLineY, {
        continued: true,
      });
      doc.text(`End Date: ${formattedEndDate}`, 150, dateLineY, {
        continued: true,
      });
      doc.text(`Downloaded At: ${downloadTimestamp}`, 230, dateLineY);

      doc.moveDown(2);
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Client Details", { align: "left" });
    };

    renderPageHeader();

    let y = doc.y + 14;
    const rowHeight = 15;
    const bottomMargin = 40;
    const maxY = doc.page.height - bottomMargin;

    drawTableHeader(doc, y);
    y += rowHeight;

    clients.forEach((client, index) => {
      if (y + rowHeight > maxY) {
        doc.addPage();
        renderPageHeader();
        y = doc.y + 14;
        drawTableHeader(doc, y);
        y += rowHeight;
      }

      drawTableRow(doc, client, y, index);
      y += rowHeight;
    });

    doc.end();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while generating the PDF" });
  }
};
export const getExecutivesBySalesManager = async (req, res) => {
  try {
    const salesManager = await Salesmanager.findById(req.params.userId);
    if (!salesManager)
      return res.status(404).json({ message: "Sales Manager not found" });

    const executives = await Executive.find({
      companyId: salesManager.companyId,
    }).select("name _id");
    res.status(200).json(executives);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
export const getFrontOfficersBySalesManager = async (req, res) => {
  try {
    const salesManager = await Salesmanager.findById(req.params.userId);
    if (!salesManager)
      return res.status(404).json({ message: "Sales Manager not found" });

    const frontOfficers = await FrontOffice.find({
      companyId: salesManager.companyId,
    }).select("name _id");

    res.status(200).json(frontOfficers);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

function convertToIST(date) {
  const istDate = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  const dateStr = istDate.toLocaleDateString("en-GB"); // DD/MM/YYYY
  const timeStr = istDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }); // hh:mm AM/PM
  return { date: dateStr, time: timeStr };
}

export const downloadClientsDataOfExecutive = async (req, res) => {
  const { startDate, endDate, executiveId } = req.body;

  try {
    if (!startDate || !endDate || !executiveId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const executiveDoc = await Executive.findById(executiveId);
    if (!executiveDoc) {
      return res.status(404).json({ message: "Executive not found" });
    }

    const clients = await Client.aggregate([
      {
        $match: {
          executiveId: new mongoose.Types.ObjectId(executiveId),
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $addFields: {
          stage: {
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
              ],
              default: "Other",
            },
          },
        },
      },
    ]);

    if (!clients.length) {
      return res.status(404).json({ message: "No clients found" });
    }

    const doc = new PDFDocument({ margin: 25, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=clients.pdf");
    doc.pipe(res);

    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("EXECUTIVE CLIENT REPORT", { align: "center" });
    doc.moveDown(0.5);

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(`${executiveDoc.name.toUpperCase()}`, { align: "center" });
    doc.moveDown(0.5);

    doc
      .fontSize(10)
      .text(
        `Date: ${start.toLocaleDateString("en-GB")} to ${end.toLocaleDateString(
          "en-GB"
        )}`,
        {
          align: "center",
        }
      );
    const downloadDate = new Date();
    doc
      .fontSize(10)
      .text(`Downloaded on: ${downloadDate.toLocaleString("en-GB")}`, {
        align: "center",
      });
    doc.moveDown(1);

    const headers = [
      "No",
      "CID",
      "Name",
      "Dest",
      "Date",
      "Time",
      "NewClient",
      "Pending",
      "Interested",
      "Confirmed",
      "Booked",
    ];
    const colWidths = [25, 60, 70, 60, 50, 40, 48, 43, 47, 49, 43];
    const startX = 25;
    let startY = doc.y;

    headers.forEach((header, i) => {
      const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.rect(x, startY, colWidths[i], 20).stroke();
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .text(header, x + 3, startY + 5);
    });
    startY += 20;

    const counts = {
      "New Client": 0,
      Pending: 0,
      Interested: 0,
      Confirmed: 0,
      Booked: 0,
    };

    clients.forEach((client, index) => {
      const stage = client.stage;
      const { date, time } = convertToIST(client.createdAt);
      const isNewClient = stage === "New Client";

      const row = [
        index + 1,
        client.clientId || "N/A",
        client.name || "N/A",
        client.primaryTourName?.label || "N/A",
        date,
        time,
        isNewClient ? "1" : "",
        stage === "Pending" ? "1" : "",
        stage === "Interested" ? "1" : "",
        stage === "Confirmed" ? "1" : "",
        stage === "Booked" ? "1" : "",
      ];

      if (counts[stage] !== undefined) counts[stage] += 1;

      row.forEach((val, i) => {
        const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc.rect(x, startY, colWidths[i], 20).stroke();

        // Apply red color for new clients
        if (isNewClient) {
          doc.fillColor("red");
        } else {
          doc.fillColor("black");
        }

        doc
          .font("Helvetica")
          .fontSize(8)
          .text(String(val), x + 3, startY + 5, {
            width: colWidths[i] - 6,
            ellipsis: true,
          });
      });

      startY += 20;

      if (startY > doc.page.height - 50) {
        doc.addPage();
        startY = doc.y;

        headers.forEach((header, i) => {
          const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
          doc.rect(x, startY, colWidths[i], 20).stroke();
          doc
            .font("Helvetica-Bold")
            .fontSize(9)
            .fillColor("black")
            .text(header, x + 3, startY + 5);
        });

        startY += 20;
      }
    });

    // Print counts below table
    startY += 10;
    headers.slice(6).forEach((header, i) => {
      const x = startX + colWidths.slice(0, i + 6).reduce((a, b) => a + b, 0);
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("red")
        .text(
          counts[
            ["New Client", "Pending", "Interested", "Confirmed", "Booked"][i]
          ] || 0,
          x + 3,
          startY
        );
    });

    doc.end();
  } catch (error) {
    console.error("Error generating executive PDF report:", error);
    res.status(500).json({ message: "Failed to generate report" });
  }
};

export const createPoints = async (req, res) => {
  try {
    const { companyId, role, points } = req.body;

    if (!companyId || !role || !points) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await PointSchema.findOne({ companyId, role });
    if (existing) {
      return res.status(400).json({ message: "Points already exist for this role" });
    }

    const newPoints = new PointSchema({ companyId, role, points });
    await newPoints.save();

    res.status(201).json({ message: "Points created successfully" });
  } catch (error) {
    console.error("Error creating points:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPoints = async (req, res) => {
  try {
    const { companyId, role } = req.query;
    const data = await PointSchema.findOne({ companyId, role });
    if (!data) return res.status(404).json({ message: "No data found" });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateSinglePoint = async (req, res) => {
  try {
    const { companyId, role, range, point } = req.body;

    const document = await PointSchema.findOne({ companyId, role });
    if (!document) return res.status(404).json({ message: "Create complete points first" });

    document.points.set(range, point);
    await document.save();

    res.status(200).json({ message: "Point updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const downloadClientsDataOfFrontOfficer = async (req, res) => {
  try {
    const { frontOfficerId, date } = req.body;

    if (!frontOfficerId || !date) {
      return res.status(400).json({ message: "Missing front officer or date" });
    }

    const frontOfficer = await FrontOffice.findById(frontOfficerId);
    if (!frontOfficer) {
      return res.status(404).json({ message: "Front officer not found" });
    }

    // Normalize input date to midnight to match MongoDB stored date (ignoring time)
    const inputDate = new Date(date);
    inputDate.setHours(0, 0, 0, 0); // 00:00:00.000
     const start = new Date(inputDate);
    const end = new Date(inputDate);
    end.setHours(23, 59, 59, 999);

    // Fetch clients created by this front officer on this date
    const clients = await Client.find({
      frontOfficerId: new mongoose.Types.ObjectId(frontOfficerId),
      createdAt: { $gte: start, $lte: end },
    });
    // Find matching creationPoint
    const matchedPoint1 = frontOfficer.creationPoints.find(point => {
      const pointDate = new Date(point.date);
      pointDate.setHours(0, 0, 0, 0);
      return pointDate.getTime() === inputDate.getTime();
    });
    const matchedSalesPoints = frontOfficer.salesPoints.filter(point => {
  const pointDate = new Date(point.date);
  pointDate.setHours(0, 0, 0, 0);
  return pointDate.getTime() === inputDate.getTime();
});

// Sum awardedPoints
const totalSalesPointsToday = matchedSalesPoints.reduce((sum, point) => sum + point.awardedPoint, 0);
    const percentage = matchedPoint1 ? matchedPoint1.percentage : null;
    const creationAwardedPoint = matchedPoint1 ? matchedPoint1.awardedPoint : 0;
   const formattedStartDate = inputDate.toLocaleDateString("en-GB")
   


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

   // Move down a little
doc.moveDown(0.5);

// Start Date in Center below Front Officer Name
doc
  .fontSize(12)
  .font("Helvetica")
  .text(`Date: ${formattedStartDate}`, { align: "center" })
  .fillColor("red");
  doc.moveDown(0.5);

  // Start Date in Center below Front Officer Name
  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`Convertion Rate: ${percentage}`, { align: "center" })
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
  const totalPointsText = `Total Points: ${creationAwardedPoint+totalSalesPointsToday}`;
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
    const createdDate = new Date(client.createdAt).toLocaleDateString("en-GB");
    const createdTime = new Date(client.createdAt).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // 12-hour format (AM/PM)
    });
  
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

export const downloadExecutiveRemarksReport = async (req, res) => {
  const { startDate, endDate, executiveId } = req.body;

  try {
    if (!startDate || !endDate || !executiveId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const executive = await Executive.findById(executiveId);
    if (!executive) return res.status(404).json({ message: "Executive not found" });

    const clients = await Client.aggregate([
      {
        $match: {
          executiveId: new mongoose.Types.ObjectId(executiveId),
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $addFields: {
          stage: {
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
              default: "Other",
            },
          },
        },
      },
    ]);

    if (!clients.length) return res.status(404).json({ message: "No clients found" });

    // Landscape mode
    const doc = new PDFDocument({ margin: 25, size: "A4", layout: "landscape" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=executive_remarks_report.pdf");
    doc.pipe(res);

    doc.fontSize(16).text("Executive Remarks Report", { align: "center" });
    doc.fontSize(12).text(executive.name.toUpperCase(), { align: "center" });
    doc.fontSize(10).text(`Date: ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`, { align: "center" });
    doc.fontSize(10).text(`Downloaded: ${new Date().toLocaleString()}`, { align: "center" });
    doc.moveDown(1);

    const headers = ["No", "CID", "Name", "Dest", "Date", "Time", "Stage", "Calls", "Status Count", "Remarks"];
    const colWidths = [20, 38, 80, 60, 50, 40, 55, 25, 100, 310]; // Adjusted for landscape
    const startX = 25;
    let startY = doc.y;

    headers.forEach((header, i) => {
      const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.rect(x, startY, colWidths[i], 20).stroke().font("Helvetica-Bold").fontSize(9).text(header, x + 3, startY + 5);
    });
    startY += 20;

    const statusCountTotal = {};

    clients.forEach((client, index) => {
      const { clientId, name, primaryTourName, createdAt, stage, status = [], response = [] } = client;
      const date = new Date(createdAt).toLocaleDateString("en-GB");
      const time = new Date(createdAt).toLocaleTimeString("en-GB");

      const statusCount = {};
      for (const s of status) {
        statusCount[s.label] = (statusCount[s.label] || 0) + 1;
        statusCountTotal[s.label] = (statusCountTotal[s.label] || 0) + 1;
      }

      const statusSummary = Object.entries(statusCount).map(([key, val]) => `${key}: ${val}`).join(", ");
      const callCount = status.length;
      const remarksText = Array.isArray(response) ? response.join(", ") : "";

      const row = [
        index + 1,
        clientId || "N/A",
        name || "N/A",
        primaryTourName?.label || "N/A",
        date,
        time,
        stage,
        callCount,
        statusSummary,
        remarksText,
      ];

      let rowHeight = 20;
      const cellHeights = row.map((val, i) => {
        const text = String(val);
        return doc.heightOfString(text, {
          width: colWidths[i] - 6,
        }) + 10;
      });
      rowHeight = Math.max(...cellHeights);

      row.forEach((val, i) => {
        const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc.rect(x, startY, colWidths[i], rowHeight).stroke();
        doc.font("Helvetica").fontSize(8).fillColor("black").text(String(val), x + 3, startY + 5, {
          width: colWidths[i] - 6,
          height: rowHeight - 10,
          align: "left",
        });
      });

      startY += rowHeight;

      if (startY > doc.page.height - 50) {
        doc.addPage();
        startY = doc.y;
        headers.forEach((header, i) => {
          const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
          doc.rect(x, startY, colWidths[i], 20).stroke().font("Helvetica-Bold").fontSize(9).text(header, x + 3, startY + 5);
        });
        startY += 20;
      }
    });

    doc.end();
  } catch (error) {
    console.error("Error generating executive remarks report:", error);
    res.status(500).json({ message: "Failed to generate report" });
  }
};
export const getDestinationsBySalesManager = async (req, res) => {
  const { userId } = req.params;

  try {
    const salesManager = await Salesmanager.findById(userId);

    if (!salesManager) {
      return res.status(404).json({ message: "Sales manager not found" });
    }

    const companyId = salesManager.companyId;

    const destinations = await Destination.find({ companyId }).select("name _id");

    res.status(200).json(destinations);
  } catch (error) {
    console.error("Error fetching destinations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const downloadDestinationBasedClientReport = async (req, res) => {
  const { destinationId } = req.body;

  try {
    if (!destinationId) {
      return res.status(400).json({ message: "Destination is required" });
    }
      // ✅ Fetch Destination by ID
    const destination = await Destination.findById(destinationId).lean();
    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    const companyName = destination.companyName;

    const clients = await Client.aggregate([
  {
    $match: {
      $or: [
        { "confirmedDestination._id": new mongoose.Types.ObjectId(destinationId) },
        { "primaryTourName._id": new mongoose.Types.ObjectId(destinationId) },
      ],
    },
  },
  {
    $lookup: {
      from: "executives", // Make sure this matches the actual collection name in MongoDB
      localField: "executiveId",
      foreignField: "_id",
      as: "executiveInfo",
    },
  },
  {
    $unwind: {
      path: "$executiveInfo",
      preserveNullAndEmptyArrays: true, // In case there's no matching executive
    },
  },
  {
    $addFields: {
      stage: {
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
          default: "Other",
        },
      },
    },
  },
]);


    if (!clients.length) return res.status(404).json({ message: "No clients found" });

   const doc = new PDFDocument({ margin: 25, size: "A4", layout: "landscape" });

res.setHeader("Content-Type", "application/pdf");
res.setHeader("Content-Disposition", "attachment; filename=destination_based_clientreport.pdf");
doc.pipe(res);

doc.fontSize(16).text(`Destination Based Client Report - ${companyName.toUpperCase()}`, { align: "center" });
doc.fontSize(10).text(`Downloaded: ${new Date().toLocaleString()}`, { align: "center" });
doc.moveDown(1);

const headers = ["No", "CID", "Name", "Mobile", "P.Dest", "C.Dest", "CreatedOn", "Time", "Executive", "Stage", "Calls", "Status Count", "Remarks"];
const colWidths = [20, 38, 80, 70, 60, 60, 50, 40, 70, 55, 25, 80, 150]; // Added width for Executive
const startX = 25;
let startY = doc.y;

// Draw headers
headers.forEach((header, i) => {
  const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
  doc.rect(x, startY, colWidths[i], 20).stroke().font("Helvetica-Bold").fontSize(9).text(header, x + 3, startY + 5);
});
startY += 20;

const statusCountTotal = {};

clients.forEach((client, index) => {
  const {
    clientId,
    name,
    mobileNumber,
    primaryTourName,
    confirmedDestination,
    createdAt,
    stage,
    status = [],
    response = [],
  } = client;
  const executiveName = client.executiveInfo?.name || "N/A";

  const date = new Date(createdAt).toLocaleDateString("en-GB");
  const time = new Date(createdAt).toLocaleTimeString("en-GB");

  const statusCount = {};
  for (const s of status) {
    statusCount[s.label] = (statusCount[s.label] || 0) + 1;
    statusCountTotal[s.label] = (statusCountTotal[s.label] || 0) + 1;
  }

  const statusSummary = Object.entries(statusCount)
    .map(([key, val]) => `${key}: ${val}`)
    .join(", ");
  const callCount = status.length;
  const remarksText = Array.isArray(response) ? response.join(", ") : "";

  const row = [
    index + 1,
    clientId || "N/A",
    name || "N/A",
    mobileNumber || "N/A",
    primaryTourName?.label || "N/A",
    confirmedDestination?.name || "N/A",
    date,
    time,
    executiveName,
    stage,
    callCount,
    statusSummary,
    remarksText,
  ];

  let rowHeight = 20;
  const cellHeights = row.map((val, i) => {
    const text = String(val);
    return doc.heightOfString(text, {
      width: colWidths[i] - 6,
    }) + 10;
  });
  rowHeight = Math.max(...cellHeights);

  row.forEach((val, i) => {
    const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
    doc.rect(x, startY, colWidths[i], rowHeight).stroke();
    doc.font("Helvetica").fontSize(8).fillColor("black").text(String(val), x + 3, startY + 5, {
      width: colWidths[i] - 6,
      height: rowHeight - 10,
      align: "left",
    });
  });

  startY += rowHeight;

  if (startY > doc.page.height - 50) {
    doc.addPage();
    startY = doc.y;
    headers.forEach((header, i) => {
      const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.rect(x, startY, colWidths[i], 20).stroke().font("Helvetica-Bold").fontSize(9).text(header, x + 3, startY + 5);
    });
    startY += 20;
  }
});

doc.end();
  } catch (error) {
    console.error("Error generating executive remarks report:", error);
    res.status(500).json({ message: "Failed to generate report" });
  }
};