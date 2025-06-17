import React, { useState } from 'react';
import SpecialItineraryForm from './SpecialItineraryForm';
import SpecialItineraryList from './SpecialItineraryList';
const SpecialItineraryMain = () => {
    const [showList, setShowList] = useState(false);
    const [selectedSpecialTour, setSelectedSpecialTour] = useState(null);
  
    const handleNext = (id = null) => {
      if (id) {
        setSelectedSpecialTour(id);
      }
      setShowList(false);
    };
    return (
      <div className="container mx-auto p-4">
      {!showList ? (
        <SpecialItineraryForm
          onNext={() => setShowList(true)}
          specialTourId={selectedSpecialTour}
        />
      ) : (
        <SpecialItineraryList onEdit={handleNext} />
      )}
    </div>
    )
}

export default SpecialItineraryMain