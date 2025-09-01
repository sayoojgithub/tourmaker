import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    whatsappNumber: {
      type: String,
    },
    additionalNumber: {
      type: String,
    },
    primaryTourName: {
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
    tourName: [
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
    ],
    groupType: {
      value: {
        type: String,
      },
      label: {
        type: String,
      },
    },
    numberOfPersons: {
      type: Number,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    numberOfDays: {
      type: Number,
      required: true,
    },
    pincode: {
      type: String,
    },
    district: {
      type: String,
    },
    state: {
      type: String,
    },
    clientContactOption: {
      value: {
        type: String,
      },
      label: {
        type: String,
      },
    },
    clientType: {
      value: {
        type: String,
      },
      label: {
        type: String,
      },
    },
    clientCurrentLocation: {
      value: {
        type: String,
      },
      label: {
        type: String,
      },
    },
    connectedThrough: {
      value: {
        type: String,
      },
      label: {
        type: String,
      },
    },
    behavior: {
      value: {
        type: String,
      },
      label: {
        type: String,
      },
    },
    additionalRequirments: {
      type: String,
    },
    gstNumber: {
      type: String,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agency",
      required: true,
    },
    frontOfficerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Frontoffice",
      required: true,
    },
    executiveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Executive",
      required: true,
    },
     customerCareId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"CustomerCare",
    },
    clientId: {
      type: String,
      required: true,
    },
      clientByEntryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ClientByEntry",
  },
  createdAtByEntry: {
    type: Date, // timestamp from ClientByEntry.createdAtByEntry
  },
    executiveVisitedStatus: {
      type: Boolean,
      default: false,
    },
    confirmedStatus: {
      type: Boolean,
      default: false,
    },
    bookedStatus: {
      type: Boolean,
      default: false,
    },
    ongoingStatus: {
      type: Boolean,
      default: false,
    },
    completedStatus: {
      type: Boolean,
      default: false,
    },
     homeReachedStatus: {
      type: Boolean,
      default: false,
    },
    reviewStatus: {
      type: Boolean,
      default: false,
    },
    status: [
      {
        value: {
          type: String,
          required: true,
        },
        label: {
          type: String,
          required: true,
        },
      },
    ],
    scheduleDate: [
      {
        type: Date,
      },
    ],
    response: [
      {
        type: String,
      },
    ],
    notes: [
      {
        type: String,
      },
    ],
    itinerary: [
      {
        itineraryId: { type: mongoose.Schema.Types.ObjectId, required: true },
        itineraryType: { type: String, required: true },
        dateId: { type: mongoose.Schema.Types.ObjectId, required: true },
        status: { type: String },
        time: { type: Date, default: Date.now },
      },
    ],
    confirmedDateAt: {
      type: Date,
    },
    finalizedTourDate: {
      type: String,
    },
    finalizedTourDateAt: {
      type: Date,
    },
     finalizedTourEndDateAt: {
      type: Date,
    },
    dueDate: {
      type: String,
    },
    dueDateAt: {
      type: Date, // Added field for due date in Date format
    },

    amountToBePaid: {
      type: Number,
      set: (v) => Math.ceil(v),
    },
    itineraryDetails: {
      heading: String,
      clientName: String,
      destination: String,
      tourName: String,
      articleNumber: String,
      duration: String,
      date: String,
      pricePerHead: Number,
      totalCost: Number,
      itineraryText: String,
      inclusionsList: [String],
      exclusionsList: [String],
      downloadDate: String,
    },
    invoiceNumber: {
      type: Number,
    },
    invoiceDate: {
      type: String,
    },
    invoiceDateAt: {
      type: Date, // Proper Date object
    },
    trackSheetNumber: {
      type: Number,
    },
    sgst: {
      type: Number,
    },
    cgst: {
      type: Number,
    },
    totalCost: {
      type: Number,
    },
    totalCostWithAdditionalAmount: {
      type: Number,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    balance: {
      type: Number,
      set: (v) => Math.ceil(v),
    },
    additionalItems: [
      {
        id: Number,
        description: String,
        qty: Number,
        rate: Number,
        amount: Number,
      },
    ],
    discount: {
      type: Number,
    },
    feedbacks: [
      {
        status: String,
        conditions: [String],
        scheduleDate: Date,
        scheduleTime: String,
        comment: String,
        submittedDate: String,
        submittedTime: String,
        submittedDateAt:Date,
        submittedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "CustomerCare", 
        },
      },
    ],
    confirmedDestination: {
  id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination' // optional, only if you have a Destination model
  },
  name: {
    type: String,
  }
}
  },
  { timestamps: true }
);

export default mongoose.model("Client", clientSchema);
