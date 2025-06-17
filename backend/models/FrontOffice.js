import mongoose from "mongoose";

const frontofficeSchema = new mongoose.Schema({
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
  creationPoints: [
    {
      date: { type: Date, required: true },
      percentage: { type: Number, required: true },
      awardedPoint: { type: Number, required: true }
    }
  ],
  salesPoints: [
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    awardedPoint: {
      type: Number,
      required: true,
    },
  }
]
});

export default mongoose.model("Frontoffice", frontofficeSchema);
