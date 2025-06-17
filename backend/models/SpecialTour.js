import mongoose from "mongoose";

const specialTourSchema = new mongoose.Schema(
  {
    destination: {
      _id: { type: mongoose.Schema.Types.ObjectId, required: true },
      value: { type: String, required: true },
      label: { type: String, required: true },
    },
    tourName: { type: String, required: true },
    articleNumber: { type: String, required: true },
    day: { type: Number, required: true },
    night: { type: Number, required: true },
    category: {
      value: { type: String, required: true },
      label: { type: String, required: true },
    },
    validStartDate: { type: Date, required: true },
    validEndDate: { type: Date, required: true },
    tourStartFrom: { type: String, required: true },
    inclusionsList: [{ type: String }],
    exclusionsList: [{ type: String }],
    itineraryText: { type: String },
    1: { type: String,}, 
    2: { type: String,}, 
    3: { type: String,}, 
    4: { type: String,},
    5: { type: String,},
    6: { type: String,},
    7: { type: String,},
    8: { type: String,},
    9: { type: String,},
    10: { type: String,},
    11: { type: String,},
    12: { type: String,},
    13: { type: String,},
    14: { type: String,},
    15: { type: String,},
    16: { type: String,},
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agency", // Reference to the agency/company
    },
    purchaserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase", // Reference to the purchaser
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

export default mongoose.model("SpecialTour", specialTourSchema);
