import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  purchaserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Purchaser', // Reference to the Purchaser model
    required: true,
  },
  purchaserName: {
    type: String,
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company', // Reference to the Company model
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
}, { timestamps: true });

 export default mongoose.model('Destination', destinationSchema);

