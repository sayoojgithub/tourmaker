import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";

const ItemEntryTable = ({ clientId }) => {
  console.log(clientId);
  const [items, setItems] = useState([]);
  const [description, setDescription] = useState("");
  const [qty, setQty] = useState("");
  const [rate, setRate] = useState("");

  // Fetch additional items when the component mounts
  useEffect(() => {
    const fetchAdditionalItems = async () => {
      if (!clientId) return;

      try {
        const response = await fetch(
          `${BASE_URL}/billing/getAdditionalItems/${clientId}`
        );
        const data = await response.json();
        console.log(data);

        if (response.ok) {
          if (data.additionalItems && data.additionalItems.length > 0) {
            setItems(data.additionalItems);
          } else {
            toast.info("No additional items added.");
          }
        }
      } catch (error) {
        console.error("Error fetching additional items:", error);
        toast.error("Something went wrong while fetching data.");
      }
    };

    fetchAdditionalItems();
  }, [clientId]);

  const handleAddItem = () => {
    if (!description || !qty || !rate) {
      toast.error("Please fill all fields");
      return;
    }
    if (items.length >= 3) {
      toast.warning("You can only add up to 3 items");
      return;
    }

    const newItem = {
      id: Date.now(),
      description,
      qty: Number.isNaN(parseInt(qty)) ? 0 : parseInt(qty), // Ensure qty is valid
      rate: Number.isNaN(parseFloat(rate)) ? 0 : parseFloat(rate), // Ensure rate is valid
      amount: parseFloat((parseInt(qty) * parseFloat(rate)).toFixed(2)), // Ensure amount is a number
    };

    setItems([...items, newItem]);
    setDescription("");
    setQty("");
    setRate("");
  };
  console.log(items);

  const handleDelete = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error("Please add at least one item before submitting.");
      return;
    }

    const requestData = {
      clientId,
      items,
      totalAmount,
    };

    try {
      const response = await fetch(`${BASE_URL}/billing/addAdditionalItems`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        toast.success("Items added successfully!");
        setItems([]); // Clear items after successful submission
      } else {
        toast.error("Failed to add items. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting items:", error);
      toast.error("Something went wrong!");
    }
  };
  const handleDeleteAll = async () => {
    if (items.length === 0) {
      toast.error("There are no items to delete.");
      return;
    }
  
    if (!clientId) {
      toast.error("Client ID is missing.");
      return;
    }
  
    try {
      const response = await fetch(`${BASE_URL}/billing/deleteAllAdditionalItems`, {
        method: "DELETE",  // Using DELETE instead of POST
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clientId }), // Ensure backend supports body for DELETE
      });
  
      if (response.ok) {
        toast.success("All items deleted successfully!");
        setItems([]); // Clear items after successful deletion
      } else {
        toast.error("Failed to delete items. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting items:", error);
      toast.error("Something went wrong!");
    }
  };
  

  return (
    <div className="p-6 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg w-full mx-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">
        Add Additional Items
      </h2>

      <div className="flex mb-4 space-x-2">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="p-2 border border-gray-300 rounded-lg flex-grow bg-white/50 placeholder-gray-600"
          maxLength={24}
        />
        <input
          type="number"
          value={qty}
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            setQty(value > 0 ? value : ""); // Ensure qty is positive
          }}
          placeholder="Qty"
          className="p-2 border border-gray-300 rounded-lg w-20 text-center bg-white/50"
        />

        <input
          type="number"
          value={rate}
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            setRate(value > 0 ? value : ""); // Ensure rate is positive
          }}
          placeholder="Rate"
          className="p-2 border border-gray-300 rounded-lg w-24 text-center bg-white/50"
        />

        <input
          type="text"
          value={
            qty && rate ? (parseInt(qty) * parseFloat(rate)).toFixed(2) : ""
          }
          placeholder="Amount"
          disabled
          className="p-2 border border-gray-300 rounded-lg w-24 text-center bg-gray-100"
        />

        <button
          onClick={handleAddItem}
          className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-full shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
        >
          ➕
        </button>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse border border-white/30 rounded-lg overflow-hidden">
          <thead className="bg-white/30 text-gray-900">
            <tr>
              <th className="border border-white/30 px-4 py-2 font-bold">
                Description
              </th>
              <th className="border border-white/30 px-4 py-2 font-bold">
                Qty
              </th>
              <th className="border border-white/30 px-4 py-2 font-bold">
                Rate
              </th>
              <th className="border border-white/30 px-4 py-2 font-bold">
                Amount
              </th>
              <th className="border border-white/30 px-4 py-2 font-bold">
                Delete
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="text-gray-800">
                <td className="border border-white/30 px-4 py-2 text-center">
                  {item.description}
                </td>
                <td className="border border-white/30 px-4 py-2 text-center">
                  {item.qty}
                </td>
                <td className="border border-white/30 px-4 py-2 text-center">
                  {item.rate}
                </td>
                <td className="border border-white/30 px-4 py-2 text-center">
                  {item.amount}
                </td>
                <td className="border border-white/30 px-4 py-2 text-center">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-4 py-1 bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold rounded-lg shadow-md hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {/* Total Amount Row */}
          <tfoot>
            <tr className="bg-gray-100 text-gray-900 font-bold">
              <td
                colSpan="3"
                className="border border-white/30 px-4 py-2 text-right"
              >
                Total Amount:
              </td>
              <td className="border border-white/30 px-4 py-2 text-center text-red-500">
                ₹{items.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
              </td>
              <td className="border border-white/30 px-4 py-2"></td>
            </tr>
            <tr>
              <td colSpan="5" className="p-2">
                <div className="flex gap-2">
                  <button
                    onClick={handleSubmit}
                    className="w-1/2 bg-blue-600 text-white font-semibold py-1 rounded-lg shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105"
                  >
                    SUBMIT
                  </button>
                  <button
                    onClick={handleDeleteAll}
                    className="w-1/2 bg-red-600 text-white font-semibold py-1 rounded-lg shadow-md hover:bg-red-700 transition-transform transform hover:scale-105"
                  >
                    DELETEALL
                  </button>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ItemEntryTable;
