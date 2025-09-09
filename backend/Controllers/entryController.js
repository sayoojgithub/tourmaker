import mongoose from "mongoose";
import ClientByEntry from "../models/ClientByEntry.js";
import PDFDocument from "pdfkit";
import Entry from "../models/Entry.js";
export const getEntryDetails = async (req, res) => {
  const { entryId } = req.params;

  try {
    const entry = await Entry.findById(entryId);

    if (!entry) {
      return res.status(404).json({ message: "not found" });
    }

    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createClientByEntry = async (req, res) => {
  try {
    const { name, mobileNumber, primaryTourName, entryId } = req.body;

    if (!entryId) {
      return res.status(400).json({ message: "entryId is required" });
    }
    if (!mobileNumber) {
      return res.status(400).json({ message: "mobileNumber is required" });
    }
    if (
      !primaryTourName ||
      !primaryTourName._id ||
      !primaryTourName.value ||
      !primaryTourName.label
    ) {
      return res
        .status(400)
        .json({ message: "primaryTourName with _id, value, label is required" });
    }

    // Find the entry to derive companyId
    const entry = await Entry.findById(entryId);
    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    const companyId = entry.companyId;

    // Coerce _id to ObjectId if sent as string
    const primaryTourSubdoc = {
      _id:
        typeof primaryTourName._id === "string"
          ? new mongoose.Types.ObjectId(primaryTourName._id)
          : primaryTourName._id,
      value: primaryTourName.value,
      label: primaryTourName.label,
    };

    const doc = await ClientByEntry.create({
      name: name || "",
      mobileNumber,
      primaryTourName: primaryTourSubdoc,
      entryId: entry._id,
      companyId,
      // createdAtByEntry set automatically via default
      // frontOfficeCreatedStatus defaults to false
    });

    return res.status(201).json({
      message: "Client created successfully",
      client: doc,
    });
  } catch (err) {
    console.error("createClientByEntry error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Internal Server Error" });
  }
};

export const searchClientsByEntry = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page ?? "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit ?? "5", 10), 1);
    const search = (req.query.search ?? "").trim();
    const entryId = req.query.entryId?.trim();

    if (!entryId || !mongoose.Types.ObjectId.isValid(entryId)) {
      return res.status(400).json({ message: "Valid entryId (user _id) is required" });
    }

    const match = { entryId: new mongoose.Types.ObjectId(entryId) };

    // mobile number partial search (case-insensitive)
    if (search) {
      match.mobileNumber = { $regex: new RegExp(search, "i") };
    }

    const [clients, totalClients] = await Promise.all([
      ClientByEntry.find(match)
        .sort({ createdAtByEntry: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select({
          name: 1,
          mobileNumber: 1,
          primaryTourName: 1,
          frontOfficeCreatedStatus: 1,
          createdAtByEntry: 1,
        })
        .lean(),
      ClientByEntry.countDocuments(match),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalClients / limit));

    return res.json({
      page,
      limit,
      totalPages,
      totalClients,
      clients,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch clients" });
  }
};

export const downloadClientsReport = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Valid userId (entryId) is required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const officer = await Entry.findById(userId).lean();
    if (!officer) {
      return res.status(404).json({ message: "Entry (officer) not found" });
    }

    const clients = await ClientByEntry.find({
      entryId: new mongoose.Types.ObjectId(userId),
      createdAtByEntry: { $gte: start, $lte: end },
    })
      .sort({ createdAtByEntry: 1 })
      .lean();

    if (!clients.length) {
      return res.status(404).json({ message: "No clients found in the selected range" });
    }

    // PDF setup
    const doc = new PDFDocument({ margin: 50 });
    const filename = `clients_${start.toISOString().split("T")[0]}_${end
      .toISOString()
      .split("T")[0]}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    doc.pipe(res);

    // --------- Layout constants (single source of truth) ----------
    const MARGIN = 40; // page margin for all sides
    const PAGE_W = doc.page.width;
    const PAGE_H = doc.page.height;
    const LEFT = MARGIN;
    const RIGHT = PAGE_W - MARGIN;
    const TOP = MARGIN;
    const BOTTOM = PAGE_H - MARGIN;
    const TABLE_X = LEFT;
    const TABLE_W = RIGHT - LEFT;

    const HEADER_LINE_H = 18;
    const ROW_H = 15;

    // Columns as percentages of TABLE_W (must sum ~ 1.0)
    // [No, Name, Destination, Mobile, Created Date, Created Time, FO Status]
    const COLS_PCT = [0.06, 0.23, 0.23, 0.14, 0.13, 0.11, 0.10];

    // Convert pct -> pixel widths that sum exactly to TABLE_W (avoid rounding spill)
    const baseWidths = COLS_PCT.map(p => Math.floor(p * TABLE_W));
    const diff = TABLE_W - baseWidths.reduce((a, b) => a + b, 0);
    baseWidths[baseWidths.length - 1] += diff; // add remainder to last column
    const COL_W = baseWidths; // final column widths in px

    const HEADERS = ["No", "Name", "Destination", "Mobile", "Created Date", "Time", "FO Status"];

    // ------------- Helpers ----------------
    const drawPageBorder = () => {
      doc
        .rect(LEFT - 15, TOP - 15, PAGE_W - (LEFT - 15) * 2, PAGE_H - (TOP - 15) * 2)
        .strokeColor("black")
        .lineWidth(1.2)
        .stroke();
    };

    const drawHeader = () => {
      const generatedAt = new Date().toLocaleString("en-GB");
      const s = start.toLocaleDateString("en-GB");
      const e = end.toLocaleDateString("en-GB");

      doc.font("Helvetica-Bold").fontSize(16).fillColor("black");
      doc.text(`ENTRY: ${String(officer.name || "").toUpperCase()}`, { align: "center" });
      doc.moveDown(0.25);
       // Company Name (added here)
      doc.font("Helvetica").fontSize(12).fillColor("black");
      doc.text(`Company: ${officer.companyName || "N/A"}`, { align: "center" });
      doc.moveDown(0.25);
      doc.font("Helvetica").fontSize(11);
      doc.text(`Date Range: ${s} to ${e}`, { align: "center" });
      doc.moveDown(0.15);
      doc.text(`Generated At: ${generatedAt}`, { align: "center" });
      doc.moveDown(0.5);
    };

    // Truncate a string to fit width with ellipsis
    const truncateToWidth = (text, width, font = "Helvetica", size = 10, padding = 8) => {
      if (text == null) return "";
      doc.font(font).fontSize(size);
      const max = Math.max(0, width - padding);
      let str = String(text);
      if (doc.widthOfString(str) <= max) return str;
      const ell = "…";
      while (str.length > 0 && doc.widthOfString(str + ell) > max) {
        str = str.slice(0, -1);
      }
      return str + ell;
    };

    const drawTableHeader = (y) => {
      doc.font("Helvetica-Bold").fontSize(10).fillColor("black");
      let x = TABLE_X;
      HEADERS.forEach((h, i) => {
        doc.text(h, x + 4, y + 4, { width: COL_W[i], align: "left" });
        doc.rect(x, y, COL_W[i], HEADER_LINE_H).strokeColor("black").lineWidth(1).stroke();
        x += COL_W[i];
      });
      return y + HEADER_LINE_H;
    };

    const drawRow = (y, index, c) => {
      doc.font("Helvetica").fontSize(10).fillColor("black");

      const created = c.createdAtByEntry ? new Date(c.createdAtByEntry) : null;
      const createdDate = created ? created.toLocaleDateString("en-GB") : "-";
      const createdTime = created
        ? created.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
        : "-";

      const values = [
        index + 1,
        truncateToWidth(c.name || "-", COL_W[1]),
        truncateToWidth(c.primaryTourName?.label || c.primaryTourName?.value || "-", COL_W[2]),
        truncateToWidth(c.mobileNumber || "-", COL_W[3]),
        createdDate,
        createdTime,
        c.frontOfficeCreatedStatus ? "Created" : "Pending",
      ];

      let x = TABLE_X;
      values.forEach((v, i) => {
        doc.text(String(v), x + 4, y + 3, { width: COL_W[i], align: "left" });
        doc.rect(x, y, COL_W[i], ROW_H).strokeColor("black").lineWidth(0.8).stroke();
        x += COL_W[i];
      });
      return y + ROW_H;
    };

    // ---------- Pagination-aware rendering ----------
    const renderPage = (startIndex, rowsPerPage) => {
      if (startIndex > 0) {
        doc.addPage();
      }
      drawPageBorder();
      drawHeader();
      let y = drawTableHeader(doc.y);
      let i = startIndex;
      const limit = Math.min(clients.length, startIndex + rowsPerPage);
      for (; i < limit; i++) {
        y = drawRow(y, i, clients[i]);
      }
      return i; // next start index
    };

    // First page
    drawPageBorder();
    drawHeader();
    let y = drawTableHeader(doc.y);

    // Rows per page calc (first page)
    const availableFirst = BOTTOM - y - 10; // 10px breathing room
    const rowsFirst = Math.max(1, Math.floor(availableFirst / ROW_H));

    // Fill first page
    let idx = 0;
    for (; idx < Math.min(rowsFirst, clients.length); idx++) {
      y = drawRow(y, idx, clients[idx]);
    }

    // Subsequent pages
    while (idx < clients.length) {
      // Layout again on a fresh page to compute available height exactly
      doc.addPage();
      drawPageBorder();
      drawHeader();
      let y2 = drawTableHeader(doc.y);
      const availableOther = BOTTOM - y2 - 10;
      const rowsOther = Math.max(1, Math.floor(availableOther / ROW_H));

      let rowsDrawn = 0;
      while (rowsDrawn < rowsOther && idx < clients.length) {
        y2 = drawRow(y2, idx, clients[idx]);
        rowsDrawn++;
        idx++;
      }
    }

    // Footer on last page
    doc.moveDown(1.2);
    const footerY = Math.min(doc.y + 10, BOTTOM - 30);
    doc
      .font("Helvetica")
      .fontSize(12)
      .text("Executive: __________________", LEFT, footerY, { continued: true })
      .text("  Manager: __________________");

    doc.end();
  } catch (err) {
    console.error("downloadClientsReport error:", err);
    return res.status(500).json({ message: "An error occurred while generating the PDF" });
  }
};