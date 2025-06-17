import mongoose from "mongoose";

const agencySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
    },
    landLineNumber: {
      type: String,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    logo: {
      type: String,
      trim: true,
    },
    authentication: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    verifyotp: {
      type: String,
    },
    role: {
      type: String,
      default: "agency",
    },
    gstNumber: {
      type: String,
      trim: true,
    },
    buildingName: {
      type: String,
      trim: true,
    },
    streetOrLocality: {
      type: String,
      trim: true,
    },
    bankDetails: {
      type: [
        {
          bankName: { type: String, trim: true, required: true },
          bankIfscCode: { type: String, trim: true, required: true },
          bankAccountNumber: { type: String, trim: true, required: true },
          bankBranch: { type: String, trim: true, required: true },
          bankQrCode: { type: String, trim: true }, // Store QR code as a URL
        },
      ],
      default: [], // Ensures it starts as an empty array if no banks are added
    },
    cgstPercentage: {
      type: Number,
      default: 0, // Default value to avoid null issues
    },
    sgstPercentage: {
      type: Number,
      default: 0, // Default value to avoid null issues
    },
      sacNumber: {
  type: String,
  default: "", // Optional field, no validation
},
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Agency", agencySchema);
