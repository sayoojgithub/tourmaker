import React, { useState } from 'react';
import TripForm from './TripForm'
import TripList from './TripList';

const TripMain = () => {
  const [showList, setShowList] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const handleNext = (id = null) => {
    if (id) {
      setSelectedTrip(id);
    }
    setShowList(false);
  };

  return (
    <div className="container mx-auto p-4">
      {!showList ? (
        <TripForm
          onNext={() => setShowList(true)}
          tripId={selectedTrip}
        />
      ) : (
        <TripList onEdit={handleNext} />
      )}
    </div>
  );
};

export default TripMain;
