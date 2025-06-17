import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  destinationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination', // Refer to the Destination model
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
  tripNameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip', // Refer to the Destination model
    required: true,
  },
  activityName: {
    type: String,
    required: true,
  },
  activityDescription: {
    type: String,
  },
  pricePerHead: {
    type: Number,
    required: true,
    min: 0, // Ensure the price is a positive number
  },
  purchaserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Purchase',
    required: true,
  },
  purchaserName: {
    type: String,
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Activity', activitySchema);
