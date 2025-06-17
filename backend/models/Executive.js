import mongoose from "mongoose";

const executiveSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agency",
    required: true,
  },
  count: {
    type: Number,
  },
  tourName: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      value: {
        type: String,
        required: true
      },
      label: {
        type: String,
        required: true
      }
    }
  ],
  
});

export default mongoose.model("Executive", executiveSchema);
