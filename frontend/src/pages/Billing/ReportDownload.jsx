import React, { useState } from "react";
import { BASE_URL } from "../../config";

const ReportDownload = () => {
  const [startInvoice, setStartInvoice] = useState("");
  const [endInvoice, setEndInvoice] = useState("");
  const [startDueDate, setStartDueDate] = useState("");
  const [endDueDate, setEndDueDate] = useState("");
  const [startTourDate, setStartTourDate] = useState("");
  const [endTourDate, setEndTourDate] = useState("");
  const [startInvoiceDate, setStartInvoiceDate] = useState("");
  const [endInvoiceDate, setEndInvoiceDate] = useState("");

  const handleInvoiceSearch = async () => {
    if (!startInvoice || !endInvoice) {
      toast.error("Please enter both start and end invoice numbers");
      return;
    }
    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.error("User not found. Please log in again.");
      return;
    }
    const user = JSON.parse(storedUser);
    if (!user._id) {
      toast.error("User ID is missing. Please log in again.");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/billing/downloadInvoiceBasedData`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ startInvoice, endInvoice, userId: user._id }),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "AcountsReport.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("Invoice PDF downloaded successfully");
      } else {
        const errorData = await response.json();
        const errorMessage =
          errorData.message || "Failed to download invoice PDF";
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error("An error occurred while downloading the PDF");
    }
  };

  const handleDateSearch = async () => {
    if (!startDueDate || !endDueDate) {
      toast.error("Please enter both start and end dates");
      return;
    }

    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.error("User not found. Please log in again.");
      return;
    }

    const user = JSON.parse(storedUser);
    if (!user._id) {
      toast.error("User ID is missing. Please log in again.");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/billing/downloadDueDateBasedData`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ startDueDate, endDueDate, userId: user._id }),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "AcountsReport.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success(" PDF downloaded successfully");
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || "Failed to download  PDF";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("An error occurred while downloading the PDF");
    }
  };

  const handleSearchBasedOnTourDate = async () => {
    if (!startTourDate || !endTourDate) {
      toast.error("Please enter both start and end dates");
      return;
    }

    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.error("User not found. Please log in again.");
      return;
    }

    const user = JSON.parse(storedUser);
    if (!user._id) {
      toast.error("User ID is missing. Please log in again.");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/billing/downloadTourDateBasedData`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startTourDate,
            endTourDate,
            userId: user._id,
          }),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "AcountsReport.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("PDF downloaded successfully");
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || "Failed to download  PDF";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("An error occurred while downloading the PDF");
    }
  };

  const handleSearchBasedOnInvoiceDate = async () => {
    if (!startInvoiceDate || !endInvoiceDate) {
      toast.error("Please enter both start and end dates");
      return;
    }

    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.error("User not found. Please log in again.");
      return;
    }

    const user = JSON.parse(storedUser);
    if (!user._id) {
      toast.error("User ID is missing. Please log in again.");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/billing/downloadInvoiceDateBasedData`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startInvoiceDate,
            endInvoiceDate,
            userId: user._id,
          }),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "AcountsReport.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("PDF downloaded successfully");
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || "Failed to download  PDF";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("An error occurred while downloading the PDF");
    }
  };

  const handleDownloadConfirmedClientsWithoutAnyPayments = async () => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.error("User not found. Please log in again.");
      return;
    }

    const user = JSON.parse(storedUser);
    if (!user._id) {
      toast.error("User ID is missing. Please log in again.");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/billing/downloadConfirmedClientsWithoutAnyPayments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user._id,
          }),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "AcountsReport.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("PDF downloaded successfully");
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || "Failed to download  PDF";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("An error occurred while downloading the PDF");
    }
  };

  return (
    <div className="w-full max-w-[90vw]  mx-auto p-6 bg-white/20 backdrop-blur-lg shadow-2xl rounded-2xl border border-white/30">
      {/* Title */}
      <div className="flex items-center justify-center mb-1">
    <div className="flex items-center gap-1 bg-white/30 px-4 py-1 rounded-lg shadow">
      <h2 className="text-xl font-bold text-red-600 text-center mb-1">
        Download Reports
      </h2>
      </div>
      </div>

      {/* Invoice Search */}
      <div className="mb-1">
        <label className="block text-lg font-medium text-gray-900 mb-1">
          Invoice Number Range
        </label>
        <div className="flex gap-3 items-center">
          <input
            type="text"
            placeholder="Start Invoice Number"
            value={startInvoice}
            onChange={(e) => setStartInvoice(e.target.value)}
            className="w-1/2 p-1 bg-gray-100 text-gray-900 placeholder-gray-500 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
          />
          <input
            type="text"
            placeholder="End Invoice Number"
            value={endInvoice}
            onChange={(e) => setEndInvoice(e.target.value)}
            className="w-1/2 p-1 bg-gray-100 text-gray-900 placeholder-gray-500 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
          />
          <button
            onClick={handleInvoiceSearch}
            className="p-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:opacity-90 transition duration-300 shadow-md"
          >
            📥
          </button>
        </div>
      </div>

      {/* Due Date Search */}
      <div className="mb-2">
        <label className="block text-lg font-medium text-gray-900 mb-2">
          Due Date Range
        </label>
        <div className="flex gap-3 items-center">
          <input
            type="date"
            value={startDueDate}
            onChange={(e) => setStartDueDate(e.target.value)}
            className="w-1/2 p-1 bg-gray-100 text-gray-900 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-md"
          />
          <input
            type="date"
            value={endDueDate}
            onChange={(e) => setEndDueDate(e.target.value)}
            className="w-1/2 p-1 bg-gray-100 text-gray-900 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-md"
          />
          <button
            onClick={handleDateSearch}
            className="p-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:opacity-90 transition duration-300 shadow-md"
          >
            📥
          </button>
        </div>
      </div>
      {/* Tour Date Search */}
      <div className="mb-2">
        <label className="block text-lg font-medium text-gray-900 mb-2">
          Tour Date Range
        </label>
        <div className="flex gap-3 items-center">
          <input
            type="date"
            value={startTourDate}
            onChange={(e) => setStartTourDate(e.target.value)}
            className="w-1/2 p-1 bg-gray-100 text-gray-900 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-md"
          />
          <input
            type="date"
            value={endTourDate}
            onChange={(e) => setEndTourDate(e.target.value)}
            className="w-1/2 p-1 bg-gray-100 text-gray-900 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-md"
          />
          <button
            onClick={handleSearchBasedOnTourDate}
            className="p-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:opacity-90 transition duration-300 shadow-md"
          >
            📥
          </button>
        </div>
      </div>
      {/* Invoice Date Search */}
      <div className="mb-2">
        <label className="block text-lg font-medium text-gray-900 mb-2">
          Invoice Date Range
        </label>
        <div className="flex gap-3 items-center">
          <input
            type="date"
            value={startInvoiceDate}
            onChange={(e) => setStartInvoiceDate(e.target.value)}
            className="w-1/2 p-1 bg-gray-100 text-gray-900 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-md"
          />
          <input
            type="date"
            value={endInvoiceDate}
            onChange={(e) => setEndInvoiceDate(e.target.value)}
            className="w-1/2 p-1 bg-gray-100 text-gray-900 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-md"
          />
          <button
            onClick={handleSearchBasedOnInvoiceDate}
            className="p-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:opacity-90 transition duration-300 shadow-md"
          >
            📥
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={handleDownloadConfirmedClientsWithoutAnyPayments}
        className="w-full p-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-300 shadow-md"
      >
        Download Confirmed Clients Without Any Payment
      </button>
    </div>
  );
};

export default ReportDownload;
