import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
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
    tripName: {
      type: String,
      required: true,
    },
    tripDescription: {
      type: String,
      required: true,
    },
    travelsDetails: [
      {
        travelsName: {
          type: String,
          required: true,
        },
        vehicleCategory: {
          type: String,
          required: true,
        },
        vehicleName: {
          type: String,
          required: true,
        },
        vehicleId: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
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
  },
  { timestamps: true }
);

export default mongoose.model("Trip", tripSchema);
