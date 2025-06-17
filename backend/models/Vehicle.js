import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    vehicleName: {
      type: String,
      required: true,
    },
    vehicleCategory: {
      type: String,
      required: true,
    },
    // Travel Agency information
    travelAgencyId: {
      type: String,
      required: true,
    },
    travelAgencyDocumentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Travelagency", // Reference to the Travelagency model
      required: true,
    },
    destinationName: {
      type: String,
      required: true,
    },
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination", // Refer to the Destination model
      required: true,
    },
    travelsName: {
      type: String,
      required: true,
    },
    ownerName: {
      type: String,
    },
    email: {
      type: String,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
    },
    contactNumber: {
      type: String,
      
    },
    whatsappNumber: {
      type: String,
     
    },
    address: {
      type: String,
    },

    // Purchaser details
    purchaserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase", // Reference to the Purchaser model
      required: true,
    },
    purchaserName: {
      type: String,
      required: true,
    },

    // Company details
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company", // Reference to the Company model
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Vehicle", vehicleSchema);
