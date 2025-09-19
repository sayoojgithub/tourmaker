import mongoose from "mongoose";

const PrimaryTourSubSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    value: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
  },
  { _id: false } // prevent automatic _id generation for the subschema
);

const ClientByEntrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    primaryTourName: {
      type: PrimaryTourSubSchema,
      required: true,
    },
    entryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Entry",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agency",
      required: true,
    },
    createdAtByEntry: {
      type: Date,
      default: Date.now,
    },
    frontOfficeCreatedStatus: {
      type: Boolean,
      default: false,
    },
        connectedThrough: {
      value: { type: String, },
      label: { type: String, },
    },
    clientType: {
      value: { type: String },
      label: { type: String },
    },
  },
  {
    timestamps: true, // keeps createdAt/updatedAt too (separate from createdAtByEntry)
  }
);

export default mongoose.model("ClientByEntry", ClientByEntrySchema);
