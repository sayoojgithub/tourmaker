import mongoose from 'mongoose';

const CustomItinerarySchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true }, // Store clientId
  totalPrice: { type: Number, required: true }, // Store totalPrice
  tripName: {
    value: { type: String, required: true },
    label: { type: String, required: true },
    description: {type: String, required: true}
  },
  vehicles: [{
    value: { type: String, required: true },
    label: { type: String, required: true },
    id: { type: Number, required: true },
    count: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  addOnTrips: [{
    addOnTripName: {
      value: { type: String, required: true },
      label: { type: String, required: true },
      description: {type: String, required: true}
    },
    vehicles: [{
      value: { type: String, required: true },
      label: { type: String, required: true },
      id: { type: Number, required: true },
      count: { type: Number, required: true },
      price: { type: Number, required: true }
    }]
  }],
  activities: [{
    value: { type: String, required: true },
    label: { type: String, required: true },
    description: {type: String, required: true},
    count: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  hotels: [{
    id: { type: String, required: true },
    roomCategory: {
      value: { type: String, required: true },
      label: { type: String, required: true }
    },
    roomName: {
      value: { type: String, required: true },
      label: { type: String, required: true }
    },
    roomPriceType: {
      value: { type: String, required: true },
      label: { type: String, required: true }
    },
    count: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  day: {
    value: { type: Number, required: true },
    label: { type: String, required: true }
  },
  destination: {
    value: { type: String, required: true },
    label: { type: String, required: true }
  },
  downloadDate: { type: Date, default: null },
  executiveId: { type: mongoose.Schema.Types.ObjectId, ref: 'Executive' }, // Executive details
  executiveName: { type: String },
  executivePhoneNumber: { type: String },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
});

export default mongoose.model('CustomItinerary', CustomItinerarySchema);
