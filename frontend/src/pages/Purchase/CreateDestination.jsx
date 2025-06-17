import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../config';

const CreateDestination = () => {
  const [destinationName, setDestinationName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!destinationName.trim()) {
      toast.error('Please enter a destination name');
      return;
    }

    setLoading(true);

    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));

      if (!storedUser || !storedUser._id) {
        toast.error('User not found in local storage');
        return;
      }

      const response = await fetch(`${BASE_URL}/purchaser/createDestination`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: destinationName,
          purchaserId: storedUser._id, 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create destination');
      }

      const result = await response.json();
      toast.success('Destination created successfully');
      setDestinationName(''); // Clear the input field
    } catch (error) {
      console.error('Creation error:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-15 flex-col justify-center overflow-hidden bg-gray-50 py-12 mt-14">
      <div className="relative bg-white px-4 pt-6 pb-7 shadow-xl mx-auto w-full max-w-md rounded-lg md:max-w-lg">
        <div className="mx-auto flex w-full flex-col space-y-8">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="font-semibold text-2xl md:text-3xl">
              <p>Create Destination</p>
            </div>
          </div>

          <div>
            <div className="flex flex-col space-y-4 md:space-y-8">
              <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                <input
                  type="text"
                  placeholder="Destination Name"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={destinationName}
                  onChange={(e) => setDestinationName(e.target.value)}
                />
              </div>

              <div className="flex flex-col space-y-5">
                <button
                  className="flex items-center justify-center w-full py-4 text-white bg-primaryColor rounded-lg font-bold shadow-sm"
                  onClick={handleCreate}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDestination;
