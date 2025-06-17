import mongoose from "mongoose";
const travelagencySchema = new mongoose.Schema(
  {
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination", // Refer to the Destination model
      required: true,
    },
    destinationName: {
      type: String,
      required: true,
    },
    travelsName: {
      type: String,
      required: true,
    },
    ownerName: {
      type: String,
    },
    address: {
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

    // Purchaser details
    purchaserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase", // Reference to the User (Purchaser) model
      required: true,
    },
    purchaserName: {
      type: String,
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company", // Reference to the Company model
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    travelAgencyId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Travelagency", travelagencySchema);
