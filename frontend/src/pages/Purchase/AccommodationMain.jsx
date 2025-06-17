import React, { useState } from 'react';
import AccommodationForm from './AccommodationForm';
import AccommodationList from './AccommodationList';

const AccommodationMain = () => {
  const [showList, setShowList] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);

  const handleNext = (id = null) => {
    if (id) {
      setSelectedAccommodation(id);
    }
    setShowList(false);
  };

  return (
    <div className="container mx-auto p-4">
      {!showList ? (
        <AccommodationForm
          onNext={() => setShowList(true)}
          accommodationId={selectedAccommodation}
        />
      ) : (
        <AccommodationList onEdit={handleNext} />
      )}
    </div>
  );
};

export default AccommodationMain;
