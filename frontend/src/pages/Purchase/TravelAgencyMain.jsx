import React, { useState } from 'react';
import TravelAgencyForm from './TravelAgencyForm';
import TravelAgencyList from './TravelAgencyList';

const TravelAgencyMain = () => {
  const [showList, setShowList] = useState(false);
  const [selectedTravelAgency, setSelectedTravelAgency] = useState(null);

  const handleNext = (id = null) => {
    if (id) {
      setSelectedTravelAgency(id);
    }
    setShowList(false);
  };

  return (
    <div className="container mx-auto p-4">
      {!showList ? (
        <TravelAgencyForm
          onNext={() => setShowList(true)}
          travelAgencyId={selectedTravelAgency}
        />
      ) : (
        <TravelAgencyList onEdit={handleNext} />
      )}
    </div>
  );
};

export default TravelAgencyMain;
