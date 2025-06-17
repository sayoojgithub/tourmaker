import mongoose from "mongoose";

const fixedTourSchema = new mongoose.Schema({
  destination: {
    _id: { type: mongoose.Schema.Types.ObjectId },
    value: { type: String },
    label: { type: String },
  },
  tourName: { type: String },
  articleNumber: { type: String },
  day: { type: Number },
  night: { type: Number },
  totalPax: { type: Number },
  mrp: { type: Number },
  category: {
    value: { type: String },
    label: { type: String },
  },
  startDates: [{
    date: { type: Date },
    totalPax: { type: Number },
    booked: { type: Number, default: 0 }, // Default booked seats to 0
    available: {
      type: Number,
      default: function () {
        return this.totalPax; 
      },
    },
  }],
  tourStartFrom: { type: String },
  inclusionsList: [{ type: String }],
  exclusionsList: [{ type: String }],
  itineraryText: { type: String },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency' }, // Add company reference
  purchaserId: { type: mongoose.Schema.Types.ObjectId, ref: 'Purchase' }, // Add purchaser reference
}, { timestamps: true });

export default mongoose.model('FixedTour', fixedTourSchema);
