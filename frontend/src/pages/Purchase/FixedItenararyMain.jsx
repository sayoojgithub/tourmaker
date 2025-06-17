import React, { useState } from 'react';
import FixedItenararyForm from './FixedItenararyForm';
import FixedItenararyList from './FixedItenararyList';
const FixedItenararyMain = () => {
  const [showList, setShowList] = useState(false);
  const [selectedFixedTour, setSelectedFixedTour] = useState(null);

  const handleNext = (id = null) => {
    if (id) {
      setSelectedFixedTour(id);
    }
    setShowList(false);
  };
  return (
    <div className="container mx-auto p-4">
    {!showList ? (
      <FixedItenararyForm
        onNext={() => setShowList(true)}
        fixedTourId={selectedFixedTour}
      />
    ) : (
      <FixedItenararyList onEdit={handleNext} />
    )}
  </div>
  )
}

export default FixedItenararyMain