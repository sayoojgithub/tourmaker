import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";

const LedgerDetails = ({ clientId }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0); // State for total transactions
  const [sumOfAmounts, setSumOfAmounts] = useState(0); // State for sum of amounts

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        clientId, // Pass clientId directly
      });

      console.log("Query Params:", queryParams.toString()); // Debugging line

      const response = await fetch(
        `${BASE_URL}/billing/transactions?${queryParams}` // Adjust the endpoint to reflect transaction fetching
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch transactions");
      }
      const data = await response.json();
      setTransactions(data.transactions); // Update with transaction data
      setTotalPages(data.totalPages); // Set total pages for pagination
      setTotalTransactions(data.totalTransactions); // Set total transactions
      setSumOfAmounts(data.sumOfAmounts); // Set sum of amounts
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      toast.error(
        error.message || "An error occurred while fetching transactions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(); // Call to fetch transactions for the specific clientId
  }, [currentPage, clientId]); // Re-run when currentPage or clientId changes
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="p-6 bg-white/20 shadow-2xl rounded-lg mt-1">
    
      <h2 className="text-2xl font-semibold mb-4 text-center">Transactions</h2>
  
        {/* Highlighting Text */}
  <div className="mb-4 text-lg font-bold text-black bg-white/20 p-2 rounded-lg text-center">
    This client has made <span className="text-red-600">{totalTransactions}</span> transactions worth 
    <span className="text-red-600"> ₹{sumOfAmounts}</span>
  </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 text-left rounded-lg">
          <thead className="bg-gray-400">
            <tr>
              <th className="px-4 py-2 border-b font-extrabold">
                Transaction ID
              </th>
              <th className="px-4 py-2 border-b font-extrabold">
                Payment Mode
              </th>
              <th className="px-4 py-2 border-b font-extrabold">Amount</th>
              <th className="px-4 py-2 border-b font-extrabold">Sender Name</th>
              <th className="px-4 py-2 border-b font-extrabold">Date</th>
              <th className="px-4 py-2 border-b font-extrabold">Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : transactions.length > 0 ? (
              transactions.map((transaction) => {
                // Format createdAt to separate date and time
                const createdAt = new Date(transaction.createdAt);
                // Format date as day-month-year (DD-MM-YYYY)
                const formattedDate = `${String(createdAt.getDate()).padStart(
                  2,
                  "0"
                )}-${String(createdAt.getMonth() + 1).padStart(
                  2,
                  "0"
                )}-${createdAt.getFullYear()}`;
                // Format time as HH:MM:SS
                const formattedTime = createdAt.toLocaleTimeString();

                return (
                  <tr key={transaction._id} className="hover:bg-white/20">
                    <td className="px-4 py-2 border-b font-bold">
                      {transaction.transactionId || "N/A"}
                    </td>
                    <td className="px-4 py-2 border-b font-bold">
                      {transaction.paymentMode}
                    </td>
                    <td className="px-4 py-2 border-b font-bold">
                      {transaction.amount}
                    </td>
                    <td className="px-4 py-2 border-b font-bold">
                      {transaction.senderName}
                    </td>
                    <td className="px-4 py-2 border-b font-bold">
                      {formattedDate} {/* Display Date */}
                    </td>
                    <td className="px-4 py-2 border-b font-bold">
                      {formattedTime} {/* Display Time */}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center p-4 font-extrabold text-red-600"
                >
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-full text-white ${
            currentPage === 1 ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          &#8592;
        </button>
        <span className="mx-4 w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white font-semibold">
          {currentPage}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-full text-white ${
            currentPage === totalPages
              ? "bg-gray-300"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          &#8594;
        </button>
      </div>
    </div>
  );
};

export default LedgerDetails;
