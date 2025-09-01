import Agency from "../models/Agency.js";
import FrontOffice from "../models/FrontOffice.js";
import Salesmanager from "../models/Salesmanager.js";
import Executive from "../models/Executive.js";
import Billing from "../models/Billing.js";
import Purchase from "../models/Purchase.js";
import Destination from "../models/Destination.js";
import CustomerCare from "../models/CustomerCare.js";
import Booking from "../models/Booking.js"
import Client from "../models/Client.js";
import Entry from "../models/Entry.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// ______________USED TO GET COMPANY DETAILS IN CompanyProfile.jsx AND ProfileUpdate.jsx PAGE_______________//
export const getCompanyDetails = async (req, res) => {
  const { companyId } = req.params;

  try {
    const company = await Agency.findById(companyId);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// _____________USED IN ProfileUpdate.jsx to update the email,mobileNumber,logo_____________//
export const updateProfile = async (req, res) => {
  const { id } = req.params;
  const { email, mobileNumber, logo, cgstPercentage, sgstPercentage, sacNumber } = req.body;

  try {
    // Find user by ID
    const user = await Agency.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email already exists
    const emailExists =
      (await FrontOffice.findOne({ email, _id: { $ne: id } })) ||
      (await Salesmanager.findOne({ email, _id: { $ne: id } })) ||
      (await Executive.findOne({ email, _id: { $ne: id } })) ||
      (await Billing.findOne({ email, _id: { $ne: id } })) ||
      (await Purchase.findOne({ email, _id: { $ne: id } })) ||
      (await Agency.findOne({ email, _id: { $ne: id } }));
    if (emailExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Check if phone number already exists
    const mobileNumberExists =
      (await FrontOffice.findOne({ mobileNumber, _id: { $ne: id } })) ||
      (await Salesmanager.findOne({ mobileNumber, _id: { $ne: id } })) ||
      (await Executive.findOne({ mobileNumber, _id: { $ne: id } })) ||
      (await Billing.findOne({ mobileNumber, _id: { $ne: id } })) ||
      (await Purchase.findOne({ mobileNumber, _id: { $ne: id } })) ||
      (await Agency.findOne({ mobileNumber, _id: { $ne: id } }));
    if (mobileNumberExists) {
      return res.status(400).json({ message: "Mobile number already exists" });
    }

    // Update user data
    user.email = email;
    user.mobileNumber = mobileNumber;
    user.logo = logo;
    user.cgstPercentage = cgstPercentage;
    user.sgstPercentage = sgstPercentage;
    user.sacNumber = sacNumber;
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getDestinationsName = async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
    }
    // Fetch only the `name` field from the destinations
    const destinations = await Destination.find({companyId}, "name");

    // Map the destinations to an array of objects with `value` and `label`
    const destinationNames = destinations.map((destination) => ({
      _id: destination._id,
      value: destination.name,
      label: destination.name,
    }));

    // Send the list of destinations as a response
    res.status(200).json(destinationNames);
  } catch (error) {
    console.error("Error fetching destination names:", error);
    res.status(500).json({ message: "Failed to fetch destination names" });
  }
};

// _______________EMPLOYEE REGISTRATION BY COMPANY______________//
export const employeeRegistration = async (req, res) => {
  const { name, email, password, role, mobileNumber, tourName } = req.body;
  const { id } = req.params;

  try {
    // Find the agency by ID to get the company name
    const agency = await Agency.findById(id);
    if (!agency) {
      return res.status(404).json({ message: "Company not found" });
    }
    const companyName = agency.name;

    // Check if email already exists in any of the collections
    const emailExists =
      (await Salesmanager.findOne({ email })) ||
      (await FrontOffice.findOne({ email })) ||
      (await Executive.findOne({ email })) ||
      (await Billing.findOne({ email })) ||
      (await Purchase.findOne({ email })) ||
      (await CustomerCare.findOne({ email })) ||
      (await Booking.findOne({ email })) ||
      (await Agency.findOne({ email })) ||
      (await Entry.findOne({email})) ;
    if (emailExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Check if mobileNumber already exists in any of the collections
    const mobileNumberExists =
      (await Salesmanager.findOne({ mobileNumber })) ||
      (await FrontOffice.findOne({ mobileNumber })) ||
      (await Executive.findOne({ mobileNumber })) ||
      (await Billing.findOne({ mobileNumber })) ||
      (await Purchase.findOne({ mobileNumber })) ||
      (await CustomerCare.findOne({ mobileNumber })) ||
      (await Booking.findOne({ mobileNumber })) ||
      (await Agency.findOne({ mobileNumber })) ||
      (await Entry.findOne({ mobileNumber })) ;
    if (mobileNumberExists) {
      return res.status(400).json({ message: "Mobile number already exists" });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine which schema to use based on the role
    let UserModel;
    switch (role) {
      case "sales":
        UserModel = Salesmanager;
        break;
      case "front office":
        UserModel = FrontOffice;
        break;
      case "purchase":
        UserModel = Purchase;
        break;
      case "executive":
        UserModel = Executive;
        break;
      case "billing":
        UserModel = Billing;
        break;
      case "customer care":
        UserModel = CustomerCare;
        break;  
        case "booking":
          UserModel = Booking;
          break;
        case "entry":
          UserModel = Entry;
          break;
      default:
        return res.status(400).json({ message: "Invalid role" });
    }

    // Create a new user with tourName if the role is executive
    const newUserData = {
      name,
      email,
      password: hashedPassword,
      mobileNumber,
      role,
      companyName,
      companyId: id,
    };

    // Include tourName if the role is "executive"
    if (role === "executive") {
      if (!tourName) {
        return res
          .status(400)
          .json({ message: "Tour destinations are required for executives" });
      }
      newUserData.tourName = tourName;

      // Fetch all executives in the same company to determine the maximum count
      const executivesInCompany = await Executive.find({ companyId: id });
      const maxCount =
        executivesInCompany.length > 0
          ? Math.max(...executivesInCompany.map((exec) => exec.count || 0))
          : 0;

      // Set the new executive's count to maxCount + 1 if others exist; otherwise, set to 0
      newUserData.count = executivesInCompany.length > 0 ? maxCount : 0;
    }
    // Include tourName if the role is "executive"
    if (role === "customer care") {
      if (!tourName) {
        return res
          .status(400)
          .json({ message: "Tour destinations are required for customer care" });
      }
      newUserData.tourName = tourName;

      // Fetch all executives in the same company to determine the maximum count
      const customerCaresInCompany = await CustomerCare.find({ companyId: id });
      const maxCount =
        customerCaresInCompany.length > 0
          ? Math.max(...customerCaresInCompany.map((cust) => cust.count || 0))
          : 0;

      // Set the new executive's count to maxCount + 1 if others exist; otherwise, set to 0
      newUserData.count = customerCaresInCompany.length > 0 ? maxCount : 0;
    }

    // Create and save the new user
    const newUser = new UserModel(newUserData);
    await newUser.save();

    res.status(201).json({ message: "Employee registration successful" });
  } catch (error) {
    res.status(500).json({ message: "Employee registration failed", error });
  }
};


export const addBankDetails = async (req, res) => {
  try {
    const { agencyId } = req.params; // Get agency ID from URL params
    const { bankName, bankIfscCode, bankAccountNumber, bankBranch, bankQrCode } = req.body;

    // Validate required fields
    if (!bankName || !bankIfscCode || !bankAccountNumber || !bankBranch) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    // Find agency by ID
    const agency = await Agency.findById(agencyId);
    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }

    // Create new bank details object
    const newBankDetails = {
      bankName,
      bankIfscCode,
      bankAccountNumber,
      bankBranch,
      bankQrCode: bankQrCode || "", // QR Code is optional
    };

    // Update agency bank details array
    agency.bankDetails.push(newBankDetails);
    await agency.save();

    res.status(200).json({ message: "Bank details added successfully", bankDetails: agency.bankDetails });
  } catch (error) {
    console.error("Error adding bank details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBankList = async (req, res) => {
  try {
    const { companyId, page = 1, limit = 4, search = "" } = req.query;

    // Validate companyId
    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    // Find the agency by company ID
    const agency = await Agency.findById(companyId);
    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }

    // Filter bank details based on search query (matching bankName or IFSC Code)
    let filteredBanks = agency.bankDetails.filter(
      (bank) =>
        bank.bankName.toLowerCase().includes(search.toLowerCase()) ||
        bank.bankIfscCode.toLowerCase().includes(search.toLowerCase())
    );

    // Pagination logic
    const totalBanks = filteredBanks.length;
    const totalPages = Math.ceil(totalBanks / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + Number(limit);
    const paginatedBanks = filteredBanks.slice(startIndex, endIndex);

    // Return the filtered & paginated results
    res.json({
      data: paginatedBanks,
      totalBanks,
      totalPages,
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("Error fetching banks list:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const fetchBankDetails = async (req, res) => {
  try {
    const { companyId, bankId } = req.params;

    // Find the company by ID
    const company = await Agency.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Find the specific bank details
    const bank = company.bankDetails.find(
      (b) => b._id.toString() === bankId
    );
    console.log(bank)

    if (!bank) {
      return res.status(404).json({ message: "Bank details not found" });
    }

    res.status(200).json(bank);
  } catch (error) {
    console.error("Error fetching bank details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateBankDetails = async (req, res) => {
  try {
    const { companyId, bankId } = req.params;
    const { bankName, bankIfscCode, bankAccountNumber, bankBranch, bankQrCode } = req.body;

    // Find the agency by ID
    const agency = await Agency.findById(companyId);
    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }

    // Find the specific bank inside the bankDetails array
    const bankIndex = agency.bankDetails.findIndex(bank => bank._id.toString() === bankId);
    if (bankIndex === -1) {
      return res.status(404).json({ message: "Bank details not found" });
    }

    // Update bank details
    agency.bankDetails[bankIndex] = {
      _id: bankId, // Ensure the ID remains unchanged
      bankName,
      bankIfscCode,
      bankAccountNumber,
      bankBranch,
      bankQrCode
    };

    // Save the updated document
    await agency.save();

    return res.status(200).json({ message: "Bank details updated successfully", updatedBank: agency.bankDetails[bankIndex] });
  } catch (error) {
    console.error("Error updating bank details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const deleteBank = async (req, res) => {
  try {
    const { companyId } = req.body; // Extract company ID from request body
    const { id } = req.params; // Extract bank ID from URL parameters

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    // Find the agency (company) by ID
    const agency = await Agency.findById(companyId);
    if (!agency) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Find the bank entry in the bankDetails array
    const bankIndex = agency.bankDetails.findIndex((bank) => bank._id.toString() === id);
    if (bankIndex === -1) {
      return res.status(404).json({ message: "Bank not found" });
    }

    // Remove the bank from the array
    agency.bankDetails.splice(bankIndex, 1);

    // Save the updated agency document
    await agency.save();

    res.status(200).json({ message: "Bank deleted successfully", bankDetails: agency.bankDetails });
  } catch (error) {
    console.error("Error deleting bank:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getCompanyExecutives = async (req, res) => {
  try {
    const { companyId, page = 1, limit = 4, search = "" } = req.query;

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const query = {
      companyId,
      name: { $regex: search, $options: "i" }, // Case-insensitive search
    };

    const totalExecutives = await Executive.countDocuments(query);
    const totalPages = Math.ceil(totalExecutives / limit);

    const executives = await Executive.find(query)
      .select("name mobileNumber email")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      data: executives,
      totalPages,
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching executives", error: error.message });
  }
};


export const getExecutiveDestinations = async (req, res) => {
  const { executiveId } = req.params;
  const { page = 1, search = "" } = req.query; // Get query params
  const limit = 3; // Number of destinations per page
  const skip = (page - 1) * limit;

  try {
    // Find the executive by ID
    const executive = await Executive.findById(executiveId);

    if (!executive) {
      return res.status(404).json({ success: false, message: "Executive not found" });
    }

    // Filter destinations by search query (case insensitive)
    let filteredDestinations = executive.tourName.filter((tour) =>
      tour.label.toLowerCase().includes(search.toLowerCase())
    );

    // Apply pagination
    const paginatedDestinations = filteredDestinations.slice(skip, skip + limit);

    res.status(200).json({
      success: true,
      data: paginatedDestinations,
      total: filteredDestinations.length, // Total count of filtered results
      totalPages: Math.ceil(filteredDestinations.length / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("Error fetching executive destinations:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const deleteExecutiveDestination = async (req, res) => {
  const { executiveId, destinationId } = req.params;

  try {
    // Find the executive
    const executive = await Executive.findById(executiveId);
    if (!executive) {
      return res.status(404).json({ message: "Executive not found" });
    }

    // Filter out the destination from the tourName array
    executive.tourName = executive.tourName.filter(
      (destination) => destination._id.toString() !== destinationId
    );

    // Save the updated executive document
    await executive.save();

    res.status(200).json({ message: "Destination removed successfully" });
  } catch (error) {
    console.error("Error deleting destination:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addExecutiveDestination = async (req, res) => {
  const { executiveId } = req.params;  // Get executiveId from URL parameters
  const { destination } = req.body;    // Get the destination from the request body
  
  if (!destination || !destination._id || !destination.value || !destination.label) {
    return res.status(400).json({ message: "Invalid destination data" });
  }

  try {
    // Find the executive by ID
    const executive = await Executive.findById(executiveId);
    
    if (!executive) {
      return res.status(404).json({ message: "Executive not found" });
    }
     // Check if the destination already exists in tourName
    const isAlreadyAdded = executive.tourName.some(
      (d) => d._id.toString() === destination._id
    );

    if (isAlreadyAdded) {
      return res.status(409).json({ message: "This destination is already added" });
    }

    // Add the new destination to the tourName array
    executive.tourName.push(destination);

    // Save the updated executive document
    await executive.save();

    return res.status(200).json({ message: "Destination added successfully", executive });
  } catch (error) {
    console.error("Error adding destination:", error);
    return res.status(500).json({ message: "Failed to add destination" });
  }
};

export const getCompanyCustomerCares = async (req, res) => {
  try {
    const { companyId, page = 1, limit = 4, search = "" } = req.query;

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const query = {
      companyId,
      name: { $regex: search, $options: "i" }, // Case-insensitive search
    };

    const totalCustomerCares = await CustomerCare.countDocuments(query);
    const totalPages = Math.ceil(totalCustomerCares / limit);

    const customercares = await CustomerCare.find(query)
      .select("name mobileNumber email")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      data: customercares,
      totalPages,
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching customer cares", error: error.message });
  }
};

export const getCustomerCareDestinations = async (req, res) => {
  const { customercareId } = req.params;
  const { page = 1, search = "" } = req.query; // Get query params
  const limit = 3; // Number of destinations per page
  const skip = (page - 1) * limit;

  try {
    // Find the customer care by ID
    const customercare = await CustomerCare.findById(customercareId);

    if (!customercare) {
      return res.status(404).json({ success: false, message: "Customer care not found" });
    }

    // Filter destinations by search query (case insensitive)
    let filteredDestinations = customercare.tourName.filter((tour) =>
      tour.label.toLowerCase().includes(search.toLowerCase())
    );

    // Apply pagination
    const paginatedDestinations = filteredDestinations.slice(skip, skip + limit);

    res.status(200).json({
      success: true,
      data: paginatedDestinations,
      total: filteredDestinations.length, // Total count of filtered results
      totalPages: Math.ceil(filteredDestinations.length / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("Error fetching customer care destinations:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const addCustomerCareDestination = async (req, res) => {
  const { customercareId } = req.params;  // Get customercareId from URL parameters
  const { destination } = req.body;    // Get the destination from the request body
  
  if (!destination || !destination._id || !destination.value || !destination.label) {
    return res.status(400).json({ message: "Invalid destination data" });
  }

  try {
    // Find the customer care by ID
    const customercare = await CustomerCare.findById(customercareId);
    
    if (!customercare) {
      return res.status(404).json({ message: "customercare not found" });
    }
     // Check if the destination already exists in tourName
    const isAlreadyAdded = customercare.tourName.some(
      (d) => d._id.toString() === destination._id
    );

    if (isAlreadyAdded) {
      return res.status(409).json({ message: "This destination is already added" });
    }

    // Add the new destination to the tourName array
   customercare.tourName.push(destination);

    // Save the updated customercare document
    await customercare.save();

    return res.status(200).json({ message: "Destination added successfully", customercare });
  } catch (error) {
    console.error("Error adding destination:", error);
    return res.status(500).json({ message: "Failed to add destination" });
  }
};
export const deleteCustomerCareDestination = async (req, res) => {
  const { customercareId, destinationId } = req.params;

  try {
    // Find the executive
    const customercare = await CustomerCare.findById(customercareId);
    if (!customercare) {
      return res.status(404).json({ message: "customercare not found" });
    }

    // Filter out the destination from the tourName array
    customercare.tourName = customercare.tourName.filter(
      (destination) => destination._id.toString() !== destinationId
    );

    // Save the updated executive document
    await customercare.save();

    res.status(200).json({ message: "Destination removed successfully" });
  } catch (error) {
    console.error("Error deleting destination:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getFrontOfficerDestinationCount = async (req, res) => {
  try {
    const { destinationId, startDate, endDate } = req.body;

    if (!destinationId || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end day

    const result = await Client.aggregate([
      {
        $match: {
          "primaryTourName._id": new mongoose.Types.ObjectId(destinationId),
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$frontOfficerId",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "frontoffices",
          localField: "_id",
          foreignField: "_id",
          as: "frontOfficer",
        },
      },
      {
        $unwind: "$frontOfficer",
      },
      {
        $project: {
          name: "$frontOfficer.name",
          count: 1,
        },
      },
    ]);
       if (result.length === 0) {
      return res.status(200).json({ message: "No clients created" });
    }
    res.json(result);
  } catch (err) {
    console.error("Error in aggregation:", err);
    res.status(500).json({ message: "Server error" });
  }
};