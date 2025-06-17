import mongoose from "mongoose";

const pointSchema = new mongoose.Schema({
   companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agency",
      required: true,
    },
  role: {
    type: String,
    enum: ["Front Office", "Executive", "Billing", "Customer Care"],
    required: true
  },
  points: {
    type: Map,
    of: Number,
    required: true
  }
}, { timestamps: true });

export default mongoose.model("Points", pointSchema);