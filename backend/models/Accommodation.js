import mongoose from "mongoose";
const accommodationSchema = new mongoose.Schema({
  propertyName: {
    type: String,
    required: true,
  },
  ownerOrManagerName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  whatsappNumber: {
    type: String,
  },
  roomCategory: {
    type: String,
    enum: [
      'Budget', 'Standard', 'Deluxe', '3 Star', '4 Star', '5 Star',
      'Tent Stay', 'Home Stay', 'Apartment', 'House Boat'
    ],
    required: true,
  },
  // Individual fields for each room type and their respective prices
  price_2bed_ap: {
    type: Number,
    required: false,
  },
  price_2bed_cp: {
    type: Number,
    required: false,
  },
  price_2bed_map: {
    type: Number,
    required: false,
  },
  price_3bed_ap: {
    type: Number,
    required: false,
  },
  price_3bed_cp: {
    type: Number,
    required: false,
  },
  price_3bed_map: {
    type: Number,
    required: false,
  },
  price_extrabed_ap: {
    type: Number,
    required: false,
  },
  price_extrabed_cp: {
    type: Number,
    required: false,
  },
  price_extrabed_map: {
    type: Number,
    required: false,
  },
  earlyCheckInPrice: {
    type: Number,
    required: false,
  },
  lateCheckoutPrice: {
    type: Number,
    required: false,
  },
  freshUpPrice: {
    type: Number,
    required: false,
  },
  destinationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination', // Refer to the Destination model
    required: true,
  },
  // Destination name
  destinationName: {
    type: String,
    required: true,
  },
  // Purchaser details
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
  accommodationId: {
    type: String,
    required: true,
    unique: true, // Ensure that the identifier is unique
  },
}, { timestamps: true });

export default mongoose.model('Accommodation', accommodationSchema);

